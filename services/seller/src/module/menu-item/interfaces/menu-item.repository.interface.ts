import { MenuItemEntity } from '../domain/menu-item.entity';

export const MENU_ITEM_REPOSITORY = Symbol('MENU_ITEM_REPOSITORY');

export interface IMenuItemRepository {
  create(item: Partial<MenuItemEntity>): Promise<MenuItemEntity>;
  findById(id: string): Promise<MenuItemEntity | null>;
  findBySellerId(sellerId: string): Promise<MenuItemEntity[]>;
  update(
    id: string,
    item: Partial<MenuItemEntity>,
  ): Promise<MenuItemEntity | null>;
  updateBySellerAndId(
    sellerId: string,
    id: string,
    item: Partial<MenuItemEntity>,
  ): Promise<MenuItemEntity | null>;
  delete(id: string): Promise<boolean>;
  deleteBySellerAndId(sellerId: string, id: string): Promise<boolean>;
}
