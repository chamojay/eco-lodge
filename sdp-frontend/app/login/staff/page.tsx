'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

const StaffLogin = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Add validation
      if (!credentials.username || !credentials.password) {
        setError('Please enter both username and password');
        return;
      }

      const response = await axios.post('http://localhost:5000/api/auth/login', credentials);
      const { token, role } = response.data;

      if (!token || !role) {
        throw new Error('Invalid response from server');
      }

      try {
        await login(token, role);
        
        switch (role) {
          case 'ADMIN':
            router.push('/admin/dashboard');
            break;
          case 'RECEPTION':
            router.push('/reception/dashboard');
            break;
          case 'RESTAURANT':
            router.push('/restaurant-pos');
            break;
          default:
            setError('Invalid role assigned to user');
        }
      } catch (loginError) {
        console.error('Context login error:', loginError);
        setError('Authentication failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#1a472a',
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          bgcolor: 'white',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 4,
            textAlign: 'center',
            color: '#1a472a',
            fontFamily: '"Cormorant Garamond", serif',
          }}
        >
          Staff Login
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="Username"
            margin="normal"
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              bgcolor: '#1a472a',
              '&:hover': {
                bgcolor: '#2e7d32',
              },
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default StaffLogin;
