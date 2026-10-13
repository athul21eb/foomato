import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  JwtService as NestJwtService,
  type JwtModuleOptions,
  type JwtSignOptions,
  type JwtVerifyOptions,
} from '@nestjs/jwt';

export type JwtExpiresIn = NonNullable<
  JwtModuleOptions['signOptions']
>['expiresIn'];

export interface TokenPayload {
  sub: string;
  email: string;
  image?: string;
  role: string | null;
  [key: string]: unknown;
}

export interface GeneratedTokens {
  accessToken: string;
  refreshToken: string;
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

  private get accessTokenExpiresIn(): JwtExpiresIn {
    return this.configService.getOrThrow<JwtExpiresIn>('JWT_EXPIRES_IN');
  }

  private get refreshTokenSecret(): string {
    return this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
  }

  private get refreshTokenExpiresIn(): JwtExpiresIn {
    return this.configService.getOrThrow<JwtExpiresIn>(
      'JWT_REFRESH_EXPIRES_IN',
    );
  }

  async generateAccessToken(payload: TokenPayload): Promise<string> {
    return this.nestJwtService.signAsync(payload, {
      secret: this.accessTokenSecret,
      expiresIn: this.accessTokenExpiresIn,
    });
  }

  async generateRefreshToken(payload: TokenPayload): Promise<string> {
    return this.nestJwtService.signAsync(payload, {
      secret: this.refreshTokenSecret,
      expiresIn: this.refreshTokenExpiresIn,
    });
  }

  async generateTokens(payload: TokenPayload): Promise<GeneratedTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyAccessToken<T extends object = TokenPayload>(
    token: string,
  ): Promise<T> {
    return this.nestJwtService.verifyAsync<T>(token, {
      secret: this.accessTokenSecret,
    });
  }

  async verifyRefreshToken<T extends object = TokenPayload>(
    token: string,
  ): Promise<T> {
    return this.nestJwtService.verifyAsync<T>(token, {
      secret: this.refreshTokenSecret,
    });
  }

  async verifyAsync<T extends object = TokenPayload>(
    token: string,
    options?: JwtVerifyOptions,
  ): Promise<T> {
    return this.nestJwtService.verifyAsync<T>(token, options);
  }

  async signAsync(
    payload: string | Buffer | object,
    options?: JwtSignOptions,
  ): Promise<string> {
    return this.nestJwtService.signAsync(payload as any, options);
  }
}
