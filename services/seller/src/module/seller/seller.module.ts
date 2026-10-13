import { Module } from '@nestjs/common';
import { SellerMongooseModule } from './repositories/mongoose/seller-mongoose.module';
import { SellerService } from './seller.service';
import { SellerController } from './seller.controller';

@Module({
  imports: [SellerMongooseModule],
  controllers: [SellerController],
  providers: [SellerService],
  exports: [SellerService],
})
export class SellerModule {}
