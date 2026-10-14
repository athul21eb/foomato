export class MenuItemEntity {
  id: string;
  sellerId: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  isVeg: boolean;
  isAvailable: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial?: Partial<MenuItemEntity>) {
    Object.assign(this, partial);
  }
}
