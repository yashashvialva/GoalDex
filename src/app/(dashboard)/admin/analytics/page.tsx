'use client';

import { Box, Typography, Grid, Card, CardContent, Stack, alpha } from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area,
} from 'recharts';

// ─── Hardcoded seed data for wow-factor analytics ───

const quarterlyTrend = [
  { quarter: 'Q1 FY25', Engineering: 62, Product: 55, Marketing: 48, HR: 70 },
  { quarter: 'Q2 FY25', Engineering: 71, Product: 63, Marketing: 56, HR: 75 },
  { quarter: 'Q3 FY25', Engineering: 78, Product: 70, Marketing: 65, HR: 80 },
  { quarter: 'Q4 FY25', Engineering: 84, Product: 76, Marketing: 72, HR: 85 },
  { quarter: 'Q1 FY26', Engineering: 68, Product: 60, Marketing: 52, HR: 72 },
  { quarter: 'Q2 FY26', Engineering: 76, Product: 68, Marketing: 61, HR: 78 },
];

const goalStatusData = [
  { name: 'Completed', value: 28, color: '#22c55e' },
  { name: 'On Track', value: 35, color: '#3b82f6' },
  { name: 'Not Started', value: 12, color: '#94a3b8' },
  { name: 'At Risk', value: 8, color: '#f59e0b' },
];

const deptPerformance = [
  { dept: 'Engineering', score: 78, target: 80, goals: 18 },
  { dept: 'Product', score: 72, target: 75, goals: 14 },
  { dept: 'Marketing', score: 68, target: 70, goals: 12 },
  { dept: 'HR', score: 82, target: 80, goals: 9 },
];

const heatmapData = [
  { dept: 'Engineering', Q1: 85, Q2: 78, Q3: 92, Q4: 88 },
  { dept: 'Product', Q1: 70, Q2: 75, Q3: 80, Q4: 72 },
  { dept: 'Marketing', Q1: 60, Q2: 65, Q3: 72, Q4: 68 },
  { dept: 'HR', Q1: 90, Q2: 85, Q3: 88, Q4: 92 },
];

const managerLeaderboard = [
  { name: 'Priya Sharma', team: 'Engineering', completion: 92, score: 84 },
  { name: 'Amit Desai', team: 'Product', completion: 85, score: 76 },
  { name: 'Neha Kulkarni', team: 'Marketing', completion: 78, score: 68 },
  { name: 'Rahul Verma', team: 'HR', completion: 95, score: 88 },
];

const monthlyGoals = [
  { month: 'Apr', created: 12, completed: 3 },
  { month: 'May', created: 8, completed: 5 },
  { month: 'Jun', created: 5, completed: 8 },
  { month: 'Jul', created: 3, completed: 10 },
  { month: 'Aug', created: 2, completed: 12 },
  { month: 'Sep', created: 4, completed: 15 },
];

const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#22c55e'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <Box sx={{ bgcolor: '#1a1a2e', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 2, p: 1.5, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: '#e2e8f0', display: 'block', mb: 0.5 }}>{label}</Typography>
      {payload.map((p: any, i: number) => (
        <Typography key={i} variant="caption" sx={{ color: p.color, display: 'block' }}>
          {p.name}: {p.value}%
        </Typography>
      ))}
    </Box>
  );
};

const HeatCell = ({ value }: { value: number }) => {
  const bg = value >= 85 ? '#22c55e' : value >= 70 ? '#3b82f6' : value >= 55 ? '#f59e0b' : '#ef4444';
  return (
    <Box sx={{
      width: 56, height: 40, borderRadius: 1, display: 'flex', alignItems: 'center',
      justifyContent: 'center', backgroundColor: alpha(bg, 0.15), color: bg,
      fontWeight: 700, fontSize: '0.8rem', border: `1px solid ${alpha(bg, 0.3)}`,
    }}>
      {value}%
    </Box>
  );
};

export default function AdminAnalyticsPage() {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Analytics</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Organization-wide performance insights
      </Typography>

      <Grid container spacing={2.5}>
        {/* Quarterly Achievement Trend */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                📈 Quarterly Achievement Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={quarterlyTrend}>
                  <defs>
                    <linearGradient id="colorEng" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="quarter" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[40, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Engineering" stroke="#6366f1" fill="url(#colorEng)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Product" stroke="#14b8a6" fill="url(#colorProd)" strokeWidth={2} />
                  <Line type="monotone" dataKey="Marketing" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="HR" stroke="#22c55e" strokeWidth={2} dot={false} />
                  <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Goal Status Pie */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                🎯 Goal Status
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={goalStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                    paddingAngle={4} dataKey="value" strokeWidth={0}>
                    {goalStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Performance Bar */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                🏢 Department Performance
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={deptPerformance} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="dept" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} name="Actual" />
                  <Bar dataKey="target" fill={alpha('#14b8a6', 0.4)} radius={[6, 6, 0, 0]} name="Target" />
                  <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Goal Creation Trend */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                📊 Goal Lifecycle
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyGoals}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="created" fill="#6366f1" radius={[6, 6, 0, 0]} name="Created" />
                  <Bar dataKey="completed" fill="#22c55e" radius={[6, 6, 0, 0]} name="Completed" />
                  <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Completion Heatmap */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                🔥 Completion Heatmap
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <Stack spacing={1}>
                  {/* Header */}
                  <Stack direction="row" spacing={1} sx={{ pl: 12 }}>
                    {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
                      <Box key={q} sx={{ width: 56, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }} color="text.secondary">{q}</Typography>
                      </Box>
                    ))}
                  </Stack>
                  {/* Rows */}
                  {heatmapData.map(row => (
                    <Stack key={row.dept} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, width: 100, flexShrink: 0 }}>{row.dept}</Typography>
                      <HeatCell value={row.Q1} />
                      <HeatCell value={row.Q2} />
                      <HeatCell value={row.Q3} />
                      <HeatCell value={row.Q4} />
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Manager Leaderboard */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                🏆 Manager Leaderboard
              </Typography>
              <Stack spacing={1.5}>
                {managerLeaderboard
                  .sort((a, b) => b.score - a.score)
                  .map((mgr, i) => (
                    <Card key={mgr.name} sx={{ backgroundColor: alpha(i === 0 ? '#f59e0b' : '#6366f1', 0.04), border: `1px solid ${alpha(i === 0 ? '#f59e0b' : '#6366f1', 0.15)}` }}>
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                          <Stack direction="row" sx={{ alignItems: 'center' }} spacing={2}>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: i === 0 ? '#f59e0b' : '#94a3b8', width: 32 }}>
                              #{i + 1}
                            </Typography>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>{mgr.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{mgr.team}</Typography>
                            </Box>
                          </Stack>
                          <Stack sx={{ alignItems: 'flex-end' }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: mgr.score >= 80 ? '#22c55e' : '#f59e0b' }}>
                              {mgr.score}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {mgr.completion}% team completion
                            </Typography>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
