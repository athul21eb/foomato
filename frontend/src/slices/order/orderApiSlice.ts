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
  CreateOrderPayload,
  CreateOrderResult,
  CustomerOrdersResponse,
  OrderDetails,
  SellerOrdersResponse,
} from '../../features/checkout/types/checkout.types';
import { requestRefreshToken } from '../../app/api/auth/authenticationApiSlice';
import { ENV } from '../../config/env';

const SELLER_API_URL = ENV.SELLER_API_URL;

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

export const orderApiSlice = createApi({
  reducerPath: 'orderApi',
  baseQuery: baseQueryWithReAuth,
  tagTypes: ['Order', 'SellerOrders'],
  endpoints: (builder) => ({
    createOrder: builder.mutation<CreateOrderResult, CreateOrderPayload>({
      query: (data) => ({
        url: '/order/new',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<CreateOrderResult>) =>
        response.data,
      invalidatesTags: ['Order'],
    }),

    getOrderById: builder.query<OrderDetails, string>({
      query: (id) => `/order/${id}`,
      transformResponse: (response: ApiResponse<{ order: OrderDetails }>) =>
        response.data.order,
      providesTags: (_result, _error, id) => [{ type: 'Order', id }],
    }),

    getMyOrders: builder.query<
      CustomerOrdersResponse,
      { page?: number; limit?: number; tab?: string } | void
    >({
      query: (params) => ({
        url: '/order/my-orders',
        params: params || {},
      }),
      transformResponse: (
        response: ApiResponse<CustomerOrdersResponse>,
      ) => response.data,
      providesTags: ['Order'],
    }),

    getSellerOrders: builder.query<
      SellerOrdersResponse,
      { page?: number; limit?: number; status?: string } | void
    >({
      query: (params) => ({
        url: '/order/seller',
        params: params || {},
      }),
      transformResponse: (
        response: ApiResponse<SellerOrdersResponse>,
      ) => response.data,
      providesTags: ['SellerOrders'],
    }),

    updateOrderStatus: builder.mutation<
      { order: OrderDetails },
      { orderId: string; status: string; reason?: string }
    >({
      query: ({ orderId, status, reason }) => ({
        url: `/order/${orderId}/status`,
        method: 'PATCH',
        body: { status, reason },
      }),
      transformResponse: (
        response: ApiResponse<{ order: OrderDetails }>,
      ) => response.data,
      invalidatesTags: ['SellerOrders', 'Order'],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrderByIdQuery,
  useGetMyOrdersQuery,
  useGetSellerOrdersQuery,
  useUpdateOrderStatusMutation,
} = orderApiSlice;

