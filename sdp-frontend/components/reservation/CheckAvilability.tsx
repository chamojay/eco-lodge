'use client';
import { useState } from 'react';
import { 
  Box, 
  Button, 
  FormControlLabel, 
  Checkbox, 
  Stack, 
  Typography 
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { StepComponentProps } from './utils/types';

const CheckAvailability = ({ data, setData, onNext }: StepComponentProps) => {
  const [error, setError] = useState('');

  const handleDateChange = (name: 'checkIn' | 'checkOut') => (date: Date | null) => {
    setData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const handleSubmit = async () => {
    if (!data.checkIn || !data.checkOut) {
      setError('Please select both check-in and check-out dates');
      return;
    }
    if (data.checkIn >= data.checkOut) {
      setError('Check-out date must be after check-in date');
      return;
    }
    
    try {
      const response = await fetch('/api/reservations/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkIn: data.checkIn.toISOString(),
          checkOut: data.checkOut.toISOString()
        })
      });
      
      if (!response.ok) throw new Error('Availability check failed');
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check availability');
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom color="#1a472a">
        Check Availability
      </Typography>

      <Stack spacing={3} sx={{ mb: 4 }}>
        <DatePicker
          label="Check-in Date"
          value={data.checkIn}
          onChange={handleDateChange('checkIn')}
          disablePast
        />

        <DatePicker
          label="Check-out Date"
          value={data.checkOut}
          onChange={handleDateChange('checkOut')}
          disablePast
          minDate={data.checkIn}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={data.isSriLankan}
              onChange={(e) => setData(prev => ({ ...prev, isSriLankan: e.target.checked }))}
              sx={{ color: '#1a472a' }}
            />
          }
          label="I am a Sri Lankan resident"
        />

        {error && <Typography color="error">{error}</Typography>}

        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{ 
            bgcolor: '#1a472a',
            '&:hover': { bgcolor: '#2e7d32' },
            alignSelf: 'flex-end'
          }}
        >
          Check Availability
        </Button>
      </Stack>
    </Box>
  );
};

export default CheckAvailability;