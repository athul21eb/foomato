import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../../domain/order.entity';

@Schema({ _id: false })
export class OrderItem {
  @Prop({ required: true })
  itemId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  quauntity: number;
}
export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ _id: false })
export class DeliveryAddress {
  @Prop({ required: true })
  fromattedAddress: string;

  @Prop({ required: true })
  mobile: number;

  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;
}
export const DeliveryAddressSchema =
  SchemaFactory.createForClass(DeliveryAddress);

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: String, unique: true, sparse: true, index: true })
  orderNumber?: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  restaurantId: string;

  @Prop({ required: true })
  restaurantName: string;

  @Prop({ type: String, default: null })
  riderId?: string | null;

  @Prop({ type: String, default: null })
  riderName?: string | null;

  @Prop({ type: Number, default: null })
  riderPhone?: number | null;

  @Prop({ required: true })
  riderAmount: number;

  @Prop({ required: true })
  distance: number;

  @Prop({ type: [OrderItemSchema], default: [] })
  items: OrderItem[];

  @Prop({ required: true })
  subtotal: number;

  @Prop({ required: true })
  deliveryFee: number;

  @Prop({ required: true })
  platfromFee: number;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ required: true })
  addressId: string;

  @Prop({ type: DeliveryAddressSchema, required: true })
  deliveryAddress: DeliveryAddress;

  @Prop({
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PLACED,
    index: true,
  })
  status: OrderStatus;

  @Prop({
    type: String,
    enum: Object.values(PaymentMethod),
    required: true,
  })
  paymentMethod: PaymentMethod;

  @Prop({
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
    index: true,
  })
  paymentStatus: PaymentStatus;

  @Prop({ type: String, default: null })
  reason?: string | null;

  @Prop({ type: Date, default: null })
  expiresAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
