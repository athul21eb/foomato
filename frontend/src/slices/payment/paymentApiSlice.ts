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
  RazorpayOrderResult,
  VerifyRazorpayPayload,
  StripePayResult,
  VerifyStripePayload,
} from '../../features/checkout/types/checkout.types';
import { requestRefreshToken } from '../../app/api/auth/authenticationApiSlice';
import { ENV } from '../../config/env';

const UTILS_API_URL = ENV.UTILS_API_URL;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: UTILS_API_URL,
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

export const paymentApiSlice = createApi({
  reducerPath: 'paymentApi',
  baseQuery: baseQueryWithReAuth,
  tagTypes: ['Payment'],
  endpoints: (builder) => ({
    createRazorpayOrder: builder.mutation<RazorpayOrderResult, { orderId: string }>({
      query: (data) => ({
        url: '/payment/razorpay/order',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<RazorpayOrderResult>) =>
        response.data,
    }),

    verifyRazorpayPayment: builder.mutation<
      { message: string },
      VerifyRazorpayPayload
    >({
      query: (data) => ({
        url: '/payment/razorpay/verify',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data,
    }),

    payWithStripe: builder.mutation<StripePayResult, { orderId: string }>({
      query: (data) => ({
        url: '/payment/stripe/pay',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<StripePayResult>) =>
        response.data,
    }),

    verifyStripePayment: builder.mutation<
      { message: string; orderId: string },
      VerifyStripePayload
    >({
      query: (data) => ({
        url: '/payment/stripe/verify',
        method: 'POST',
        body: data,
      }),
      transformResponse: (
        response: ApiResponse<{ message: string; orderId: string }>,
      ) => response.data,
    }),
  }),
});

export const {
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
  usePayWithStripeMutation,
  useVerifyStripePaymentMutation,
} = paymentApiSlice;
