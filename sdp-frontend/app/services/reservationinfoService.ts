import axios from 'axios';


const API_BASE = 'http://localhost:5000/api/reservationinfo';

export const fetchAllReservations = async () => {
  const response = await axios.get(API_BASE);
  return response.data;
};

export const fetchReservationById = async (id: number) => {
  const response = await axios.get(`${API_BASE}/${id}`);
  return response.data;
};

export const updateReservation = async (id: number, data: any) => {
  const response = await axios.put(`${API_BASE}/${id}`, data);
  return response.data;
};