export interface Room {
  RoomID: string;
  RoomNumber: string;
  Type: string;
  LocalPrice: number;
  ForeignPrice: number;
  MaxPeople: number;
  Description: string;
}

export interface Reservation {
  ReservationID: string;
  CustomerID: number;
  CheckInDate: string;
  CheckOutDate: string;
  Room_Status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  PackageType: 'RoomOnly' | 'HalfBoard' | 'FullBoard';
  Adults: number;
  Children: number;
  SpecialRequests?: string;
  ArrivalTime?: string;
  DepartureTime?: string;
  RoomID: number;
  TotalAmount?: number;
  ExtraCharges?: number; // New field to store extra charges
}

export interface Customer {
  CustomerID: number;
  Title: 'Mr' | 'Mrs' | 'Ms';
  FirstName: string;
  LastName: string;
  Email: string;
  Phone: string;
  Country: string;
  Nic_Passport: string;
}

export interface ReservationWithCustomer extends Reservation {
  customer?: Customer;
}
