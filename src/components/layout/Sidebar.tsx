'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Stack,
  alpha,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrackChanges as GoalsIcon,
  EventNote as CheckinIcon,
  Groups as TeamIcon,
  Approval as ApprovalIcon,
  AdminPanelSettings as AdminIcon,
  People as UsersIcon,
  Share as SharedIcon,
  Assessment as ReportsIcon,
  History as AuditIcon,
  BarChart as AnalyticsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuthStore } from '@/lib/store/authStore';
import { UserRole } from '@/lib/types';

const DRAWER_WIDTH = 260;

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navByRole: Record<UserRole, NavItem[]> = {
  employee: [
    { label: 'Dashboard', href: '/employee/dashboard', icon: <DashboardIcon /> },
    { label: 'My Goals', href: '/employee/goals', icon: <GoalsIcon /> },
    { label: 'Check-ins', href: '/employee/checkins', icon: <CheckinIcon /> },
  ],
  manager: [
    { label: 'Dashboard', href: '/manager/dashboard', icon: <DashboardIcon /> },
    { label: 'Approvals', href: '/manager/approvals', icon: <ApprovalIcon /> },
    { label: 'Team Overview', href: '/manager/team', icon: <TeamIcon /> },
    { label: 'Check-in Review', href: '/manager/checkins', icon: <CheckinIcon /> },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: <DashboardIcon /> },
    { label: 'Users', href: '/admin/users', icon: <UsersIcon /> },
    { label: 'Shared Goals', href: '/admin/shared-goals', icon: <SharedIcon /> },
    { label: 'Reports', href: '/admin/reports', icon: <ReportsIcon /> },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: <AuditIcon /> },
    { label: 'Analytics', href: '/admin/analytics', icon: <AnalyticsIcon /> },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const role = user?.role || 'employee';
  const navItems = navByRole[role] || navByRole.employee;

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    router.refresh();
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          backgroundColor: '#12121f',
          backgroundImage: 'none',
        },
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #14b8a6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 16px ${alpha('#6366f1', 0.4)}`,
            }}
          >
            <GoalsIcon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #6366f1, #14b8a6)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.1rem',
              }}
            >
              GoalDex
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              Performance Tracking
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ mx: 2, opacity: 0.5 }} />

      {/* Navigation */}
      <List sx={{ px: 1.5, py: 2, flex: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => router.push(item.href)}
                sx={{
                  borderRadius: '10px',
                  px: 2,
                  py: 1.2,
                  backgroundColor: isActive ? alpha('#6366f1', 0.12) : 'transparent',
                  borderLeft: isActive ? `3px solid #6366f1` : '3px solid transparent',
                  '&:hover': {
                    backgroundColor: alpha('#6366f1', 0.08),
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: isActive ? '#6366f1' : 'text.secondary',
                    '& .MuiSvgIcon-root': { fontSize: 20 },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.85rem',
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? '#e2e8f0' : 'text.secondary',
                      }}
                    >
                      {item.label}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Logout */}
      <Box sx={{ p: 1.5 }}>
        <Divider sx={{ mb: 1, opacity: 0.5 }} />
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: '10px',
            px: 2,
            py: 1.2,
            '&:hover': {
              backgroundColor: alpha('#ef4444', 0.08),
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
            <LogoutIcon sx={{ fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: 'text.secondary',
                }}
              >
                Logout
              </Typography>
            }
          />
        </ListItemButton>
      </Box>
    </Drawer>
  );
}

export { DRAWER_WIDTH };
