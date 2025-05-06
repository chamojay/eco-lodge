import axios from 'axios';

const API_URL = 'http://localhost:5000/api/reservations';

export const reservationService = {
  checkAvailability: async (checkIn: string, checkOut: string) => {
    const response = await axios.post(`${API_URL}/availability`, { checkIn, checkOut });
    return response.data;
  },

  createReservation: async (roomNumber: string, customerData: any, reservationData: any) => {
    const response = await axios.post(API_URL, { roomNumber, customerData, reservationData });
    return response.data;
  },

  getActiveReservations: async () => {
    const response = await axios.get(`${API_URL}/active`);
    return response.data.map((res: any) => ({
      ...res,
      TotalAmount: parseFloat(res.TotalAmount) || 0,
    }));
  },

  completeCheckout: async (reservationID: string, TotalAmount:Number ) => {
    const response = await axios.put(`${API_URL}/checkout/${reservationID}`, {
      TotalAmount: TotalAmount
    });
    return response.data;
  },

  getAllRoomsStatus: async () => {
    const response = await axios.get(`${API_URL}/room-status`);
    return response.data;
  }
};