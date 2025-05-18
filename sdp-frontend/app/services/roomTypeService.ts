import axios from 'axios';
import { RoomTypeDetail } from '@/types/roomTypes';

const API_BASE_URL = 'http://localhost:5000/api/room-types';

export const getRoomTypes = async (): Promise<RoomTypeDetail[]> => {
  const response = await axios.get<RoomTypeDetail[]>(API_BASE_URL);
  return response.data;
};

export const createRoomType = async (formData: FormData): Promise<RoomTypeDetail> => {
  const response = await axios.post<RoomTypeDetail>(API_BASE_URL, formData);
  return response.data;
};

export const updateRoomType = async (typeId: number, formData: FormData): Promise<RoomTypeDetail> => {
  const response = await axios.put<RoomTypeDetail>(`${API_BASE_URL}/${typeId}`, formData);
  return response.data;
};

export const deleteRoomType = async (typeId: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/${typeId}`);
};