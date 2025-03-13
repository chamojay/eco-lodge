import axios from 'axios';
import { RoomType } from '@/types/roomTypes';

const API_BASE_URL = 'http://localhost:5000/api/rooms';



export const getRooms = async (searchTerm: string, filterType: string): Promise<RoomType[]> => {
  const response = await axios.get<RoomType[]>(API_BASE_URL, {
    params: {
      search: searchTerm || undefined,
      type: filterType === 'All' ? undefined : filterType
    }
  });
  return response.data;
};

export const createRoom = async (roomData: Omit<RoomType, 'RoomID'>): Promise<RoomType> => {
  const response = await axios.post<RoomType>(API_BASE_URL, roomData);
  return response.data;
};

export const updateRoom = async (roomId: string, roomData: Omit<RoomType, 'RoomID'>): Promise<RoomType> => {
  const response = await axios.put<RoomType>(`${API_BASE_URL}/${roomId}`, roomData);
  return response.data;
};

export const deleteRoom = async (roomId: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/${roomId}`);
};