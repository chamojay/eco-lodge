import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { activityService, Activity, ReservationActivity, ActivityCreate } from '@/app/services/activityService';

interface FormData {
  name: string;
  description: string;
  localPrice: string | number;
  foreignPrice: string | number;
}

const AdminActivity: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [formData, setFormData] = useState<FormData>({ name: '', description: '', localPrice: '', foreignPrice: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [reservationId, setReservationId] = useState<string>('');
  const [reservationActivities, setReservationActivities] = useState<ReservationActivity[]>([]);
  const [error, setError] = useState<string>('');

  // Fetch all activities on mount
  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const data = await activityService.getAllActivities();
      setActivities(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const activityData: ActivityCreate = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        localPrice: Number(formData.localPrice),
        foreignPrice: Number(formData.foreignPrice),
      };
      if (editingId) {
        await activityService.updateActivity(editingId, activityData);
        alert('Activity updated successfully');
      } else {
        await activityService.addActivity(activityData);
        alert('Activity created successfully');
      }
      setFormData({ name: '', description: '', localPrice: '', foreignPrice: '' });
      setEditingId(null);
      fetchActivities();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (activity: Activity) => {
    setFormData({
      name: activity.Name,
      description: activity.Description || '',
      localPrice: activity.LocalPrice.toString(),
      foreignPrice: activity.ForeignPrice.toString(),
    });
    setEditingId(activity.ActivityID);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await activityService.deleteActivity(id);
        alert('Activity deleted successfully');
        fetchActivities();
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const fetchReservationActivities = async () => {
    if (!reservationId) {
      setError('Please enter a Reservation ID');
      return;
    }
    try {
      const data = await activityService.getActivitiesForReservation(parseInt(reservationId));
      setReservationActivities(data);
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Activity Management
      </Typography>

      {/* Activity Form */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {editingId ? 'Edit Activity' : 'Add New Activity'}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
          <TextField
            label="Activity Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            fullWidth
          />
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            multiline
            rows={3}
            fullWidth
          />
          <TextField
            label="Local Price"
            name="localPrice"
            value={formData.localPrice}
            onChange={handleInputChange}
            type="number"
            inputProps={{ step: '0.01', min: '0' }}
            required
            fullWidth
          />
          <TextField
            label="Foreign Price"
            name="foreignPrice"
            value={formData.foreignPrice}
            onChange={handleInputChange}
            type="number"
            inputProps={{ step: '0.01', min: '0' }}
            required
            fullWidth
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button type="submit" variant="contained" color="primary">
              {editingId ? 'Update Activity' : 'Add Activity'}
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setFormData({ name: '', description: '', localPrice: '', foreignPrice: '' });
                  setEditingId(null);
                }}
              >
                Cancel
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Error Message */}
      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

      {/* Activities Table */}
      <Typography variant="h6" gutterBottom>
        Activities List
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Local Price</TableCell>
              <TableCell>Foreign Price</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.ActivityID}>
                <TableCell>{activity.ActivityID}</TableCell>
                <TableCell>{activity.Name}</TableCell>
                <TableCell>{activity.Description}</TableCell>
                <TableCell>{(Number(activity.LocalPrice) || 0).toFixed(2)}</TableCell> {/* Ensure it's a number */}
                <TableCell>{(Number(activity.ForeignPrice) || 0).toFixed(2)}</TableCell> {/* Ensure it's a number */}
                <TableCell>
                  <IconButton onClick={() => handleEdit(activity)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(activity.ActivityID)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Reservation Activities View */}
      <Typography variant="h6" gutterBottom>
        View Reservation Activities
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <TextField
          label="Reservation ID"
          value={reservationId}
          onChange={(e) => setReservationId(e.target.value)}
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={fetchReservationActivities}>
          Fetch
        </Button>
      </Box>
      {reservationActivities.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Activity Name</TableCell>
                <TableCell>Scheduled Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Participants</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservationActivities.map((ra) => (
                <TableRow key={ra.ReservationActivityID}>
                  <TableCell>{ra.ReservationActivityID}</TableCell>
                  <TableCell>{ra.Name}</TableCell>
                  <TableCell>{ra.ScheduledDate}</TableCell>
                  <TableCell>{ra.Amount}</TableCell>
                  <TableCell>{ra.Participants}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AdminActivity;