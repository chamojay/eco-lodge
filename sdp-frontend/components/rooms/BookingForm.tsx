import React, { useState } from 'react';

const BookingForm: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [roomType, setRoomType] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle booking submission logic here
    };

    return (
        <form onSubmit={handleSubmit} className="booking-form">
            <h2 className="text-lg font-bold mb-4">Book a Room</h2>
            <div className="mb-4">
                <label htmlFor="name" className="block mb-1">Name</label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="border rounded p-2 w-full"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="email" className="block mb-1">Email</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border rounded p-2 w-full"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="checkInDate" className="block mb-1">Check-In Date</label>
                <input
                    type="date"
                    id="checkInDate"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    required
                    className="border rounded p-2 w-full"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="checkOutDate" className="block mb-1">Check-Out Date</label>
                <input
                    type="date"
                    id="checkOutDate"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    required
                    className="border rounded p-2 w-full"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="roomType" className="block mb-1">Room Type</label>
                <select
                    id="roomType"
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    required
                    className="border rounded p-2 w-full"
                >
                    <option value="">Select a room type</option>
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="suite">Suite</option>
                </select>
            </div>
            <button type="submit" className="bg-green-500 text-white rounded p-2">Book Now</button>
        </form>
    );
};

export default BookingForm;