'use client';
import { Box, Button, Typography, Stack } from '@mui/material';
import { StepComponentProps } from './utils/types';

const Confirmation = ({ data, onBack }: StepComponentProps) => {
  const calculateTotal = () => {
    if (!data.selectedRoom) return 0;
    const nights = Math.ceil(
      (data.checkOut!.getTime() - data.checkIn!.getTime()) / (1000 * 3600 * 24)
    );
    let total = data.selectedRoom.price * nights;
    
    if (data.packageType === 'HalfBoard') total *= 1.15;
    if (data.packageType === 'FullBoard') total *= 1.3;
    if (data.isSriLankan) total *= 0.9; // 10% discount
    
    return total;
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom color="#1a472a">
        Confirm Reservation
      </Typography>

      <Stack spacing={2} sx={{ mb: 4 }}>
        <Typography variant="body1">
          Check-in: {data.checkIn?.toLocaleDateString()}
        </Typography>
        <Typography variant="body1">
          Check-out: {data.checkOut?.toLocaleDateString()}
        </Typography>
        <Typography variant="body1">
          Room: {data.selectedRoom?.roomNumber} ({data.selectedRoom?.type})
        </Typography>
        <Typography variant="body1">
          Package: {data.packageType}
        </Typography>
        <Typography variant="h6" sx={{ mt: 2 }}>
          Total Amount: ${calculateTotal().toFixed(2)}
        </Typography>
      </Stack>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button onClick={onBack} sx={{ color: '#1a472a' }}>
          Back
        </Button>
        <Button
          variant="contained"
          sx={{ bgcolor: '#1a472a', '&:hover': { bgcolor: '#2e7d32' } }}
          onClick={async () => {
            // Implement payment integration
            await fetch('/api/reservations/create', {
              method: 'POST',
              body: JSON.stringify(data)
            });
          }}
        >
          Confirm and Pay
        </Button>
      </Box>
    </Box>
  );
};

export default Confirmation;