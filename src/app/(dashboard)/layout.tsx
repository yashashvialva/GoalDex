'use client';

import { useEffect, useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import Sidebar, { DRAWER_WIDTH } from '@/components/layout/Sidebar';
import AppBarHeader from '@/components/layout/AppBarHeader';
import { useAuthStore } from '@/lib/store/authStore';
import LoadingScreen from '@/components/shared/LoadingScreen';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { fetchProfile, isLoading, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetchProfile().then(() => setMounted(true));
  }, [fetchProfile]);

  if (!mounted || isLoading) {
    return <LoadingScreen message="Initializing GoalDex..." />;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <AppBarHeader />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: `${DRAWER_WIDTH}px`,
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
          minHeight: '100vh',
          backgroundColor: '#0f0f1a',
        }}
      >
        <Toolbar /> {/* Spacer for fixed AppBar */}
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
