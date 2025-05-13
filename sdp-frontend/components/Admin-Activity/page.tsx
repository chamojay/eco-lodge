import React, { useState, useEffect } from 'react';
import { activityService, Activity, ReservationActivity, ActivityCreate } from '@/app/services/activityService';

interface FormData {
  name: string;
  description: string;
  localPrice: string | number;
  foreignPrice: string | number;
}

const AdminActivity: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [formData, setFormData] = useState<FormData>({ name: '', description: '', localPrice: '', foreignPrice: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [reservationId, setReservationId] = useState<string>('');
  const [reservationActivities, setReservationActivities] = useState<ReservationActivity[]>([]);
  const [error, setError] = useState<string>('');

  // Fetch all activities on mount
  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const data = await activityService.getAllActivities();
      setActivities(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Create or update activity
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const activityData: ActivityCreate = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        localPrice: Number(formData.localPrice),
        foreignPrice: Number(formData.foreignPrice)
      };
      if (editingId) {
        await activityService.updateActivity(editingId, activityData);
        alert('Activity updated successfully');
      } else {
        await activityService.addActivity(activityData);
        alert('Activity created successfully');
      }
      setFormData({ name: '', description: '', localPrice: '', foreignPrice: '' });
      setEditingId(null);
      fetchActivities();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Edit activity
  const handleEdit = (activity: Activity) => {
    setFormData({
      name: activity.Name,
      description: activity.Description || '',
      localPrice: activity.LocalPrice.toString(),
      foreignPrice: activity.ForeignPrice.toString(),
    });
    setEditingId(activity.ActivityID);
  };

  // Delete activity
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await activityService.deleteActivity(id);
        alert('Activity deleted successfully');
        fetchActivities();
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  // Fetch reservation activities
  const fetchReservationActivities = async () => {
    if (!reservationId) {
      setError('Please enter a Reservation ID');
      return;
    }
    try {
      const data = await activityService.getActivitiesForReservation(parseInt(reservationId));
      setReservationActivities(data);
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Activity Management</h1>

      {/* Activity Form */}
      <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-xl mb-4">{editingId ? 'Edit Activity' : 'Add New Activity'}</h2>
        <div className="grid grid-cols-1 gap-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Activity Name"
            className="p-2 border rounded"
            required
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Description"
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="localPrice"
            value={formData.localPrice}
            onChange={handleInputChange}
            placeholder="Local Price"
            className="p-2 border rounded"
            step="0.01"
            required
          />
          <input
            type="number"
            name="foreignPrice"
            value={formData.foreignPrice}
            onChange={handleInputChange}
            placeholder="Foreign Price"
            className="p-2 border rounded"
            step="0.01"
            required
          />
        </div>
        <button type="submit" className="mt-4 bg-blue-500 text-white p-2 rounded">
          {editingId ? 'Update Activity' : 'Add Activity'}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setFormData({ name: '', description: '', localPrice: '', foreignPrice: '' });
              setEditingId(null);
            }}
            className="mt-4 ml-2 bg-gray-500 text-white p-2 rounded"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Error Message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Activities Table */}
      <h2 className="text-xl mb-4">Activities List</h2>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Local Price</th>
            <th className="border p-2">Foreign Price</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => (
            <tr key={activity.ActivityID}>
              <td className="border p-2">{activity.ActivityID}</td>
              <td className="border p-2">{activity.Name}</td>
              <td className="border p-2">{activity.Description}</td>
              <td className="border p-2">{activity.LocalPrice}</td>
              <td className="border p-2">{activity.ForeignPrice}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleEdit(activity)}
                  className="bg-yellow-500 text-white p-1 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(activity.ActivityID)}
                  className="bg-red-500 text-white p-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Reservation Activities View */}
      <div className="mt-8">
        <h2 className="text-xl mb-4">View Reservation Activities</h2>
        <div className="flex mb-4">
          <input
            type="text"
            value={reservationId}
            onChange={(e) => setReservationId(e.target.value)}
            placeholder="Enter Reservation ID"
            className="p-2 border rounded mr-2"
          />
          <button
            onClick={fetchReservationActivities}
            className="bg-blue-500 text-white p-2 rounded"
          >
            Fetch
          </button>
        </div>
        {reservationActivities.length > 0 && (
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">ID</th>
                <th className="border p-2">Activity Name</th>
                <th className="border p-2">Scheduled Date</th>
                <th className="border p-2">Amount</th>
                <th className="border p-2">Participants</th>
              </tr>
            </thead>
            <tbody>
              {reservationActivities.map((ra) => (
                <tr key={ra.ReservationActivityID}>
                  <td className="border p-2">{ra.ReservationActivityID}</td>
                  <td className="border p-2">{ra.Name}</td>
                  <td className="border p-2">{ra.ScheduledDate}</td>
                  <td className="border p-2">{ra.Amount}</td>
                  <td className="border p-2">{ra.Participants}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminActivity;