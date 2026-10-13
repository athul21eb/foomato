import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { type ISellerRepository } from '../../interfaces/seller.repository.interface';
import { SellerEntity } from '../../domain/seller.entity';
import { Seller, SellerDocument } from './seller.schema';

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
