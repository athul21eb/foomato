import React, { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '../layouts/root-layout';
import { ErrorPage } from '../pages/error-page';
import { LoadingScreen } from '../components/feedback/loading-screen';
import { sellerRoutes } from '../features/seller/seller.routes';
import { authRoutes } from '../features/auth/auth.routes';

// Lazy-loaded page components for customer & fallback routes
const HomePage = lazy(() =>
  import('../pages/home-page').then((m) => ({ default: m.HomePage })),
);
const CustomerAccountPage = lazy(() =>
  import('../pages/customer/account-page').then((m) => ({
    default: m.CustomerAccountPage,
  })),
);
const NotFoundPage = lazy(() =>
  import('../pages/not-found-page').then((m) => ({
    default: m.NotFoundPage,
  })),
);

const withSuspense = (Component: React.ComponentType) => (
  <Suspense
    fallback={
      <LoadingScreen
        message="Loading page..."
        subtext="Fetching live content"
        fullScreen={false}
      />
    }
  >
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  // Main Application Shell & Customer Routes
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: withSuspense(HomePage),
      },
      {
        path: 'account',
        element: withSuspense(CustomerAccountPage),
      },
      // Modular Feature Sub-Trees
      sellerRoutes,
    ],
  },

  // Modular Authentication Feature Routes
  authRoutes,

  // Catch-all 404
  {
    path: '*',
    element: withSuspense(NotFoundPage),
  },
]);

export default router;
