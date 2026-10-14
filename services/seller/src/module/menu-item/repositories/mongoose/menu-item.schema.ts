import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type MenuItemDocument = HydratedDocument<MenuItem>;

@Schema({ timestamps: true })
export class MenuItem {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Seller',
    required: true,
    index: true,
  })
  sellerId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, required: false, trim: true })
  description?: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: true, type: String })
  image: string;

  @Prop({ required: true, type: Boolean, default: true })
  isVeg: boolean;

  @Prop({ required: true, type: Boolean, default: true })
  isAvailable: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
