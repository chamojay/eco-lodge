import axios from 'axios';
import { PackageType } from '@/types/reservationtypes';

const API_URL = 'http://localhost:5000/api/package-types';

export const packageTypeService = {
  getAllPackageTypes: async (): Promise<PackageType[]> => {
    try {
      const response = await axios.get<PackageType[]>(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching package types:', error);
      throw error;
    }
  },

  createPackageType: async (formData: FormData): Promise<PackageType> => {
    try {
      const response = await axios.post<PackageType>(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating package type:', error);
      throw error;
    }
  },

  updatePackageType: async (id: number, formData: FormData): Promise<PackageType> => {
    try {
      const response = await axios.put<PackageType>(`${API_URL}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating package type:', error);
      throw error;
    }
  },

  deletePackageType: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/${id}`);
    } catch (error) {
      console.error('Error deleting package type:', error);
      throw error;
    }
  },
};