import React from 'react';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClientProvider } from '@tanstack/react-query';
import { store } from './store';
import { queryClient } from '../lib/query-client';
import { ENV } from '../config/env';
import { ThemeProvider } from '../context/theme-context';
import { ToastProvider } from '../context/toast-context';
import { AuthProvider } from '../context/auth-context';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <GoogleOAuthProvider clientId={ENV.GOOGLE_CLIENT_ID}>
          <ThemeProvider>
            <ToastProvider>
              <AuthProvider>{children}</AuthProvider>
            </ToastProvider>
          </ThemeProvider>
        </GoogleOAuthProvider>
      </QueryClientProvider>
    </Provider>
  );
};
