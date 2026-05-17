'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Button, Stack, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, alpha,
} from '@mui/material';
import { Add, Edit, Delete, Send, Lock } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import StatusChip from '@/components/shared/StatusChip';
import WeightageBar from '@/components/goals/WeightageBar';
import EmptyState from '@/components/shared/EmptyState';
import LoadingScreen from '@/components/shared/LoadingScreen';
import { useAuthStore } from '@/lib/store/authStore';
import { createClient } from '@/lib/supabase/client';
import { Goal, GoalSheet } from '@/lib/types';
import { getCurrentCycleYear } from '@/lib/utils/helpers';
import { validateGoalSheet } from '@/lib/validations/goalSchema';
import { submitGoalSheet, deleteGoal } from '@/lib/actions/goals';

export default function EmployeeGoalsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [goalSheet, setGoalSheet] = useState<GoalSheet | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const supabase = createClient();
      const { data: sheet, error } = await supabase
        .from('goal_sheets').select('*')
        .eq('employee_id', user.id).eq('cycle_year', getCurrentCycleYear()).single();
      
      if (sheet) {
        setGoalSheet(sheet);
        const { data } = await supabase.from('goals').select('*')
          .eq('goal_sheet_id', sheet.id).order('created_at');
        setGoals(data || []);
      } else if (error && error.code !== 'PGRST116') {
        console.error('Error fetching goal sheet:', error);
      }
    } catch (err) {
      console.error('Error in fetchData:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalW = goals.reduce((s, g) => s + g.weightage, 0);
  const isLocked = goalSheet?.locked || goalSheet?.status === 'approved';

  const handleSubmit = async () => {
    if (!goalSheet) return;
    const errors = validateGoalSheet(goals);
    if (errors.length > 0) { errors.forEach(e => enqueueSnackbar(e, { variant: 'error' })); return; }
    setSubmitting(true);
    try {
      await submitGoalSheet(goalSheet.id);
      enqueueSnackbar('Goal sheet submitted! 🎉', { variant: 'success' });
      fetchData();
    } catch (err: any) { enqueueSnackbar(err.message, { variant: 'error' }); }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGoal(id);
      enqueueSnackbar('Goal deleted', { variant: 'success' });
      setDeleteDialog(null); fetchData();
    } catch (err: any) { enqueueSnackbar(err.message, { variant: 'error' }); }
  };

  if (loading) return <LoadingScreen />;

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>My Goals</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">FY {getCurrentCycleYear()}</Typography>
            {goalSheet && <StatusChip status={goalSheet.status} />}
          </Stack>
        </Box>
        <Stack direction="row" spacing={1.5}>
          {!isLocked && goals.length < 8 && (
            <Button variant="contained" startIcon={<Add />} onClick={() => router.push('/employee/goals/new')}>Add Goal</Button>
          )}
          {!isLocked && goalSheet?.status !== 'submitted' && goals.length > 0 && (
            <Button variant="contained" color="secondary" startIcon={<Send />}
              onClick={handleSubmit} disabled={submitting || totalW !== 100}>
              {submitting ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          )}
          {isLocked && <Chip icon={<Lock />} label="Locked" color="success" variant="outlined" />}
        </Stack>
      </Stack>

      {goals.length > 0 && <Box sx={{ mb: 3 }}><WeightageBar used={totalW} /></Box>}

      {goals.length === 0 ? (
        <EmptyState title="No goals yet" message="Create your first goal to get started." />
      ) : (
        <TableContainer component={Paper} sx={{ backgroundColor: '#1a1a2e' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell><TableCell>Goal</TableCell><TableCell>Thrust Area</TableCell>
                <TableCell>UoM</TableCell><TableCell align="center">Target</TableCell>
                <TableCell align="center">Weight</TableCell><TableCell align="center">Score</TableCell>
                <TableCell>Status</TableCell>{!isLocked && <TableCell align="center">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {goals.map((g, i) => (
                <TableRow key={g.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{g.title}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.description}</Typography>
                  </TableCell>
                  <TableCell>{g.thrust_area}</TableCell>
                  <TableCell><Chip label={g.uom_type} size="small" variant="outlined" sx={{ fontSize: '0.65rem', textTransform: 'capitalize' }} /></TableCell>
                  <TableCell align="center"><Typography variant="body2" sx={{ fontWeight: 600 }}>{g.target_value}</Typography></TableCell>
                  <TableCell align="center"><Chip label={`${g.weightage}%`} size="small" sx={{ fontWeight: 700, backgroundColor: alpha('#6366f1', 0.12), color: '#6366f1' }} /></TableCell>
                  <TableCell align="center"><Typography variant="body2" sx={{ fontWeight: 700, color: g.progress_score >= 80 ? '#22c55e' : g.progress_score >= 50 ? '#f59e0b' : '#94a3b8' }}>{g.progress_score}%</Typography></TableCell>
                  <TableCell><StatusChip status={g.status} /></TableCell>
                  {!isLocked && (
                    <TableCell align="center">
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => router.push(`/employee/goals/${g.id}`)} sx={{ color: '#6366f1' }}><Edit fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" onClick={() => setDeleteDialog(g.id)} sx={{ color: '#ef4444' }}><Delete fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>Delete Goal?</DialogTitle>
        <DialogContent><Typography>This cannot be undone.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => deleteDialog && handleDelete(deleteDialog)}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
