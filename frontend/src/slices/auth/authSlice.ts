import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '../../features/auth/types/auth.types';

export interface AuthState {
  authInfo: {
    user: AuthUser | null;
    accessToken: string | null;
  };
  isCheckingAuth: boolean;
}

const initialState: AuthState = {
  authInfo: {
    user: null,
    accessToken: null,
  },
  isCheckingAuth: true,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    SetCredentials: (
      state,
      action: PayloadAction<
        { user: AuthUser; accessToken?: string } | AuthUser
      >,
    ) => {
      if ('user' in action.payload) {
        state.authInfo.user = action.payload.user;
        if (action.payload.accessToken) {
          state.authInfo.accessToken = action.payload.accessToken;
        }
      } else {
        state.authInfo.user = action.payload;
      }
      state.isCheckingAuth = false;
    },

    SetAccessToken: (state, action: PayloadAction<string>) => {
      state.authInfo.accessToken = action.payload;
    },

    ClearCredentials: (state) => {
      state.authInfo.user = null;
      state.authInfo.accessToken = null;
      state.isCheckingAuth = false;
    },

    SetCheckingAuth: (state, action: PayloadAction<boolean>) => {
      state.isCheckingAuth = action.payload;
    },
  },
});

export const {
  SetCredentials,
  SetAccessToken,
  ClearCredentials,
  SetCheckingAuth,
} = authSlice.actions;

export default authSlice.reducer;
