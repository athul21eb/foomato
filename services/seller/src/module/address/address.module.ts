import { Module } from '@nestjs/common';
import { AddressMongooseModule } from './repositories/mongoose/address-mongoose.module';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';

@Module({
  imports: [AddressMongooseModule],
  controllers: [AddressController],
  providers: [AddressService],
  exports: [AddressService],
})
export class AddressModule {}
