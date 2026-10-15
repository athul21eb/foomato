import { useQuery } from '@tanstack/react-query';
import {
  fetchNearbySellers,
  fetchSellerById,
  fetchSellerMenu,
} from '../api/seller-public.api';
import type { GetNearbySellersParams } from '../types/seller.types';

export function useNearbySellers(
  params: Partial<GetNearbySellersParams> & { enabled?: boolean },
) {
  const { latitude, longitude, radius = 5000, search = '', enabled = true } = params;

  return useQuery({
    queryKey: ['sellers', 'nearby', { latitude, longitude, radius, search }],
    queryFn: () =>
      fetchNearbySellers({
        latitude: latitude!,
        longitude: longitude!,
        radius,
        search,
      }),
    enabled: enabled && latitude != null && longitude != null,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useSellerDetails(id?: string) {
  return useQuery({
    queryKey: ['seller', id],
    queryFn: () => fetchSellerById(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSellerMenu(sellerId?: string) {
  return useQuery({
    queryKey: ['seller', sellerId, 'menu'],
    queryFn: () => fetchSellerMenu(sellerId!),
    enabled: Boolean(sellerId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Backward-compatible aliases
export const useNearbyRestaurants = useNearbySellers;
export const useRestaurantDetails = useSellerDetails;
export const useRestaurantMenu = useSellerMenu;
