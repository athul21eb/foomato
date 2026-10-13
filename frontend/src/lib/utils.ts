import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ApiErrorResponse } from '../types/api';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extracts a user-friendly error message from any error (RTK Query, Axios, Error, or unknown)
 */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (!error || typeof error !== 'object') {
    return typeof error === 'string' ? error : fallback;
  }

  // Handle RTK Query FetchBaseQueryError with data payload
  if ('data' in error) {
    const data = (error as { data?: ApiErrorResponse }).data;
    if (data?.message) {
      if (Array.isArray(data.message)) {
        return data.message[0] || fallback;
      }
      return data.message;
    }
    if (data?.error && typeof data.error === 'string') {
      return data.error;
    }
  }

  // Handle standard JavaScript Error object or RTK Query SerializedError
  if ('message' in error && typeof (error as Error).message === 'string') {
    return (error as Error).message;
  }

  return fallback;
}
