import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { Cookies } from '../../common/decorators/cookies.decorator';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../common/decorators/current-user.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setRefreshTokenCookie(res: Response, token: string) {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Login successful')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);
    this.setRefreshTokenCookie(res, result.refreshToken);
    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Google login successful')
  async googleLogin(
    @Body() googleLoginDto: GoogleLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.googleLogin(googleLoginDto);
    this.setRefreshTokenCookie(res, result.refreshToken);
    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @UseGuards(AuthGuard)
  @Put('update-role')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Role updated successfully')
  async updateRole(
    @CurrentUser('id') userId: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.updateRole(userId, updateRoleDto);
    this.setRefreshTokenCookie(res, result.refreshToken);
    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post(['token-refresh', 'refresh-token'])
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Access token refreshed successfully')
  async refreshToken(
    @Cookies('refreshToken') token: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!token) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const result = await this.authService.refreshTokens(token);
    this.setRefreshTokenCookie(res, result.refreshToken);
    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Logged out successfully')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    });
    return { success: true };
  }

  @UseGuards(AuthGuard)
  @Get('user-profile')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('User profile fetched successfully')
  userProfile(@CurrentUser() user: CurrentUserPayload | null) {
    return user;
  }
}
