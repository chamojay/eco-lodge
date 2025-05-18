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
import { getRoomTypes } from '@/app/services/roomTypeService';
import { RoomTypeDetail } from '@/types/roomTypes';

export interface Room {
  RoomID: string;
  RoomNumber: number;
  TypeID: number;
  TypeName: string;
  LocalPrice: string | number;
  ForeignPrice: string | number;
  MaxPeople: number;
  Room_Status: string;
  Description?: string;
  type?: {
    Name: string;
    ImagePath?: string;
    Description?: string;
  }
}

// Remove the typeOrder array and use room types from the backend
const ReceptionRoom: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Log the API URLs being called
        console.log('Fetching rooms from:', `${process.env.NEXT_PUBLIC_API_URL}/api/reservations/room-status`);
        console.log('Fetching types from:', `${process.env.NEXT_PUBLIC_API_URL}/api/room-types`);

        const [allRooms, types] = await Promise.all([
          reservationService.getAllRoomsStatus(),
          getRoomTypes()
        ]);

        // Validate the response data
        if (!Array.isArray(allRooms)) {
          throw new Error('Invalid rooms data received');
        }
        if (!Array.isArray(types)) {
          throw new Error('Invalid room types data received');
        }

        console.log('Rooms received:', allRooms);
        console.log('Types received:', types);

        setRooms(allRooms);
        setRoomTypes(types);
      } catch (error) {
        console.error('Error details:', error);
        setError(
          error instanceof Error 
            ? `Error: ${error.message}` 
            : 'Failed to fetch data. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderRoomSection = (type: RoomTypeDetail) => {
    const filteredRooms = rooms.filter(room => room.TypeID === type.TypeID);
    if (filteredRooms.length === 0) return null;

    return (
      <Box key={type.TypeID} sx={{ mb: 5 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          mt: 4 
        }}>
          {type.ImagePath && (
            <img 
              src={`${process.env.NEXT_PUBLIC_API_URL}${type.ImagePath}`}
              alt={type.Name}
              style={{ 
                width: 50, 
                height: 50, 
                objectFit: 'cover', 
                borderRadius: '8px' 
              }}
              onError={(e) => {
                e.currentTarget.src = '/placeholder-room.jpg';
              }}
            />
          )}
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'darkgreen', 
              fontWeight: 600
            }}
          >
            {type.Name} Rooms
            {type.Description && (
              <Typography variant="caption" display="block" color="text.secondary">
                {type.Description}
              </Typography>
            )}
          </Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={3}>
          {filteredRooms.map((room) => (
            <Grid item key={room.RoomNumber} xs={12} sm={6} md={4}>
              <Paper
                sx={{
                  p: 2,
                  height: 100,
                  borderRadius: 4,
                  display: 'flex',
                  flexDirection: 'column',
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
                <Typography variant="caption" color="text.secondary">
                  {room.Room_Status}
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
    
      {roomTypes.map(renderRoomSection)}
    </Box>
  );
};

export default ReceptionRoom;
