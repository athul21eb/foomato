import React from 'react';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { store } from './store';
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
    <Provider store={store}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </Provider>
  );
};
