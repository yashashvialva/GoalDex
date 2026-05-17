'use client';

import { Chip, alpha } from '@mui/material';
import { getStatusColor, formatStatus } from '@/lib/utils/helpers';

interface StatusChipProps {
  status: string;
  size?: 'small' | 'medium';
}

export default function StatusChip({ status, size = 'small' }: StatusChipProps) {
  const colorMap: Record<string, string> = {
    draft: '#94a3b8',
    submitted: '#3b82f6',
    approved: '#22c55e',
    sent_back: '#f59e0b',
    not_started: '#94a3b8',
    on_track: '#3b82f6',
    completed: '#22c55e',
  };

  const color = colorMap[status] || '#94a3b8';

  return (
    <Chip
      label={formatStatus(status)}
      size={size}
      sx={{
        backgroundColor: alpha(color, 0.12),
        color: color,
        border: `1px solid ${alpha(color, 0.3)}`,
        fontWeight: 600,
        fontSize: '0.7rem',
      }}
    />
  );
}
