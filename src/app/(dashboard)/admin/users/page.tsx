'use client';

import { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Avatar, Chip, Stack, alpha,
} from '@mui/material';
import LoadingScreen from '@/components/shared/LoadingScreen';
import { createClient } from '@/lib/supabase/client';
import { User } from '@/lib/types';
import { getInitials, getRoleLabel, getRoleColor } from '@/lib/utils/helpers';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('users').select('*').order('role').order('name');
      setUsers(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>User Management</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {users.length} users in the organization (view-only)
      </Typography>

      <TableContainer component={Paper} sx={{ backgroundColor: '#1a1a2e' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell><TableCell>Role</TableCell>
              <TableCell>Department</TableCell><TableCell>Email</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id}>
                <TableCell>
                  <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1.5}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem', bgcolor: alpha(getRoleColor(u.role), 0.2), color: getRoleColor(u.role) }}>
                      {getInitials(u.name)}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{u.name}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip label={getRoleLabel(u.role)} size="small" sx={{
                    fontWeight: 600, backgroundColor: alpha(getRoleColor(u.role), 0.12),
                    color: getRoleColor(u.role), border: `1px solid ${alpha(getRoleColor(u.role), 0.3)}`
                  }} />
                </TableCell>
                <TableCell>{u.department}</TableCell>
                <TableCell><Typography variant="body2" color="text.secondary">{u.email}</Typography></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
