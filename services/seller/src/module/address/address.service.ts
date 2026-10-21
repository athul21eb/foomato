import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import {
  type IAddressRepository,
  ADDRESS_REPOSITORY,
} from './interfaces/address.repository.interface';
import { AddressEntity } from './domain/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(
    @Inject(ADDRESS_REPOSITORY)
    private readonly addressRepository: IAddressRepository,
  ) {}

  async addAddress(
    userId: string,
    dto: CreateAddressDto,
  ): Promise<AddressEntity> {
    const currentCount = await this.addressRepository.countByUserId(userId);
    if (currentCount >= 5) {
      throw new BadRequestException(
        'You have reached the maximum limit of 5 saved addresses',
      );
    }

    // Auto-make first address the default
    if (currentCount === 0) {
      dto.isDefault = true;
    }

    return this.addressRepository.create(userId, dto);
  }

  async getMyAddresses(userId: string): Promise<AddressEntity[]> {
    return this.addressRepository.findByUserId(userId);
  }

  async findById(id: string): Promise<AddressEntity | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.addressRepository.findById(id);
  }

  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<AddressEntity | null> {
    const address = await this.findById(id);
    if (!address || address.userId !== userId) {
      return null;
    }
    return address;
  }

  async updateAddress(
    userId: string,
    id: string,
    dto: UpdateAddressDto,
  ): Promise<AddressEntity> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid address ID format');
    }

    const updated = await this.addressRepository.update(userId, id, dto);
    if (!updated) {
      throw new NotFoundException('Address not found');
    }

    return updated;
  }

  async setDefaultAddress(userId: string, id: string): Promise<AddressEntity> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid address ID format');
    }

    const updated = await this.addressRepository.setDefault(userId, id);
    if (!updated) {
      throw new NotFoundException('Address not found');
    }

    return updated;
  }

  async deleteAddress(userId: string, id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid address ID format');
    }

    const deleted = await this.addressRepository.delete(userId, id);
    if (!deleted) {
      throw new NotFoundException('Address not found');
    }

    return true;
  }
}
