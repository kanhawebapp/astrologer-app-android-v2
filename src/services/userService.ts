import { httpClient } from './httpClient';
import { ApiResponse, PaginatedResponse, User } from '../types';

export const userApi = {
  getProfile: () => httpClient.get<User>('/users/profile'),

  updateProfile: (data: Partial<User>) =>
    httpClient.put<User>('/users/profile', data),

  uploadAvatar: (formData: FormData) =>
    httpClient.post<{ url: string }>('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getUsers: (page = 1, limit = 10) =>
    httpClient.get<PaginatedResponse<User>>(
      `/users?page=${page}&limit=${limit}`,
    ),
};
