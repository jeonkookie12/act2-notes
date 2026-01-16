import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './users.entity';

/**
 * Users module
 * Configures the users feature module with its dependencies
 * Exports UsersService for use in other modules (e.g., AuthModule)
 */
@Module({
  // Register the User entity with TypeORM for this module
  imports: [TypeOrmModule.forFeature([User])],
  // Register the UsersService as a provider
  providers: [UsersService],
  // Export UsersService so other modules can use it
  exports: [UsersService],
})
export class UsersModule {}