export interface AutoLocation {
  type: string;
  coordinates: [number, number]; // [longitude, latitude]
  formattedAddress: string;
}

export interface Seller {
  id: string;
  name: string;
  description: string;
  image: string;
  ownerId: string;
  phone: string;
  isVerified: boolean;
  autoLocation: AutoLocation;
  isOpen: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSellerDto {
  name: string;
  description: string;
  image: string;
  phone: string;
  autoLocation: AutoLocation;
  isOpen?: boolean;
}

export interface UpdateSellerDto {
  name?: string;
  description?: string;
  image?: string;
  phone?: string;
  autoLocation?: AutoLocation;
  isOpen?: boolean;
}

export interface UpdateStatusDto {
  isOpen?: boolean;
}

export interface UploadResponse {
  url: string;
  publicId: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
}

export interface MenuItem {
  id: string;
  sellerId: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  isVeg: boolean;
  isAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMenuItemDto {
  name: string;
  description?: string;
  price: number;
  image: string;
  isVeg?: boolean;
  isAvailable?: boolean;
  sellerId?: string;
}

export interface UpdateMenuItemStatusDto {
  isAvailable?: boolean;
}

