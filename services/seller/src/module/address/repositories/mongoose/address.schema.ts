import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type AddressDocument = HydratedDocument<Address>;

@Schema({ _id: false })
export class LocationPoint {
  @Prop({ type: String, enum: ['Point'], required: true, default: 'Point' })
  type: 'Point';

  @Prop({ type: [Number], required: true })
  coordinates: [number, number]; // [longitude, latitude]
}

export const LocationPointSchema = SchemaFactory.createForClass(LocationPoint);

@Schema({ timestamps: true })
export class Address {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({ required: true, type: Number })
  mobile: number;

  @Prop({ type: String, required: false })
  instructions?: string;

  @Prop({ required: true, type: String })
  formattedAddress: string;

  @Prop({ type: LocationPointSchema, required: true })
  location: LocationPoint;

  @Prop({ type: Boolean, default: false })
  isDefault: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const AddressSchema = SchemaFactory.createForClass(Address);

AddressSchema.index({ location: '2dsphere' });
AddressSchema.index({ userId: 1, createdAt: -1 });
