export interface Room {
  RoomID: number;
  RoomNumber: number;
  Type: string;
  Price: number;
}
  
  export interface Reservation {
    ReservationID: string;
    CheckOutDate: string;
    FirstName: string;
    LastName: string;
    RoomNumber: string;
  }

