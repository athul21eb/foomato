import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../store';
import {
  ClearCredentials,
  SetAccessToken,
  SetCredentials,
} from '../../../slices/auth/authSlice';
import type { ApiResponse } from '../../../types/api';
import type { AuthResponse } from '../../../features/auth/types/auth.types';
import { ENV } from '../../../config/env';

const API_BASE_URL = ENV.API_URL;

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth?.authInfo?.accessToken;

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  },
});

let refreshPromise: Promise<string | null> | null = null;

export const requestRefreshToken = async (
  dispatch: (action: unknown) => unknown,
): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/token-refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const res = (await response.json()) as ApiResponse<AuthResponse>;
          const data = res.data || (res as unknown as AuthResponse);
          const { accessToken, user } = data;

          if (accessToken) {
            dispatch(SetAccessToken(accessToken));
            if (user) {
              dispatch(
                SetCredentials({
                  user,
                  accessToken,
                }),
              );
            }
            return accessToken;
          }
        }
      } catch {
        // Refresh token failed or expired; clear state and force login
      }

      dispatch(ClearCredentials());
      return null;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

const baseQueryWithReAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  const requestUrl = typeof args === 'string' ? args : args.url;
  const isAuthRoute =
    requestUrl.includes('/auth/login') ||
    requestUrl.includes('/auth/google') ||
    requestUrl.includes('/auth/token-refresh');

  if (result.error && result.error.status === 401 && !isAuthRoute) {
    const newAccessToken = await requestRefreshToken(api.dispatch);

    if (newAccessToken) {
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'authenticationApi',
  baseQuery: baseQueryWithReAuth,
  tagTypes: ['User', 'Auth'],
  endpoints: () => ({}),
});
