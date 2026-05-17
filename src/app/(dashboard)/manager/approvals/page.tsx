'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Stack, Avatar, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Collapse, IconButton, alpha,
} from '@mui/material';
import { ExpandMore, ExpandLess, Check, Undo } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import StatusChip from '@/components/shared/StatusChip';
import EmptyState from '@/components/shared/EmptyState';
import LoadingScreen from '@/components/shared/LoadingScreen';
import { useAuthStore } from '@/lib/store/authStore';
import { createClient } from '@/lib/supabase/client';
import { GoalSheet, Goal, User } from '@/lib/types';
import { getInitials, formatDate, getCurrentCycleYear } from '@/lib/utils/helpers';
import { approveGoalSheet, sendBackGoalSheet } from '@/lib/actions/approvals';

export default function ManagerApprovalsPage() {
  const { user } = useAuthStore();
  const { enqueueSnackbar } = useSnackbar();
  const [sheets, setSheets] = useState<(GoalSheet & { employee?: User; goals?: Goal[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionDialog, setActionDialog] = useState<{ sheetId: string; type: 'approve' | 'reject' } | null>(null);
  const [comment, setComment] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    const supabase = createClient();
    const { data: team } = await supabase.from('users').select('id').eq('manager_id', user.id);
    if (!team || team.length === 0) { setLoading(false); return; }

    const ids = team.map(t => t.id);
    const { data } = await supabase
      .from('goal_sheets')
      .select('*, employee:users!goal_sheets_employee_id_fkey(*)')
      .in('employee_id', ids)
      .eq('cycle_year', getCurrentCycleYear())
      .in('status', ['submitted', 'sent_back'])
      .order('submitted_at', { ascending: false });

    if (data) {
      const withGoals = await Promise.all(data.map(async (s) => {
        const { data: goals } = await supabase.from('goals').select('*').eq('goal_sheet_id', s.id).order('created_at');
        return { ...s, goals: goals || [] };
      }));
      setSheets(withGoals);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAction = async () => {
    if (!actionDialog) return;
    setProcessing(true);
    try {
      if (actionDialog.type === 'approve') {
        await approveGoalSheet(actionDialog.sheetId, comment);
        enqueueSnackbar('Goal sheet approved! ✅', { variant: 'success' });
      } else {
        if (!comment.trim()) { enqueueSnackbar('Comment required for send back', { variant: 'error' }); setProcessing(false); return; }
        await sendBackGoalSheet(actionDialog.sheetId, comment);
        enqueueSnackbar('Goal sheet sent back for rework', { variant: 'warning' });
      }
      setActionDialog(null); setComment(''); fetchData();
    } catch (err: any) { enqueueSnackbar(err.message, { variant: 'error' }); }
    setProcessing(false);
  };

  if (loading) return <LoadingScreen />;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Goal Approvals</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review and approve goal sheets from your team
      </Typography>

      {sheets.length === 0 ? (
        <EmptyState title="All caught up!" message="No pending goal sheets to review." />
      ) : (
        <Stack spacing={2}>
          {sheets.map((sheet) => (
            <Card key={sheet.id} sx={{ border: `1px solid ${alpha(sheet.status === 'submitted' ? '#f59e0b' : '#94a3b8', 0.3)}` }}>
              <CardContent sx={{ p: 3 }}>
                {/* Header */}
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Stack direction="row" sx={{ alignItems: 'center' }} spacing={2}>
                    <Avatar sx={{ bgcolor: alpha('#6366f1', 0.2), color: '#6366f1' }}>
                      {sheet.employee ? getInitials(sheet.employee.name) : '?'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }} color="text.primary">
                        {sheet.employee?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {sheet.employee?.department} • Submitted {formatDate(sheet.submitted_at)}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <StatusChip status={sheet.status} />
                    <Chip label={`${sheet.total_weightage}%`} size="small" sx={{ fontWeight: 700 }} />
                    <IconButton size="small" onClick={() => setExpanded(expanded === sheet.id ? null : sheet.id)}>
                      {expanded === sheet.id ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Stack>
                </Stack>

                {/* Expanded Goals */}
                <Collapse in={expanded === sheet.id}>
                  <TableContainer sx={{ mt: 2, backgroundColor: alpha('#000', 0.2), borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>#</TableCell><TableCell>Goal</TableCell>
                          <TableCell>Thrust Area</TableCell><TableCell>UoM</TableCell>
                          <TableCell align="center">Target</TableCell><TableCell align="center">Weight</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sheet.goals?.map((g, i) => (
                          <TableRow key={g.id}>
                            <TableCell>{i + 1}</TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{g.title}</Typography>
                              <Typography variant="caption" color="text.secondary">{g.description}</Typography>
                            </TableCell>
                            <TableCell>{g.thrust_area}</TableCell>
                            <TableCell><Chip label={g.uom_type} size="small" variant="outlined" sx={{ fontSize: '0.6rem', textTransform: 'capitalize' }} /></TableCell>
                            <TableCell align="center">{g.target_value}</TableCell>
                            <TableCell align="center"><Chip label={`${g.weightage}%`} size="small" sx={{ fontWeight: 700, backgroundColor: alpha('#6366f1', 0.12), color: '#6366f1' }} /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Action Buttons */}
                  {sheet.status === 'submitted' && (
                    <Stack direction="row" spacing={1.5} sx={{ mt: 2, justifyContent: 'flex-end' }}>
                      <Button variant="outlined" color="warning" startIcon={<Undo />}
                        onClick={() => setActionDialog({ sheetId: sheet.id, type: 'reject' })}>
                        Send Back
                      </Button>
                      <Button variant="contained" color="success" startIcon={<Check />}
                        onClick={() => setActionDialog({ sheetId: sheet.id, type: 'approve' })}>
                        Approve
                      </Button>
                    </Stack>
                  )}
                </Collapse>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Action Dialog */}
      <Dialog open={!!actionDialog} onClose={() => setActionDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionDialog?.type === 'approve' ? '✅ Approve Goal Sheet' : '↩️ Send Back for Rework'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth multiline rows={3} label="Manager Comment"
            placeholder={actionDialog?.type === 'approve' ? 'Optional feedback...' : 'Explain what needs to be revised (required)'}
            value={comment} onChange={(e) => setComment(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setActionDialog(null); setComment(''); }}>Cancel</Button>
          <Button variant="contained" onClick={handleAction} disabled={processing}
            color={actionDialog?.type === 'approve' ? 'success' : 'warning'}>
            {processing ? 'Processing...' : actionDialog?.type === 'approve' ? 'Approve' : 'Send Back'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
