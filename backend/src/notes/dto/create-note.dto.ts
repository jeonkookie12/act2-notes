import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';

/**
 * Data Transfer Object for creating a new note
 * Defines the structure of data required to create a note
 * Includes validation decorators to ensure data integrity
 */
export class CreateNoteDto {
  /**
   * Note title - required, maximum 80 characters
   */
  @IsString()
  @MaxLength(80, { message: 'Title must be at most 80 characters' })
  title: string;

  /**
   * Note content/body - required
   */
  @IsString()
  content: string;

  /**
   * Background color of the note - optional
   */
  @IsString()
  @IsOptional()
  color: string;

  /**
   * Whether the note should be pinned - optional
   */
  @IsBoolean()
  @IsOptional()
  pinned: boolean;

  /**
   * Whether the note is private (requires private password) - required
   */
  @IsBoolean()
  is_private: boolean;
}