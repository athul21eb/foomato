import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomInt } from 'crypto';
import { Types } from 'mongoose';
import {
  ORDER_REPOSITORY,
  type IOrderRepository,
} from './interfaces/order.repository.interface';
import { OrderEntity, OrderStatus, PaymentStatus } from './domain/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetSellerOrdersDto } from './dto/get-seller-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CartService } from '../cart/cart.service';
import { AddressService } from '../address/address.service';
import { SellerService } from '../seller/seller.service';
import { RealtimeEmitterService } from '../../lib/realtime-grpc/realtime-emitter.service';

export interface CreateOrderResponse {
  message: string;
  orderId: string;
  orderNumber: string;
  amount: number;
}

export interface PaymentOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
}

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    private readonly cartService: CartService,
    private readonly addressService: AddressService,
    private readonly sellerService: SellerService,
    private readonly realtimeEmitter: RealtimeEmitterService,
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

      if (!item.isAvailable) {
        this.logger.warn(
          `Order placement failed: item "${item.name}" (${item.id}) is unavailable`,
        );
        throw new BadRequestException(
          `"${item.name}" is currently unavailable or out of stock`,
        );
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

    const deliveryFee = subtotal < 350 ? 49 : 0;
    const platformFee = 7;
    const totalAmount = subtotal + deliveryFee + platformFee;

    // Idempotent checkout: check if user already has an active, unexpired pending order matching restaurant, address, and amount
    const existingOrder =
      await this.orderRepository.findActivePendingByUserId(userId);
    if (
      existingOrder &&
      existingOrder.restaurantId === restaurantId &&
      existingOrder.addressId === address.id &&
      existingOrder.totalAmount === totalAmount
    ) {
      if (existingOrder.paymentMethod !== dto.paymentMethod) {
        await this.orderRepository.updatePaymentMethod(
          existingOrder.id,
          dto.paymentMethod,
        );
        this.logger.log(
          `Switched payment method for pending order ${existingOrder.id} to "${dto.paymentMethod}"`,
        );
      }
      this.logger.log(
        `Reusing existing active pending order ${existingOrder.id} (#${existingOrder.orderNumber}) for user ${userId}`,
      );
      return {
        message: 'Active pending order retrieved successfully',
        orderId: existingOrder.id,
        orderNumber: existingOrder.orderNumber || existingOrder.id,
        amount: existingOrder.totalAmount,
      };
    }

    const orderNumber = `FOO-${randomInt(1000000000, 9999999999)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const [longitude, latitude] = address.location.coordinates;
    const riderAmount = Math.ceil(distance) * 17;

    const order = await this.orderRepository.create({
      orderNumber,
      userId,
      restaurantId,
      restaurantName: restaurant.name,
      riderId: null,
      distance,
      riderAmount,
      items: orderItems,
      subtotal,
      deliveryFee,
      platformFee,
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

    this.logger.log(
      `Created order ${order.id} (#${order.orderNumber || orderNumber}) for user ${userId} at restaurant ${restaurantId} (Total: ₹${totalAmount})`,
    );

    return {
      message: 'Order created successfully',
      orderId: order.id,
      orderNumber: order.orderNumber || orderNumber,
      amount: totalAmount,
    };
  }

  async fetchOrderForPayment(id: string): Promise<PaymentOrderResponse> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid order ID format');
    }

    const order = await this.orderRepository.findById(id);

    if (!order) {
      this.logger.warn(`Payment query failed - order ${id} not found`);
      throw new NotFoundException('Order not found');
    }

    if (order.paymentStatus !== 'pending') {
      this.logger.warn(
        `Order ${id} is already in payment status "${order.paymentStatus}"`,
      );
      throw new BadRequestException('Order already paid');
    }

    this.logger.log(
      `Retrieved order ${order.id} for payment verification (Amount: ₹${order.totalAmount})`,
    );

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
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Order ID is required');
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
    this.logger.log(`Order ${id} transitioned status to "${status}"`);
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
    this.logger.log(
      `Order ${id} payment status transitioned to "${paymentStatus}"`,
    );

    if (paymentStatus === 'paid') {
      try {
        await this.cartService.clearCart(updated.userId);
        this.logger.log(
          `Cart cleared for user ${updated.userId} upon payment success for order ${id}`,
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(
          `Failed to clear cart for user ${updated.userId} after payment: ${message}`,
        );
      }
    }

    return updated;
  }

  async getSellerOrders(
    ownerId: string,
    query: GetSellerOrdersDto,
  ): Promise<{
    orders: OrderEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    counts?: Record<string, number>;
  }> {
    const seller = await this.sellerService.fetchMySeller(ownerId);
    const page = query.page || 1;
    const limit = query.limit || 10;
    const status = query.status;

    const { orders, total, counts } =
      await this.orderRepository.findSellerOrders(
        seller.id,
        page,
        limit,
        status,
      );

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
      counts,
    };
  }

  async updateSellerOrderStatus(
    ownerId: string,
    orderId: string,
    dto: UpdateOrderStatusDto,
  ): Promise<OrderEntity> {
    const seller = await this.sellerService.fetchMySeller(ownerId);
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.restaurantId !== seller.id) {
      throw new ForbiddenException(
        'You are not authorized to manage orders for another restaurant',
      );
    }

    const currentStatus = order.status;
    const targetStatus = dto.status;

    if (currentStatus === targetStatus) {
      return order;
    }

    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PLACED]: [OrderStatus.ACCEPTED, OrderStatus.CANCELLED],
      [OrderStatus.ACCEPTED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [
        OrderStatus.READY_FOR_RIDER,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.READY_FOR_RIDER]: [OrderStatus.CANCELLED],
      [OrderStatus.RIDER_ASSIGNED]: [],
      [OrderStatus.PICKED_UP]: [],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    const allowed = allowedTransitions[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
      throw new BadRequestException(
        `Invalid status transition from "${currentStatus}" to "${targetStatus}". Allowed next states: ${
          allowed.length > 0 ? allowed.join(', ') : 'none (terminal state)'
        }`,
      );
    }

    const reason = dto.reason;

    const updated = await this.orderRepository.updateStatus(
      orderId,
      targetStatus,
      reason,
    );
    if (!updated) {
      throw new NotFoundException('Order not found during status update');
    }

    this.logger.log(
      `Order ${orderId} status transitioned from "${currentStatus}" to "${targetStatus}" by seller ${seller.id}`,
    );

    try {
      await this.realtimeEmitter.emitToUser(
        updated.userId,
        'order:status_updated',
        {
          orderId: updated.id,
          status: updated.status,
          restaurantId: updated.restaurantId,
          restaurantName: updated.restaurantName,
          reason: updated.reason,
        },
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Failed to emit realtime status update for order ${orderId}: ${message}`,
      );
    }

    return updated;
  }
}
