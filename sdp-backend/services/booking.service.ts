import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to create a booking
export const createBooking = async (data: {
  userId: string;
  roomId: string;
  checkInDate: Date;
  checkOutDate: Date;
}) => {
  return await prisma.booking.create({
    data,
  });
};

// Function to cancel a booking
export const cancelBooking = async (bookingId: string) => {
  return await prisma.booking.delete({
    where: { id: bookingId },
  });
};

// Function to get all bookings for a user
export const getUserBookings = async (userId: string) => {
  return await prisma.booking.findMany({
    where: { userId },
  });
};

// Function to get a specific booking by ID
export const getBookingById = async (bookingId: string) => {
  return await prisma.booking.findUnique({
    where: { id: bookingId },
  });
};