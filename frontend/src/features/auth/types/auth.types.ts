export type Role = 'customer' | 'rider' | 'seller';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: Role | null;
  googleId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
}
