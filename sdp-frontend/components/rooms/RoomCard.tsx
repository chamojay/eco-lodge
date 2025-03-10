import React from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';

interface RoomProps {
  room: {
    id: number;
    name: string;
    price: number;
    description: string;
  };
}

const RoomCard: React.FC<RoomProps> = ({ room }) => {
  const { name, price, description } = room;

  return (
    <Card className="h-full hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6">
        <Typography variant="h5" component="h2" className="text-gray-900 mb-2">
          {name}
        </Typography>
        <Typography variant="body1" color="textSecondary" className="mb-4">
          {description}
        </Typography>
        <div className="flex justify-between items-center">
          <Typography variant="h6" className="text-dark-green">
            ${price.toFixed(2)} per night
          </Typography>
          <Button 
            variant="contained" 
            sx={{ 
              backgroundColor: '#006400',
              '&:hover': {
                backgroundColor: '#005000',
              }
            }}
          >
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomCard;