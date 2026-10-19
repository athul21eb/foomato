export interface LocationPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export class AddressEntity {
  id: string;
  userId: string;
  mobile: number;
  instructions?: string;
  formattedAddress: string;
  location: LocationPoint;
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial?: Partial<AddressEntity>) {
    Object.assign(this, partial);
  }
}
