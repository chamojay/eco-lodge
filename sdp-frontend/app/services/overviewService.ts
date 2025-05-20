import axios from 'axios';
import { OverviewData } from '@/types/overviewTypes' // You'll need to create this type

const API_URL = 'http://localhost:5000/api/overview';

export const overviewService = {
  getOverviewData: async (timeRange: 'daily' | 'weekly' | 'monthly'): Promise<OverviewData> => {
    try {
      const response = await axios.get<OverviewData>(API_URL, {
        params: { range: timeRange },
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching overview data:', error);
      throw error;
    }
  },

  getRevenueStats: async (timeRange: 'daily' | 'weekly' | 'monthly'): Promise<any> => {
    try {
      const response = await axios.get(`${API_URL}/revenue`, {
        params: { range: timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
      throw error;
    }
  },

  getBookingStats: async (timeRange: 'daily' | 'weekly' | 'monthly'): Promise<any> => {
    try {
      const response = await axios.get(`${API_URL}/bookings`, {
        params: { range: timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      throw error;
    }
  },

  getActivityStats: async (timeRange: 'daily' | 'weekly' | 'monthly'): Promise<any> => {
    try {
      const response = await axios.get(`${API_URL}/activities`, {
        params: { range: timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      throw error;
    }
  },

  getRestaurantStats: async (timeRange: 'daily' | 'weekly' | 'monthly'): Promise<any> => {
    try {
      const response = await axios.get(`${API_URL}/restaurant`, {
        params: { range: timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant stats:', error);
      throw error;
    }
  }
};