import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  RIDER_REPOSITORY,
  type IRiderRepository,
} from './interfaces/rider.repository.interface';
import { RiderEntity } from './domain/rider.entity';
import { CreateRiderProfileDto } from './dto/create-rider-profile.dto';
import { ToggleAvailabilityDto } from './dto/toggle-availability.dto';
import { UpdateRiderProfileDto } from './dto/update-rider-profile.dto';
import { OrderGrpcService } from '../../lib/order-grpc/order-grpc.service';

@Injectable()
export class RiderService {
  private readonly logger = new Logger(RiderService.name);

  constructor(
    @Inject(RIDER_REPOSITORY)
    private readonly riderRepository: IRiderRepository,
    private readonly orderGrpcService: OrderGrpcService,
  ) {}

  async createProfile(
    userId: string,
    dto: CreateRiderProfileDto,
  ): Promise<RiderEntity> {
    const existing = await this.riderRepository.findByUserId(userId);
    if (existing) {
      throw new BadRequestException('Rider profile already exists');
    }

    const rider = await this.riderRepository.create({
      userId,
      riderName: dto.riderName.trim(),
      picture: dto.picture,
      phoneNumber: dto.phoneNumber,
      aadharNumber: dto.aadharNumber,
      drivingLicenseNumber: dto.drivingLicenseNumber,
      location: {
        type: 'Point',
        coordinates: [dto.longitude, dto.latitude],
        formattedAddress: dto.formattedAddress?.trim() || undefined,
      },
      isAvailable: false,
      isVerified: false,
      lastActiveAt: new Date(),
    });

    this.logger.log(`Created new rider profile for user: ${userId} (ID: ${rider.id})`);
    return rider;
  }

  async getMyProfile(userId: string): Promise<RiderEntity> {
    const rider = await this.riderRepository.findByUserId(userId);
    if (!rider) {
      throw new NotFoundException('Rider profile not found');
    }
    return rider;
  }

  async updateProfile(
    userId: string,
    dto: UpdateRiderProfileDto,
  ): Promise<RiderEntity> {
    const rider = await this.riderRepository.findByUserId(userId);
    if (!rider) {
      throw new NotFoundException('Rider profile not found');
    }

    // Business rule: Once verified, riders cannot modify identity or KYC documents.
    // They can only update their operating location coordinates.
    if (rider.isVerified) {
      const hasRestrictedChanges =
        (dto.riderName !== undefined && dto.riderName.trim() !== rider.riderName) ||
        (dto.picture !== undefined && dto.picture.trim() !== rider.picture) ||
        (dto.phoneNumber !== undefined && dto.phoneNumber.trim() !== rider.phoneNumber) ||
        (dto.aadharNumber !== undefined && dto.aadharNumber.trim() !== rider.aadharNumber) ||
        (dto.drivingLicenseNumber !== undefined &&
          dto.drivingLicenseNumber.trim() !== rider.drivingLicenseNumber);

      if (hasRestrictedChanges) {
        throw new ForbiddenException(
          'Verified riders can only update their service location. Identity and KYC documents are locked after verification.',
        );
      }
    }

    const payload: Partial<RiderEntity> = {};
    if (!rider.isVerified) {
      if (dto.riderName !== undefined) payload.riderName = dto.riderName.trim();
      if (dto.picture !== undefined) payload.picture = dto.picture.trim();
      if (dto.phoneNumber !== undefined) payload.phoneNumber = dto.phoneNumber.trim();
      if (dto.aadharNumber !== undefined) payload.aadharNumber = dto.aadharNumber.trim();
      if (dto.drivingLicenseNumber !== undefined)
        payload.drivingLicenseNumber = dto.drivingLicenseNumber.trim();
    }

    if (dto.latitude !== undefined && dto.longitude !== undefined) {
      payload.location = {
        type: 'Point',
        coordinates: [dto.longitude, dto.latitude],
        formattedAddress: dto.formattedAddress?.trim() || rider.location?.formattedAddress,
      };
    } else if (dto.formattedAddress !== undefined) {
      payload.location = {
        type: 'Point',
        coordinates: rider.location?.coordinates || [0, 0],
        formattedAddress: dto.formattedAddress.trim(),
      };
    }

    const updated = await this.riderRepository.update(userId, payload);
    if (!updated) {
      throw new NotFoundException('Failed to update rider profile');
    }

    this.logger.log(`Updated rider profile for user: ${userId} (ID: ${updated.id})`);
    return updated;
  }

