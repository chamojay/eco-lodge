'use client';
import React, { useState, useEffect } from 'react';
import { activityService, ReservationActivity, Activity } from '@/app/services/activityService';

const ReceptionActivity = () => {
    const [activities, setActivities] = useState<ReservationActivity[]>([]);
    const [allActivities, setAllActivities] = useState<Activity[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [activityForm, setActivityForm] = useState({
        reservationId: '',
        activityId: '',
        scheduledDate: '',
        participants: '1',
    });

    useEffect(() => {
        const loadAllActivities = async () => {
            try {
                const data = await activityService.getAllActivities();
                setAllActivities(data);
            } catch (err) {
                setError('Failed to load activities');
            }
        };
        loadAllActivities();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        console.log(`Input changed: ${name} = ${value}`);
        setActivityForm({ ...activityForm, [name]: value });
    };

    const fetchReservationActivities = async () => {
        try {
            if (!activityForm.reservationId) {
                return setError('Please enter a Reservation ID');
            }
            const data = await activityService.getActivitiesForReservation(
                Number(activityForm.reservationId)
            );
            setActivities(data);
            setError('');
        } catch (err: any) {
            setError(err.message || 'Failed to fetch reservation activities');
        }
    };

    const handleAddActivity = async () => {
        try {
            const { reservationId, activityId, scheduledDate, participants } = activityForm;
            
            // Validation checks
            if (!reservationId || !activityId || !scheduledDate || !participants) {
                return setError('All fields are required');
            }

            // Create payload with correct property names
            const payload = {
                reservationId: parseInt(reservationId),
                activityId: parseInt(activityId),
                scheduledDate: scheduledDate,
                participants: parseInt(participants)
            };

            console.log('Submitting payload:', payload);

            await activityService.addActivityToReservation(payload);
            
            setSuccess('Activity added successfully!');
            setError('');
            setActivityForm(prev => ({
                ...prev,
                activityId: '',
                scheduledDate: '',
                participants: '1'
            }));
            fetchReservationActivities();
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to add activity';
            setError(errorMessage);
            setSuccess('');
        }
    };

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Reservation Activities Management</h1>

            {/* Available Activities Table */}
            <div className="mb-8 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold p-4 border-b">Available Activities</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 text-left">Activity</th>
                                <th className="p-3 text-left">Description</th>
                                <th className="p-3 text-right">Local Price</th>
                                <th className="p-3 text-right">Foreign Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allActivities.map(activity => (
                                <tr key={activity.ActivityID} className="hover:bg-gray-50">
                                    <td className="p-3">{activity.Name}</td>
                                    <td className="p-3 text-gray-600">
                                        {activity.Description || 'No description'}
                                    </td>
                                    <td className="p-3 text-right">
                                        {Number(activity.LocalPrice).toLocaleString('en-US', {
                                            style: 'currency',
                                            currency: 'USD'
                                        })}
                                    </td>
                                    <td className="p-3 text-right">
                                        {Number(activity.ForeignPrice).toLocaleString('en-US', {
                                            style: 'currency',
                                            currency: 'USD'
                                        })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Activity Management Form */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-8">
                <h2 className="text-xl font-semibold mb-4">Add Activity to Reservation</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <input
                        type="number"
                        name="reservationId"
                        placeholder="Reservation ID"
                        value={activityForm.reservationId}
                        onChange={handleInputChange}
                        className="p-2 border rounded"
                        min="1"
                    />
                    <select
                        name="activityId"
                        value={activityForm.activityId}
                        onChange={handleInputChange}
                        className="p-2 border rounded"
                    >
                        <option value="">Select Activity</option>
                        {allActivities.map(activity => (
                            <option key={activity.ActivityID} value={activity.ActivityID}>
                                {activity.Name} (
                                {Number(activity.LocalPrice).toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'USD'
                                })})
                            </option>
                        ))}
                    </select>
                    <input
                        type="date"
                        name="scheduledDate"
                        value={activityForm.scheduledDate}
                        onChange={handleInputChange}
                        className="p-2 border rounded"
                    />
                    <input
                        type="number"
                        name="participants"
                        placeholder="Participants"
                        value={activityForm.participants}
                        onChange={handleInputChange}
                        className="p-2 border rounded"
                        min="1"
                    />
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleAddActivity}
                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
                    >
                        Add Activity
                    </button>
                    <button
                        onClick={fetchReservationActivities}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                    >
                        Refresh List
                    </button>
                </div>
            </div>

            {/* Status Messages */}
            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                    Error: {error}
                </div>
            )}
            {success && (
                <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
                    {success}
                </div>
            )}

            {/* Reservation Activities List */}
            {activities.length > 0 && (
                <div className="bg-white rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold p-4 border-b">
                        Existing Reservation Activities
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3 text-left">Activity</th>
                                    <th className="p-3 text-left">Date</th>
                                    <th className="p-3 text-right">Participants</th>
                                    <th className="p-3 text-right">Unit Price</th>
                                    <th className="p-3 text-right">Total Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activities.map(activity => (
                                    <tr key={activity.ReservationActivityID} className="hover:bg-gray-50">
                                        <td className="p-3">{activity.Name}</td>
                                        <td className="p-3">
                                            {new Date(activity.ScheduledDate).toLocaleDateString()}
                                        </td>
                                        <td className="p-3 text-right">{activity.Participants}</td>
                                        <td className="p-3 text-right">
                                            {Number(activity.Amount / activity.Participants).toLocaleString('en-US', {
                                                style: 'currency',
                                                currency: 'USD'
                                            })}
                                        </td>
                                        <td className="p-3 text-right">
                                            {Number(activity.Amount).toLocaleString('en-US', {
                                                style: 'currency',
                                                currency: 'USD'
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReceptionActivity;