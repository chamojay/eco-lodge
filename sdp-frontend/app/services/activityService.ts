import axios from 'axios';

const API_URL = 'http://localhost:5000/api/activities';

// Types
export interface Activity {
  ActivityID: number;
  Name: string;
  Description: string | null;
  LocalPrice: number;
  ForeignPrice: number;
}

export interface ReservationActivity {
  ReservationActivityID: number;
  ReservationID: number;
  ActivityID: number;
  ScheduledDate: string;
  Amount: number;
  Participants: number;
  Name?: string;
  Description?: string | null;
  LocalPrice?: number;
  ForeignPrice?: number;
}

export type ActivityCreate = Omit<Activity, 'ActivityID'>;
export type ReservationActivityCreate = Omit<ReservationActivity, 'ReservationActivityID' | 'Name' | 'Description' | 'LocalPrice' | 'ForeignPrice'>;
export type ReservationActivityUpdate = Partial<ReservationActivityCreate>;

// Service
export const activityService = {
  // ===== Activities CRUD =====
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
      if (!activityData.Name || !activityData.LocalPrice || !activityData.ForeignPrice) {
        throw new Error('Name, LocalPrice, and ForeignPrice are required');
      }
      const response = await axios.post<{ activity: Activity }>(`${API_URL}`, activityData);
      return { id: response.data.activity.ActivityID };
    } catch (error) {
      throw new Error(`Failed to add activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  updateActivity: async (id: number, updatedData: Partial<ActivityCreate>): Promise<{ success: boolean }> => {
    try {
      if (!updatedData.Name || !updatedData.LocalPrice || !updatedData.ForeignPrice) {
        throw new Error('Name, LocalPrice, and ForeignPrice are required');
      }
      const response = await axios.put<{ activity: Activity }>(`${API_URL}/${id}`, updatedData);
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

  // ===== Reservation Activities CRUD =====
  getActivitiesForReservation: async (reservationId: number): Promise<ReservationActivity[]> => {
    try {
      const response = await axios.get<ReservationActivity[]>(`${API_URL}/reservation/${reservationId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch reservation activities: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  addActivityToReservation: async (activityData: ReservationActivityCreate): Promise<{ id: number }> => {
    try {
      if (!activityData.ReservationID || !activityData.ActivityID || !activityData.ScheduledDate || !activityData.Participants) {
        throw new Error('ReservationID, ActivityID, ScheduledDate, and Participants are required');
      }
      if (!Number.isInteger(activityData.Participants) || activityData.Participants < 1) {
        throw new Error('Participants must be a positive integer');
      }
      const response = await axios.post<{ reservationActivity: ReservationActivity }>(`${API_URL}/reservation`, activityData);
      return { id: response.data.reservationActivity.ReservationActivityID };
    } catch (error) {
      throw new Error(`Failed to add reservation activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  updateReservationActivity: async (id: number, updatedData: ReservationActivityUpdate): Promise<{ success: boolean }> => {
    try {
      if (!updatedData.ScheduledDate || !updatedData.Amount || !updatedData.Participants) {
        throw new Error('ScheduledDate, Amount, and Participants are required');
      }
      if (!Number.isInteger(updatedData.Participants) || updatedData.Participants < 1) {
        throw new Error('Participants must be a positive integer');
      }
      const response = await axios.put<{ updatedActivity: ReservationActivity }>(`${API_URL}/reservation/${id}`, updatedData);
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