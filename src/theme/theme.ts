'use client';

import { createTheme, alpha } from '@mui/material/styles';

// GoalDex Enterprise Palette — Deep Indigo + Teal
const palette = {
  primary: {
    main: '#6366f1',      // Indigo-500
    light: '#818cf8',     // Indigo-400
    dark: '#4338ca',      // Indigo-700
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#14b8a6',      // Teal-500
    light: '#2dd4bf',     // Teal-400
    dark: '#0d9488',      // Teal-600
    contrastText: '#ffffff',
  },
  background: {
    default: '#0f0f1a',   // Deep dark
    paper: '#1a1a2e',     // Card background
  },
  text: {
    primary: '#e2e8f0',
    secondary: '#94a3b8',
  },
  error: {
    main: '#ef4444',
    light: '#f87171',
  },
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
  },
  success: {
    main: '#22c55e',
    light: '#4ade80',
  },
  info: {
    main: '#3b82f6',
    light: '#60a5fa',
  },
  divider: 'rgba(148, 163, 184, 0.12)',
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    ...palette,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.25rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.1rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    subtitle1: {
      fontSize: '0.95rem',
      fontWeight: 500,
      color: palette.text.secondary,
    },
    subtitle2: {
      fontSize: '0.85rem',
      fontWeight: 500,
      color: palette.text.secondary,
    },
    body1: {
      fontSize: '0.95rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.85rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: `${alpha('#6366f1', 0.3)} transparent`,
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: alpha('#6366f1', 0.3),
            borderRadius: 3,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 20px',
          fontSize: '0.875rem',
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 6px 20px ${alpha(palette.primary.main, 0.4)}`,
          },
        },
        contained: {
          background: `linear-gradient(135deg, ${palette.primary.main} 0%, ${palette.primary.dark} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${palette.primary.light} 0%, ${palette.primary.main} 100%)`,
          },
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${palette.secondary.main} 0%, ${palette.secondary.dark} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${palette.secondary.light} 0%, ${palette.secondary.main} 100%)`,
            boxShadow: `0 6px 20px ${alpha(palette.secondary.main, 0.4)}`,
          },
        },
        outlined: {
          borderColor: alpha(palette.primary.main, 0.5),
          '&:hover': {
            borderColor: palette.primary.main,
            backgroundColor: alpha(palette.primary.main, 0.12),
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: alpha(palette.background.paper, 0.4),
          backdropFilter: 'blur(16px)',
          border: `1px solid ${alpha(palette.primary.main, 0.15)}`,
          borderRadius: 16,
          boxShadow: `0 8px 32px ${alpha('#000', 0.4)}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            borderColor: alpha(palette.primary.main, 0.6),
            boxShadow: `0 12px 48px ${alpha('#000', 0.6)}, 0 0 20px ${alpha(palette.primary.main, 0.2)}`,
            backgroundColor: alpha(palette.background.paper, 0.55),
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: alpha(palette.background.paper, 0.4),
          backdropFilter: 'blur(16px)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '& fieldset': {
              borderColor: alpha(palette.text.secondary, 0.2),
            },
            '&:hover fieldset': {
              borderColor: alpha(palette.primary.main, 0.5),
            },
            '&.Mui-focused fieldset': {
              borderColor: palette.primary.main,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '0.75rem',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: alpha(palette.primary.main, 0.08),
            color: palette.text.secondary,
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            borderBottom: `1px solid ${palette.divider}`,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${palette.divider}`,
          padding: '14px 16px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: alpha(palette.primary.main, 0.08),
            transform: 'scale(1.002)',
            boxShadow: `inset 4px 0 0 ${palette.primary.main}`,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          backgroundColor: alpha(palette.background.paper, 0.7),
          backdropFilter: 'blur(24px)',
          border: `1px solid ${alpha(palette.primary.main, 0.2)}`,
          boxShadow: `0 24px 64px ${alpha('#000', 0.6)}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha('#0f0f1a', 0.4),
          backdropFilter: 'blur(24px)',
          borderBottom: `1px solid ${alpha(palette.divider, 0.5)}`,
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: alpha('#0f0f1a', 0.6),
          backdropFilter: 'blur(24px)',
          borderRight: `1px solid ${alpha(palette.divider, 0.5)}`,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 8,
          backgroundColor: alpha(palette.primary.main, 0.12),
        },
        bar: {
          borderRadius: 4,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontSize: '0.875rem',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: alpha(palette.background.paper, 0.95),
          border: `1px solid ${palette.divider}`,
          borderRadius: 8,
          fontSize: '0.8rem',
          padding: '8px 12px',
          backdropFilter: 'blur(8px)',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
  },
});

export default theme;
