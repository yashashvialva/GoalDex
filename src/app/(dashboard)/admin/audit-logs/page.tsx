'use client';

import { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Avatar, Stack, Chip, alpha,
  TextField, MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import LoadingScreen from '@/components/shared/LoadingScreen';
import { createClient } from '@/lib/supabase/client';
import { AuditLog, User } from '@/lib/types';
import { getInitials, formatDateTime } from '@/lib/utils/helpers';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<(AuditLog & { user?: User })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();
      let query = supabase.from('audit_logs')
        .select('*, user:users!audit_logs_user_id_fkey(*)')
        .order('timestamp', { ascending: false })
        .limit(100);
      if (filter !== 'all') query = query.eq('action', filter);
      const { data } = await query;
      setLogs(data || []);
      setLoading(false);
    };
    fetch();
  }, [filter]);

  if (loading) return <LoadingScreen />;

  const actionColors: Record<string, string> = {
    created: '#22c55e', approved: '#14b8a6', submitted: '#3b82f6',
    updated: '#f59e0b', deleted: '#ef4444', sent_back: '#f97316',
    commented: '#8b5cf6', manager_edit: '#6366f1',
  };

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Audit Logs</Typography>
          <Typography variant="body2" color="text.secondary">{logs.length} entries</Typography>
        </Box>
        <FormControl size="small" sx={{ width: 180 }}>
          <InputLabel>Filter Action</InputLabel>
          <Select value={filter} label="Filter Action" onChange={e => setFilter(e.target.value)}>
            <MenuItem value="all">All Actions</MenuItem>
            <MenuItem value="created">Created</MenuItem>
            <MenuItem value="submitted">Submitted</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="sent_back">Sent Back</MenuItem>
            <MenuItem value="updated">Updated</MenuItem>
            <MenuItem value="deleted">Deleted</MenuItem>
            <MenuItem value="commented">Commented</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <TableContainer component={Paper} sx={{ backgroundColor: '#1a1a2e' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell><TableCell>Action</TableCell>
              <TableCell>Entity</TableCell><TableCell>Details</TableCell>
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map(log => (
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
                  <Chip label={log.action} size="small" sx={{
                    fontWeight: 600, textTransform: 'capitalize', fontSize: '0.65rem',
                    backgroundColor: alpha(actionColors[log.action] || '#94a3b8', 0.12),
                    color: actionColors[log.action] || '#94a3b8',
                  }} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {log.entity_type?.replace('_', ' ')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 250, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.new_value || log.old_value || '—'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">{formatDateTime(log.timestamp)}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
