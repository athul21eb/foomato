import { SellerEntity } from '../domain/seller.entity';

export const SELLER_REPOSITORY = Symbol('SELLER_REPOSITORY');

export interface ISellerRepository {
  create(seller: Partial<SellerEntity>): Promise<SellerEntity>;
  findById(id: string): Promise<SellerEntity | null>;
  findByOwnerId(ownerId: string): Promise<SellerEntity | null>;
  findAll(): Promise<SellerEntity[]>;
  update(
    id: string,
    seller: Partial<SellerEntity>,
  ): Promise<SellerEntity | null>;
  updateByOwnerId(
    ownerId: string,
    seller: Partial<SellerEntity>,
  ): Promise<SellerEntity | null>;
  delete(id: string): Promise<boolean>;
}
