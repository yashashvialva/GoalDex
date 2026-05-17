'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Stack, Tabs, Tab, TextField,
  Button, Avatar, Chip, alpha,
} from '@mui/material';
import { Comment } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import StatusChip from '@/components/shared/StatusChip';
import LoadingScreen from '@/components/shared/LoadingScreen';
import EmptyState from '@/components/shared/EmptyState';
import { useAuthStore } from '@/lib/store/authStore';
import { createClient } from '@/lib/supabase/client';
import { Goal, QuarterlyCheckin, User } from '@/lib/types';
import { getInitials, getCurrentCycleYear, getCurrentQuarter } from '@/lib/utils/helpers';
import { getScoreColor } from '@/lib/utils/scoring';
import { addManagerCheckinComment } from '@/lib/actions/checkins';

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

interface TeamCheckin {
  employee: User;
  goals: (Goal & { checkin?: QuarterlyCheckin })[];
}

export default function ManagerCheckinsPage() {
  const { user } = useAuthStore();
  const { enqueueSnackbar } = useSnackbar();
  const [quarter, setQuarter] = useState(getCurrentQuarter());
  const [teamData, setTeamData] = useState<TeamCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();
    const { data: team } = await supabase.from('users').select('*').eq('manager_id', user.id);
    if (!team) { setLoading(false); return; }

    const results: TeamCheckin[] = [];
    for (const member of team) {
      const { data: sheet } = await supabase.from('goal_sheets').select('id')
        .eq('employee_id', member.id).eq('cycle_year', getCurrentCycleYear()).eq('status', 'approved').single();
      if (!sheet) continue;

      const { data: goals } = await supabase.from('goals').select('*').eq('goal_sheet_id', sheet.id);
      if (!goals) continue;

      const enriched = await Promise.all(goals.map(async (g) => {
        const { data: checkin } = await supabase.from('quarterly_checkins')
          .select('*').eq('goal_id', g.id).eq('quarter', quarter).single();
        return { ...g, checkin: checkin || undefined };
      }));
      results.push({ employee: member, goals: enriched });
    }
    setTeamData(results);
    setLoading(false);
  }, [user, quarter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleComment = async (checkinId: string) => {
    const text = comments[checkinId];
    if (!text?.trim()) return;
    setSaving(checkinId);
    try {
      await addManagerCheckinComment(checkinId, text);
      enqueueSnackbar('Comment added ✅', { variant: 'success' });
      setComments(p => ({ ...p, [checkinId]: '' }));
      fetchData();
    } catch (err: any) { enqueueSnackbar(err.message, { variant: 'error' }); }
    setSaving(null);
  };

  if (loading) return <LoadingScreen />;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Check-in Review</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review your team&apos;s quarterly progress and provide feedback
      </Typography>

      <Tabs value={QUARTERS.indexOf(quarter)} onChange={(_, v) => setQuarter(QUARTERS[v])} sx={{ mb: 3 }}>
        {QUARTERS.map(q => <Tab key={q} label={q} />)}
      </Tabs>

      {teamData.length === 0 ? (
        <EmptyState title="No check-ins" message="No approved goal sheets with check-in data yet." />
      ) : (
        <Stack spacing={3}>
          {teamData.map(({ employee, goals }) => (
            <Card key={employee.id}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" sx={{ alignItems: 'center', mb: 2 }} spacing={2}>
                  <Avatar sx={{ bgcolor: alpha('#6366f1', 0.2), color: '#6366f1' }}>
                    {getInitials(employee.name)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{employee.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{employee.department}</Typography>
                  </Box>
                </Stack>

                <Stack spacing={1.5}>
                  {goals.map(g => (
                    <Card key={g.id} sx={{ backgroundColor: alpha('#000', 0.2) }}>
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1 }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{g.title}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Target: {g.target_value} | Weight: {g.weightage}%
                            </Typography>
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: getScoreColor(g.progress_score) }}>
                            {g.progress_score}%
                          </Typography>
                        </Stack>

                        {g.checkin ? (
                          <>
                            <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                              <Chip label={`Planned: ${g.checkin.planned_target}`} size="small" variant="outlined" />
                              <Chip label={`Actual: ${g.checkin.actual_achievement}`} size="small"
                                sx={{ fontWeight: 700, bgcolor: alpha(getScoreColor(g.progress_score), 0.12), color: getScoreColor(g.progress_score) }} />
                              <StatusChip status={g.checkin.status} />
                            </Stack>
                            {g.checkin.employee_comment && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                💬 Employee: {g.checkin.employee_comment}
                              </Typography>
                            )}
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-end' }}>
                              <TextField size="small" placeholder="Add feedback..." sx={{ flex: 1 }}
                                value={comments[g.checkin.id] !== undefined ? comments[g.checkin.id] : (g.checkin.manager_comment || '')}
                                onChange={e => setComments(p => ({ ...p, [g.checkin!.id]: e.target.value }))} />
                              <Button size="small" variant="contained" startIcon={<Comment />}
                                disabled={saving === g.checkin.id} onClick={() => handleComment(g.checkin!.id)}>
                                {saving === g.checkin.id ? '...' : 'Comment'}
                              </Button>
                            </Stack>
                          </>
                        ) : (
                          <Typography variant="caption" color="text.secondary">No check-in submitted for {quarter}</Typography>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
