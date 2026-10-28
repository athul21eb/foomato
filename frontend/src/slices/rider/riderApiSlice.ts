import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../app/store';
import type { ApiResponse } from '../../types/api';
import type {
  CreateRiderDto,
  RiderProfile,
  ToggleAvailabilityDto,
  UpdateRiderDto,
  UploadResponse,
} from '../../features/rider/types/rider.types';
import { requestRefreshToken } from '../../app/api/auth/authenticationApiSlice';
import { ENV } from '../../config/env';

const RIDER_API_URL = ENV.RIDER_API_URL;
const UTILS_API_URL = ENV.UTILS_API_URL;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: RIDER_API_URL,
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

const baseQueryWithReAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const newAccessToken = await requestRefreshToken(api.dispatch);

    if (newAccessToken) {
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const riderApiSlice = createApi({
  reducerPath: 'riderApi',
  baseQuery: baseQueryWithReAuth,
  tagTypes: ['Rider', 'RiderCurrentOrder'],
  endpoints: (builder) => ({
    getMyRider: builder.query<RiderProfile, void>({
      query: () => '/rider/profile',
      transformResponse: (response: ApiResponse<RiderProfile>) => response.data,
      providesTags: ['Rider'],
    }),

    createRider: builder.mutation<RiderProfile, CreateRiderDto>({
      query: (data) => ({
        url: '/rider/profile',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<RiderProfile>) => response.data,
      invalidatesTags: ['Rider'],
    }),

    toggleAvailability: builder.mutation<RiderProfile, ToggleAvailabilityDto>({
      query: (data) => ({
        url: '/rider/availability',
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: ApiResponse<RiderProfile>) => response.data,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          riderApiSlice.util.updateQueryData('getMyRider', undefined, (draft) => {
            if (draft) {
              draft.isAvailable = arg.isAvailable;
              draft.location = {
                type: 'Point',
                coordinates: [arg.longitude, arg.latitude],
              };
            }
          }),
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(
            riderApiSlice.util.updateQueryData('getMyRider', undefined, (draft) => {
              if (draft) {
                Object.assign(draft, data);
              }
            }),
          );
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ['Rider'],
    }),

    updateRider: builder.mutation<RiderProfile, UpdateRiderDto>({
      query: (data) => ({
        url: '/rider/edit',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<RiderProfile>) => response.data,
      invalidatesTags: ['Rider'],
    }),

    uploadRiderImage: builder.mutation<UploadResponse, FormData>({
      query: (formData) => {
        if (!formData.has('folder')) {
          formData.append('folder', 'foomato/rider');
        }
        return {
          url: `${UTILS_API_URL}/upload`,
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: (response: ApiResponse<UploadResponse>) => response.data,
    }),

    getCurrentOrder: builder.query<{ order: import('../../features/rider/types/rider.types').RiderCurrentOrder | null }, void>({
      query: () => '/rider/order/current',
      transformResponse: (
        response: ApiResponse<{ order: import('../../features/rider/types/rider.types').RiderCurrentOrder | null }>,
      ) => response.data,
      providesTags: ['RiderCurrentOrder'],
    }),

    acceptOrder: builder.mutation<
      { message: string; orderId: string; status: string },
      { orderId: string }
    >({
      query: ({ orderId }) => ({
        url: `/rider/order/${orderId}/accept`,
        method: 'POST',
      }),
      transformResponse: (
        response: ApiResponse<{ message: string; orderId: string; status: string }>,
      ) => response.data,
      invalidatesTags: ['RiderCurrentOrder', 'Rider'],
    }),

    updateOrderStatus: builder.mutation<
      { message: string; order: import('../../features/rider/types/rider.types').RiderCurrentOrder },
      { orderId: string }
    >({
      query: ({ orderId }) => ({
        url: `/rider/order/${orderId}/status`,
        method: 'PATCH',
      }),
      transformResponse: (
        response: ApiResponse<{
          message: string;
          order: import('../../features/rider/types/rider.types').RiderCurrentOrder;
        }>,
      ) => response.data,
      invalidatesTags: ['RiderCurrentOrder', 'Rider'],
    }),
  }),
});

export const {
  useGetMyRiderQuery,
  useCreateRiderMutation,
  useUpdateRiderMutation,
  useToggleAvailabilityMutation,
  useUploadRiderImageMutation,
  useGetCurrentOrderQuery,
  useAcceptOrderMutation,
  useUpdateOrderStatusMutation,
} = riderApiSlice;
