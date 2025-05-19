export interface PackageType {
  PackageID: number;
  Name: string;
  PriceMultiplier: number;
  Description?: string;
  ImagePath?: string;
}

export interface Room {
  RoomID: string;
  RoomNumber: number;
  TypeID: number;
  TypeName: string;
  LocalPrice: number;
  ForeignPrice: number;
  MaxPeople: number;
  Type?: string;
}

export interface Reservation {
  ReservationID: number;
  CheckInDate: string;
  CheckOutDate: string;
  Room_Status: string;
  PackageID: number;
  PackageName: string;
  PriceMultiplier: number;
  Adults: number;
  Children: number;
  SpecialRequests: string;
  ArrivalTime: string;
  DepartureTime: string;
  RoomNumber: string;
  RoomType: string;
  Status: string;
  CustomerID: number;
  Title: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone: string;
  Country: string;
  NIC: string;
  PassportNumber: string;
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
