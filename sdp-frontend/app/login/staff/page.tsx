'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useRouter } from 'next/navigation';

const StaffLogin = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState('reception');
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Add your authentication logic here
      // For now, we'll just simulate a login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (userType === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/reception/dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
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
        <form onSubmit={handleLogin}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Login As</InputLabel>
            <Select
              value={userType}
              label="Login As"
              onChange={(e) => setUserType(e.target.value)}
            >
              <MenuItem value="reception">Reception</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
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
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default StaffLogin;
