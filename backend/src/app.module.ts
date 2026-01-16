import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { NotesModule } from './notes/notes.module';
import { AuthModule } from './auth/auth.module';

/**
 * Root application module
 * Configures the main application dependencies, database connection, and feature modules
 */
@Module({
  imports: [
    // Configure global ConfigModule to access environment variables
    ConfigModule.forRoot({ isGlobal: true }),
    // Configure TypeORM database connection asynchronously using environment variables
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DATABASE_HOST'),
        port: +configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        // Automatically load all entity files
        entities: [__dirname + '/**/*.entity{.ts,.js}'],

      }),
      inject: [ConfigService],
    }),
    // Import feature modules
    UsersModule,    // User management functionality
    NotesModule,    // Notes management functionality
    AuthModule,     // Authentication and authorization functionality
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}