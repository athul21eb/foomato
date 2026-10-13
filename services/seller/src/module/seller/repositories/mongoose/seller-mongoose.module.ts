import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Seller, SellerSchema } from './seller.schema';
import { MongooseSellerRepository } from './mongoose-seller.repository';
import { SELLER_REPOSITORY } from '../../interfaces/seller.repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Seller.name, schema: SellerSchema }]),
  ],
  providers: [
    {
      provide: SELLER_REPOSITORY,
      useClass: MongooseSellerRepository,
    },
  ],
  exports: [SELLER_REPOSITORY],
})
export class SellerMongooseModule {}
