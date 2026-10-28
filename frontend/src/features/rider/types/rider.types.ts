export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  formattedAddress?: string;
}

export interface RiderProfile {
  id: string;
  userId: string;
  riderName: string;
  picture: string;
  phoneNumber: string;
  aadharNumber: string;
  drivingLicenseNumber: string;
  isVerified: boolean;
  location: GeoLocation;
  isAvailable: boolean;
  lastActiveAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRiderDto {
  riderName: string;
  picture: string;
  phoneNumber: string;
  aadharNumber: string;
  drivingLicenseNumber: string;
  latitude: number;
  longitude: number;
  formattedAddress?: string;
}

export interface UpdateRiderDto {
  riderName?: string;
  picture?: string;
  phoneNumber?: string;
  aadharNumber?: string;
  drivingLicenseNumber?: string;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
}

export interface ToggleAvailabilityDto {
  isAvailable: boolean;
  latitude: number;
  longitude: number;
}

export interface UploadResponse {
  url: string;
  public_id?: string;
}

export interface RiderOrderItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
  customizations?: string[];
}

export interface RiderDeliveryAddress {
  label?: string;
  street: string;
  city: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  latitude: number;
  longitude: number;
}

export interface RiderCurrentOrder {
  orderId: string;
  orderNumber: string;
  status:
    | 'ready_for_rider'
    | 'rider_assigned'
    | 'out_for_delivery'
    | 'delivered'
    | string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  restaurantId: string;
  restaurantName: string;
  restaurantPhone: string;
  restaurantAddress: string;
  deliveryAddress?: RiderDeliveryAddress;
  items: RiderOrderItem[];
  totalAmount: number;
  deliveryFee: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncomingOrderAlert {
  orderId: string;
  orderNumber?: string;
  restaurantId: string;
  restaurantName?: string;
  pickupLocation?: {
    type?: string;
    coordinates?: [number, number];
    formattedAddress?: string;
  };
  dropoffLocation?: {
    latitude?: number;
    longitude?: number;
    address?: string;
    formattedAddress?: string;
  };
  totalAmount?: number;
  riderAmount?: number;
  timestamp?: string;
}
