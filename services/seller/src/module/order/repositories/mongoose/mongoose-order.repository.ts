import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './order.schema';
import {
  OrderEntity,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../../domain/order.entity';
import { IOrderRepository } from '../../interfaces/order.repository.interface';

@Injectable()
export class MongooseOrderRepository implements IOrderRepository {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  private toDomain(doc: OrderDocument | null): OrderEntity | null {
    if (!doc) return null;
    return new OrderEntity({
      id: doc._id.toString(),
      userId: doc.userId,
      restaurantId: doc.restaurantId,
      restaurantName: doc.restaurantName,
      riderId: doc.riderId ?? null,
      riderName: doc.riderName ?? null,
      riderPhone: doc.riderPhone ?? null,
      riderAmount: doc.riderAmount,
      distance: doc.distance,
      items: doc.items.map((i) => ({
        itemId: i.itemId,
        name: i.name,
        price: i.price,
        quauntity: i.quauntity,
        quantity: i.quauntity,
      })),
      subtotal: doc.subtotal,
      deliveryFee: doc.deliveryFee,
      platfromFee: doc.platfromFee,
      platformFee: doc.platfromFee,
      totalAmount: doc.totalAmount,
      addressId: doc.addressId,
      deliveryAddress: {
        fromattedAddress: doc.deliveryAddress.fromattedAddress,
        formattedAddress: doc.deliveryAddress.fromattedAddress,
        mobile: doc.deliveryAddress.mobile,
        latitude: doc.deliveryAddress.latitude,
        longitude: doc.deliveryAddress.longitude,
      },
      status: doc.status as OrderStatus,
      paymentMethod: doc.paymentMethod as PaymentMethod,
      paymentStatus: doc.paymentStatus as PaymentStatus,
      expiresAt: doc.expiresAt ?? null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async create(order: Partial<OrderEntity>): Promise<OrderEntity> {
    const created = await this.orderModel.create({
      userId: order.userId,
      restaurantId: order.restaurantId,
      restaurantName: order.restaurantName,
      riderId: order.riderId ?? null,
      riderName: order.riderName ?? null,
      riderPhone: order.riderPhone ?? null,
      riderAmount: order.riderAmount,
      distance: order.distance,
      items: order.items?.map((i) => ({
        itemId: i.itemId,
        name: i.name,
        price: i.price,
        quauntity: i.quauntity ?? i.quantity ?? 1,
      })),
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      platfromFee: order.platfromFee ?? order.platformFee ?? 0,
      totalAmount: order.totalAmount,
      addressId: order.addressId,
      deliveryAddress: {
        fromattedAddress:
          order.deliveryAddress?.fromattedAddress ??
          order.deliveryAddress?.formattedAddress ??
          '',
        mobile: order.deliveryAddress?.mobile,
        latitude: order.deliveryAddress?.latitude,
        longitude: order.deliveryAddress?.longitude,
      },
      status: order.status || 'placed',
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus || 'pending',
      expiresAt: order.expiresAt ?? null,
    });

    return this.toDomain(created)!;
  }

  async findById(id: string): Promise<OrderEntity | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.orderModel.findById(id).exec();
    return this.toDomain(doc);
  }

  async findByUserId(userId: string): Promise<OrderEntity[]> {
    const docs = await this.orderModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
    return docs.map((doc) => this.toDomain(doc)!);
  }

  async findByRestaurantId(restaurantId: string): Promise<OrderEntity[]> {
    const docs = await this.orderModel
      .find({ restaurantId })
      .sort({ createdAt: -1 })
      .exec();
    return docs.map((doc) => this.toDomain(doc)!);
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
  ): Promise<OrderEntity | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.orderModel
      .findByIdAndUpdate(id, { $set: { status } }, { new: true })
      .exec();
    return this.toDomain(doc);
  }

  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
  ): Promise<OrderEntity | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const updateQuery: Record<string, unknown> = { paymentStatus };
    if (paymentStatus === 'paid') {
      updateQuery.expiresAt = null; // Clear TTL expiration on payment
    }
    const doc = await this.orderModel
      .findByIdAndUpdate(id, { $set: updateQuery }, { new: true })
      .exec();
    return this.toDomain(doc);
  }
}
