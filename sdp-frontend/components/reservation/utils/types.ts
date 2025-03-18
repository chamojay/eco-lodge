import { Dayjs } from 'dayjs';

export type ReservationData = {
  checkIn: Dayjs | null;
  checkOut: Dayjs | null;
  isSriLankan: boolean;
  selectedRoom?: {
    roomId: number;
    roomNumber: string;
    type: string;
    price: number;
  };
  packageType: 'RoomOnly' | 'HalfBoard' | 'FullBoard';
  customer: {
    title: 'Mr' | 'Mrs' | 'Ms';
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    adults: number;
    children: number;
    arrivalTime: string;
    specialRequests: string;
  };
};