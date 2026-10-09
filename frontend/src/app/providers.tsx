import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from '../context/theme-context';
import { ToastProvider } from '../context/toast-context';
import { AuthProvider } from '../context/auth-context';

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  'YOUR_GOOGLE_CLIENT_ID_PLACEHOLDER.apps.googleusercontent.com';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
};
