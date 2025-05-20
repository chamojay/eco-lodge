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

  createWebReservation: async (roomNumber: string, customerData: any, reservationData: any) => {
    const response = await axios.post(`${API_URL}/web`, { 
      roomNumber, 
      customerData, 
      reservationData 
    });
    return response.data;
  },

  getActiveReservations: async () => {
    const response = await axios.get(`${API_URL}/active`);
    return response.data.map((res: any) => ({
      ...res,
      TotalAmount: parseFloat(res.TotalAmount) || 0,
    }));
  },

  completeCheckout: async (reservationID: string, paymentMethod: string) => {
    const response = await axios.put(`${API_URL}/checkout/${reservationID}`, {
      paymentMethod
    });
    return {
      success: response.data.success,
      totalAmount: response.data.totalAmount,
      baseAmountPaidOnline: response.data.baseAmountPaidOnline,
      paidAmount: response.data.paidAmount,
      message: response.data.message
    };
  },

  getAllRoomsStatus: async () => {
    const response = await axios.get(`${API_URL}/room-status`);
    return response.data;
  },

  getReservationDetails: async (reservationId: string) => {
    try {
      const response = await fetch(`${API_URL}/${reservationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reservation details');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching reservation details:', error);
      throw error;
    }
  },
};