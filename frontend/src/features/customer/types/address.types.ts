export interface LocationPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface CustomerAddress {
  id: string;
  userId: string;
  mobile: number;
  instructions?: string;
  formattedAddress: string;
  location: LocationPoint;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAddressPayload {
  mobile: number;
  instructions?: string;
  formattedAddress: string;
  location: LocationPoint;
  isDefault?: boolean;
}

export interface UpdateAddressPayload {
  mobile?: number;
  instructions?: string;
  formattedAddress?: string;
  location?: LocationPoint;
  isDefault?: boolean;
}

export interface AddressesApiResponse {
  addresses: CustomerAddress[];
}

export interface SingleAddressApiResponse {
  address: CustomerAddress;
}
