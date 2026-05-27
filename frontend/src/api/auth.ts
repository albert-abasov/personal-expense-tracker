import client from './client';
import { User } from '../types/auth';

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await client.get<User>('/api/v1/me');
    if (response.status === 302 || response.status === 401) {
      return null;
    }
    return response.data;
  } catch (error) {
    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await client.post('/api/v1/auth/logout');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
