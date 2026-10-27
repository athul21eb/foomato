import React, { useEffect } from "react";
import type { AuthUser, Role } from "../features/auth/types/auth.types";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  useGoogleSignInMutation,
  useUpdateRoleMutation,
  useTokenRefreshMutation,
  useLogoutMutation,
} from "../slices/auth/authApiSlice";
import { ClearCredentials, SetCheckingAuth } from "../slices/auth/authSlice";
import { apiSlice } from "../app/api/auth/authenticationApiSlice";
import { sellerApiSlice } from "../slices/seller/sellerApiSlice";
import { cartApiSlice } from "../slices/cart/cartApiSlice";
import { orderApiSlice } from "../slices/order/orderApiSlice";
import { clearCart } from "../slices/cart/cartSlice";
import { AuthContext } from "./use-auth";

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
    const role = user?.role;
    try {
      // 1. Role-specific pre-logout cleanup (close store if seller)
      if (role === "seller") {
        try {
          await dispatch(
            sellerApiSlice.endpoints.updateSellerStatus.initiate({ isOpen: false }),
          ).unwrap();
        } catch {
          // Ignore failures (e.g. seller not yet registered or network issues)
        }
      }

      // 2. Immediately wipe local auth credentials synchronously to prevent any bounce/redirect glitch
      dispatch(ClearCredentials());

      // 3. Clear global auth & orders cache
      dispatch(apiSlice.util.resetApiState());
      dispatch(orderApiSlice.util.resetApiState());

      // 4. Role-scoped domain cache & state cleanup
      if (role === "seller") {
        dispatch(sellerApiSlice.util.resetApiState());
      } else if (role === "customer") {
        dispatch(cartApiSlice.util.resetApiState());
        dispatch(clearCart());
      }

      // 5. Tell backend to clear the httpOnly refreshToken cookie
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
