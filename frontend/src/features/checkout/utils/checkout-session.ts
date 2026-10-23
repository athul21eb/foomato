import type { PendingOrderSession } from '../types';

export const SESSION_ORDER_KEY = 'foomato_pending_order';

export const readSavedPendingOrder = (): PendingOrderSession | null => {
  try {
    const raw = sessionStorage.getItem(SESSION_ORDER_KEY);
    if (!raw) return null;
    const parsed: PendingOrderSession = JSON.parse(raw);
    if (Date.now() - parsed.createdAt < 14 * 60 * 1000) {
      return parsed;
    }
    sessionStorage.removeItem(SESSION_ORDER_KEY);
  } catch {
    // Ignore storage parse errors
  }
  return null;
};

export const savePendingOrder = (order: PendingOrderSession | null): void => {
  try {
    if (order) {
      sessionStorage.setItem(SESSION_ORDER_KEY, JSON.stringify(order));
    } else {
      sessionStorage.removeItem(SESSION_ORDER_KEY);
    }
  } catch {
    // Ignore storage write errors
  }
};
