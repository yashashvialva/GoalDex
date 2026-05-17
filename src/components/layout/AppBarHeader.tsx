'use client';

import {
  AppBar,
  Toolbar,
  Typography,
  Stack,
  Avatar,
  Chip,
  Box,
  alpha,
} from '@mui/material';
import { useAuthStore } from '@/lib/store/authStore';
import { getInitials, getRoleLabel, getRoleColor } from '@/lib/utils/helpers';
import { DRAWER_WIDTH } from './Sidebar';

export default function AppBarHeader() {
  const { user } = useAuthStore();

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${DRAWER_WIDTH}px)`,
        ml: `${DRAWER_WIDTH}px`,
        backgroundColor: alpha('#12121f', 0.85),
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px !important' }}>
        {/* Page context */}
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Typography>
        </Box>

        {/* User info */}
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Chip
            label={user ? getRoleLabel(user.role) : '—'}
            size="small"
            sx={{
              backgroundColor: user ? alpha(getRoleColor(user.role), 0.12) : undefined,
              color: user ? getRoleColor(user.role) : undefined,
              border: `1px solid ${user ? alpha(getRoleColor(user.role), 0.3) : 'transparent'}`,
              fontWeight: 800,
              fontSize: '0.7rem',
            }}
          />
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                fontSize: '0.8rem',
                fontWeight: 700,
                background: user
                  ? `linear-gradient(135deg, ${getRoleColor(user.role)}, ${alpha(getRoleColor(user.role), 0.6)})`
                  : undefined,
              }}
            >
              {user ? getInitials(user.name) : '?'}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {user?.name || 'Loading...'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                {user?.department}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
