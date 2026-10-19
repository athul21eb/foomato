import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Address, AddressSchema } from './address.schema';
import { MongooseAddressRepository } from './mongoose-address.repository';
import { ADDRESS_REPOSITORY } from '../../interfaces/address.repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Address.name, schema: AddressSchema }]),
  ],
  providers: [
    {
      provide: ADDRESS_REPOSITORY,
      useClass: MongooseAddressRepository,
    },
  ],
  exports: [ADDRESS_REPOSITORY],
})
export class AddressMongooseModule {}
