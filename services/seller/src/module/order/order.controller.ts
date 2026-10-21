import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { InternalKeyGuard } from '../../common/guards/internal-key.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';

@Controller(['order', 'orders'])
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post(['', 'new'])
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ResponseMessage('Order created successfully')
  async createOrder(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.orderService.createOrder(userId, dto);
  }

  @Get([':id/payment', 'payment/:id'])
  @UseGuards(InternalKeyGuard)
  @ResponseMessage('Order payment details fetched successfully')
  async fetchOrderForPayment(@Param('id') id: string) {
    return this.orderService.fetchOrderForPayment(id);
  }

  @Get('my-orders')
  @UseGuards(AuthGuard)
  @ResponseMessage('User orders fetched successfully')
  async getMyOrders(@CurrentUser('id') userId: string) {
    const orders = await this.orderService.getMyOrders(userId);
    return { orders };
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ResponseMessage('Order details fetched successfully')
  async getOrderById(@Param('id') id: string) {
    const order = await this.orderService.getOrderById(id);
    return { order };
  }
}
