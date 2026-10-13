import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class AutoLocation {
  @Prop({ type: String, enum: ['Point'], required: true, default: 'Point' })
  type: 'Point';

  @Prop({ type: [Number], required: true })
  coordinates: [number, number]; // [longitude, latitude]

  @Prop({ type: String, required: false })
  formattedAddress?: string;
}

export const AutoLocationSchema = SchemaFactory.createForClass(AutoLocation);

export type SellerDocument = HydratedDocument<Seller>;

@Schema({ timestamps: true })
export class Seller {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, required: false })
  description?: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true, index: true })
  ownerId: string;

  @Prop({ required: true, type: Number })
  phone: number;

  @Prop({ required: true, default: false })
  isVerified: boolean;

  @Prop({ type: AutoLocationSchema, required: true })
  autoLocation: AutoLocation;

  @Prop({ default: false })
  isOpen: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const SellerSchema = SchemaFactory.createForClass(Seller);

SellerSchema.index({ autoLocation: '2dsphere' });
