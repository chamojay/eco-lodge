import { NextResponse } from 'next/server';
import { createBooking, cancelBooking, getBookings } from '../../../services/booking.service';

export async function POST(request: Request) {
    const bookingData = await request.json();
    const booking = await createBooking(bookingData);
    return NextResponse.json(booking, { status: 201 });
}

export async function DELETE(request: Request) {
    const { id } = await request.json();
    await cancelBooking(id);
    return NextResponse.json({ message: 'Booking canceled' }, { status: 200 });
}

export async function GET() {
    const bookings = await getBookings();
    return NextResponse.json(bookings, { status: 200 });
}