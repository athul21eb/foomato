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
  MenuItem,
  CreateMenuItemDto,
  UpdateMenuItemStatusDto,
} from '../../features/seller/types/seller.types';
import { requestRefreshToken } from '../../app/api/auth/authenticationApiSlice';
import { ENV } from '../../config/env';

const SELLER_API_URL = ENV.SELLER_API_URL;
const UTILS_API_URL = ENV.UTILS_API_URL;

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
  tagTypes: ['Seller', 'MenuItem'],
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
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          sellerApiSlice.util.updateQueryData('getMySeller', undefined, (draft) => {
            if (arg && typeof arg.isOpen === 'boolean') {
              draft.isOpen = arg.isOpen;
            }
          }),
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(
            sellerApiSlice.util.updateQueryData('getMySeller', undefined, (draft) => {
              Object.assign(draft, data);
            }),
          );
        } catch {
          patchResult.undo();
        }
      },
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
      query: (formData) => {
        if (!formData.has('folder')) {
          formData.append('folder', 'foomato/seller');
        }
        return {
          url: `${UTILS_API_URL}/upload`,
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: (response: ApiResponse<UploadResponse>) =>
        response.data,
    }),

    getMenuItems: builder.query<MenuItem[], string>({
      query: (sellerId) => `/menu-item/all/${sellerId}`,
      transformResponse: (response: ApiResponse<MenuItem[]>) => response.data,
      providesTags: (result, _error, sellerId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'MenuItem' as const, id })),
              { type: 'MenuItem', id: `LIST-${sellerId}` },
            ]
          : [{ type: 'MenuItem', id: `LIST-${sellerId}` }],
    }),

    createMenuItem: builder.mutation<MenuItem, CreateMenuItemDto>({
      query: (data) => ({
        url: '/menu-item/new',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<MenuItem>) => response.data,
      invalidatesTags: (_result, _error, arg) =>
        arg.sellerId
          ? [{ type: 'MenuItem', id: `LIST-${arg.sellerId}` }]
          : [{ type: 'MenuItem', id: 'LIST' }],
    }),

    toggleMenuItemAvailability: builder.mutation<
      MenuItem,
      { itemId: string; isAvailable?: boolean; sellerId: string }
    >({
      query: ({ itemId, isAvailable }) => {
        const body: UpdateMenuItemStatusDto =
          isAvailable !== undefined ? { isAvailable } : {};
        return {
          url: `/menu-item/status/${itemId}`,
          method: 'PUT',
          body,
        };
      },
      transformResponse: (response: ApiResponse<MenuItem>) => response.data,
      async onQueryStarted({ itemId, isAvailable, sellerId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          sellerApiSlice.util.updateQueryData('getMenuItems', sellerId, (draft) => {
            const item = draft.find((i) => i.id === itemId);
            if (item) {
              item.isAvailable =
                isAvailable !== undefined ? isAvailable : !item.isAvailable;
            }
          }),
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(
            sellerApiSlice.util.updateQueryData('getMenuItems', sellerId, (draft) => {
              const item = draft.find((i) => i.id === itemId);
              if (item) {
                Object.assign(item, data);
              }
            }),
          );
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_result, _error, { itemId, sellerId }) => [
        { type: 'MenuItem', id: itemId },
        { type: 'MenuItem', id: `LIST-${sellerId}` },
      ],
    }),

    deleteMenuItem: builder.mutation<
      { deleted: boolean },
      { itemId: string; sellerId: string }
    >({
      query: ({ itemId }) => ({
        url: `/menu-item/${itemId}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<{ deleted: boolean }>) =>
        response.data,
      async onQueryStarted({ itemId, sellerId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          sellerApiSlice.util.updateQueryData('getMenuItems', sellerId, (draft) => {
            return draft.filter((i) => i.id !== itemId);
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_result, _error, { sellerId }) => [
        { type: 'MenuItem', id: `LIST-${sellerId}` },
      ],
    }),
  }),
});

export const {
  useGetMySellerQuery,
  useCreateSellerMutation,
  useUpdateSellerStatusMutation,
  useUpdateSellerMutation,
  useUploadImageMutation,
  useGetMenuItemsQuery,
  useCreateMenuItemMutation,
  useToggleMenuItemAvailabilityMutation,
  useDeleteMenuItemMutation,
} = sellerApiSlice;

