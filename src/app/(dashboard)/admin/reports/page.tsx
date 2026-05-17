'use client';

import { useState } from 'react';
import { Box, Typography, Card, CardContent, Stack, Grid, Button, alpha } from '@mui/material';
import { Download } from '@mui/icons-material';
import StatCard from '@/components/shared/StatCard';
import { createClient } from '@/lib/supabase/client';

export default function AdminReportsPage() {
  const [exporting, setExporting] = useState(false);

  // Hardcoded report data for hackathon demo
  const departments = [
    { name: 'Engineering', employees: 5, goalsSet: 18, approved: 15, avgScore: 78 },
    { name: 'Product', employees: 4, goalsSet: 14, approved: 10, avgScore: 72 },
    { name: 'Marketing', employees: 4, goalsSet: 12, approved: 8, avgScore: 68 },
    { name: 'HR', employees: 3, goalsSet: 9, approved: 7, avgScore: 82 },
  ];

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const supabase = createClient();
      
      // Fetch related data
      const { data: users } = await supabase.from('users').select('id, name, department');
      const { data: sheets } = await supabase.from('goal_sheets').select('id, employee_id, cycle_year, status');
      const { data: goals } = await supabase.from('goals').select('goal_sheet_id, title, target_value, achievement_value, uom_type, progress_score, status');
      
      if (!users || !sheets || !goals) throw new Error('Failed to fetch data');

      // Generate CSV rows
      const csvRows = ['Employee Name,Department,Cycle Year,Sheet Status,Goal Title,UoM,Planned Target,Actual Achievement,Score,Goal Status'];
      
      goals.forEach(goal => {
        const sheet = sheets.find(s => s.id === goal.goal_sheet_id);
        const user = sheet ? users.find(u => u.id === sheet.employee_id) : null;
        
        if (user && sheet) {
          const row = [
            `"${user.name}"`,
            `"${user.department}"`,
            sheet.cycle_year,
            sheet.status,
            `"${goal.title.replace(/"/g, '""')}"`,
            goal.uom_type,
            goal.target_value,
            goal.achievement_value,
            `${goal.progress_score}%`,
            goal.status
          ];
          csvRows.push(row.join(','));
        }
      });
      
      // Download file
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `GoalDex_Performance_Report_FY${new Date().getFullYear()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Reports</Typography>
          <Typography variant="body2" color="text.secondary">
            Department-wise performance summary
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="secondary" 
          startIcon={<Download />} 
          onClick={handleExportCSV} 
          disabled={exporting}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          {exporting ? 'Generating...' : 'Export to CSV'}
        </Button>
      </Stack>

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
