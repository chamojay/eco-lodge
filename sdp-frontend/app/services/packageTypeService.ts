import axios from 'axios';
import { PackageType } from '@/types/reservationtypes';

const API_URL =  'http://localhost:5000/api/package-types';

export const packageTypeService = {
  getAllPackageTypes: async (): Promise<PackageType[]> => {
    try {
      const response = await axios.get(API_URL);
      console.log('Package types response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching package types:', error);
      throw error;
    }
  },
};