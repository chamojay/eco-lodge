'use client';
import React, { useEffect, useState } from 'react';
import { 
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Divider
} from '@mui/material';
import { reservationService } from '@/app/services/reservationService';

export interface Room {
  RoomNumber: number;
  Type: 'Standard' | 'Suite' | 'Delux' | 'Cabana';
  LocalPrice: number;
  ForeignPrice: number;
  MaxPeople: number;
  Room_Status: 'Confirmed' | 'Completed';
}

const typeOrder = ['Standard', 'Suite', 'Delux', 'Cabana'];

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

  const renderRoomSection = (type: string) => {
    const filteredRooms = rooms.filter(room => room.Type === type);
    if (filteredRooms.length === 0) return null;

    return (
      <Box key={type} sx={{ mb: 5 }}>
        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ 
            mt: 4, 
            color: 'darkgreen', 
            fontWeight: 600, 
            p: 1, 
            borderRadius: 1 
          }}
        >
          {type} Rooms
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {filteredRooms.map((room) => (
            <Grid item key={room.RoomNumber} xs={12} sm={6} md={4}>
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
                <Typography variant="h6" color={room.Room_Status === 'Confirmed' ? 'error' : 'success.main'}>
                  Room {room.RoomNumber}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'darkgreen' }}>
        Today Room Status
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        typeOrder.map(renderRoomSection)
      )}
    </Box>
  );
};

export default ReceptionRoom;
