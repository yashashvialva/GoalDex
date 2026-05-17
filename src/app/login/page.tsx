'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Stack,
  Divider,
  Chip,
  CircularProgress,
  alpha,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  TrackChanges as GoalIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { createClient } from '@/lib/supabase/client';

const DEMO_ACCOUNTS = [
  { email: 'employee@goaldex.com', label: 'Employee', color: '#6366f1' },
  { email: 'manager@goaldex.com', label: 'Manager', color: '#14b8a6' },
  { email: 'admin@goaldex.com', label: 'Admin', color: '#f59e0b' },
];

export default function LoginPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        enqueueSnackbar(error.message, { variant: 'error' });
        setLoading(false);
        return;
      }

      // Fetch profile to determine redirect
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        const role = profile?.role || 'employee';
        enqueueSnackbar('Login successful!', { variant: 'success' });
        router.push(`/${role}/dashboard`);
        router.refresh();
      }
    } catch {
      enqueueSnackbar('An unexpected error occurred', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('goaldex123');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `
          radial-gradient(ellipse at 20% 50%, ${alpha('#6366f1', 0.15)} 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, ${alpha('#14b8a6', 0.1)} 0%, transparent 50%),
          radial-gradient(ellipse at 50% 80%, ${alpha('#6366f1', 0.08)} 0%, transparent 50%),
          linear-gradient(180deg, #0f0f1a 0%, #0a0a14 100%)
        `,
        p: 2,
      }}
    >
      {/* Animated background orbs */}
      <Box
        sx={{
          position: 'fixed',
          top: '15%',
          left: '10%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha('#6366f1', 0.08)}, transparent)`,
          filter: 'blur(60px)',
          animation: 'float 8s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px) scale(1)' },
            '50%': { transform: 'translateY(-30px) scale(1.05)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'fixed',
          bottom: '20%',
          right: '15%',
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha('#14b8a6', 0.06)}, transparent)`,
          filter: 'blur(50px)',
          animation: 'float2 10s ease-in-out infinite',
          '@keyframes float2': {
            '0%, 100%': { transform: 'translateY(0px) scale(1)' },
            '50%': { transform: 'translateY(20px) scale(1.08)' },
          },
        }}
      />

      <Card
        sx={{
          maxWidth: 440,
          width: '100%',
          position: 'relative',
          overflow: 'visible',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -1,
            left: -1,
            right: -1,
            bottom: -1,
            borderRadius: '17px',
            background: `linear-gradient(135deg, ${alpha('#6366f1', 0.4)}, ${alpha('#14b8a6', 0.2)}, ${alpha('#6366f1', 0.1)})`,
            zIndex: -1,
          },
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Stack spacing={1} sx={{ alignItems: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '16px',
                background: `linear-gradient(135deg, #6366f1, #14b8a6)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 8px 32px ${alpha('#6366f1', 0.4)}`,
                mb: 1,
              }}
            >
              <GoalIcon sx={{ fontSize: 36, color: '#fff' }} />
            </Box>
            <Typography variant="h3" fontWeight={800} sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #14b8a6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              GoalDex
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Employee Goal Setting & Performance Tracking
            </Typography>
          </Stack>

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            <Stack spacing={2.5}>
              <TextField
                id="email-input"
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                slotProps={{
                  input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}}
              />
              <TextField
                id="password-input"
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                slotProps={{
                  input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}}
              />
              <Button
                id="login-button"
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </Button>
            </Stack>
          </form>

          {/* Demo Accounts */}
          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary">
              QUICK ACCESS — DEMO ACCOUNTS
            </Typography>
          </Divider>

          <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
            {DEMO_ACCOUNTS.map((account) => (
              <Chip
                key={account.email}
                id={`demo-${account.label.toLowerCase()}`}
                label={account.label}
                onClick={() => handleDemoLogin(account.email)}
                sx={{
                  px: 1,
                  fontWeight: 600,
                  backgroundColor: alpha(account.color, 0.12),
                  color: account.color,
                  border: `1px solid ${alpha(account.color, 0.3)}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: alpha(account.color, 0.2),
                    transform: 'translateY(-1px)',
                  },
                }}
              />
            ))}
          </Stack>

          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            align="center"
            sx={{ mt: 2 }}
          >
            Demo password: goaldex123
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
