import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const receptionService = {
  // Check room availability
  async checkAvailability(checkIn: string, checkOut: string): Promise<Room[]> {
    try {
      const response = await api.post('/reservations/availability', { checkIn, checkOut });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Create new reservation
  async createReservation(data: ReservationRequest): Promise<ReservationResponse> {
    try {
      const response = await api.post('/reservations', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Get active reservations
  async getActiveReservations(): Promise<ActiveReservation[]> {
    try {
      const response = await api.get('/reservations/active');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Complete checkout
  async completeCheckout(reservationId: number): Promise<void> {
    try {
      await api.put(`/reservations/${reservationId}/checkout`);
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Error handler
  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      return new Error(error.response?.data?.error || error.message);
    }
    return new Error('An unexpected error occurred');
  }
};

// Type definitions
export interface Room {
  RoomNumber: number;
  Type: string;
  Price: number;
}

interface ReservationRequest {
  roomNumber: number;
  customer: Customer;
  reservation: ReservationDetails;
}

interface Customer {
  Title: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone: string;
  Nic_Passport: string;
}

interface ReservationDetails {
  CheckInDate: string;
  CheckOutDate: string;
  Adults: number;
  Children: number;
  PackageType: string;
  TotalAmount: number;
}

interface ReservationResponse {
  id: number;
  total: number;
}

export interface ActiveReservation {
  ReservationID: number;
  CheckOutDate: string;
  FirstName: string;
  LastName: string;
  RoomNumber: number;
}