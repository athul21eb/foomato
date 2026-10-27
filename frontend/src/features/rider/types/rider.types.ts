export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
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
}

export interface UpdateRiderDto {
  riderName?: string;
  picture?: string;
  phoneNumber?: string;
  aadharNumber?: string;
  drivingLicenseNumber?: string;
  latitude?: number;
  longitude?: number;
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
