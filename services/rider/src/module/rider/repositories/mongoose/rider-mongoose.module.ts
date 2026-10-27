import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RiderModel, RiderSchema } from './rider.schema';
import { MongooseRiderRepository } from './mongoose-rider.repository';
import { RIDER_REPOSITORY } from '../../interfaces/rider.repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RiderModel.name, schema: RiderSchema },
    ]),
  ],
  providers: [
    {
      provide: RIDER_REPOSITORY,
      useClass: MongooseRiderRepository,
    },
  ],
  exports: [RIDER_REPOSITORY, MongooseModule],
})
export class RiderMongooseModule {}
