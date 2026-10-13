import { Module } from '@nestjs/common';
import { UsersMongooseModule } from './repositories/mongoose/users-mongoose.module';
import { UsersService } from './users.service';

@Module({
  imports: [UsersMongooseModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
