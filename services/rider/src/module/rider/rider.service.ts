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

@Injectable()
export class RiderService {
  private readonly logger = new Logger(RiderService.name);

  constructor(
    @Inject(RIDER_REPOSITORY)
    private readonly riderRepository: IRiderRepository,
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
}
