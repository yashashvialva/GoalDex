'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  LinearProgress,
  Button,
  alpha,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  TrackChanges,
  TrendingUp,
} from '@mui/icons-material';
import StatCard from '@/components/shared/StatCard';
import StatusChip from '@/components/shared/StatusChip';
import { useAuthStore } from '@/lib/store/authStore';
import { createClient } from '@/lib/supabase/client';
import { GoalSheet, Goal } from '@/lib/types';
import { getCurrentCycleYear, getCurrentQuarter, formatDate } from '@/lib/utils/helpers';
import { getScoreColor, calculateSheetScore } from '@/lib/utils/scoring';

export default function EmployeeDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [goalSheet, setGoalSheet] = useState<GoalSheet | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const supabase = createClient();
      const year = getCurrentCycleYear();

      // Fetch goal sheet
      const { data: sheet } = await supabase
        .from('goal_sheets')
        .select('*')
        .eq('employee_id', user.id)
        .eq('cycle_year', year)
        .single();

      if (sheet) {
        setGoalSheet(sheet);
        // Fetch goals
        const { data: goalsData } = await supabase
          .from('goals')
          .select('*')
          .eq('goal_sheet_id', sheet.id)
          .order('created_at');

        setGoals(goalsData || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const overallScore = goals.length > 0 ? calculateSheetScore(goals) : 0;
  const completedGoals = goals.filter(g => g.progress_score >= 80).length;
  const totalWeightage = goals.reduce((sum, g) => sum + g.weightage, 0);

  return (
    <Box>
      {/* Welcome Banner */}
      <Card
        sx={{
          mb: 3,
          background: `linear-gradient(135deg, ${alpha('#6366f1', 0.15)} 0%, ${alpha('#14b8a6', 0.1)} 50%, ${alpha('#6366f1', 0.05)} 100%)`,
          border: `1px solid ${alpha('#6366f1', 0.2)}`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha('#6366f1', 0.1)}, transparent)`,
          },
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Welcome back, {user?.name?.split(' ')[0]} 👋
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                FY {getCurrentCycleYear()}-{getCurrentCycleYear() + 1} • Current Quarter: {getCurrentQuarter()}
              </Typography>
              {goalSheet && (
                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                  <StatusChip status={goalSheet.status} />
                  {goalSheet.locked && (
                    <Chip label="🔒 Locked" size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                  )}
                </Stack>
              )}
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push('/employee/goals')}
              sx={{ px: 3 }}
            >
              {goalSheet ? 'View Goals' : 'Create Goals'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Overall Score"
            value={`${overallScore}%`}
            subtitle="Weighted performance"
            icon="trending"
            color={getScoreColor(overallScore)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Goals"
            value={goals.length}
            subtitle={`${completedGoals} on track`}
            icon="goals"
            color="#6366f1"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Weightage"
            value={`${totalWeightage}%`}
            subtitle={totalWeightage === 100 ? '✓ Complete' : `${100 - totalWeightage}% remaining`}
            icon="assessment"
            color={totalWeightage === 100 ? '#22c55e' : '#f59e0b'}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Quarter"
            value={getCurrentQuarter()}
            subtitle="Active period"
            icon="check"
            color="#14b8a6"
          />
        </Grid>
      </Grid>

      {/* Goal Progress Cards */}
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Goal Progress
      </Typography>
      <Grid container spacing={2}>
        {goals.length === 0 && !loading && (
          <Grid size={{ xs: 12 }}>
            <Card sx={{ textAlign: 'center', py: 6 }}>
              <CardContent>
                <TrackChanges sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No goals created yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Start by creating your goals for FY {getCurrentCycleYear()}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => router.push('/employee/goals/new')}
                >
                  Create Your First Goal
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
        {goals.map((goal) => (
          <Grid size={{ xs: 12, md: 6 }} key={goal.id}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1, mr: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {goal.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {goal.thrust_area} • Weightage: {goal.weightage}%
                    </Typography>
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 800, color: getScoreColor(goal.progress_score) }}
                  >
                    {goal.progress_score}%
                  </Typography>
                </Stack>
                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={goal.progress_score}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: alpha(getScoreColor(goal.progress_score), 0.12),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: `linear-gradient(90deg, ${getScoreColor(goal.progress_score)}, ${alpha(getScoreColor(goal.progress_score), 0.7)})`,
                      },
                    }}
                  />
                  <Stack direction="row" sx={{ justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Target: {goal.target_value} | Achieved: {goal.achievement_value}
                    </Typography>
                    <StatusChip status={goal.status} />
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
