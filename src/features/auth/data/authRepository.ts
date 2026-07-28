import { httpClient } from '../../../services/httpClient';
import { ApiResponse } from '../../../types';
import { AuthResult, AuthUser } from '../domain/types';

export const authRepository = {
  login: (email: string, password: string) =>
    httpClient.post<AuthResult>('/auth/login', { email, password }),

  logout: () => httpClient.post<void>('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    httpClient.post<AuthResult>('/auth/refresh', { refreshToken }),

  getProfile: () => httpClient.get<AuthUser>('/auth/profile'),

  forgotPassword: (email: string) =>
    httpClient.post<void>('/auth/forgot-password', { email }),

  verifyEmail: (token: string) =>
    httpClient.post<void>('/auth/verify-email', { token }),
};
