'use client';
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Button,
  CircularProgress
} from '@mui/material';
import { reservationService } from '@/app/services/reservationService';

interface Reservation {
  ReservationID: string;
  CheckOutDate: string;
  FirstName: string;
  LastName: string;
  RoomNumber: string;
}

const CheckOutComponent = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const data = await reservationService.getActiveReservations();
        setReservations(data);
      } catch (error) {
        console.error('Error fetching reservations:', error);
      }
      setLoading(false);
    };
    fetchReservations();
  }, []);

  const handleCheckout = async (id: string) => {
    setProcessing(id);
    try {
      await reservationService.completeCheckout(id);
      setReservations(reservations.filter(r => r.ReservationID !== id));
    } catch (error) {
      console.error('Checkout failed:', error);
    }
    setProcessing(null);
  };

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ color: '#1a472a' }}>
        Active Reservations
      </Typography>
      
      {loading ? (
        <CircularProgress />
      ) : reservations.length === 0 ? (
        <Typography>No active reservations</Typography>
      ) : (
        <List>
          {reservations.map((res) => (
            <ListItem 
              key={res.ReservationID}
              sx={{ 
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <ListItemText
                primary={`${res.FirstName} ${res.LastName}`}
                secondary={`Room ${res.RoomNumber} - Checkout: ${new Date(res.CheckOutDate).toLocaleDateString()}`}
              />
              <Button
                variant="contained"
                onClick={() => handleCheckout(res.ReservationID)}
                disabled={processing === res.ReservationID}
                sx={{ 
                  backgroundColor: '#1a472a',
                  color: 'white',
                  '&:hover': { backgroundColor: '#2e7d32' }
                }}
              >
                {processing === res.ReservationID ? 
                  <CircularProgress size={24} /> : 
                  'Complete Checkout'}
              </Button>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default CheckOutComponent;