export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  formattedAddress?: string;
}

export class RiderEntity {
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
  lastActiveAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
