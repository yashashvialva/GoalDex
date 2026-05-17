'use client';

import { Box, Card, CardContent, Typography, Stack, alpha } from '@mui/material';
import {
  TrackChanges,
  Groups,
  Assessment,
  CheckCircle,
  TrendingUp,
  Person,
  AdminPanelSettings,
  Assignment,
  PendingActions,
  BarChart,
} from '@mui/icons-material';
import { ReactNode } from 'react';

const iconMap: Record<string, ReactNode> = {
  goals: <TrackChanges />,
  team: <Groups />,
  assessment: <Assessment />,
  check: <CheckCircle />,
  trending: <TrendingUp />,
  person: <Person />,
  admin: <AdminPanelSettings />,
  assignment: <Assignment />,
  pending: <PendingActions />,
  chart: <BarChart />,
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: string;
  trend?: { value: number; positive: boolean };
}

export default function StatCard({ title, value, subtitle, icon, color, trend }: StatCardProps) {
  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.3)})`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              {title}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, mt: 0.5, color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 1 }}>
                <TrendingUp
                  sx={{
                    fontSize: 14,
                    color: trend.positive ? '#22c55e' : '#ef4444',
                    transform: trend.positive ? 'none' : 'rotate(180deg)',
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: trend.positive ? '#22c55e' : '#ef4444', fontWeight: 600 }}
                >
                  {trend.value}%
                </Typography>
              </Stack>
            )}
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: '12px',
              backgroundColor: alpha(color, 0.12),
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {iconMap[icon] || <TrackChanges />}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
