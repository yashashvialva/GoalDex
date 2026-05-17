'use client';

import { Box, Stack } from '@mui/material';

export default function LoadingScreen() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}
    >
      <Stack spacing={4} sx={{ alignItems: 'center' }}>
        <Box
          sx={{
            position: 'relative',
            width: 240,
            height: 240,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'float 3s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-20px)' },
            },
          }}
        >
          {/* The Coffee Cat Image */}
          <Box
            component="img"
            src="/coffecat.gif"
            alt="Loading cat"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              mixBlendMode: 'screen',
              filter: 'drop-shadow(0 15px 30px rgba(20, 184, 166, 0.5))',
            }}
          />
        </Box>
        
        {/* Pulsing Shadow on the ground */}
        <Box
          sx={{
            width: 100,
            height: 12,
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            boxShadow: '0 0 25px rgba(20, 184, 166, 0.7)',
            animation: 'shadowPulse 3s ease-in-out infinite',
            '@keyframes shadowPulse': {
              '0%, 100%': { transform: 'scale(1)', opacity: 0.8 },
              '50%': { transform: 'scale(0.7)', opacity: 0.3 },
            },
            mt: -3,
          }}
        />
      </Stack>
    </Box>
  );
}
