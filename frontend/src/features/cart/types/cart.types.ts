export interface PopulatedCartItem {
  id: string;
  userId: string;
  sellerId: string;
  itemId: string;
  quantity: number;
  item?: {
    id: string;
    name: string;
    price: number;
    image: string;
    isVeg: boolean;
    isAvailable?: boolean;
    description?: string;
  };
  seller?: {
    id: string;
    name: string;
    image?: string;
    isOpen?: boolean;
  };
}

export interface BackendCartResponse {
  cart: PopulatedCartItem[];
  subtotal: number;
  cartLength: number;
}

export interface AddToCartPayload {
  sellerId: string;
  itemId: string;
}
