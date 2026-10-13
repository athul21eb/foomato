/**
 * Centralized Application Route Constants
 * Eliminates magic strings and provides type-safe route paths across the application.
 */
export const ROUTES = {
  HOME: '/',
  ACCOUNT: '/account',
  AUTH: {
    LOGIN: '/login',
    SELECT_ROLE: '/select-role',
  },
  SELLER: {
    ROOT: '/seller',
    NEW: '/seller/new',
    ITEMS: '/seller/items',
    ORDERS: '/seller/orders',
  },
  RIDER: {
    ROOT: '/rider',
  },
} as const;

export type AppRoutes = typeof ROUTES;
