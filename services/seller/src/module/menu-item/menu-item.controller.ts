import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { MenuItemService } from './menu-item.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemStatusDto } from './dto/update-menu-item-status.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { SellerGuard } from '../../common/guards/seller.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';

@Controller(['menu-item', 'menuItem'])
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}

  @Post('new')
  @UseGuards(AuthGuard, SellerGuard)
  @ResponseMessage('Menu item added successfully')
  async addMenuItem(
    @CurrentUser('id') ownerId: string,
    @Body() createMenuItemDto: CreateMenuItemDto,
  ) {
    return this.menuItemService.addMenuItem(ownerId, createMenuItemDto);
  }

  @Get('all/:id')
  @UseGuards(AuthGuard)
  @ResponseMessage('Menu items retrieved successfully')
  async getAllItems(@Param('id') sellerId: string) {
    return this.menuItemService.getAllItems(sellerId);
  }

  @Delete(':itemId')
  @UseGuards(AuthGuard, SellerGuard)
  @ResponseMessage('Menu item deleted successfully')
  async deleteMenuItem(
    @CurrentUser('id') ownerId: string,
    @Param('itemId') itemId: string,
  ) {
    await this.menuItemService.deleteMenuItem(ownerId, itemId);
    return { deleted: true };
  }

  @Put('status/:itemId')
  @UseGuards(AuthGuard, SellerGuard)
  @ResponseMessage('Menu item availability updated successfully')
  async toggleMenuItemAvailability(
    @CurrentUser('id') ownerId: string,
    @Param('itemId') itemId: string,
    @Body() updateStatusDto?: UpdateMenuItemStatusDto,
  ) {
    return this.menuItemService.toggleMenuItemAvailability(
      ownerId,
      itemId,
      updateStatusDto,
    );
  }
}
