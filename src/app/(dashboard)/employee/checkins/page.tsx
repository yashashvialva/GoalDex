'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Stack, Tabs, Tab, TextField,
  Button, MenuItem, Select, FormControl, InputLabel, Chip, alpha,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import StatusChip from '@/components/shared/StatusChip';
import LoadingScreen from '@/components/shared/LoadingScreen';
import EmptyState from '@/components/shared/EmptyState';
import { useAuthStore } from '@/lib/store/authStore';
import { createClient } from '@/lib/supabase/client';
import { Goal, QuarterlyCheckin } from '@/lib/types';
import { getCurrentCycleYear, getCurrentQuarter } from '@/lib/utils/helpers';
import { getScoreColor } from '@/lib/utils/scoring';
import { upsertCheckin } from '@/lib/actions/checkins';

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

export default function EmployeeCheckinsPage() {
  const { user } = useAuthStore();
  const { enqueueSnackbar } = useSnackbar();
  const [quarter, setQuarter] = useState(getCurrentQuarter());
  const [goals, setGoals] = useState<(Goal & { checkin?: QuarterlyCheckin })[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, { achievement: number; status: string; comment: string }>>({});

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: sheet, error: sheetError } = await supabase.from('goal_sheets').select('id')
        .eq('employee_id', user.id).eq('cycle_year', getCurrentCycleYear()).single();
      
      if (!sheet) { 
        if (sheetError && sheetError.code !== 'PGRST116') {
          console.error('Error fetching goal sheet:', sheetError);
        }
        return; 
      }

      const { data: goalsData } = await supabase.from('goals').select('*')
        .eq('goal_sheet_id', sheet.id).order('created_at');

      if (goalsData) {
        const enriched = await Promise.all(goalsData.map(async (g) => {
          const { data: checkin } = await supabase.from('quarterly_checkins')
            .select('*').eq('goal_id', g.id).eq('quarter', quarter).single();
          return { ...g, checkin: checkin || undefined };
        }));
        setGoals(enriched);
        const fd: Record<string, any> = {};
        enriched.forEach(g => {
          fd[g.id] = {
            achievement: g.checkin?.actual_achievement || 0,
            status: g.checkin?.status || 'not_started',
            comment: g.checkin?.employee_comment || '',
          };
        });
        setFormData(fd);
      }
    } catch (err) {
      console.error('Error in fetchData:', err);
    } finally {
      setLoading(false);
    }
  }, [user, quarter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (goalId: string) => {
    const d = formData[goalId];
    if (!d) return;
    setSaving(goalId);
    try {
      await upsertCheckin(goalId, quarter, {
        actual_achievement: d.achievement,
        status: d.status,
        employee_comment: d.comment,
      });
      enqueueSnackbar('Check-in saved! ✅', { variant: 'success' });
      fetchData();
    } catch (err: any) { enqueueSnackbar(err.message, { variant: 'error' }); }
    setSaving(null);
  };

  if (loading) return <LoadingScreen />;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Quarterly Check-ins</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Update your progress for each goal
      </Typography>

      <Tabs value={QUARTERS.indexOf(quarter)} onChange={(_, v) => setQuarter(QUARTERS[v])} sx={{ mb: 3 }}>
        {QUARTERS.map(q => <Tab key={q} label={q} />)}
      </Tabs>

      {goals.length === 0 ? (
        <EmptyState title="No approved goals" message="Goals must be approved before check-ins." />
      ) : (
        <Stack spacing={2}>
          {goals.map(g => (
            <Card key={g.id}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{g.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Target: {g.target_value} • UoM: {g.uom_type} • Weight: {g.weightage}%
                    </Typography>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: getScoreColor(g.progress_score) }}>
                    {g.progress_score}%
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-end' }}>
                  <TextField label="Actual Achievement" type="number" size="small" sx={{ width: 160 }}
                    value={formData[g.id]?.achievement || 0}
                    onChange={e => setFormData(p => ({ ...p, [g.id]: { ...p[g.id], achievement: Number(e.target.value) } }))} />
                  <FormControl size="small" sx={{ width: 150 }}>
                    <InputLabel>Status</InputLabel>
                    <Select label="Status" value={formData[g.id]?.status || 'not_started'}
                      onChange={e => setFormData(p => ({ ...p, [g.id]: { ...p[g.id], status: e.target.value } }))}>
                      <MenuItem value="not_started">Not Started</MenuItem>
                      <MenuItem value="on_track">On Track</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField label="Comment" size="small" sx={{ flex: 1 }}
                    value={formData[g.id]?.comment || ''}
                    onChange={e => setFormData(p => ({ ...p, [g.id]: { ...p[g.id], comment: e.target.value } }))} />
                  <Button variant="contained" size="small" startIcon={<Save />}
                    disabled={saving === g.id} onClick={() => handleSave(g.id)}>
                    {saving === g.id ? '...' : 'Save'}
                  </Button>
                </Stack>

                {g.checkin?.manager_comment && (
                  <Card sx={{ mt: 2, backgroundColor: alpha('#14b8a6', 0.06), border: `1px solid ${alpha('#14b8a6', 0.2)}` }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }} color="#14b8a6">Manager Feedback</Typography>
                      <Typography variant="body2">{g.checkin.manager_comment}</Typography>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
