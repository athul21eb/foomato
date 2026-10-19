import { Module } from '@nestjs/common';
import { CartMongooseModule } from './repositories/mongoose/cart-mongoose.module';
import { SellerModule } from '../seller/seller.module';
import { MenuItemModule } from '../menu-item/menu-item.module';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  imports: [CartMongooseModule, SellerModule, MenuItemModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
