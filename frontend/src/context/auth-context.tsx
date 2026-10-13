import React, { useEffect } from 'react';
import type { AuthUser, Role } from '../features/auth/types/auth.types';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  useGoogleSignInMutation,
  useUpdateRoleMutation,
  useTokenRefreshMutation,
  useLogoutMutation,
} from '../slices/auth/authApiSlice';
import { ClearCredentials, SetCheckingAuth } from '../slices/auth/authSlice';
import { apiSlice } from '../app/api/auth/authenticationApiSlice';
import { sellerApiSlice } from '../slices/seller/sellerApiSlice';
import { AuthContext } from './use-auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const { user, accessToken: token } = useAppSelector(
    (state) => state.auth.authInfo,
  );
  const isCheckingAuth = useAppSelector((state) => state.auth.isCheckingAuth);

  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [tokenRefresh] = useTokenRefreshMutation();
  const [googleSignIn, { isLoading: isGoogleLoading }] =
    useGoogleSignInMutation();
  const [updateRoleMutation, { isLoading: isUpdateRoleLoading }] =
    useUpdateRoleMutation();
  const [logoutMutation] = useLogoutMutation();

  useEffect(() => {
    // Silent in-memory token refresh on initial app load/tab restore using httpOnly cookie
    tokenRefresh()
      .unwrap()
      .catch(() => {
        // No active session cookie or expired
      })
      .finally(() => {
        dispatch(SetCheckingAuth(false));
      });
  }, [tokenRefresh, dispatch]);

  const isLoading = isCheckingAuth || isGoogleLoading || isUpdateRoleLoading;

  const loginWithGoogle = async (idToken: string): Promise<AuthUser> => {
    const res = await googleSignIn({ idToken }).unwrap();
    return res.user;
  };

  const updateRole = async (role: Role): Promise<AuthUser> => {
    const res = await updateRoleMutation({ role }).unwrap();
    return res.user;
  };

  const logout = async (): Promise<void> => {
    setIsLoggingOut(true);
    try {
      // 1. Immediately wipe local auth credentials synchronously to prevent any bounce/redirect glitch
      dispatch(ClearCredentials());

      // 2. Clear RTK Query caches
      dispatch(apiSlice.util.resetApiState());
      dispatch(sellerApiSlice.util.resetApiState());

      // 3. Tell backend to clear the httpOnly refreshToken cookie
      await logoutMutation().unwrap();
    } catch {
      // Ignore network errors on logout
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        isLoggingOut,
        loginWithGoogle,
        updateRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
