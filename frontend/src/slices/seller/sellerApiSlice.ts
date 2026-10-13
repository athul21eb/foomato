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
  CreateSellerDto,
  Seller,
  UpdateSellerDto,
  UpdateStatusDto,
  UploadResponse,
} from '../../features/seller/types/seller.types';
import { requestRefreshToken } from '../../app/api/auth/authenticationApiSlice';

const SELLER_API_URL =
  import.meta.env.VITE_SELLER_API_URL || 'http://localhost:5001';
const UTILS_API_URL =
  import.meta.env.VITE_UTILS_API_URL || 'http://localhost:5002';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: SELLER_API_URL,
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

export const sellerApiSlice = createApi({
  reducerPath: 'sellerApi',
  baseQuery: baseQueryWithReAuth,
  tagTypes: ['Seller'],
  endpoints: (builder) => ({
    getMySeller: builder.query<Seller, void>({
      query: () => '/seller/get-seller',
      transformResponse: (response: ApiResponse<Seller>) => response.data,
      providesTags: ['Seller'],
    }),

    createSeller: builder.mutation<Seller, CreateSellerDto>({
      query: (data) => ({
        url: '/seller/new',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<Seller>) => response.data,
      invalidatesTags: ['Seller'],
    }),

    updateSellerStatus: builder.mutation<Seller, UpdateStatusDto | void>({
      query: (data) => ({
        url: '/seller/status',
        method: 'PUT',
        body: data || {},
      }),
      transformResponse: (response: ApiResponse<Seller>) => response.data,
      invalidatesTags: ['Seller'],
    }),

    updateSeller: builder.mutation<Seller, UpdateSellerDto>({
      query: (data) => ({
        url: '/seller/edit',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<Seller>) => response.data,
      invalidatesTags: ['Seller'],
    }),

    uploadImage: builder.mutation<UploadResponse, FormData>({
      query: (formData) => ({
        url: `${UTILS_API_URL}/api/upload`,
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: ApiResponse<UploadResponse>) =>
        response.data,
    }),
  }),
});

export const {
  useGetMySellerQuery,
  useCreateSellerMutation,
  useUpdateSellerStatusMutation,
  useUpdateSellerMutation,
  useUploadImageMutation,
} = sellerApiSlice;
