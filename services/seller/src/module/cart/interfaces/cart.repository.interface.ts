import { CartItemEntity } from '../domain/cart-item.entity';

export const CART_REPOSITORY = Symbol('CART_REPOSITORY');

export interface ICartRepository {
  findItemsByUserId(userId: string): Promise<CartItemEntity[]>;
  findPopulatedCartByUserId(userId: string): Promise<CartItemEntity[]>;
  findFirstItemByUserId(userId: string): Promise<CartItemEntity | null>;
  findItem(userId: string, itemId: string): Promise<CartItemEntity | null>;
  addItem(
    userId: string,
    sellerId: string,
    itemId: string,
  ): Promise<CartItemEntity>;
  incrementItem(userId: string, itemId: string): Promise<CartItemEntity | null>;
  decrementItem(userId: string, itemId: string): Promise<CartItemEntity | null>;
  deleteItem(userId: string, itemId: string): Promise<boolean>;
  clearUserCart(userId: string): Promise<boolean>;
}
