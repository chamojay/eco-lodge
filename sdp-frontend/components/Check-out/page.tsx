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

const getCheckoutStatus = (checkoutDate: string): 'today' | 'overdue' | 'future' => {
  const checkout = new Date(checkoutDate);
  const today = new Date();

  // Set both dates to midnight in local time
  const checkoutMidnight = new Date(checkout.getFullYear(), checkout.getMonth(), checkout.getDate());
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (checkoutMidnight < todayMidnight) return 'overdue';
  if (checkoutMidnight.getTime() === todayMidnight.getTime()) return 'today';
  return 'future';
};

const CheckOutComponent = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const data = await reservationService.getActiveReservations() as Reservation[];
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
          {reservations.map((res) => {
            const status = getCheckoutStatus(res.CheckOutDate);
            return (
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {status === 'today' && (
                    <Typography sx={{ color: '#ffd700', fontWeight: 'bold' }}>
                      Checkout today
                    </Typography>
                  )}
                  {status === 'overdue' && (
                    <Typography sx={{ color: '#dc3545', fontWeight: 'bold' }}>
                      Checkout late
                    </Typography>
                  )}
                  <Button
                    variant="contained"
                    onClick={() => handleCheckout(res.ReservationID)}
                    disabled={processing === res.ReservationID}
                    sx={{ 
                      backgroundColor: 
                        status === 'overdue' ? '#dc3545' : 
                        status === 'today' ? '#ffd700' : 
                        '#1a472a',
                      color: 
                        status === 'overdue' || status === 'today' ? 'black' : 'white',
                      '&:hover': { 
                        backgroundColor: 
                          status === 'overdue' ? '#bb2d3b' : 
                          status === 'today' ? '#ffc107' : 
                          '#2e7d32' 
                      },
                      minWidth: 160
                    }}
                  >
                    {processing === res.ReservationID ? 
                      <CircularProgress size={24} /> : 
                      'Complete Checkout'}
                  </Button>
                </Box>
              </ListItem>
            );
          })}
        </List>
      )}
    </Box>
  );
};

export default CheckOutComponent;