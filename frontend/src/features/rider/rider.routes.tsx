import React, { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { LoadingScreen } from '../../components/feedback/loading-screen';

// Lazy-loaded route chunks
const RiderGuard = lazy(() =>
  import('./components/rider-guard').then((m) => ({ default: m.RiderGuard })),
);
const RiderDashboardPage = lazy(() =>
  import('../../pages/rider/rider-dashboard-page').then((m) => ({
    default: m.RiderDashboardPage,
  })),
);
const AddRiderPage = lazy(() =>
  import('../../pages/rider/add-rider-page').then((m) => ({
    default: m.AddRiderPage,
  })),
);

const withSuspense = (Component: React.ComponentType) => (
  <Suspense
    fallback={
      <LoadingScreen
        message="Loading Rider Portal..."
        subtext="Fetching courier credentials and live status"
        fullScreen={false}
      />
    }
  >
    <Component />
  </Suspense>
);

/**
 * Modular Feature Routes for Rider Domain
 * Guarded at the parent layout level so all child routes inherit security automatically.
 */
export const riderRoutes: RouteObject = {
  path: 'rider',
  element: withSuspense(RiderGuard),
  children: [
    {
      index: true,
      element: withSuspense(RiderDashboardPage),
    },
    {
      path: 'new',
      element: withSuspense(AddRiderPage),
    },
  ],
};

export default riderRoutes;
