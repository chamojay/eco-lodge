'use client';
import React, { useState, useEffect } from 'react';
import { activityService, ReservationActivity, Activity } from '@/app/services/activityService';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Select,
  Button,
  Alert,
  Grid,
  InputLabel,
  FormControl,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  fontWeight: 600,
}));

const FormContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
}));

const ReceptionActivity = () => {
  const [activities, setActivities] = useState<ReservationActivity[]>([]);
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [activityForm, setActivityForm] = useState({
    reservationId: '',
    activityId: '',
    scheduledDate: '',
    participants: '1',
  });

  const [isLocalCustomer, setIsLocalCustomer] = useState<boolean>(true);
  const [customerCountry, setCustomerCountry] = useState<string>('');

  useEffect(() => {
    const loadAllActivities = async () => {
      try {
        const data = await activityService.getAllActivities();
        setAllActivities(data);
      } catch (err) {
        setError('Failed to load activities');
      }
    };
    loadAllActivities();
  }, []);

  const checkCustomerNationality = async (reservationId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/reservations/${reservationId}/customer`
      );
      const data = await response.json();
      const isLocal = data.Country?.toLowerCase() === 'sri lanka';
      setIsLocalCustomer(isLocal);
      setCustomerCountry(data.Country || '');
    } catch (err) {
      console.error('Failed to fetch customer details:', err);
      setIsLocalCustomer(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setActivityForm({ ...activityForm, [name]: value });
    
    if (name === 'reservationId' && value) {
      checkCustomerNationality(value);
    }
  };

  const fetchReservationActivities = async () => {
    try {
      if (!activityForm.reservationId) {
        return setError('Please enter a Reservation ID');
      }
      const data = await activityService.getActivitiesForReservation(
        Number(activityForm.reservationId)
      );
      setActivities(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reservation activities');
    }
  };

  const handleAddActivity = async () => {
    try {
      const { reservationId, activityId, scheduledDate, participants } = activityForm;
      
      if (!reservationId || !activityId || !scheduledDate || !participants) {
        return setError('All fields are required');
      }

      const payload = {
        reservationId: parseInt(reservationId),
        activityId: parseInt(activityId),
        scheduledDate: scheduledDate,
        participants: parseInt(participants),
      };

      console.log('Submitting payload:', payload);

      await activityService.addActivityToReservation(payload);
      
      setSuccess('Activity added successfully!');
      setError('');
      setActivityForm(prev => ({
        ...prev,
        activityId: '',
        scheduledDate: '',
        participants: '1',
      }));
      fetchReservationActivities();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to add activity';
      setError(errorMessage);
      setSuccess('');
    }
  };

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
        Reservation Activities Management
      </Typography>

      {/* Available Activities Table */}
      <StyledPaper>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Available Activities
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Activity</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Local Price</TableCell>
                <TableCell align="right">Foreign Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allActivities.map(activity => (
                <TableRow key={activity.ActivityID} hover>
                  <TableCell>{activity.Name}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>
                    {activity.Description || 'No description'}
                  </TableCell>
                  <TableCell align="right">
                    {Number(activity.LocalPrice).toLocaleString('si-LK', {
                      style: 'currency',
                      currency: 'LKR',
                    })}
                  </TableCell>
                  <TableCell align="right">
                    {Number(activity.ForeignPrice).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </StyledPaper>

      {/* Activity Management Form */}
      <StyledPaper>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Add Activity to Reservation
        </Typography>
        <FormContainer>
          <TextField
            label="Reservation ID"
            type="number"
            name="reservationId"
            value={activityForm.reservationId}
            onChange={handleInputChange}
            fullWidth
            InputProps={{ inputProps: { min: 1 } }}
          />
          <Box sx={{ width: '100%', mt: 1 }}>
            {activityForm.reservationId && customerCountry && (
              <Typography variant="caption" color="text.secondary">
                Customer from: {customerCountry} ({isLocalCustomer ? 'Local rates - LKR' : 'Foreign rates - USD'})
              </Typography>
            )}
          </Box>
          <FormControl fullWidth>
            <InputLabel>Select Activity</InputLabel>
            <Select
              name="activityId"
              value={activityForm.activityId}
              onChange={handleInputChange}
              label="Select Activity"
            >
              <MenuItem value="">Select Activity</MenuItem>
              {allActivities.map(activity => (
                <MenuItem key={activity.ActivityID} value={activity.ActivityID}>
                  {activity.Name} (
                  {Number(activity.LocalPrice).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Scheduled Date"
            type="date"
            name="scheduledDate"
            value={activityForm.scheduledDate}
            onChange={handleInputChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Participants"
            type="number"
            name="participants"
            value={activityForm.participants}
            onChange={handleInputChange}
            fullWidth
            InputProps={{ inputProps: { min: 1 } }}
          />
        </FormContainer>
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <StyledButton
            variant="contained"
            color="success"
            onClick={handleAddActivity}
          >
            Add Activity
          </StyledButton>
          <StyledButton
            variant="contained"
            color="primary"
            onClick={fetchReservationActivities}
          >
            Fetch Activities
          </StyledButton>
        </Box>
      </StyledPaper>

      {/* Status Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Reservation Activities List */}
      {activities.length > 0 && (
        <StyledPaper>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Existing Reservation Activities
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Activity</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Participants</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Total Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activities.map(activity => {
                  const isLocalCustomer = activity.Country?.toLowerCase() === 'sri lanka';
                  const unitPrice = isLocalCustomer ? 
                    activity.LocalPrice : 
                    activity.ForeignPrice;
                
                  return (
                    <TableRow key={activity.ReservationActivityID} hover>
                      <TableCell>{activity.Name}</TableCell>
                      <TableCell>
                        {new Date(activity.ScheduledDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">{activity.Participants}</TableCell>
                      <TableCell align="right">
                        {isLocalCustomer 
                          ? Number(activity.Amount / activity.Participants).toLocaleString('si-LK', {
                              style: 'currency',
                              currency: 'LKR',
                            })
                          : Number(activity.Amount / activity.Participants).toLocaleString('en-US', {
                              style: 'currency',
                              currency: 'USD',
                            })
                        }
                      </TableCell>
                      <TableCell align="right">
                        {isLocalCustomer
                          ? Number(activity.Amount).toLocaleString('si-LK', {
                              style: 'currency',
                              currency: 'LKR',
                            })
                          : Number(activity.Amount).toLocaleString('en-US', {
                              style: 'currency',
                              currency: 'USD',
                            })
                        }
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </StyledPaper>
      )}
    </Box>
  );
};

export default ReceptionActivity;