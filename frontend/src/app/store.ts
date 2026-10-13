import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/auth/authSlice';
import locationReducer from '../slices/location/locationSlice';
import { apiSlice } from './api/auth/authenticationApiSlice';
import { sellerApiSlice } from '../slices/seller/sellerApiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    location: locationReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [sellerApiSlice.reducerPath]: sellerApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware)
      .concat(sellerApiSlice.middleware),
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
