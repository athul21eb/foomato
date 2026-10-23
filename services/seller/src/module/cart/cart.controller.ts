import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';

@Controller('cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Item added to cart')
  async addToCart(
    @CurrentUser('id') userId: string,
    @Body() dto: AddToCartDto,
  ) {
    const cartItem = await this.cartService.addToCart(userId, dto);
    return { cartItem };
  }

  @Get()
  @ResponseMessage('Cart fetched successfully')
  async getMyCart(@CurrentUser('id') userId: string) {
    return this.cartService.getMyCart(userId);
  }

  @Patch('items/:itemId/increment')
  @ResponseMessage('Cart item incremented successfully')
  async incrementItem(
    @CurrentUser('id') userId: string,
    @Param('itemId') paramItemId?: string,
    @Body('itemId') bodyItemId?: string,
    @Body('id') bodyId?: string,
  ) {
    const itemId = paramItemId || bodyItemId || bodyId;
    if (!itemId) {
      throw new BadRequestException('Item ID is required');
    }
    const cartItem = await this.cartService.incrementItem(userId, itemId);
    return { cartItem };
  }

  @Patch('items/:itemId/decrement')
  @ResponseMessage('Cart item decremented successfully')
  async decrementItem(
    @CurrentUser('id') userId: string,
    @Param('itemId') paramItemId?: string,
    @Body('itemId') bodyItemId?: string,
    @Body('id') bodyId?: string,
  ) {
    const itemId = paramItemId || bodyItemId || bodyId;
    if (!itemId) {
      throw new BadRequestException('Item ID is required');
    }
    const cartItem = await this.cartService.decrementItem(userId, itemId);
    return { cartItem };
  }

  @Delete('items/:itemId')
  @ResponseMessage('Item removed from cart')
  async removeItem(
    @CurrentUser('id') userId: string,
    @Param('itemId') itemId: string,
  ) {
    await this.cartService.removeItem(userId, itemId);
    return { removed: true };
  }

  @Delete()
  @ResponseMessage('Cart cleared successfully')
  async clearCart(@CurrentUser('id') userId: string) {
    await this.cartService.clearCart(userId);
    return { cleared: true };
  }
}
