import {
  Injectable,
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
        user = await this.usersService.update(user.id, {
          googleId: googlePayload.googleId,
          image: user.image || googlePayload.picture,
        });
      } else {
        user = await this.usersService.create({
          name: googlePayload.name,
          email: googlePayload.email,
          image: googlePayload.picture,
          googleId: googlePayload.googleId,
        });
      }
    }

    if (!user) {
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
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    const tokens = await this.generateTokensForUser(user);

    return {
      user,
      ...tokens,
    };
  }
}
