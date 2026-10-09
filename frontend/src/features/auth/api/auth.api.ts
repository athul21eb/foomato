import { apiClient } from '../../../lib/api-client';
import type { AuthResponse, AuthUser, Role } from '../types/auth.types';

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
