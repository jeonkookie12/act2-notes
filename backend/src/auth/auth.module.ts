import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

/**
 * Authentication module
 * Configures the authentication feature module with JWT support
 */
@Module({
  imports: [
    // Import UsersModule to access user operations
    UsersModule,
    // Configure JWT module asynchronously using environment variables
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'), // JWT secret key from environment
        signOptions: { expiresIn: '1h' }, // Token expires in 1 hour
      }),
      inject: [ConfigService],
    }),
  ],
  // Register the AuthController to handle HTTP requests
  controllers: [AuthController],
  // Register AuthService and JwtStrategy as providers
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}