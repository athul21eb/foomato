import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './order.schema';
import {
  OrderEntity,
  OrderStatus,
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
      orderNumber:
        doc.orderNumber || `FOO-${doc._id.toString().slice(-8).toUpperCase()}`,
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
      status: doc.status,
      paymentMethod: doc.paymentMethod,
      paymentStatus: doc.paymentStatus,
      reason: doc.reason ?? undefined,
      expiresAt: doc.expiresAt ?? null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async create(order: Partial<OrderEntity>): Promise<OrderEntity> {
    const created = await this.orderModel.create({
      orderNumber: order.orderNumber,
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
      platfromFee: order.platformFee ?? 0,
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

  async findSellerOrders(
    restaurantId: string,
    page: number = 1,
    limit: number = 10,
    status?: OrderStatus,
  ): Promise<{
    orders: OrderEntity[];
    total: number;
    counts?: Record<string, number>;
  }> {
    const filter: Record<string, unknown> = { restaurantId };
    if (status) {
      if (status === OrderStatus.READY_FOR_RIDER) {
        filter.status = {
          $in: [
            OrderStatus.READY_FOR_RIDER,
            OrderStatus.RIDER_ASSIGNED,
            OrderStatus.PICKED_UP,
          ],
        };
      } else {
        filter.status = status;
      }
    }

    const skip = (page - 1) * limit;

    const [docs, total, aggCounts] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments(filter).exec(),
      this.orderModel.aggregate([
        { $match: { restaurantId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const counts: Record<string, number> = {
      all: 0,
      placed: 0,
      accepted: 0,
      preparing: 0,
      ready_for_rider: 0,
      rider_assigned: 0,
      picked_up: 0,
      delivered: 0,
      cancelled: 0,
    };

    let totalAll = 0;
    for (const item of aggCounts as Array<{ _id: string; count: number }>) {
      if (item._id && typeof item.count === 'number') {
        counts[item._id] = item.count;
        totalAll += item.count;
      }
    }
    counts.all = totalAll;
    // Combine ready_for_rider, rider_assigned, and picked_up into ready_for_rider count
    counts.ready_for_rider =
      (counts.ready_for_rider || 0) +
      (counts.rider_assigned || 0) +
      (counts.picked_up || 0);

    const orders = docs
      .map((doc) => this.toDomain(doc))
      .filter((order): order is OrderEntity => order !== null);

    return { orders, total, counts };
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
    reason?: string,
  ): Promise<OrderEntity | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const updatePayload: Record<string, unknown> = { status };
    if (reason !== undefined) {
      updatePayload.reason = reason;
    }
    const doc = await this.orderModel
      .findByIdAndUpdate(
        id,
        { $set: updatePayload },
        { returnDocument: 'after' },
      )
      .exec();
    return this.toDomain(doc);
  }

  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
  ): Promise<OrderEntity | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const updateQuery: Record<string, unknown> = {
      $set: { paymentStatus },
    };
    if (paymentStatus === 'paid') {
      updateQuery.$unset = { expiresAt: 1 };
    }
    const doc = await this.orderModel
      .findByIdAndUpdate(id, updateQuery, { returnDocument: 'after' })
      .exec();
    return this.toDomain(doc);
  }

  async findActivePendingByUserId(userId: string): Promise<OrderEntity | null> {
    const doc = await this.orderModel
      .findOne({
        userId,
        status: 'placed',
        paymentStatus: 'pending',
        expiresAt: { $gt: new Date() },
      })
      .sort({ createdAt: -1 })
      .exec();
    return this.toDomain(doc);
  }

  async updatePaymentMethod(
    id: string,
    paymentMethod: string,
  ): Promise<OrderEntity | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.orderModel
      .findByIdAndUpdate(
        id,
        { $set: { paymentMethod } },
        { returnDocument: 'after' },
      )
      .exec();
    return this.toDomain(doc);
  }

  async findUserOrders(
    userId: string,
    page: number = 1,
    limit: number = 10,
    tab: string = 'all',
  ): Promise<{
    orders: OrderEntity[];
    total: number;
    counts: {
      all: number;
      inProgress: number;
      delivered: number;
      cancelled: number;
    };
  }> {
    const IN_PROGRESS_STATUSES: readonly string[] = [
      OrderStatus.PLACED,
      OrderStatus.ACCEPTED,
      OrderStatus.PREPARING,
      OrderStatus.READY_FOR_RIDER,
      OrderStatus.RIDER_ASSIGNED,
      OrderStatus.PICKED_UP,
    ];

    const filter: Record<string, unknown> = { userId };
    if (tab === 'in_progress') {
      filter.status = { $in: IN_PROGRESS_STATUSES };
    } else if (tab === 'delivered') {
      filter.status = OrderStatus.DELIVERED;
    } else if (tab === 'cancelled') {
      filter.status = OrderStatus.CANCELLED;
    }

    const skip = (page - 1) * limit;

    const [docs, total, aggCounts] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments(filter).exec(),
      this.orderModel.aggregate([
        { $match: { userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const counts = {
      all: 0,
      inProgress: 0,
      delivered: 0,
      cancelled: 0,
    };

    let totalAll = 0;
    for (const item of aggCounts as Array<{ _id: string; count: number }>) {
      if (item._id && typeof item.count === 'number') {
        totalAll += item.count;
        if (IN_PROGRESS_STATUSES.includes(item._id)) {
          counts.inProgress += item.count;
        } else if (item._id === OrderStatus.DELIVERED) {
          counts.delivered += item.count;
        } else if (item._id === OrderStatus.CANCELLED) {
          counts.cancelled += item.count;
        }
      }
    }
    counts.all = totalAll;

    const orders = docs
      .map((doc) => this.toDomain(doc))
      .filter((order): order is OrderEntity => order !== null);

    return { orders, total, counts };
  }

  async assignRiderAtomic(
    orderId: string,
    riderId: string,
    riderName: string,
    riderPhone: string,
  ): Promise<OrderEntity | null> {
    if (!Types.ObjectId.isValid(orderId)) return null;

    const doc = await this.orderModel
      .findOneAndUpdate(
        {
          _id: orderId,
          riderId: null,
          status: OrderStatus.READY_FOR_RIDER,
        },
        {
          $set: {
            riderId,
            riderName,
            riderPhone: Number(riderPhone) || null,
            status: OrderStatus.RIDER_ASSIGNED,
          },
        },
        { returnDocument: 'after' },
      )
      .exec();

    return this.toDomain(doc);
  }

  async findCurrentActiveByRiderId(
    riderId: string,
  ): Promise<OrderEntity | null> {
    const doc = await this.orderModel
      .findOne({
        riderId,
        status: { $in: [OrderStatus.RIDER_ASSIGNED, OrderStatus.PICKED_UP] },
      })
      .sort({ createdAt: -1 })
      .exec();

    return this.toDomain(doc);
  }

  async updateStatusByRider(
    orderId: string,
    riderId: string,
    targetStatus: OrderStatus,
  ): Promise<OrderEntity | null> {
    if (!Types.ObjectId.isValid(orderId)) return null;

    const doc = await this.orderModel
      .findOneAndUpdate(
        { _id: orderId, riderId },
        { $set: { status: targetStatus } },
        { returnDocument: 'after' },
      )
      .exec();

    return this.toDomain(doc);
  }

  async findPastOrdersByRiderId(
    riderId: string,
    limit: number = 20,
  ): Promise<{ orders: OrderEntity[]; total: number; totalEarnings: number }> {
    const filter = { riderId, status: OrderStatus.DELIVERED };
    const [docs, total, earningsAgg] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort({ updatedAt: -1, createdAt: -1 })
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments(filter).exec(),
      this.orderModel.aggregate([
        { $match: filter },
        { $group: { _id: null, totalEarnings: { $sum: '$riderAmount' } } },
      ]),
    ]);

    const totalEarnings =
      earningsAgg.length > 0 && typeof earningsAgg[0].totalEarnings === 'number'
        ? earningsAgg[0].totalEarnings
        : 0;

    const orders = docs
      .map((doc) => this.toDomain(doc))
      .filter((order): order is OrderEntity => order !== null);

    return { orders, total, totalEarnings };
  }
}
