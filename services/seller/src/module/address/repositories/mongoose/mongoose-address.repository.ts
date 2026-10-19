import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Address, AddressDocument } from './address.schema';
import { AddressEntity } from '../../domain/address.entity';
import { IAddressRepository } from '../../interfaces/address.repository.interface';

@Injectable()
export class MongooseAddressRepository implements IAddressRepository {
  constructor(
    @InjectModel(Address.name)
    private readonly addressModel: Model<AddressDocument>,
  ) {}

  private toDomain(doc: AddressDocument | null): AddressEntity | null {
    if (!doc) return null;
    return new AddressEntity({
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      mobile: doc.mobile,
      instructions: doc.instructions,
      formattedAddress: doc.formattedAddress,
      location: {
        type: doc.location.type,
        coordinates: [doc.location.coordinates[0], doc.location.coordinates[1]],
      },
      isDefault: Boolean(doc.isDefault),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return this.addressModel
      .countDocuments({ userId: new Types.ObjectId(userId) })
      .exec();
  }

  async create(
    userId: string,
    data: Partial<AddressEntity>,
  ): Promise<AddressEntity> {
    const userObjId = new Types.ObjectId(userId);

    // If marked default, unset any existing default for this user
    if (data.isDefault) {
      await this.addressModel
        .updateMany({ userId: userObjId }, { $set: { isDefault: false } })
        .exec();
    }

    const created = await this.addressModel.create({
      userId: userObjId,
      mobile: data.mobile,
      instructions: data.instructions,
      formattedAddress: data.formattedAddress,
      location: data.location,
      isDefault: Boolean(data.isDefault),
    });
    return this.toDomain(created)!;
  }

  async findByUserId(userId: string): Promise<AddressEntity[]> {
    const docs = await this.addressModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ isDefault: -1, createdAt: -1 })
      .exec();
    return docs.map((doc) => this.toDomain(doc)!);
  }

  async findById(id: string): Promise<AddressEntity | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.addressModel.findById(id).exec();
    return this.toDomain(doc);
  }

  async update(
    userId: string,
    id: string,
    data: Partial<AddressEntity>,
  ): Promise<AddressEntity | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const userObjId = new Types.ObjectId(userId);
    const targetId = new Types.ObjectId(id);

    if (data.isDefault) {
      await this.addressModel
        .updateMany(
          { userId: userObjId, _id: { $ne: targetId } },
          { $set: { isDefault: false } },
        )
        .exec();
    }

    const updatePayload: Record<string, unknown> = {};
    if (data.mobile !== undefined) updatePayload.mobile = data.mobile;
    if (data.instructions !== undefined)
      updatePayload.instructions = data.instructions;
    if (data.formattedAddress !== undefined)
      updatePayload.formattedAddress = data.formattedAddress;
    if (data.location !== undefined) updatePayload.location = data.location;
    if (data.isDefault !== undefined) updatePayload.isDefault = data.isDefault;

    const updated = await this.addressModel
      .findOneAndUpdate(
        {
          _id: targetId,
          userId: userObjId,
        },
        { $set: updatePayload },
        { new: true },
      )
      .exec();

    return this.toDomain(updated);
  }

  async setDefault(userId: string, id: string): Promise<AddressEntity | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const userObjId = new Types.ObjectId(userId);
    const targetId = new Types.ObjectId(id);

    const exists = await this.addressModel
      .findOne({ _id: targetId, userId: userObjId })
      .exec();
    if (!exists) return null;

    // Reset all user addresses to isDefault: false
    await this.addressModel
      .updateMany({ userId: userObjId }, { $set: { isDefault: false } })
      .exec();

    // Mark targeted address as default
    const updated = await this.addressModel
      .findOneAndUpdate(
        { _id: targetId, userId: userObjId },
        { $set: { isDefault: true } },
        { new: true },
      )
      .exec();

    return this.toDomain(updated);
  }

  async delete(userId: string, id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const userObjId = new Types.ObjectId(userId);
    const targetId = new Types.ObjectId(id);

    const addressToDelete = await this.addressModel
      .findOne({ _id: targetId, userId: userObjId })
      .exec();

    if (!addressToDelete) return false;

    const result = await this.addressModel
      .deleteOne({
        _id: targetId,
        userId: userObjId,
      })
      .exec();

    const wasDeleted = (result.deletedCount ?? 0) > 0;

    // If the deleted address was default, promote the newest remaining address to default
    if (wasDeleted && addressToDelete.isDefault) {
      const newestRemaining = await this.addressModel
        .findOne({ userId: userObjId })
        .sort({ updatedAt: -1, createdAt: -1 })
        .exec();

      if (newestRemaining) {
        newestRemaining.isDefault = true;
        await newestRemaining.save();
      }
    }

    return wasDeleted;
  }
}
