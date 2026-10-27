import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetMyOrdersDto } from './dto/get-my-orders.dto';
import { GetOrderForPaymentDto } from './dto/get-order-for-payment.dto';
import { GetSellerOrdersDto } from './dto/get-seller-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import type { GetOrderForPaymentResponse } from './interfaces/order-grpc.interface';
import { AuthGuard } from '../../common/guards/auth.guard';
import { SellerGuard } from '../../common/guards/seller.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';

@Controller('order')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(private readonly orderService: OrderService) {}

  @Post('new')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ResponseMessage('Order created successfully')
  async createOrder(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    this.logger.log(`Order placement received from user: ${userId}`);
    return this.orderService.createOrder(userId, dto);
  }

  @GrpcMethod('OrderService', 'GetOrderForPayment')
  async getOrderForPayment(
    data: GetOrderForPaymentDto,
  ): Promise<GetOrderForPaymentResponse> {
    this.logger.log(`[gRPC] GetOrderForPayment requested for: ${data.orderId}`);

    if (!data.orderId) {
      throw new RpcException('Order ID is required');
    }

    try {
      const order = await this.orderService.fetchOrderForPayment(data.orderId);

      return {
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        paymentStatus: 'pending',
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch order for payment';
      this.logger.error(
        `[gRPC] GetOrderForPayment failed for ${data.orderId}: ${message}`,
      );
      throw new RpcException(message);
    }
  }

  @Get('my-orders')
  @UseGuards(AuthGuard)
  @ResponseMessage('User orders fetched successfully')
  async getMyOrders(
    @CurrentUser('id') userId: string,
    @Query() query: GetMyOrdersDto,
  ) {
    return this.orderService.getMyOrders(userId, query);
  }

  @Get('seller')
  @UseGuards(AuthGuard, SellerGuard)
  @ResponseMessage('Seller orders fetched successfully')
  async getSellerOrders(
    @CurrentUser('id') ownerId: string,
    @Query() query: GetSellerOrdersDto,
  ) {
    return this.orderService.getSellerOrders(ownerId, query);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard, SellerGuard)
  @ResponseMessage('Order status updated successfully')
  async updateOrderStatus(
    @CurrentUser('id') ownerId: string,
    @Param('id') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const order = await this.orderService.updateSellerOrderStatus(
      ownerId,
      orderId,
      dto,
    );
    return { order };
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ResponseMessage('Order details fetched successfully')
  async getOrderById(@Param('id') id: string) {
    const order = await this.orderService.getOrderById(id);
    return { order };
  }
}
