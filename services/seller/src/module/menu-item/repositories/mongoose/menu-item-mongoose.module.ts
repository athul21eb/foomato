import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuItem, MenuItemSchema } from './menu-item.schema';
import { MongooseMenuItemRepository } from './mongoose-menu-item.repository';
import { MENU_ITEM_REPOSITORY } from '../../interfaces/menu-item.repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MenuItem.name, schema: MenuItemSchema },
    ]),
  ],
  providers: [
    {
      provide: MENU_ITEM_REPOSITORY,
      useClass: MongooseMenuItemRepository,
    },
  ],
  exports: [MENU_ITEM_REPOSITORY],
})
export class MenuItemMongooseModule {}
