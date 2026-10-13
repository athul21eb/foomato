import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUsersRepository } from '../../interfaces/users.repository.interface';
import { UserEntity } from '../../domain/user.entity';
import { User, UserDocument } from './user.schema';

@Injectable()
export class MongooseUsersRepository implements IUsersRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  private toDomain(document: UserDocument | null): UserEntity | null {
    if (!document) return null;
    return new UserEntity({
      id: document._id.toString(),
      name: document.name,
      email: document.email,
      image: document.image,
      role: document.role,
      googleId: document.googleId,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }

  async create(user: Partial<UserEntity>): Promise<UserEntity> {
    const createdUser = new this.userModel(user);
    const saved = await createdUser.save();
    return this.toDomain(saved)!;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.userModel.findById(id).exec();
    return this.toDomain(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userModel.findOne({ email }).exec();
    return this.toDomain(user);
  }

  async findByGoogleId(googleId: string): Promise<UserEntity | null> {
    const user = await this.userModel.findOne({ googleId }).exec();
    return this.toDomain(user);
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.userModel.find().exec();
    return users.map((u) => this.toDomain(u)!);
  }

  async update(
    id: string,
    user: Partial<UserEntity>,
  ): Promise<UserEntity | null> {
    const updated = await this.userModel
      .findByIdAndUpdate(id, { $set: user }, { returnDocument: 'after' })
      .exec();
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
