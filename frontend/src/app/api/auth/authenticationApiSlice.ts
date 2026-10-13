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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
    requestUrl.includes('/auth/token-refresh')
    
  if (result.error && result.error.status === 401 && !isAuthRoute) {
    if (!refreshPromise) {
      refreshPromise = (async () => {
        const refreshResult = await baseQuery(
          {
            url: '/auth/token-refresh',
            method: 'POST',
          },
          api,
          extraOptions,
        );

        if (refreshResult.data) {
          const res = refreshResult.data as ApiResponse<AuthResponse>;
          const data = res.data || (res as unknown as AuthResponse);
          const { accessToken, user } = data;

          if (accessToken) {
            api.dispatch(SetAccessToken(accessToken));
            if (user) {
              api.dispatch(
                SetCredentials({
                  user,
                  accessToken,
                }),
              );
            }
            return accessToken;
          }
        }

        api.dispatch(ClearCredentials());
        return null;
      })().finally(() => {
        refreshPromise = null;
      });
    }

    const newAccessToken = await refreshPromise;

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
