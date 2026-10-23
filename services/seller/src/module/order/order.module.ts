import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrderMongooseModule } from './repositories/mongoose/order-mongoose.module';
import { CartModule } from '../cart/cart.module';
import { AddressModule } from '../address/address.module';
import { SellerModule } from '../seller/seller.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { PaymentSuccessConsumer } from './consumers/payment-success.consumer';

@Module({
  imports: [
    OrderMongooseModule,
    CartModule,
    AddressModule,
    SellerModule,
    ConfigModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, PaymentSuccessConsumer],
  exports: [OrderService],
})
export class OrderModule {}
