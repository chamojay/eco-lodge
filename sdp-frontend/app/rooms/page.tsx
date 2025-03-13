import React from 'react';
import RoomCard from '@/components/rooms/RoomCard';
import MainLayout from '../../components/layout/MainLayout';

const RoomsPage = () => {
  const rooms = [
    { id: 1, name: 'Deluxe Room', price: 200, description: 'A luxurious room with a beautiful view.' },
    { id: 2, name: 'Standard Room', price: 150, description: 'A comfortable room for a pleasant stay.' },
    { id: 3, name: 'Suite', price: 300, description: 'A spacious suite with premium amenities.' },
    { id: 4, name: 'Cabana', price: 250, description: 'A cozy cabana surrounded by nature.' },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Available Rooms</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(room => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default RoomsPage;