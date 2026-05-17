'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  alpha,
} from '@mui/material';
import StatCard from '@/components/shared/StatCard';
import { useAuthStore } from '@/lib/store/authStore';
import { createClient } from '@/lib/supabase/client';
import { formatDateTime, getInitials } from '@/lib/utils/helpers';
import { AuditLog, User, GoalSheet } from '@/lib/types';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalGoalSheets: 0,
    pendingApprovals: 0,
    approvedSheets: 0,
  });
  const [auditLogs, setAuditLogs] = useState<(AuditLog & { user?: User })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const supabase = createClient();

      // Count users
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'employee');

      // Count goal sheets
      const { data: sheets } = await supabase
        .from('goal_sheets')
        .select('status');

      const pending = sheets?.filter(s => s.status === 'submitted').length || 0;
      const approved = sheets?.filter(s => s.status === 'approved').length || 0;

      setStats({
        totalEmployees: userCount || 0,
        totalGoalSheets: sheets?.length || 0,
        pendingApprovals: pending,
        approvedSheets: approved,
      });

      // Recent audit logs
      const { data: logs } = await supabase
        .from('audit_logs')
        .select('*, user:users!audit_logs_user_id_fkey(*)')
        .order('timestamp', { ascending: false })
        .limit(10);

      setAuditLogs(logs || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Organization-wide performance overview
      </Typography>

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Employees"
            value={stats.totalEmployees}
            icon="person"
            color="#6366f1"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Goal Sheets"
            value={stats.totalGoalSheets}
            subtitle={`${stats.approvedSheets} approved`}
            icon="assignment"
            color="#14b8a6"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon="pending"
            color={stats.pendingApprovals > 0 ? '#f59e0b' : '#22c55e'}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Approval Rate"
            value={stats.totalGoalSheets > 0 ? `${Math.round((stats.approvedSheets / stats.totalGoalSheets) * 100)}%` : '0%'}
            icon="chart"
            color="#22c55e"
          />
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Recent Activity
      </Typography>
      <TableContainer component={Paper} sx={{ backgroundColor: '#1a1a2e' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Entity</TableCell>
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {auditLogs.map(log => (
              <TableRow key={log.id}>
                <TableCell>
                  <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1}>
                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.7rem', bgcolor: alpha('#6366f1', 0.2), color: '#6366f1' }}>
                      {log.user ? getInitials(log.user.name) : '?'}
                    </Avatar>
                    <Typography variant="body2">{log.user?.name || 'System'}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                    {log.action}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                    {log.entity_type?.replace('_', ' ')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {formatDateTime(log.timestamp)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            {auditLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No audit logs found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
