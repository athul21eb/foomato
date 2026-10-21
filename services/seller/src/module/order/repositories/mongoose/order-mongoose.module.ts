import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './order.schema';
import { MongooseOrderRepository } from './mongoose-order.repository';
import { ORDER_REPOSITORY } from '../../interfaces/order.repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
  ],
  providers: [
    {
      provide: ORDER_REPOSITORY,
      useClass: MongooseOrderRepository,
    },
  ],
  exports: [ORDER_REPOSITORY],
})
export class OrderMongooseModule {}
