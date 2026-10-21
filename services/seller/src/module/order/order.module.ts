import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrderMongooseModule } from './repositories/mongoose/order-mongoose.module';
import { CartModule } from '../cart/cart.module';
import { AddressModule } from '../address/address.module';
import { SellerModule } from '../seller/seller.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { InternalKeyGuard } from '../../common/guards/internal-key.guard';

@Module({
  imports: [
    OrderMongooseModule,
    CartModule,
    AddressModule,
    SellerModule,
    ConfigModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, InternalKeyGuard],
  exports: [OrderService],
})
export class OrderModule {}
