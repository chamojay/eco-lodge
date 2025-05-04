'use client';

import React, { useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page after 3 seconds
    const timer = setTimeout(() => {
      router.push('/login/staff');
    }, 3000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#1a472a',
        color: 'white',
      }}
    >
      <Typography
        variant="h2"
        sx={{
          mb: 4,
          fontFamily: '"Cormorant Garamond", serif',
          textAlign: 'center',
        }}
      >
        Algama Ella Eco Lodge
      </Typography>
      <CircularProgress size={50} sx={{ color: 'white' }} />
    </Box>
  );
}