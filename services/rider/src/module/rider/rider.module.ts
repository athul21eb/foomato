import { Module } from '@nestjs/common';
import { RiderController } from './rider.controller';
import { RiderService } from './rider.service';
import { RiderMongooseModule } from './repositories/mongoose/rider-mongoose.module';

@Module({
  imports: [RiderMongooseModule],
  controllers: [RiderController],
  providers: [RiderService],
  exports: [RiderService],
})
export class RiderModule {}
