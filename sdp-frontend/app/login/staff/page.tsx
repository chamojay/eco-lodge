'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Box, Typography, Container, Grid, Paper } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface LoginFormInputs {
    email: string;
    password: string;
}

const StaffLogin = () => {
    const { control, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();
    const router = useRouter();

    const onSubmit = async (data: LoginFormInputs) => {
        try {
            const response = await axios.post('/api/auth/login', data);
            //const { token, role } = response.data;
            
           // localStorage.setItem('token', token); // Store JWT for authentication
            
           // if (role === 'admin') router.push('/admin-dashboard');
           // else if (role === 'receptionist') router.push('/reception-dashboard');
           // else if (role === 'restaurant_cashier') router.push('/restaurant-dashboard');
        } catch (error) {
            console.error('Login failed', error);
            alert('Invalid credentials. Please try again.');
        }
    };

    return (
        <Container maxWidth="md">
            <Paper elevation={6} sx={{ p: 4, mt: 8, borderRadius: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    {/* Left Side - Image Placeholder */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Image src="/images/staff-login-placeholder.jpg" alt="Staff Login" width={300} height={300} />
                        </Box>
                    </Grid>
                    
                    {/* Right Side - Login Form */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h4" fontWeight="bold" textAlign="center" mb={2}>
                            Staff Login
                        </Typography>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            {/* Email Field */}
                            <Controller
                                name="email"
                                control={control}
                                defaultValue=""
                                rules={{ 
                                    required: 'Email is required', 
                                    pattern: { 
                                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 
                                        message: 'Enter a valid email address' 
                                    }
                                }}
                                render={({ field }) => (
                                    <TextField {...field} label="Email" fullWidth margin="normal" error={!!errors.email} helperText={errors.email?.message} />
                                )}
                            />
                            
                            {/* Password Field */}
                            <Controller
                                name="password"
                                control={control}
                                defaultValue=""
                                rules={{ 
                                    required: 'Password is required', 
                                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                                }}
                                render={({ field }) => (
                                    <TextField {...field} label="Password" type="password" fullWidth margin="normal" error={!!errors.password} helperText={errors.password?.message} />
                                )}
                            />
                            
                            {/* Submit Button */}
                            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                                Login
                            </Button>
                        </form>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default StaffLogin;
