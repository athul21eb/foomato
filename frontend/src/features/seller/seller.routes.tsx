import React, { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { LoadingScreen } from '../../components/feedback/loading-screen';

// Lazy-loaded route chunks
const SellerGuard = lazy(() =>
  import('./components/seller-guard').then((m) => ({ default: m.SellerGuard })),
);
const SellerDashboardPage = lazy(() =>
  import('../../pages/seller/seller-dashboard-page').then((m) => ({
    default: m.SellerDashboardPage,
  })),
);
const AddSellerPage = lazy(() =>
  import('../../pages/seller/add-seller-page').then((m) => ({
    default: m.AddSellerPage,
  })),
);

const withSuspense = (Component: React.ComponentType) => (
  <Suspense
    fallback={
      <LoadingScreen
        message="Loading Seller Portal..."
        subtext="Fetching kitchen and store management workspace"
        fullScreen={false}
      />
    }
  >
    <Component />
  </Suspense>
);

/**
 * Modular Feature Routes for Seller Domain
 * Guarded at the parent layout level so all child routes inherit security automatically.
 */
export const sellerRoutes: RouteObject = {
  path: 'seller',
  element: withSuspense(SellerGuard),
  children: [
    {
      index: true,
      element: withSuspense(SellerDashboardPage),
    },
    {
      path: 'new',
      element: withSuspense(AddSellerPage),
    },
    // Future item & menu routes will plug in here cleanly:
    // { path: 'items', element: withSuspense(SellerItemsPage) },
    // { path: 'orders', element: withSuspense(SellerOrdersPage) },
  ],
};

export default sellerRoutes;
