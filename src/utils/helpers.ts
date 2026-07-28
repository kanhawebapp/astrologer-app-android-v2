import { ERROR_MESSAGES } from './constants';
import { ApiError } from '../types';

export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    const apiError = error as Partial<ApiError>;

    if (apiError.statusCode) {
      switch (apiError.statusCode) {
        case 401:
          return ERROR_MESSAGES.UNAUTHORIZED;
        case 403:
          return ERROR_MESSAGES.FORBIDDEN;
        case 404:
          return ERROR_MESSAGES.NOT_FOUND;
        case 500:
          return ERROR_MESSAGES.SERVER_ERROR;
        default:
          return apiError.message || ERROR_MESSAGES.UNKNOWN_ERROR;
      }
    }

    if (apiError.message) {
      return apiError.message;
    }

    if (error instanceof Error) {
      return error.message;
    }
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
};

export const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const truncate = (str: string, length: number): string =>
  str.length > length ? `${str.substring(0, length)}...` : str;

export const isEmptyObject = (obj: Record<string, unknown>): boolean =>
  Object.keys(obj).length === 0;

export const formatCurrency = (
  amount: number,
  currency = 'INR',
  locale = 'en-IN',
): string =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);

export const formatDate = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
  locale = 'en-IN',
): string => new Intl.DateTimeFormat(locale, options).format(new Date(date));
