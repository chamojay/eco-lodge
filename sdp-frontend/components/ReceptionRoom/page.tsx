'use client';
import React, { useEffect, useState } from 'react';
import { 
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress
} from '@mui/material';
import { reservationService } from '@/app/services/reservationService';

export interface Room {
  RoomNumber: number;
  Type: string;
  LocalPrice: number;
  ForeignPrice: number;
  MaxPeople: number;
  Room_Status: 'Confirmed' | 'Completed';
}

const ReceptionRoom: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const allRooms = await reservationService.getAllRoomsStatus() as Room[];
        setRooms(allRooms);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom color="primary">
        Room Status
      </Typography>
      
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
          {rooms.map((room) => (
            <Grid item key={room.RoomNumber} xs={4}>
              <Paper
                sx={{
                  p: 2,
                  height: 100,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backgroundColor: room.Room_Status === 'Confirmed' ? '#ffebee' : '#e8f5e9',
                  '&:hover': { transform: 'scale(1.05)' },
                  transition: 'all 0.3s',
                }}
              >
                <Typography variant="h5" color={room.Room_Status === 'Confirmed' ? 'error' : 'success.main'}>
                  Room {room.RoomNumber}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ReceptionRoom;
