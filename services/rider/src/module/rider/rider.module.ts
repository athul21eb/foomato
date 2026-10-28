import { Module } from '@nestjs/common';
import { RiderController } from './rider.controller';
import { RiderService } from './rider.service';
import { RiderMongooseModule } from './repositories/mongoose/rider-mongoose.module';

import { OrderReadyConsumer } from './consumers/order-ready.consumer';

@Module({
  imports: [RiderMongooseModule],
  controllers: [RiderController],
  providers: [RiderService, OrderReadyConsumer],
  exports: [RiderService],
})
export class RiderModule {}
