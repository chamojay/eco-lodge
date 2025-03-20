'use client';
import { Dayjs } from 'dayjs';
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

  const handleDateChange = (name: 'checkIn' | 'checkOut') => (date: Dayjs | null) => {
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
    if (data.checkIn.isAfter(data.checkOut)) {
      setError('Check-out date must be after check-in date');
      return;
    }
    
    // Mock API call
    onNext();
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