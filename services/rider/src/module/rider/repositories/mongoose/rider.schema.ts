import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class LocationSubdocument {
  @Prop({ type: String, enum: ['Point'], default: 'Point' })
  type: string;

  @Prop({ type: [Number], required: true })
  coordinates: [number, number]; // [longitude, latitude]
}

export const LocationSubdocumentSchema =
  SchemaFactory.createForClass(LocationSubdocument);

export type RiderDocument = RiderModel & Document;

@Schema({ timestamps: true, collection: 'riders' })
export class RiderModel {
  @Prop({ type: String, required: true, unique: true, index: true })
  userId: string;

  @Prop({ type: String, required: true, trim: true })
  riderName: string;

  @Prop({ type: String, required: true })
  picture: string;

  @Prop({ type: String, required: true, trim: true })
  phoneNumber: string;

  @Prop({ type: String, required: true })
  aadharNumber: string;

  @Prop({ type: String, required: true })
  drivingLicenseNumber: string;

  @Prop({ type: Boolean, default: false })
  isVerified: boolean;

  @Prop({ type: LocationSubdocumentSchema, required: true })
  location: LocationSubdocument;

  @Prop({ type: Boolean, default: false })
  isAvailable: boolean;

  @Prop({ type: Date, default: Date.now })
  lastActiveAt: Date;
}

export const RiderSchema = SchemaFactory.createForClass(RiderModel);

// 2dsphere index for location queries
RiderSchema.index({ location: '2dsphere' });
