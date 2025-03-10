import { NextResponse } from 'next/server';
import { getUsers, createUser, updateUser, deleteUser } from '../../../services/user.service';

export async function GET() {
    const users = await getUsers();
    return NextResponse.json(users);
}

export async function POST(request: Request) {
    const body = await request.json();
    const newUser = await createUser(body);
    return NextResponse.json(newUser, { status: 201 });
}

export async function PUT(request: Request) {
    const body = await request.json();
    const updatedUser = await updateUser(body);
    return NextResponse.json(updatedUser);
}

export async function DELETE(request: Request) {
    const { id } = await request.json();
    await deleteUser(id);
    return NextResponse.json({ message: 'User deleted' });
}