'use client';

import { Box, Typography, Stack, alpha } from '@mui/material';
import { InboxOutlined } from '@mui/icons-material';

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export default function EmptyState({
  title = 'No data yet',
  message = 'There are no items to display.',
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        py: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Stack spacing={2} sx={{ alignItems: 'center' }}>
        <Box
          sx={{
            p: 3,
            borderRadius: '50%',
            backgroundColor: alpha('#6366f1', 0.08),
          }}
        >
          <InboxOutlined sx={{ fontSize: 48, color: 'text.secondary' }} />
        </Box>
        <Typography variant="h6" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          {message}
        </Typography>
      </Stack>
    </Box>
  );
}
