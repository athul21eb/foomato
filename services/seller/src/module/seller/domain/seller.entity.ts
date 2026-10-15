export interface AutoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  formattedAddress?: string;
}

export class SellerEntity {
  id: string;
  name: string;
  description?: string;
  image: string;
  ownerId: string;
  phone: number;
  isVerified: boolean;
  autoLocation: AutoLocation;
  isOpen: boolean;
  distance?: number;
  distanceKm?: number;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial?: Partial<SellerEntity>) {
    Object.assign(this, partial);
  }
}
