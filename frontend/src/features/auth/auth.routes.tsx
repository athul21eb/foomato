import React, { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { AuthLayout } from '../../layouts/auth-layout';
import { ErrorPage } from '../../pages/error-page';
import { LoadingScreen } from '../../components/feedback/loading-screen';

const LoginPage = lazy(() =>
  import('../../pages/login-page').then((m) => ({ default: m.LoginPage })),
);
const SelectRolePage = lazy(() =>
  import('../../pages/select-role-page').then((m) => ({
    default: m.SelectRolePage,
  })),
);

const withSuspense = (Component: React.ComponentType) => (
  <Suspense
    fallback={
      <LoadingScreen
        message="Loading Authentication..."
        subtext="Securing your session"
        fullScreen={false}
      />
    }
  >
    <Component />
  </Suspense>
);

/**
 * Modular Feature Routes for Authentication Domain
 */
export const authRoutes: RouteObject = {
  element: <AuthLayout />,
  errorElement: <ErrorPage />,
  children: [
    {
      path: '/login',
      element: withSuspense(LoginPage),
    },
    {
      path: '/select-role',
      element: withSuspense(SelectRolePage),
    },
  ],
};

export default authRoutes;
