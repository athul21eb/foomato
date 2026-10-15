import type { ApiResponse } from '../types/api';
import { store } from '../app/store';
import { ENV } from '../config/env';

const API_BASE_URL = ENV.API_URL;

interface RequestOptions extends RequestInit {
  data?: unknown;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = store.getState().auth?.authInfo?.accessToken;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    credentials: 'include',
    ...options,
    headers,
  };

  if (options.data) {
    config.body = JSON.stringify(options.data);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, config);

  let responseData: unknown;
  try {
    responseData = await response.json();
  } catch {
    responseData = null;
  }

  if (!response.ok) {
    if (
      response.status === 401 &&
      !endpoint.includes('/auth/token-refresh') &&
      !endpoint.includes('/auth/login') &&
      !endpoint.includes('/auth/google')
    ) {
      const { requestRefreshToken } = await import(
        '../app/api/auth/authenticationApiSlice'
      );
      const newAccessToken = await requestRefreshToken(store.dispatch);
      if (newAccessToken) {
        return apiClient<T>(endpoint, options);
      }
    }

    const errorMsg =
      (responseData as { message?: string | string[] })?.message ||
      response.statusText ||
      'Something went wrong';
    const message = Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg;
    throw new Error(message);
  }

  // NestJS backend returns ApiResponse<T> ({ data, message, statusCode, success })
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    return (responseData as ApiResponse<T>).data;
  }

  return responseData as T;
}
