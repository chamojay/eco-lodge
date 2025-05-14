import axios from 'axios';

const API_URL = 'http://localhost:5000/api/activities';

// Types to match backend exactly
export interface Activity {
  ActivityID: number;
  name: string;
  description: string | null;
  localPrice: number;
  foreignPrice: number;
}

export interface ReservationActivity {
  ReservationActivityID: number;
  reservationId: number;
  activityId: number;
  scheduledDate: string;
  amount: number;
  participants: number;
  name?: string;
  description?: string | null;
}

export interface ActivityCreate {
  name: string;
  description: string | null;
  localPrice: number;
  foreignPrice: number;
}

export interface ReservationActivityCreate {
  reservationId: number;
  activityId: number;
  scheduledDate: string;
  participants: number;
}

export interface ReservationActivityUpdate {
  scheduledDate: string;
  amount: number;
  participants: number;
}

// Service
export const activityService = {
  getAllActivities: async (): Promise<Activity[]> => {
    try {
      const response = await axios.get<Activity[]>(`${API_URL}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch activities: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  getActivityById: async (id: number): Promise<Activity> => {
    try {
      const response = await axios.get<Activity>(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  addActivity: async (activityData: ActivityCreate): Promise<{ id: number }> => {
    try {
      const response = await axios.post<Activity>(`${API_URL}`, {
        name: activityData.name,
        description: activityData.description,
        localPrice: activityData.localPrice,
        foreignPrice: activityData.foreignPrice
      });
      return { id: response.data.ActivityID };
    } catch (error) {
      throw new Error(`Failed to add activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  updateActivity: async (id: number, updatedData: ActivityCreate): Promise<{ success: boolean }> => {
    try {
      await axios.put(`${API_URL}/${id}`, {
        name: updatedData.name,
        description: updatedData.description,
        localPrice: updatedData.localPrice,
        foreignPrice: updatedData.foreignPrice
      });
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to update activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  deleteActivity: async (id: number): Promise<{ success: boolean }> => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  getActivitiesForReservation: async (reservationId: number): Promise<ReservationActivity[]> => {
    try {
      const response = await axios.get<ReservationActivity[]>(`${API_URL}/reservation/${reservationId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch reservation activities: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

   addActivityToReservation: async (data: ReservationActivityCreate): Promise<{ id: number }> => {
    try {
      const response = await axios.post<ReservationActivity>(`${API_URL}/reservation`, data);
      return { id: response.data.ReservationActivityID };
    } catch (error) {
      throw new Error(`Failed to add reservation activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  updateReservationActivity: async (id: number, data: ReservationActivityUpdate): Promise<{ success: boolean }> => {
    try {
      await axios.put(`${API_URL}/reservation/${id}`, data);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to update reservation activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  deleteReservationActivity: async (id: number): Promise<{ success: boolean }> => {
    try {
      await axios.delete(`${API_URL}/reservation/${id}`);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete reservation activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};