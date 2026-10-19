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
  CustomerAddress,
  CreateAddressPayload,
  UpdateAddressPayload,
  AddressesApiResponse,
  SingleAddressApiResponse,
} from '../../features/customer/types/address.types';
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

export const addressApiSlice = createApi({
  reducerPath: 'addressApi',
  baseQuery: baseQueryWithReAuth,
  tagTypes: ['Address'],
  endpoints: (builder) => ({
    getMyAddresses: builder.query<CustomerAddress[], void>({
      query: () => '/address/all',
      transformResponse: (response: ApiResponse<AddressesApiResponse>) =>
        response.data.addresses,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Address' as const, id })),
              { type: 'Address', id: 'LIST' },
            ]
          : [{ type: 'Address', id: 'LIST' }],
    }),

    addAddress: builder.mutation<CustomerAddress, CreateAddressPayload>({
      query: (data) => ({
        url: '/address/new',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<SingleAddressApiResponse>) =>
        response.data.address,
      invalidatesTags: [{ type: 'Address', id: 'LIST' }],
    }),

    updateAddress: builder.mutation<
      CustomerAddress,
      { id: string; data: UpdateAddressPayload }
    >({
      query: ({ id, data }) => ({
        url: `/address/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<SingleAddressApiResponse>) =>
        response.data.address,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Address', id },
        { type: 'Address', id: 'LIST' },
      ],
    }),

    setDefaultAddress: builder.mutation<CustomerAddress, string>({
      query: (id) => ({
        url: `/address/${id}/default`,
        method: 'PATCH',
      }),
      transformResponse: (response: ApiResponse<SingleAddressApiResponse>) =>
        response.data.address,
      invalidatesTags: [{ type: 'Address', id: 'LIST' }],
    }),

    deleteAddress: builder.mutation<boolean, string>({
      query: (id) => ({
        url: `/address/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Address', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetMyAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useSetDefaultAddressMutation,
  useDeleteAddressMutation,
} = addressApiSlice;

