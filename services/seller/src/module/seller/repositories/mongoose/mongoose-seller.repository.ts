import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { type ISellerRepository } from '../../interfaces/seller.repository.interface';
import { SellerEntity } from '../../domain/seller.entity';
import { Seller, SellerDocument } from './seller.schema';

interface NearbySellerAggregationDoc {
  _id: { toString(): string };
  name: string;
  description?: string;
  image: string;
  ownerId: string;
  phone: number;
  isVerified: boolean;
  autoLocation?: {
    type: 'Point';
    coordinates: [number, number];
    formattedAddress?: string;
  };
  isOpen: boolean;
  distance?: number;
  distanceKm?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class MongooseSellerRepository implements ISellerRepository {
  constructor(
    @InjectModel(Seller.name)
    private readonly sellerModel: Model<SellerDocument>,
  ) {}

  private toDomain(document: SellerDocument | null): SellerEntity | null {
    if (!document) return null;
    return new SellerEntity({
      id: document._id.toString(),
      name: document.name,
      description: document.description,
      image: document.image,
      ownerId: document.ownerId,
      phone: document.phone,
      isVerified: document.isVerified,
      autoLocation: {
        type: document.autoLocation.type,
        coordinates: document.autoLocation.coordinates,
        formattedAddress: document.autoLocation.formattedAddress,
      },
      isOpen: document.isOpen,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }

  async create(seller: Partial<SellerEntity>): Promise<SellerEntity> {
    const createdSeller = new this.sellerModel(seller);
    const saved = await createdSeller.save();
    return this.toDomain(saved)!;
  }

  async findById(id: string): Promise<SellerEntity | null> {
    if (!id || !isValidObjectId(id)) {
      return null;
    }
    const seller = await this.sellerModel.findById(id).exec();
    return this.toDomain(seller);
  }

  async findByOwnerId(ownerId: string): Promise<SellerEntity | null> {
    const seller = await this.sellerModel.findOne({ ownerId }).exec();
    return this.toDomain(seller);
  }

  async findAll(): Promise<SellerEntity[]> {
    const sellers = await this.sellerModel.find().exec();
    return sellers.map((s) => this.toDomain(s)!);
  }

  async findNearby(params: {
    latitude: number;
    longitude: number;
    radius?: number;
    search?: string;
  }): Promise<SellerEntity[]> {
    const matchQuery: Record<string, unknown> = {
      isVerified: true,
    };

    if (params.search && params.search.trim()) {
      matchQuery.name = { $regex: params.search.trim(), $options: 'i' };
    }

    const radius =
      params.radius !== undefined && !isNaN(params.radius)
        ? Number(params.radius)
        : 5000;

    const results =
      await this.sellerModel.aggregate<NearbySellerAggregationDoc>([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [Number(params.longitude), Number(params.latitude)],
            },
            key: 'autoLocation',
            distanceField: 'distance',
            maxDistance: radius,
            spherical: true,
            query: matchQuery,
          },
        },
        {
          $sort: {
            isOpen: -1,
            distance: 1,
          },
        },
        {
          $addFields: {
            distanceKm: {
              $round: [{ $divide: ['$distance', 1000] }, 2],
            },
          },
        },
      ]);

    return results.map(
      (doc) =>
        new SellerEntity({
          id: doc._id.toString(),
          name: doc.name,
          description: doc.description,
          image: doc.image,
          ownerId: doc.ownerId,
          phone: doc.phone,
          isVerified: doc.isVerified,
          autoLocation: {
            type: doc.autoLocation?.type || 'Point',
            coordinates: doc.autoLocation?.coordinates || [0, 0],
            formattedAddress: doc.autoLocation?.formattedAddress,
          },
          isOpen: doc.isOpen,
          distance: doc.distance,
          distanceKm: doc.distanceKm,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        }),
    );
  }

  async update(
    id: string,
    seller: Partial<SellerEntity>,
  ): Promise<SellerEntity | null> {
    const updated = await this.sellerModel
      .findByIdAndUpdate(id, { $set: seller }, { returnDocument: 'after' })
      .exec();
    return this.toDomain(updated);
  }

  async updateByOwnerId(
    ownerId: string,
    seller: Partial<SellerEntity>,
  ): Promise<SellerEntity | null> {
    const updated = await this.sellerModel
      .findOneAndUpdate(
        { ownerId },
        { $set: seller },
        { returnDocument: 'after' },
      )
      .exec();
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.sellerModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
