import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RiderModel, RiderDocument } from './rider.schema';
import { IRiderRepository } from '../../interfaces/rider.repository.interface';
import { RiderEntity } from '../../domain/rider.entity';

@Injectable()
export class MongooseRiderRepository implements IRiderRepository {
  constructor(
    @InjectModel(RiderModel.name)
    private readonly riderModel: Model<RiderDocument>,
  ) {}

  private toDomain(doc: RiderDocument | null): RiderEntity | null {
    if (!doc) return null;
    const obj = doc.toObject();
    return {
      id: doc._id.toString(),
      userId: obj.userId,
      riderName: obj.riderName,
      picture: obj.picture,
      phoneNumber: obj.phoneNumber,
      aadharNumber: obj.aadharNumber,
      drivingLicenseNumber: obj.drivingLicenseNumber,
      isVerified: obj.isVerified,
      location: {
        type: 'Point',
        coordinates: obj.location?.coordinates || [0, 0],
        formattedAddress: obj.location?.formattedAddress,
      },
      isAvailable: obj.isAvailable,
      lastActiveAt: obj.lastActiveAt,
      createdAt: (obj as { createdAt?: Date }).createdAt,
      updatedAt: (obj as { updatedAt?: Date }).updatedAt,
    };
  }

  async create(rider: Partial<RiderEntity>): Promise<RiderEntity> {
    const created = await this.riderModel.create({
      userId: rider.userId,
      riderName: rider.riderName,
      picture: rider.picture,
      phoneNumber: rider.phoneNumber,
      aadharNumber: rider.aadharNumber,
      drivingLicenseNumber: rider.drivingLicenseNumber,
      isVerified: rider.isVerified ?? false,
      location: {
        type: 'Point',
        coordinates: rider.location?.coordinates || [0, 0],
        formattedAddress: rider.location?.formattedAddress,
      },
      isAvailable: rider.isAvailable ?? false,
      lastActiveAt: rider.lastActiveAt || new Date(),
    });

    return this.toDomain(created)!;
  }

  async findByUserId(userId: string): Promise<RiderEntity | null> {
    const doc = await this.riderModel.findOne({ userId }).exec();
    return this.toDomain(doc);
  }

  async findById(id: string): Promise<RiderEntity | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.riderModel.findById(id).exec();
    return this.toDomain(doc);
  }

  async updateAvailability(
    userId: string,
    isAvailable: boolean,
    coordinates: [number, number],
  ): Promise<RiderEntity | null> {
    const doc = await this.riderModel
      .findOneAndUpdate(
        { userId },
        {
          $set: {
            isAvailable,
            'location.type': 'Point',
            'location.coordinates': coordinates,
            lastActiveAt: new Date(),
          },
        },
        { returnDocument: 'after' },
      )
      .exec();

    return this.toDomain(doc);
  }

  async update(
    userId: string,
    data: Partial<RiderEntity>,
  ): Promise<RiderEntity | null> {
    const updatePayload: Record<string, unknown> = {};

    if (data.riderName !== undefined) updatePayload.riderName = data.riderName;
    if (data.picture !== undefined) updatePayload.picture = data.picture;
    if (data.phoneNumber !== undefined) updatePayload.phoneNumber = data.phoneNumber;
    if (data.aadharNumber !== undefined) updatePayload.aadharNumber = data.aadharNumber;
    if (data.drivingLicenseNumber !== undefined) updatePayload.drivingLicenseNumber = data.drivingLicenseNumber;
    if (data.isVerified !== undefined) updatePayload.isVerified = data.isVerified;
    if (data.isAvailable !== undefined) updatePayload.isAvailable = data.isAvailable;
    if (data.location !== undefined) updatePayload.location = data.location;
    if (data.lastActiveAt !== undefined) updatePayload.lastActiveAt = data.lastActiveAt;

    const doc = await this.riderModel
      .findOneAndUpdate(
        { userId },
        { $set: updatePayload },
        { returnDocument: 'after' },
      )
      .exec();

    return this.toDomain(doc);
  }

  async findNearbyAvailable(
    coordinates: [number, number],
    maxDistanceMeters = 5000,
  ): Promise<RiderEntity[]> {
    const docs = await this.riderModel
      .find({
        isAvailable: true,
        isVerified: true,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates,
            },
            $maxDistance: maxDistanceMeters,
          },
        },
      })
      .exec();

    return docs
      .map((doc) => this.toDomain(doc))
      .filter((r): r is RiderEntity => r !== null);
  }
}
