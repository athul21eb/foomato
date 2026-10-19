import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import {
  type IMenuItemRepository,
  MENU_ITEM_REPOSITORY,
} from './interfaces/menu-item.repository.interface';
import { MenuItemEntity } from './domain/menu-item.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemStatusDto } from './dto/update-menu-item-status.dto';
import { SellerService } from '../seller/seller.service';

@Injectable()
export class MenuItemService {
  constructor(
    @Inject(MENU_ITEM_REPOSITORY)
    private readonly menuItemRepository: IMenuItemRepository,
    private readonly sellerService: SellerService,
  ) {}

  async addMenuItem(
    ownerId: string,
    createMenuItemDto: CreateMenuItemDto,
  ): Promise<MenuItemEntity> {
    const seller = await this.sellerService.fetchMySeller(ownerId);

    if (!createMenuItemDto.image) {
      throw new BadRequestException('Dish image is required');
    }

    const menuItem = await this.menuItemRepository.create({
      sellerId: seller.id,
      name: createMenuItemDto.name,
      description: createMenuItemDto.description,
      price: createMenuItemDto.price,
      image: createMenuItemDto.image,
      isVeg: createMenuItemDto.isVeg ?? true,
      isAvailable: createMenuItemDto.isAvailable ?? true,
    });

    return menuItem;
  }

  async getAllItems(sellerId: string): Promise<MenuItemEntity[]> {
    if (!Types.ObjectId.isValid(sellerId)) {
      throw new BadRequestException('Invalid seller ID format');
    }

    const seller = await this.sellerService.findById(sellerId);
    if (!seller) {
      throw new NotFoundException('Seller profile not found');
    }

    return this.menuItemRepository.findBySellerId(sellerId);
  }

  async deleteMenuItem(ownerId: string, itemId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(itemId)) {
      throw new BadRequestException('Invalid item ID format');
    }

    const seller = await this.sellerService.fetchMySeller(ownerId);
    const item = await this.menuItemRepository.findById(itemId);

    if (!item) {
      throw new NotFoundException('Menu item not found');
    }

    if (item.sellerId !== seller.id) {
      throw new ForbiddenException(
        'You do not have permission to delete this menu item',
      );
    }

    const deleted = await this.menuItemRepository.deleteBySellerAndId(
      seller.id,
      itemId,
    );

    if (!deleted) {
      throw new NotFoundException('Failed to delete menu item');
    }

    return true;
  }

  async toggleMenuItemAvailability(
    ownerId: string,
    itemId: string,
    updateStatusDto?: UpdateMenuItemStatusDto,
  ): Promise<MenuItemEntity> {
    if (!Types.ObjectId.isValid(itemId)) {
      throw new BadRequestException('Invalid item ID format');
    }

    const seller = await this.sellerService.fetchMySeller(ownerId);
    const item = await this.menuItemRepository.findById(itemId);

    if (!item) {
      throw new NotFoundException('Menu item not found');
    }

    if (item.sellerId !== seller.id) {
      throw new ForbiddenException(
        'You do not have permission to modify this menu item',
      );
    }

    const newStatus =
      updateStatusDto?.isAvailable !== undefined
        ? updateStatusDto.isAvailable
        : !item.isAvailable;

    const updated = await this.menuItemRepository.updateBySellerAndId(
      seller.id,
      itemId,
      { isAvailable: newStatus },
    );

    if (!updated) {
      throw new NotFoundException('Failed to update menu item status');
    }

    return updated;
  }

  async findById(itemId: string): Promise<MenuItemEntity | null> {
    if (!Types.ObjectId.isValid(itemId)) {
      return null;
    }
    return this.menuItemRepository.findById(itemId);
  }
}
