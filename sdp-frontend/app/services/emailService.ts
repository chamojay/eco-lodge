import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const emailService = {
  sendReservationConfirmation: async (reservationId: number) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/email/reservation-confirmation/${reservationId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      throw error;
    }
  }
};