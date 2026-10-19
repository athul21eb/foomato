export class CartItemEntity {
  id: string;
  userId: string;
  sellerId: string;
  itemId: string;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;

  // Populated fields (optional)
  item?: {
    id: string;
    name: string;
    price: number;
    image: string;
    isVeg: boolean;
    description?: string;
  };
  seller?: {
    id: string;
    name: string;
    image?: string;
    isOpen?: boolean;
  };

  constructor(partial?: Partial<CartItemEntity>) {
    Object.assign(this, partial);
  }
}
