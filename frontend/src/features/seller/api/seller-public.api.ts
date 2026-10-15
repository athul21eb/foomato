import type {
  GetNearbySellersParams,
  NearbySellersResponse,
  Seller,
  MenuItem,
} from '../types/seller.types';
import type { ApiResponse } from '../../../types/api';
import { ENV } from '../../../config/env';

export async function fetchNearbySellers({
  latitude,
  longitude,
  radius = 5000,
  search = '',
}: GetNearbySellersParams): Promise<NearbySellersResponse> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    radius: radius.toString(),
  });

  if (search.trim()) {
    params.set('search', search.trim());
  }

  const response = await fetch(
    `${ENV.SELLER_API_URL}/seller/nearby?${params.toString()}`,
  );
  if (!response.ok) {
    throw new Error('Failed to fetch nearby sellers');
  }

  const json = (await response.json()) as ApiResponse<NearbySellersResponse>;
  return json.data;
}

export async function fetchSellerById(id: string): Promise<Seller> {
  const response = await fetch(`${ENV.SELLER_API_URL}/seller/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch seller details');
  }

  const json = (await response.json()) as ApiResponse<Seller>;
  return json.data;
}

export async function fetchSellerMenu(sellerId: string): Promise<MenuItem[]> {
  const response = await fetch(
    `${ENV.SELLER_API_URL}/menu-item/all/${sellerId}`,
  );
  if (!response.ok) {
    throw new Error('Failed to fetch seller menu');
  }

  const json = (await response.json()) as ApiResponse<MenuItem[]>;
  return json.data;
}

// Backward-compatible aliases
export const fetchNearbyRestaurants = fetchNearbySellers;
export const fetchRestaurantById = fetchSellerById;
export const fetchRestaurantMenu = fetchSellerMenu;
