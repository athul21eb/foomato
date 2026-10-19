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
  BackendCartResponse,
  AddToCartPayload,
} from '../../features/cart/types/cart.types';
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

export const cartApiSlice = createApi({
  reducerPath: 'cartApi',
  baseQuery: baseQueryWithReAuth,
  tagTypes: ['Cart'],
  endpoints: (builder) => ({
    getMyCart: builder.query<BackendCartResponse, void>({
      query: () => '/cart',
      transformResponse: (response: ApiResponse<BackendCartResponse>) =>
        response.data,
      providesTags: ['Cart'],
    }),

    addToCart: builder.mutation<unknown, AddToCartPayload>({
      query: (data) => ({
        url: '/cart',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cart'],
    }),

    incrementCartItem: builder.mutation<unknown, string>({
      query: (itemId) => ({
        url: `/cart/items/${itemId}/increment`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Cart'],
    }),

    decrementCartItem: builder.mutation<unknown, string>({
      query: (itemId) => ({
        url: `/cart/items/${itemId}/decrement`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Cart'],
    }),

    removeCartItem: builder.mutation<unknown, string>({
      query: (itemId) => ({
        url: `/cart/items/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),

    clearCart: builder.mutation<unknown, void>({
      query: () => ({
        url: '/cart',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetMyCartQuery,
  useAddToCartMutation,
  useIncrementCartItemMutation,
  useDecrementCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} = cartApiSlice;
