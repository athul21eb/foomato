import { apiSlice } from '../../app/api/auth/authenticationApiSlice';
import type {
  AuthResponse,
  AuthUser,
  Role,
} from '../../features/auth/types/auth.types';
import type { ApiResponse } from '../../types/api';
import { ClearCredentials, SetCredentials } from './authSlice';

const AUTH_URL = '/auth';

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    googleSignIn: builder.mutation<AuthResponse, { idToken: string }>({
      query: (data) => ({
        url: `${AUTH_URL}/google`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<AuthResponse>) => response.data,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const { user, accessToken } = res.data;
          dispatch(SetCredentials({ user, accessToken }));
        } catch (error) {
          console.error('Error in googleSignIn:', error);
        }
      },
      invalidatesTags: ['User'],
    }),

    updateRole: builder.mutation<AuthResponse, { role: Role }>({
      query: (data) => ({
        url: `${AUTH_URL}/update-role`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<AuthResponse>) => response.data,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const { user, accessToken } = res.data;
          dispatch(SetCredentials({ user, accessToken }));
        } catch (error) {
          console.error('Error in updateRole:', error);
        }
      },
      invalidatesTags: ['User'],
    }),

    tokenRefresh: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: `${AUTH_URL}/token-refresh`,
        method: 'POST',
      }),
      transformResponse: (response: ApiResponse<AuthResponse>) => response.data,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const { user, accessToken } = res.data;
          dispatch(SetCredentials({ user, accessToken }));
        } catch {
          dispatch(ClearCredentials());
        }
      },
      invalidatesTags: ['User'],
    }),

    getProfile: builder.query<AuthUser, void>({
      query: () => `${AUTH_URL}/user-profile`,
      transformResponse: (response: ApiResponse<AuthUser>) => response.data,
      providesTags: ['User'],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: `${AUTH_URL}/logout`,
        method: 'POST',
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(ClearCredentials());
        }
      },
      invalidatesTags: ['User', 'Auth'],
    }),
  }),
});

export const {
  useGoogleSignInMutation,
  useUpdateRoleMutation,
  useTokenRefreshMutation,
  useGetProfileQuery,
  useLogoutMutation,
} = authApiSlice;
