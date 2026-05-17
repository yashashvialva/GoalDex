'use client';

import { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Avatar, Stack, Chip, alpha,
} from '@mui/material';
import StatusChip from '@/components/shared/StatusChip';
import LoadingScreen from '@/components/shared/LoadingScreen';
import { useAuthStore } from '@/lib/store/authStore';
import { createClient } from '@/lib/supabase/client';
import { User, GoalSheet } from '@/lib/types';
import { getInitials, getCurrentCycleYear } from '@/lib/utils/helpers';

export default function ManagerTeamPage() {
  const { user } = useAuthStore();
  const [team, setTeam] = useState<(User & { goalSheet?: GoalSheet })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const supabase = createClient();
      const { data: members } = await supabase.from('users').select('*').eq('manager_id', user.id);
      if (members) {
        const enriched = await Promise.all(members.map(async (m) => {
          const { data: sheet } = await supabase.from('goal_sheets').select('*')
            .eq('employee_id', m.id).eq('cycle_year', getCurrentCycleYear()).single();
          return { ...m, goalSheet: sheet || undefined };
        }));
        setTeam(enriched);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (loading) return <LoadingScreen />;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Team Overview</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {team.length} direct reports • FY {getCurrentCycleYear()}
      </Typography>

      <TableContainer component={Paper} sx={{ backgroundColor: '#1a1a2e' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell><TableCell>Department</TableCell>
              <TableCell>Goal Sheet</TableCell><TableCell>Weightage</TableCell>
              <TableCell>Goals Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {team.map(m => (
              <TableRow key={m.id}>
                <TableCell>
                  <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1.5}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem', bgcolor: alpha('#6366f1', 0.2), color: '#6366f1' }}>
                      {getInitials(m.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{m.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{m.email}</Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>{m.department}</TableCell>
                <TableCell>{m.goalSheet ? <StatusChip status={m.goalSheet.status} /> : <Chip label="Not Started" size="small" variant="outlined" />}</TableCell>
                <TableCell>{m.goalSheet?.total_weightage || 0}%</TableCell>
                <TableCell>—</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
