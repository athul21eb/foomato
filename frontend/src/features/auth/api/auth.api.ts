import { apiClient } from '../../../lib/api-client';
import type { AuthResponse, AuthUser, Role } from '../types/auth.types';

export {
  authApiSlice,
  useGoogleSignInMutation,
  useUpdateRoleMutation,
  useTokenRefreshMutation,
  useGetProfileQuery,
  useLogoutMutation,
} from '../../../slices/auth/authApiSlice';
export {
  authSlice,
  SetCredentials,
  SetAccessToken,
  ClearCredentials,
} from '../../../slices/auth/authSlice';

export const authApi = {
  loginWithGoogle: (idToken: string): Promise<AuthResponse> => {
    return apiClient<AuthResponse>('/auth/google', {
      method: 'POST',
      data: { idToken },
    });
  },

  updateRole: (role: Role): Promise<AuthResponse> => {
    return apiClient<AuthResponse>('/auth/update-role', {
      method: 'PUT',
      data: { role },
    });
  },

  getProfile: (): Promise<AuthUser> => {
    return apiClient<AuthUser>('/auth/user-profile', {
      method: 'GET',
    });
  },
};
