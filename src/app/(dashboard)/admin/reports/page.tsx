'use client';

import { Box, Typography, Card, CardContent, Stack, Grid, alpha } from '@mui/material';
import StatCard from '@/components/shared/StatCard';

export default function AdminReportsPage() {
  // Hardcoded report data for hackathon demo
  const departments = [
    { name: 'Engineering', employees: 5, goalsSet: 18, approved: 15, avgScore: 78 },
    { name: 'Product', employees: 4, goalsSet: 14, approved: 10, avgScore: 72 },
    { name: 'Marketing', employees: 4, goalsSet: 12, approved: 8, avgScore: 68 },
    { name: 'HR', employees: 3, goalsSet: 9, approved: 7, avgScore: 82 },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Reports</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Department-wise performance summary
      </Typography>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Goals" value={53} icon="goals" color="#6366f1" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Approved" value={40} subtitle="75% approval rate" icon="check" color="#22c55e" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Avg Score" value="75%" icon="trending" color="#14b8a6" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Completion" value="62%" icon="chart" color="#f59e0b" />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {departments.map(dept => (
          <Grid size={{ xs: 12, md: 6 }} key={dept.name}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{dept.name}</Typography>
                <Stack spacing={1.5}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Employees</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{dept.employees}</Typography>
                  </Stack>
                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Goals Set</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{dept.goalsSet}</Typography>
                  </Stack>
                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Approved</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} color="#22c55e">{dept.approved}</Typography>
                  </Stack>
                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Avg Performance</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: dept.avgScore >= 75 ? '#22c55e' : '#f59e0b' }}>
                      {dept.avgScore}%
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
