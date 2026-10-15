import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  type ISellerRepository,
  SELLER_REPOSITORY,
} from './interfaces/seller.repository.interface';
import { SellerEntity } from './domain/seller.entity';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { GetNearbySellersDto } from './dto/get-nearby-sellers.dto';

@Injectable()
export class SellerService {
  constructor(
    @Inject(SELLER_REPOSITORY)
    private readonly sellerRepository: ISellerRepository,
  ) {}

  async addSeller(
    ownerId: string,
    createSellerDto: CreateSellerDto,
  ): Promise<SellerEntity> {
    const existingSeller = await this.sellerRepository.findByOwnerId(ownerId);
    if (existingSeller) {
      throw new ConflictException(
        'Seller profile already exists for this account',
      );
    }

    if (!createSellerDto.image) {
      throw new BadRequestException('Seller image is required');
    }

    const seller = await this.sellerRepository.create({
      name: createSellerDto.name,
      description: createSellerDto.description,
      image: createSellerDto.image,
      ownerId,
      phone: createSellerDto.phone,
      isVerified: false,
      autoLocation: {
        type: createSellerDto.autoLocation.type,
        coordinates: createSellerDto.autoLocation.coordinates,
        formattedAddress: createSellerDto.autoLocation.formattedAddress,
      },
      isOpen: createSellerDto.isOpen ?? false,
    });

    return seller;
  }

  async fetchMySeller(ownerId: string): Promise<SellerEntity> {
    const seller = await this.sellerRepository.findByOwnerId(ownerId);
    if (!seller) {
      throw new NotFoundException('Seller profile not found');
    }
    return seller;
  }

  async updateStatusSeller(
    ownerId: string,
    updateStatusDto?: UpdateStatusDto,
  ): Promise<SellerEntity> {
    const seller = await this.sellerRepository.findByOwnerId(ownerId);
    if (!seller) {
      throw new NotFoundException('Seller profile not found');
    }

    const newStatus =
      updateStatusDto?.isOpen !== undefined
        ? updateStatusDto.isOpen
        : !seller.isOpen;

    const updated = await this.sellerRepository.updateByOwnerId(ownerId, {
      isOpen: newStatus,
    });

    if (!updated) {
      throw new NotFoundException('Failed to update seller status');
    }

    return updated;
  }

  async updateSeller(
    ownerId: string,
    updateSellerDto: UpdateSellerDto,
  ): Promise<SellerEntity> {
    const seller = await this.sellerRepository.findByOwnerId(ownerId);
    if (!seller) {
      throw new NotFoundException('Seller profile not found');
    }

    const updatePayload: Partial<SellerEntity> = {};

    if (updateSellerDto.name !== undefined) {
      updatePayload.name = updateSellerDto.name;
    }
    if (updateSellerDto.description !== undefined) {
      updatePayload.description = updateSellerDto.description;
    }
    if (updateSellerDto.phone !== undefined) {
      updatePayload.phone = updateSellerDto.phone;
    }
    if (updateSellerDto.isOpen !== undefined) {
      updatePayload.isOpen = updateSellerDto.isOpen;
    }
    if (updateSellerDto.autoLocation !== undefined) {
      updatePayload.autoLocation = {
        type: updateSellerDto.autoLocation.type,
        coordinates: updateSellerDto.autoLocation.coordinates,
        formattedAddress: updateSellerDto.autoLocation.formattedAddress,
      };
    }
    if (updateSellerDto.image !== undefined) {
      updatePayload.image = updateSellerDto.image;
    }

    const updated = await this.sellerRepository.updateByOwnerId(
      ownerId,
      updatePayload,
    );

    if (!updated) {
      throw new NotFoundException('Failed to update seller profile');
    }

    return updated;
  }

  async findById(id: string): Promise<SellerEntity | null> {
    return this.sellerRepository.findById(id);
  }

  async findAll(): Promise<SellerEntity[]> {
    return this.sellerRepository.findAll();
  }

  async getNearbyRestaurants(dto: GetNearbySellersDto): Promise<{
    count: number;
    restaurants: SellerEntity[];
  }> {
    const restaurants = await this.sellerRepository.findNearby({
      latitude: dto.latitude,
      longitude: dto.longitude,
      radius: dto.radius,
      search: dto.search,
    });

    return {
      count: restaurants.length,
      restaurants,
    };
  }

  async fetchSingleRestaurant(id: string): Promise<SellerEntity> {
    const seller = await this.sellerRepository.findById(id);
    if (!seller) {
      throw new NotFoundException('Restaurant not found');
    }
    return seller;
  }
}
