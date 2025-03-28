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
    CheckOutDate: string;
    FirstName: string;
    LastName: string;
    RoomNumber: string;
  }

