import { Module } from '@nestjs/common';
import { MenuItemMongooseModule } from './repositories/mongoose/menu-item-mongoose.module';
import { SellerModule } from '../seller/seller.module';
import { MenuItemController } from './menu-item.controller';
import { MenuItemService } from './menu-item.service';

@Module({
  imports: [MenuItemMongooseModule, SellerModule],
  controllers: [MenuItemController],
  providers: [MenuItemService],
  exports: [MenuItemService],
})
export class MenuItemModule {}
