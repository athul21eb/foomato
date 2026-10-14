import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { type IMenuItemRepository } from '../../interfaces/menu-item.repository.interface';
import { MenuItemEntity } from '../../domain/menu-item.entity';
import { MenuItem, MenuItemDocument } from './menu-item.schema';

@Injectable()
export class MongooseMenuItemRepository implements IMenuItemRepository {
  constructor(
    @InjectModel(MenuItem.name)
    private readonly menuItemModel: Model<MenuItemDocument>,
  ) {}

  private toDomain(document: MenuItemDocument | null): MenuItemEntity | null {
    if (!document) return null;
    return new MenuItemEntity({
      id: document._id.toString(),
      sellerId: document.sellerId.toString(),
      name: document.name,
      description: document.description,
      price: document.price,
      image: document.image,
      isVeg: document.isVeg,
      isAvailable: document.isAvailable,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }

  async create(item: Partial<MenuItemEntity>): Promise<MenuItemEntity> {
    const payload: Record<string, unknown> = { ...item };
    if (item.sellerId && typeof item.sellerId === 'string') {
      payload.sellerId = new Types.ObjectId(item.sellerId);
    }

    const createdMenuItem = new this.menuItemModel(payload);
    const saved = await createdMenuItem.save();
    return this.toDomain(saved)!;
  }

  async findById(id: string): Promise<MenuItemEntity | null> {
    const item = await this.menuItemModel.findById(id).exec();
    return this.toDomain(item);
  }

  async findBySellerId(sellerId: string): Promise<MenuItemEntity[]> {
    const items = await this.menuItemModel
      .find({ sellerId: new Types.ObjectId(sellerId) })
      .sort({ createdAt: -1 })
      .exec();
    return items.map((item) => this.toDomain(item)!);
  }

  async update(
    id: string,
    item: Partial<MenuItemEntity>,
  ): Promise<MenuItemEntity | null> {
    const payload: Record<string, unknown> = { ...item };
    if (item.sellerId && typeof item.sellerId === 'string') {
      payload.sellerId = new Types.ObjectId(item.sellerId);
    }

    const updated = await this.menuItemModel
      .findByIdAndUpdate(id, { $set: payload }, { returnDocument: 'after' })
      .exec();
    return this.toDomain(updated);
  }

  async updateBySellerAndId(
    sellerId: string,
    id: string,
    item: Partial<MenuItemEntity>,
  ): Promise<MenuItemEntity | null> {
    const payload: Record<string, unknown> = { ...item };
    delete payload.sellerId;

    const updated = await this.menuItemModel
      .findOneAndUpdate(
        { _id: id, sellerId: new Types.ObjectId(sellerId) },
        { $set: payload },
        { returnDocument: 'after' },
      )
      .exec();
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.menuItemModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async deleteBySellerAndId(sellerId: string, id: string): Promise<boolean> {
    const result = await this.menuItemModel
      .findOneAndDelete({ _id: id, sellerId: new Types.ObjectId(sellerId) })
      .exec();
    return !!result;
  }
}
