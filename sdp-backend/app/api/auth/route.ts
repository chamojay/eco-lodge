import { NextResponse } from 'next/server';
import { authService } from '../../../services/auth.service';

export async function POST(request: Request) {
    const { email, password } = await request.json();

    const user = await authService.login(email, password);
    
    if (!user) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({ message: 'Login successful', user });
}

export async function DELETE(request: Request) {
    // Logic for logout can be implemented here
    return NextResponse.json({ message: 'Logout successful' });
}

export async function REGISTER(request: Request) {
    const { email, password } = await request.json();

    const newUser = await authService.register(email, password);
    
    if (!newUser) {
        return NextResponse.json({ message: 'Registration failed' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Registration successful', user: newUser });
}