  async toggleAvailability(
    userId: string,
    dto: ToggleAvailabilityDto,
  ): Promise<RiderEntity> {
    const rider = await this.riderRepository.findByUserId(userId);
    if (!rider) {
      throw new NotFoundException('Rider profile not found');
    }

    if (dto.isAvailable && !rider.isVerified) {
      throw new ForbiddenException(
        'Rider is not verified yet. Verification is required before going online.',
      );
    }

    const updated = await this.riderRepository.updateAvailability(
      userId,
      dto.isAvailable,
      [dto.longitude, dto.latitude],
    );

    if (!updated) {
      throw new NotFoundException('Failed to update rider availability');
    }

    this.logger.log(
      `Rider ${updated.id} (user: ${userId}) availability transitioned to: ${
        dto.isAvailable ? 'ONLINE' : 'OFFLINE'
      }`,
    );

    return updated;
  }

  async acceptOrder(userId: string, orderId: string) {
    const rider = await this.riderRepository.findByUserId(userId);
    if (!rider) {
      throw new NotFoundException('Rider profile not found');
    }

    if (!rider.isVerified) {
      throw new ForbiddenException(
        'Rider verification required to accept orders',
      );
    }

    if (!rider.isAvailable) {
      throw new BadRequestException(
        'Rider must be online/available to accept orders',
      );
    }

    try {
      const res = await this.orderGrpcService.assignRider({
        orderId,
        riderId: rider.id,
        riderName: rider.riderName,
        riderPhone: rider.phoneNumber,
      });

      // Atomically mark rider busy (isAvailable: false)
      await this.riderRepository.update(userId, { isAvailable: false });

      this.logger.log(
        `Rider ${rider.id} (user: ${userId}) accepted order ${orderId} successfully`,
      );

      return {
        message: 'Order accepted successfully',
        orderId: res.orderId,
        status: res.status,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to accept order';
      this.logger.error(
        `Rider ${rider.id} failed to accept order ${orderId}: ${message}`,
      );
      throw new BadRequestException(message);
    }
  }

  async getCurrentOrder(userId: string) {
    const rider = await this.riderRepository.findByUserId(userId);
    if (!rider) {
      throw new NotFoundException('Rider profile not found');
    }

    try {
      const order = await this.orderGrpcService.getCurrentRiderOrder(rider.id);
      return { order };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'No active order found';
      this.logger.warn(
        `Active order query for rider ${rider.id} returned: ${message}`,
      );
      return { order: null };
    }
  }

  async updateOrderStatus(userId: string, orderId: string) {
    const rider = await this.riderRepository.findByUserId(userId);
    if (!rider) {
      throw new NotFoundException('Rider profile not found');
    }

    try {
      const updatedOrder =
        await this.orderGrpcService.updateOrderStatusByRider(
          orderId,
          rider.id,
        );

      // If the order has reached terminal 'delivered' state, restore rider duty to online!
      if (updatedOrder.status === 'delivered') {
        await this.riderRepository.update(userId, { isAvailable: true });
        this.logger.log(
          `Rider ${rider.id} delivered order ${orderId}. Duty status restored to ONLINE.`,
        );
      }

      return {
        message: `Order status updated to ${updatedOrder.status}`,
        order: updatedOrder,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update order status';
      this.logger.error(
        `Rider ${rider.id} failed to update order ${orderId}: ${message}`,
      );
      throw new BadRequestException(message);
    }
  }
}
