import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { GoogleService } from '../../lib/google/google.service';
import { JwtService } from '../../lib/jwt/jwt.service';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UserEntity } from '../users/domain/user.entity';

export interface AuthTokensResult {
  user: UserEntity;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly googleService: GoogleService,
  ) {}

  private async generateTokensForUser(
    user: UserEntity,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.jwtService.generateTokens({
      sub: user.id,
      email: user.email,
      image: user.image,
      role: user.role,
    });
  }

  async login(loginDto: LoginDto): Promise<AuthTokensResult> {
    let user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      user = await this.usersService.create({
        name: loginDto.name,
        email: loginDto.email,
        image: loginDto.picture ?? loginDto.image ?? '',
      });
      this.logger.log(`Created new user record for: ${loginDto.email}`);
    }

    const tokens = await this.generateTokensForUser(user);

    return {
      user,
      ...tokens,
    };
  }

  async googleLogin(googleLoginDto: GoogleLoginDto): Promise<AuthTokensResult> {
    const googlePayload = await this.googleService.verifyIdToken(
      googleLoginDto.idToken,
    );

    let user = await this.usersService.findByGoogleId(googlePayload.googleId);

    if (!user) {
      user = await this.usersService.findByEmail(googlePayload.email);
      if (user) {
        const userId = user.id;
        user = await this.usersService.update(userId, {
          googleId: googlePayload.googleId,
          image: user.image || googlePayload.picture,
        });
        this.logger.log(`Linked existing user ${userId} with Google account`);
      } else {
        user = await this.usersService.create({
          name: googlePayload.name,
          email: googlePayload.email,
          image: googlePayload.picture,
          googleId: googlePayload.googleId,
        });
        this.logger.log(
          `Registered new user via Google: ${googlePayload.email}`,
        );
      }
    }

    if (!user) {
      this.logger.error(
        `Failed to find or create user account for Google ID: ${googlePayload.googleId}`,
      );
      throw new NotFoundException('Failed to process user account');
    }

    const tokens = await this.generateTokensForUser(user);

    return {
      user,
      ...tokens,
    };
  }

  async updateRole(
    userId: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<AuthTokensResult> {
    const updatedUser = await this.usersService.update(userId, {
      role: updateRoleDto.role,
    });

    if (!updatedUser) {
      this.logger.warn(`Role update failed - user ${userId} not found`);
      throw new NotFoundException('User not found');
    }

    const tokens = await this.generateTokensForUser(updatedUser);

    return {
      user: updatedUser,
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokensResult> {
    let payload: { sub: string };
    try {
      payload = await this.jwtService.verifyRefreshToken<{ sub: string }>(
        refreshToken,
      );
    } catch {
      this.logger.warn('Refresh token verification failed');
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      this.logger.warn(
        `Refresh token rejected: user ${payload.sub} no longer exists`,
      );
      throw new UnauthorizedException('User no longer exists');
    }

    const tokens = await this.generateTokensForUser(user);

    return {
      user,
      ...tokens,
    };
  }
}
