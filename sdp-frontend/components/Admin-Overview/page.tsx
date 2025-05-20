import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Paper, Typography, CircularProgress, 
  ToggleButton, ToggleButtonGroup, Card, CardContent
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, ResponsiveContainer, Cell
} from 'recharts';
import { format } from 'date-fns';
import { overviewService } from '@/app/services/overviewService';
import { OverviewData } from '@/types/overviewTypes';

// Define types for our data
interface AdminOverviewProps {}

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a472a', // Dark green
    },
    secondary: {
      main: '#2e7d32', // Forest green
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
});

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminOverview: React.FC<AdminOverviewProps> = () => {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchOverviewData = async (range: 'daily' | 'weekly' | 'monthly') => {
    try {
      setLoading(true);
      setError(null);
      const response = await overviewService.getOverviewData(range);
      console.log('Fetched overview data:', response); // Debug log
      if (!response || !response.revenue) {
        throw new Error('Invalid data format received');
      }
      setData(response);
    } catch (error) {
      console.error('Error fetching overview data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData(timeRange);
  }, [timeRange]);

  // Show error state if there's an error
  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Add data validation before rendering
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!data || !data.revenue) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography color="error">No data available</Typography>
      </Box>
    );
  }

  // Format revenue data for charts
  const revenueData = [
    { name: 'Rooms', value: Number(data.revenue.rooms).toFixed(2) },
    { name: 'Activities', value: Number(data.revenue.activities).toFixed(2) },
    { name: 'Restaurant', value: Number(data.revenue.restaurant).toFixed(2) },
    { name: 'Extra Charges', value: Number(data.revenue.extraCharges).toFixed(2) },
  ];

  // Format occupancy data for pie chart
  const occupancyData = [
    { name: 'Occupied', value: Number(data.occupancyRate) },
    { name: 'Available', value: 100 - Number(data.occupancyRate) }
  ];

  // Format popular activities for bar chart
  const activityData = data.activities.popular.map(activity => ({
    name: activity.name,
    count: Number(activity.count)
  }));

  return (
    <ThemeProvider theme={theme}>
      <Box p={4} bgcolor="background.default" minHeight="100vh">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" color="primary" fontWeight="bold">
            Dashboard Overview
          </Typography>
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={(_, newValue) => newValue && setTimeRange(newValue)}
            aria-label="time range"
          >
            <ToggleButton value="daily">Daily</ToggleButton>
            <ToggleButton value="weekly">Weekly</ToggleButton>
            <ToggleButton value="monthly">Monthly</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Grid container spacing={3}>
          {/* Revenue Overview */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: '400px' }}>
              <Typography variant="h6" gutterBottom>
                Revenue Breakdown (Total: LKR {Number(data.revenue.total).toLocaleString()})
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis 
                    tickFormatter={(value) => `LKR ${Number(value).toLocaleString()}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`LKR ${Number(value).toLocaleString()}`, 'Revenue']}
                  />
                  <Legend />
                  <Bar dataKey="value" fill="#1a472a" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Occupancy Rate */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '400px' }}>
              <Typography variant="h6" gutterBottom>
                Occupancy Rate ({data.occupancyRate}%)
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={occupancyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {occupancyData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Booking Statistics */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Booking Statistics</Typography>
              <Grid container spacing={2}>
                {Object.entries(data.bookings).map(([key, value]) => (
                  <Grid item xs={6} key={key}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </Typography>
                        <Typography variant="h4">{value}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Popular Activities */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Popular Activities (Revenue: LKR {Number(data.activities.revenue).toLocaleString()})
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2e7d32" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Restaurant Analytics */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Restaurant Overview (Revenue: LKR {Number(data.restaurant.revenue).toLocaleString()})
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary">Total Orders</Typography>
                      <Typography variant="h4">{data.restaurant.orders}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={8}>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.restaurant.popularItems}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#1a472a" />
                    </BarChart>
                  </ResponsiveContainer>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
};

export default AdminOverview;