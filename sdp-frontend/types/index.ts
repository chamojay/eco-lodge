export type Room = {
    id: string;
    name: string;
    description: string;
    price: number;
    capacity: number;
    amenities: string[];
    images: string[];
};

export type Booking = {
    id: string;
    roomId: string;
    userId: string;
    checkInDate: string;
    checkOutDate: string;
    totalPrice: number;
};

export type User = {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'receptionist' | 'staff';
};

