'use client';
import React from 'react';
import { 
  Box,
  Typography,
  Grid,
  Paper,
} from '@mui/material';

export interface Room {
  number: number;
  reserved: boolean;
  customer: string | null;
  checkIn: string | null;
  checkOut: string | null;
}

interface ReceptionRoomProps {
  rooms: Room[];
  onRoomClick: (room: Room) => void;
}

const ReceptionRoom: React.FC<ReceptionRoomProps> = ({ rooms, onRoomClick }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom color="primary">
        Room Status
      </Typography>
      <Grid container spacing={3}>
        {rooms.map((room) => (
          <Grid item key={room.number} xs={4}>
            <Paper
              onClick={() => onRoomClick(room)}
              sx={{
                p: 2,
                height: 100,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backgroundColor: room.reserved ? '#ffebee' : '#e8f5e9',
                '&:hover': { transform: 'scale(1.05)' },
                transition: 'all 0.3s',
              }}
            >
              <Typography variant="h5" color={room.reserved ? 'error' : 'success.main'}>
                Room {room.number}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ReceptionRoom;