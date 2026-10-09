import React, { useEffect, useState } from 'react';
import type { AuthUser, Role } from '../features/auth/types/auth.types';
import { authApi } from '../features/auth/api/auth.api';
import { AuthContext } from './use-auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('foomato-user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('accessToken');
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('foomato-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('foomato-user');
    }
  }, [user]);

  const loginWithGoogle = async (idToken: string): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const response = await authApi.loginWithGoogle(idToken);
      setToken(response.accessToken);
      setUser(response.user);
      return response.user;
    } finally {
      setIsLoading(false);
    }
  };

  const updateRole = async (role: Role): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const response = await authApi.updateRole(role);
      if (response.accessToken) {
        setToken(response.accessToken);
      }
      setUser(response.user);
      return response.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('foomato-user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        loginWithGoogle,
        updateRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
