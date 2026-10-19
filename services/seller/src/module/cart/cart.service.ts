import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import {
  type ICartRepository,
  CART_REPOSITORY,
} from './interfaces/cart.repository.interface';
import { CartItemEntity } from './domain/cart-item.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { SellerService } from '../seller/seller.service';
import { MenuItemService } from '../menu-item/menu-item.service';

export interface MyCartResponse {
  cart: CartItemEntity[];
  subtotal: number;
  cartLength: number;
}

@Injectable()
export class CartService {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
    private readonly sellerService: SellerService,
    private readonly menuItemService: MenuItemService,
  ) {}

  async addToCart(userId: string, dto: AddToCartDto): Promise<CartItemEntity> {
    const seller = await this.sellerService.findById(dto.sellerId);
    if (!seller) {
      throw new NotFoundException('Restaurant not found');
    }

    if (!seller.isOpen) {
      throw new BadRequestException(
        'This restaurant is currently closed and not accepting orders',
      );
    }

    const item = await this.menuItemService.findById(dto.itemId);
    if (!item) {
      throw new NotFoundException('Menu item not found');
    }

    if (item.sellerId !== dto.sellerId) {
      throw new BadRequestException(
        'Menu item does not belong to the specified restaurant',
      );
    }

    if (!item.isAvailable) {
      throw new BadRequestException(
        `"${item.name}" is currently out of stock / unavailable`,
      );
    }

    const existingCartItem =
      await this.cartRepository.findFirstItemByUserId(userId);
    if (existingCartItem && existingCartItem.sellerId !== dto.sellerId) {
      throw new BadRequestException(
        'You can order from only one restaurant at a time. Please clear your cart first to add items from this restaurant.',
      );
    }

    return this.cartRepository.addItem(userId, dto.sellerId, dto.itemId);
  }

  async getMyCart(userId: string): Promise<MyCartResponse> {
    const cart = await this.cartRepository.findPopulatedCartByUserId(userId);
    const subtotal = cart.reduce(
      (acc, curr) => acc + (curr.item?.price || 0) * curr.quantity,
      0,
    );
    const cartLength = cart.reduce((acc, curr) => acc + curr.quantity, 0);

    return {
      cart,
      subtotal,
      cartLength,
    };
  }

  async incrementItem(userId: string, itemId: string): Promise<CartItemEntity> {
    if (!Types.ObjectId.isValid(itemId)) {
      throw new BadRequestException('Invalid item ID format');
    }

    const cartItem = await this.cartRepository.findItem(userId, itemId);
    if (!cartItem) {
      throw new NotFoundException('Item not found in cart');
    }

    const item = await this.menuItemService.findById(itemId);
    if (!item) {
      throw new NotFoundException('Menu item not found');
    }

    if (!item.isAvailable) {
      throw new BadRequestException(
        `"${item.name}" is currently out of stock / unavailable`,
      );
    }

    const seller = await this.sellerService.findById(cartItem.sellerId);
    if (seller && !seller.isOpen) {
      throw new BadRequestException(
        'This restaurant is currently closed and not accepting orders',
      );
    }

    const updated = await this.cartRepository.incrementItem(userId, itemId);
    if (!updated) {
      throw new NotFoundException('Failed to increment item in cart');
    }

    return updated;
  }

  async decrementItem(
    userId: string,
    itemId: string,
  ): Promise<CartItemEntity | null> {
    if (!Types.ObjectId.isValid(itemId)) {
      throw new BadRequestException('Invalid item ID format');
    }

    const cartItem = await this.cartRepository.findItem(userId, itemId);
    if (!cartItem) {
      throw new NotFoundException('Item not found in cart');
    }

    return this.cartRepository.decrementItem(userId, itemId);
  }

  async removeItem(userId: string, itemId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(itemId)) {
      throw new BadRequestException('Invalid item ID format');
    }

    const deleted = await this.cartRepository.deleteItem(userId, itemId);
    if (!deleted) {
      throw new NotFoundException('Item not found in cart');
    }

    return true;
  }

  async clearCart(userId: string): Promise<boolean> {
    return this.cartRepository.clearUserCart(userId);
  }
}
