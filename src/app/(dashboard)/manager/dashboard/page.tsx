'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Avatar,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  alpha,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import StatCard from '@/components/shared/StatCard';
import StatusChip from '@/components/shared/StatusChip';
import { useAuthStore } from '@/lib/store/authStore';
import { createClient } from '@/lib/supabase/client';
import { User, GoalSheet } from '@/lib/types';
import { getInitials, formatDate, getCurrentCycleYear } from '@/lib/utils/helpers';

export default function ManagerDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [goalSheets, setGoalSheets] = useState<GoalSheet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const supabase = createClient();

      // Fetch direct reports
      const { data: team } = await supabase
        .from('users')
        .select('*')
        .eq('manager_id', user.id);

      setTeamMembers(team || []);

      if (team && team.length > 0) {
        const teamIds = team.map(t => t.id);
        const { data: sheets } = await supabase
          .from('goal_sheets')
          .select('*, employee:users!goal_sheets_employee_id_fkey(*)')
          .in('employee_id', teamIds)
          .eq('cycle_year', getCurrentCycleYear());

        setGoalSheets(sheets || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const pendingApprovals = goalSheets.filter(s => s.status === 'submitted').length;
  const approvedSheets = goalSheets.filter(s => s.status === 'approved').length;

  return (
    <Box>
      {/* Header */}
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
        Manager Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Team performance overview — FY {getCurrentCycleYear()}
      </Typography>

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Team Size"
            value={teamMembers.length}
            subtitle="Direct reports"
            icon="team"
            color="#6366f1"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Pending Approvals"
            value={pendingApprovals}
            subtitle="Awaiting review"
            icon="pending"
            color={pendingApprovals > 0 ? '#f59e0b' : '#22c55e'}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Approved"
            value={approvedSheets}
            subtitle="Goal sheets locked"
            icon="check"
            color="#22c55e"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Completion"
            value={teamMembers.length > 0 ? `${Math.round((approvedSheets / teamMembers.length) * 100)}%` : '0%'}
            subtitle="Team progress"
            icon="trending"
            color="#14b8a6"
          />
        </Grid>
      </Grid>

      {/* Pending Approvals */}
      {pendingApprovals > 0 && (
        <Card sx={{ mb: 3, border: `1px solid ${alpha('#f59e0b', 0.3)}` }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                ⚠️ Pending Approvals
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => router.push('/manager/approvals')}
              >
                Review All
              </Button>
            </Stack>
            {goalSheets.filter(s => s.status === 'submitted').map(sheet => (
              <Card key={sheet.id} sx={{ mb: 1, backgroundColor: alpha('#f59e0b', 0.04) }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Stack direction="row" sx={{ alignItems: 'center' }} spacing={2}>
                      <Avatar sx={{ width: 36, height: 36, fontSize: '0.8rem', bgcolor: alpha('#f59e0b', 0.2), color: '#f59e0b' }}>
                        {sheet.employee ? getInitials(sheet.employee.name) : '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {sheet.employee?.name || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Submitted {formatDate(sheet.submitted_at)}
                        </Typography>
                      </Box>
                    </Stack>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => router.push('/manager/approvals')}
                    >
                      Review
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Team Overview Table */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Team Members
      </Typography>
      <TableContainer component={Paper} sx={{ backgroundColor: '#1a1a2e' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Goal Sheet Status</TableCell>
              <TableCell>Weightage</TableCell>
              <TableCell>Submitted</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teamMembers.map(member => {
              const sheet = goalSheets.find(s => s.employee_id === member.id);
              return (
                <TableRow key={member.id}>
                  <TableCell>
                    <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1.5}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem', bgcolor: alpha('#6366f1', 0.2), color: '#6366f1' }}>
                        {getInitials(member.name)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{member.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{member.email}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{member.department}</Typography>
                  </TableCell>
                  <TableCell>
                    {sheet ? <StatusChip status={sheet.status} /> : <Chip label="Not Started" size="small" variant="outlined" />}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{sheet?.total_weightage || 0}%</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {sheet?.submitted_at ? formatDate(sheet.submitted_at) : '—'}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
            {teamMembers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No team members found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
