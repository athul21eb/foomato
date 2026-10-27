import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  JwtService as NestJwtService,
  type JwtVerifyOptions,
} from '@nestjs/jwt';

export interface TokenPayload {
  sub: string;
  email: string;
  image?: string;
  role: string | null;
  [key: string]: unknown;
}

@Injectable()
export class JwtService {
  constructor(
    private readonly nestJwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {}

  private get accessTokenSecret(): string {
    return this.configService.getOrThrow<string>('JWT_SECRET');
  }

  async verifyAccessToken<T extends object = TokenPayload>(
    token: string,
  ): Promise<T> {
    return this.nestJwtService.verifyAsync<T>(token, {
      secret: this.accessTokenSecret,
    });
  }

  async verifyAsync<T extends object = TokenPayload>(
    token: string,
    options?: JwtVerifyOptions,
  ): Promise<T> {
    return this.nestJwtService.verifyAsync<T>(token, {
      secret: this.accessTokenSecret,
      ...options,
    });
  }
}
