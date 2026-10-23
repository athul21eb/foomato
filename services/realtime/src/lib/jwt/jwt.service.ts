import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';

export interface DecodedUser {
  sub?: string;
  _id?: string;
  id?: string;
  email?: string;
  role?: string | null;
  restaurantId?: string;
  user?: {
    _id?: string;
    id?: string;
    email?: string;
    role?: string | null;
    restaurantId?: string;
  };
  [key: string]: unknown;
}

@Injectable()
export class JwtService {
  constructor(private readonly configService: ConfigService) {}

  private get jwtSecret(): string {
    return this.configService.getOrThrow<string>('JWT_SECRET');
  }

  verifyToken(token: string): DecodedUser {
    return jwt.verify(token, this.jwtSecret) as DecodedUser;
  }
}
