'use client';
import { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Grid, 
  Typography, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Chip
} from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers';
import { StepComponentProps } from './utils/types';

const RoomSelection = ({ data, setData, onNext, onBack }: StepComponentProps) => {
  const [availability, setAvailability] = useState<Date[]>([]);
  const [roomType, setRoomType] = useState('');

  useEffect(() => {
    // Fetch room availability
    const fetchAvailability = async () => {
      const response = await fetch(
        `/api/reservations/availability?roomType=${roomType}&checkIn=${data.checkIn?.format()}&checkOut=${data.checkOut?.format()}`
      );
      const dates = await response.json();
      setAvailability(dates);
    };
    
    if (data.checkIn && data.checkOut) fetchAvailability();
  }, [roomType, data.checkIn, data.checkOut]);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom color="#1a472a">
        Select Your Room
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Room Type</InputLabel>
            <Select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              label="Room Type"
            >
              <MenuItem value="Standard">Standard</MenuItem>
              <MenuItem value="Delux">Delux</MenuItem>
              <MenuItem value="Suite">Suite</MenuItem>
              <MenuItem value="Cabana">Cabana</MenuItem>
            </Select>
          </FormControl>

          <DateCalendar
            value={data.checkIn}
            onChange={(newDate) => setData(prev => ({ ...prev, checkIn: newDate }))}
            disablePast
            slots={{
              day: (props) => {
                const isAvailable = availability.some(date => 
                  date.toDateString() === props.day.toDateString()
                );
                return (
                  <Box
                    {...props}
                    sx={{
                      bgcolor: isAvailable ? '#2e7d32' : '#d32f2f',
                      color: 'white',
                      borderRadius: '4px',
                      '&:hover': { bgcolor: isAvailable ? '#1a472a' : '#9a0007' }
                    }}
                  />
                );
              }
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Packages
            </Typography>
            <Select
              fullWidth
              value={data.packageType}
              onChange={(e) => setData(prev => ({
                ...prev,
                packageType: e.target.value as typeof data.packageType
              }))}
            >
              <MenuItem value="RoomOnly">Room Only</MenuItem>
              <MenuItem value="HalfBoard">Half Board</MenuItem>
              <MenuItem value="FullBoard">Full Board</MenuItem>
            </Select>
          </Box>

          {/* Room listing */}
          <Box sx={{ border: '1px solid #1a472a', borderRadius: 2, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Available Rooms
            </Typography>
            {/* Map through available rooms */}
            <Box sx={{ p: 2, border: '1px solid #eee', mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                Standard Room
                <Chip label="$150/night" sx={{ ml: 2, bgcolor: '#1a472a', color: 'white' }} />
              </Typography>
              <Button 
                variant="outlined"
                sx={{ borderColor: '#1a472a', color: '#1a472a' }}
                onClick={() => {
                  setData(prev => ({
                    ...prev,
                    selectedRoom: {
                      roomId: 1,
                      roomNumber: '101',
                      type: 'Standard',
                      price: 150
                    }
                  }));
                  onNext();
                }}
              >
                Select Room
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoomSelection;