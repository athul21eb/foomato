import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { MongooseUsersRepository } from './mongoose-users.repository';
import { USERS_REPOSITORY } from '../../interfaces/users.repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    {
      provide: USERS_REPOSITORY,
      useClass: MongooseUsersRepository,
    },
  ],
  exports: [USERS_REPOSITORY],
})
export class UsersMongooseModule {}
