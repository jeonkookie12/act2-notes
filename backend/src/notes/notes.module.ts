import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { Note } from './notes.entity';
import { UsersModule } from '../users/users.module';

/**
 * Notes module
 * Configures the notes feature module with its dependencies
 */
@Module({
  // Register the Note entity with TypeORM and import UsersModule for user operations
  imports: [TypeOrmModule.forFeature([Note]), UsersModule],
  // Register the NotesController to handle HTTP requests
  controllers: [NotesController],
  // Register the NotesService as a provider
  providers: [NotesService],
})
export class NotesModule {}