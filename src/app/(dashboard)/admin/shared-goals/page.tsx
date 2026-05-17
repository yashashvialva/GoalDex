'use client';

import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Stack, Chip, alpha,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from '@mui/material';
import LoadingScreen from '@/components/shared/LoadingScreen';
import EmptyState from '@/components/shared/EmptyState';
import { createClient } from '@/lib/supabase/client';
import { SharedGoal } from '@/lib/types';
import { formatDate } from '@/lib/utils/helpers';

export default function AdminSharedGoalsPage() {
  const [goals, setGoals] = useState<SharedGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('shared_goals').select('*').order('created_at', { ascending: false });
      setGoals(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Shared Goals</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Department-wide goals pushed to employees
      </Typography>

      {goals.length === 0 ? (
        <EmptyState title="No shared goals" message="No shared goals have been created yet." />
      ) : (
        <TableContainer component={Paper} sx={{ backgroundColor: '#1a1a2e' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell><TableCell>Description</TableCell>
                <TableCell>Target</TableCell><TableCell>Department</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {goals.map(g => (
                <TableRow key={g.id}>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{g.title}</Typography></TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>{g.description}</Typography></TableCell>
                  <TableCell><Chip label={g.target} size="small" sx={{ fontWeight: 700 }} /></TableCell>
                  <TableCell><Chip label={g.department} size="small" variant="outlined" /></TableCell>
                  <TableCell><Typography variant="caption" color="text.secondary">{formatDate(g.created_at)}</Typography></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
