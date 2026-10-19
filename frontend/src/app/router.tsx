import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
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
const AddressPage = lazy(() =>
  import('../pages/customer/address-page').then((m) => ({
    default: m.AddressPage,
  })),
);
const CartPage = lazy(() =>
  import('../pages/customer/cart-page').then((m) => ({
    default: m.CartPage,
  })),
);
const SellerDetailsPage = lazy(() =>
  import('../pages/customer/seller-details-page').then((m) => ({
    default: m.SellerDetailsPage,
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
        path: 'cart',
        element: withSuspense(CartPage),
      },
      {
        path: 'account',
        element: withSuspense(CustomerAccountPage),
      },
      {
        path: 'address',
        element: withSuspense(AddressPage),
      },
      {
        path: 'restaurant/:id',
        element: withSuspense(SellerDetailsPage),
      },
      {
        path: 'seller-store/:id',
        element: withSuspense(SellerDetailsPage),
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

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;

