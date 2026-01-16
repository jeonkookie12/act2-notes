// src/common/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

/**
 * JWT Strategy
 * Implements Passport JWT strategy for token validation
 * Extracts and validates JWT tokens from Authorization header
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      // Extract JWT token from Authorization header as Bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Do not ignore token expiration
      ignoreExpiration: false,
      // Use JWT secret from environment variables
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  /**
   * Validates the JWT payload and returns user information
   * Called after JWT token is successfully decoded
   * @param {any} payload - Decoded JWT payload
   * @returns {Promise<{sub: number, email: string}>} User information
   * @throws {UnauthorizedException} If user is not found
   */
  async validate(payload: any) {
    // Find user by email from JWT payload
    const user = await this.usersService.findByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    // Return user information to be attached to request object
    return { sub: user.id, email: user.email };
  }
}