import { AddressEntity } from '../domain/address.entity';

export const ADDRESS_REPOSITORY = Symbol('ADDRESS_REPOSITORY');

export interface IAddressRepository {
  create(userId: string, data: Partial<AddressEntity>): Promise<AddressEntity>;
  findByUserId(userId: string): Promise<AddressEntity[]>;
  findById(id: string): Promise<AddressEntity | null>;
  countByUserId(userId: string): Promise<number>;
  update(
    userId: string,
    id: string,
    data: Partial<AddressEntity>,
  ): Promise<AddressEntity | null>;
  setDefault(userId: string, id: string): Promise<AddressEntity | null>;
  delete(userId: string, id: string): Promise<boolean>;
}
