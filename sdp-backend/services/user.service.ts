import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to create a new user
export const createUser = async (data: { email: string; password: string; role: string }) => {
    const user = await prisma.user.create({
        data,
    });
    return user;
};

// Function to find a user by email
export const findUserByEmail = async (email: string) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });
    return user;
};

// Function to update a user's details
export const updateUser = async (id: string, data: { email?: string; password?: string; role?: string }) => {
    const user = await prisma.user.update({
        where: { id },
        data,
    });
    return user;
};

// Function to delete a user
export const deleteUser = async (id: string) => {
    const user = await prisma.user.delete({
        where: { id },
    });
    return user;
};

// Function to get all users
export const getAllUsers = async () => {
    const users = await prisma.user.findMany();
    return users;
};