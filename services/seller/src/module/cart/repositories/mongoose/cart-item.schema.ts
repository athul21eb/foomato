import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type CartItemDocument = HydratedDocument<CartItem>;

@Schema({ timestamps: true })
export class CartItem {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Seller',
    required: true,
    index: true,
  })
  sellerId: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
    index: true,
  })
  itemId: Types.ObjectId;

  @Prop({
    required: true,
    type: Number,
    default: 1,
    min: 1,
  })
  quantity: number;

  createdAt: Date;
  updatedAt: Date;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

CartItemSchema.index({ userId: 1, sellerId: 1, itemId: 1 }, { unique: true });
