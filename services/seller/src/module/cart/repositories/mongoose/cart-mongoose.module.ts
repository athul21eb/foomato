import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartItem, CartItemSchema } from './cart-item.schema';
import { MongooseCartRepository } from './mongoose-cart.repository';
import { CART_REPOSITORY } from '../../interfaces/cart.repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CartItem.name, schema: CartItemSchema },
    ]),
  ],
  providers: [
    {
      provide: CART_REPOSITORY,
      useClass: MongooseCartRepository,
    },
  ],
  exports: [CART_REPOSITORY],
})
export class CartMongooseModule {}
