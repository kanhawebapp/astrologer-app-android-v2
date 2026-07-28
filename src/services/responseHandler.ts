import { AxiosError } from 'axios';
import { ApiError, ApiResponse } from '../types';
import { getErrorMessage } from '../utils/helpers';

export const handleApiResponse = <T>(
  response: ApiResponse<T>,
): { success: boolean; data: T | null; error: string | null } => {
  if (response.success) {
    return { success: true, data: response.data, error: null };
  }
  return { success: false, data: null, error: response.message };
};

export const handleApiError = (
  error: unknown,
): { success: false; data: null; error: string } => {
  const message = getErrorMessage(error);
  return { success: false, data: null, error: message };
};

export const createApiHandler = <T, Args extends unknown[]>(
  apiCall: (...args: Args) => Promise<ApiResponse<T>>,
) => {
  return async (...args: Args) => {
    try {
      const response = await apiCall(...args);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  };
};
