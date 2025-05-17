import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

export interface User {
  UserID: number;
  Username: string;
  Role: string;
}

export interface UserCreate {
  username: string;
  password: string;
  role: string;
}

export interface UserUpdate {
  username?: string;
  password?: string;
  role?: string;
}

export const userService = {
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await axios.get<User[]>(API_URL);
      console.log('Users fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching users:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch users');
    }
  },

  createUser: async (userData: UserCreate): Promise<User> => {
    try {
      const response = await axios.post<User>(API_URL, userData);
      console.log('User created:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating user:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to create user');
    }
  },

  updateUser: async (id: number, userData: UserUpdate): Promise<User> => {
    try {
      const response = await axios.put<User>(`${API_URL}/${id}`, userData);
      console.log('User updated:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating user:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to update user');
    }
  },

  deleteUser: async (id: number): Promise<void> => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      console.log('User deleted:', response.data);
    } catch (error: any) {
      console.error('Error deleting user:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to delete user');
    }
  }
};