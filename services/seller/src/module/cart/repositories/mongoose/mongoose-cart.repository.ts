import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { type ICartRepository } from '../../interfaces/cart.repository.interface';
import { CartItemEntity } from '../../domain/cart-item.entity';
import { CartItem, CartItemDocument } from './cart-item.schema';

interface PopulatedMenuItem {
  _id: Types.ObjectId;
  name: string;
  price: number;
  image: string;
  isVeg: boolean;
  isAvailable?: boolean;
  description?: string;
}

interface PopulatedSeller {
  _id: Types.ObjectId;
  name: string;
  image?: string;
  isOpen?: boolean;
}

interface CartItemDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  sellerId: Types.ObjectId | PopulatedSeller;
  itemId: Types.ObjectId | PopulatedMenuItem;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class MongooseCartRepository implements ICartRepository {
  constructor(
    @InjectModel(CartItem.name)
    private readonly cartItemModel: Model<CartItemDocument>,
  ) {}

  private toDomain(doc: CartItemDoc | null): CartItemEntity | null {
    if (!doc) return null;

    const sellerObj = doc.sellerId;
    const isSellerPopulated =
      Boolean(sellerObj) &&
      typeof sellerObj === 'object' &&
      'name' in (sellerObj as object);

    const itemObj = doc.itemId;
    const isItemPopulated =
      Boolean(itemObj) &&
      typeof itemObj === 'object' &&
      'name' in (itemObj as object);

    const sellerId = isSellerPopulated
      ? (sellerObj as PopulatedSeller)._id.toString()
      : (sellerObj as Types.ObjectId).toString();

    const itemId = isItemPopulated
      ? (itemObj as PopulatedMenuItem)._id.toString()
      : (itemObj as Types.ObjectId).toString();

    const entity = new CartItemEntity({
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      sellerId,
      itemId,
      quantity: doc.quantity,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });

    if (isItemPopulated) {
      const populatedItem = itemObj as PopulatedMenuItem;
      entity.item = {
        id: populatedItem._id.toString(),
        name: populatedItem.name,
        price: populatedItem.price,
        image: populatedItem.image,
        isVeg: populatedItem.isVeg,
        isAvailable: populatedItem.isAvailable ?? true,
        description: populatedItem.description,
      };
    }

    if (isSellerPopulated) {
      const populatedSeller = sellerObj as PopulatedSeller;
      entity.seller = {
        id: populatedSeller._id.toString(),
        name: populatedSeller.name,
        image: populatedSeller.image,
        isOpen: populatedSeller.isOpen,
      };
    }

    return entity;
  }

  async findItemsByUserId(userId: string): Promise<CartItemEntity[]> {
    const items = await this.cartItemModel
      .find({ userId: new Types.ObjectId(userId) })
      .exec();
    return items.map((doc) => this.toDomain(doc as unknown as CartItemDoc)!);
  }

  async findPopulatedCartByUserId(userId: string): Promise<CartItemEntity[]> {
    const items = await this.cartItemModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('itemId')
      .populate('sellerId')
      .exec();
    return items.map((doc) => this.toDomain(doc as unknown as CartItemDoc)!);
  }

  async findFirstItemByUserId(userId: string): Promise<CartItemEntity | null> {
    const item = await this.cartItemModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();
    return this.toDomain(item);
  }

  async findItem(
    userId: string,
    itemId: string,
  ): Promise<CartItemEntity | null> {
    const item = await this.cartItemModel
      .findOne({
        userId: new Types.ObjectId(userId),
        itemId: new Types.ObjectId(itemId),
      })
      .exec();
    return this.toDomain(item);
  }

  async addItem(
    userId: string,
    sellerId: string,
    itemId: string,
  ): Promise<CartItemEntity> {
    const updated = await this.cartItemModel
      .findOneAndUpdate(
        {
          userId: new Types.ObjectId(userId),
          sellerId: new Types.ObjectId(sellerId),
          itemId: new Types.ObjectId(itemId),
        },
        {
          $inc: { quantity: 1 },
        },
        {
          returnDocument: 'after',
          upsert: true,
          setDefaultsOnInsert: true,
        },
      )
      .exec();

    return this.toDomain(updated)!;
  }

  async incrementItem(
    userId: string,
    itemId: string,
  ): Promise<CartItemEntity | null> {
    const updated = await this.cartItemModel
      .findOneAndUpdate(
        {
          userId: new Types.ObjectId(userId),
          itemId: new Types.ObjectId(itemId),
        },
        {
          $inc: { quantity: 1 },
        },
        { returnDocument: 'after' },
      )
      .exec();

    return this.toDomain(updated);
  }

  async decrementItem(
    userId: string,
    itemId: string,
  ): Promise<CartItemEntity | null> {
    const item = await this.cartItemModel
      .findOne({
        userId: new Types.ObjectId(userId),
        itemId: new Types.ObjectId(itemId),
      })
      .exec();

    if (!item) {
      return null;
    }

    if (item.quantity > 1) {
      item.quantity -= 1;
      const saved = await item.save();
      return this.toDomain(saved);
    } else {
      await this.cartItemModel.deleteOne({ _id: item._id }).exec();
      return null;
    }
  }

  async deleteItem(userId: string, itemId: string): Promise<boolean> {
    const result = await this.cartItemModel
      .deleteOne({
        userId: new Types.ObjectId(userId),
        itemId: new Types.ObjectId(itemId),
      })
      .exec();
    return result.deletedCount > 0;
  }

  async clearUserCart(userId: string): Promise<boolean> {
    const result = await this.cartItemModel
      .deleteMany({
        userId: new Types.ObjectId(userId),
      })
      .exec();
    return result.acknowledged;
  }
}
