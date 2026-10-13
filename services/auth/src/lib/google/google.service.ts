import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

export interface GooglePayload {
  googleId: string;
  email: string;
  name: string;
  picture: string;
}

@Injectable()
export class GoogleService {
  private readonly logger = new Logger(GoogleService.name);
  private readonly client: OAuth2Client;
  private readonly clientId: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    this.client = new OAuth2Client(this.clientId);
  }

  async verifyIdToken(idToken: string): Promise<GooglePayload> {
    try {
      if (!this.clientId) {
        this.logger.error(
          'GOOGLE_CLIENT_ID is not configured in environment variables',
        );
        throw new UnauthorizedException(
          'GOOGLE_CLIENT_ID is not configured on the server',
        );
      }

      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.clientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid Google token payload');
      }

      if (!payload.email_verified) {
        throw new UnauthorizedException('Google email is not verified');
      }

      if (!payload.email) {
        throw new UnauthorizedException(
          'Google account has no associated email',
        );
      }

      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name ?? '',
        picture: payload.picture ?? '',
      };
    } catch (error) {
      this.logger.error('Google ID token verification failed', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      const reason = error instanceof Error ? error.message : 'Unknown error';
      throw new UnauthorizedException(
        `Failed to verify Google ID token: ${reason}`,
      );
    }
  }
}
