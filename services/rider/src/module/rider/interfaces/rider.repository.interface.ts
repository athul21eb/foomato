import { RiderEntity } from '../domain/rider.entity';

export const RIDER_REPOSITORY = Symbol('RIDER_REPOSITORY');

export interface IRiderRepository {
  create(rider: Partial<RiderEntity>): Promise<RiderEntity>;
  findByUserId(userId: string): Promise<RiderEntity | null>;
  findById(id: string): Promise<RiderEntity | null>;
  updateAvailability(
    userId: string,
    isAvailable: boolean,
    coordinates: [number, number],
  ): Promise<RiderEntity | null>;
  update(userId: string, data: Partial<RiderEntity>): Promise<RiderEntity | null>;
}
