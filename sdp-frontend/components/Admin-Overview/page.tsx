import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, CircularProgress } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { fetchUsers, fetchBookings, fetchRevenue, fetchFeedback } from '@/app/services'; // Adjust the import path as necessary

const theme = createTheme({
    palette: {
        primary: {
            main: '#000000', // Black
        },
        secondary: {
            main: '#006400', // Dark Green
        },
        background: {
            default: '#ffffff', // White
        },
    },
});

const AdminOverview: React.FC = () => {
    const [data, setData] = useState({
        users: 0,
        bookings: 0,
        revenue: 0,
        feedback: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [users, bookings, revenue, feedback] = await Promise.all([
                    fetchUsers(),
                    fetchBookings(),
                    fetchRevenue(),
                    fetchFeedback(),
                ]);
                setData({
                    users: users.total,
                    bookings: bookings.total,
                    revenue: revenue.total,
                    feedback: feedback.total,
                });
            } catch (error) {
                console.error('Error fetching admin overview data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100vh"
                bgcolor={theme.palette.background.default}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <Box p={4} bgcolor={theme.palette.background.default}>
                <Typography variant="h4" color="primary" gutterBottom>
                    Admin Overview Dashboard
                </Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper elevation={3} style={{ padding: '16px', textAlign: 'center' }}>
                            <Typography variant="h6" color="secondary">
                                Total Users
                            </Typography>
                            <Typography variant="h4" color="primary">
                                {data.users}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper elevation={3} style={{ padding: '16px', textAlign: 'center' }}>
                            <Typography variant="h6" color="secondary">
                                Total Bookings
                            </Typography>
                            <Typography variant="h4" color="primary">
                                {data.bookings}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper elevation={3} style={{ padding: '16px', textAlign: 'center' }}>
                            <Typography variant="h6" color="secondary">
                                Total Revenue
                            </Typography>
                            <Typography variant="h4" color="primary">
                                ${data.revenue}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper elevation={3} style={{ padding: '16px', textAlign: 'center' }}>
                            <Typography variant="h6" color="secondary">
                                Feedback Received
                            </Typography>
                            <Typography variant="h4" color="primary">
                                {data.feedback}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </ThemeProvider>
    );
};

export default AdminOverview;