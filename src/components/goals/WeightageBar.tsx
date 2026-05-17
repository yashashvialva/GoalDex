'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  LinearProgress,
  alpha,
} from '@mui/material';

interface WeightageBarProps {
  used: number;
  total?: number;
}

export default function WeightageBar({ used, total = 100 }: WeightageBarProps) {
  const remaining = total - used;
  const isValid = used === total;
  const isOver = used > total;

  const color = isOver ? '#ef4444' : isValid ? '#22c55e' : '#f59e0b';

  return (
    <Card sx={{ border: `1px solid ${alpha(color, 0.3)}` }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 600 }} color="text.secondary">
            WEIGHTAGE ALLOCATION
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color }}>
            {used}% / {total}%
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={Math.min(used, total)}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: alpha(color, 0.12),
            '& .MuiLinearProgress-bar': {
              borderRadius: 5,
              backgroundColor: color,
              transition: 'all 0.3s ease',
            },
          }}
        />
        <Stack direction="row" sx={{ justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" sx={{ color }}>
            {isOver
              ? `⚠️ Over by ${used - total}%`
              : isValid
              ? '✓ Weightage complete'
              : `${remaining}% remaining`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Must equal exactly 100%
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
