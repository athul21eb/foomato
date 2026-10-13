import { Inject, Injectable } from '@nestjs/common';
import {
  USERS_REPOSITORY,
  type IUsersRepository,
} from './interfaces/users.repository.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './domain/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.usersRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      image: createUserDto.image ?? '',
      role: createUserDto.role,
      googleId: createUserDto.googleId,
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findByGoogleId(googleId: string): Promise<UserEntity | null> {
    return this.usersRepository.findByGoogleId(googleId);
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.usersRepository.findById(id);
  }

  async findAll(): Promise<UserEntity[]> {
    return this.usersRepository.findAll();
  }

  async update(
    id: string,
    updateData: Partial<UserEntity>,
  ): Promise<UserEntity | null> {
    return this.usersRepository.update(id, updateData);
  }

  async delete(id: string): Promise<boolean> {
    return this.usersRepository.delete(id);
  }
}
