import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import {
  ORDER_REPOSITORY,
  type IOrderRepository,
} from './interfaces/order.repository.interface';
import { OrderEntity, OrderStatus, PaymentStatus } from './domain/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { CartService } from '../cart/cart.service';
import { AddressService } from '../address/address.service';
import { SellerService } from '../seller/seller.service';

export interface CreateOrderResponse {
  message: string;
  orderId: string;
  amount: number;
}

export interface PaymentOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
}

@Injectable()
export class OrderService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    private readonly cartService: CartService,
    private readonly addressService: AddressService,
    private readonly sellerService: SellerService,
  ) {}

  private getDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(2);
  }

  async createOrder(
    userId: string,
    dto: CreateOrderDto,
  ): Promise<CreateOrderResponse> {
    if (!dto.addressId) {
      throw new BadRequestException('Address is required');
    }

    const address = await this.addressService.findByIdAndUserId(
      dto.addressId,
      userId,
    );

    if (!address) {
      throw new NotFoundException('Address Not found');
    }

    const { cart } = await this.cartService.getMyCart(userId);

    if (!cart || cart.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const firstCartItem = cart[0];
    if (!firstCartItem || !firstCartItem.sellerId) {
      throw new BadRequestException('Invailid Cart Data');
    }

    const restaurantId = firstCartItem.sellerId;
    const restaurant = await this.sellerService.findById(restaurantId);

    if (!restaurant) {
      throw new NotFoundException('No restaurant with this id');
    }

    if (!restaurant.isOpen) {
      throw new NotFoundException('Sorry this restaurant is closed for now');
    }

    const distance = this.getDistanceKm(
      address.location.coordinates[1],
      address.location.coordinates[0],
      restaurant.autoLocation.coordinates[1],
      restaurant.autoLocation.coordinates[0],
    );

    let subtotal = 0;

    const orderItems = cart.map((cartItem) => {
      const item = cartItem.item;
      if (!item) {
        throw new BadRequestException('Invalid cart item');
      }

      const itemTotal = item.price * cartItem.quantity;
      subtotal += itemTotal;

      return {
        itemId: item.id || cartItem.itemId,
        name: item.name,
        price: item.price,
        quauntity: cartItem.quantity,
        quantity: cartItem.quantity,
      };
    });

    const deliveryFee = subtotal < 250 ? 49 : 0;
    const platfromFee = 7;
    const totalAmount = subtotal + deliveryFee + platfromFee;

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const [longitude, latitude] = address.location.coordinates;
    const riderAmount = Math.ceil(distance) * 17;

    const order = await this.orderRepository.create({
      userId,
      restaurantId,
      restaurantName: restaurant.name,
      riderId: null,
      distance,
      riderAmount,
      items: orderItems,
      subtotal,
      deliveryFee,
      platfromFee,
      platformFee: platfromFee,
      totalAmount,
      addressId: address.id,
      deliveryAddress: {
        fromattedAddress: address.formattedAddress,
        formattedAddress: address.formattedAddress,
        mobile: address.mobile,
        latitude,
        longitude,
      },
      paymentMethod: dto.paymentMethod,
      paymentStatus: 'pending',
      status: 'placed',
      expiresAt,
    });

    await this.cartService.clearCart(userId);

    return {
      message: 'Order created successfully',
      orderId: order.id,
      amount: totalAmount,
    };
  }

  async fetchOrderForPayment(id: string): Promise<PaymentOrderResponse> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid order ID format');
    }

    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.paymentStatus !== 'pending') {
      throw new BadRequestException('Order already paid');
    }

    return {
      orderId: order.id,
      amount: order.totalAmount,
      currency: 'INR',
    };
  }

  async getMyOrders(userId: string): Promise<OrderEntity[]> {
    return this.orderRepository.findByUserId(userId);
  }

  async getRestaurantOrders(restaurantId: string): Promise<OrderEntity[]> {
    return this.orderRepository.findByRestaurantId(restaurantId);
  }

  async getOrderById(id: string): Promise<OrderEntity> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid order ID format');
    }

    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateOrderStatus(
    id: string,
    status: OrderStatus,
  ): Promise<OrderEntity> {
    const updated = await this.orderRepository.updateStatus(id, status);
    if (!updated) {
      throw new NotFoundException('Order not found');
    }
    return updated;
  }

  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
  ): Promise<OrderEntity> {
    const updated = await this.orderRepository.updatePaymentStatus(
      id,
      paymentStatus,
    );
    if (!updated) {
      throw new NotFoundException('Order not found');
    }
    return updated;
  }
}
