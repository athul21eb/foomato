import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/auth/authSlice';
import locationReducer from '../slices/location/locationSlice';
import cartReducer from '../slices/cart/cartSlice';
import { apiSlice } from './api/auth/authenticationApiSlice';
import { sellerApiSlice } from '../slices/seller/sellerApiSlice';
import { cartApiSlice } from '../slices/cart/cartApiSlice';
import { addressApiSlice } from '../slices/address/addressApiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    location: locationReducer,
    cart: cartReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [sellerApiSlice.reducerPath]: sellerApiSlice.reducer,
    [cartApiSlice.reducerPath]: cartApiSlice.reducer,
    [addressApiSlice.reducerPath]: addressApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware)
      .concat(sellerApiSlice.middleware)
      .concat(cartApiSlice.middleware)
      .concat(addressApiSlice.middleware),
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
