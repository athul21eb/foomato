export enum UserRole {
  CUSTOMER = 'customer',
  RIDER = 'rider',
  SELLER = 'seller',
}

export class UserEntity {
  id: string;
  name: string;
  email: string;
  image: string;
  role: UserRole | null;
  googleId?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial?: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
