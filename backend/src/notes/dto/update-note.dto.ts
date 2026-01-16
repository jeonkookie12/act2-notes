import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';

/**
 * Data Transfer Object for updating an existing note
 * All fields are optional, allowing partial updates
 * Includes validation decorators to ensure data integrity
 */
export class UpdateNoteDto {
  /**
   * Note title - optional, maximum 80 characters
   */
  @IsString()
  @MaxLength(80, { message: 'Title must be at most 80 characters' })
  @IsOptional()
  title?: string;

  /**
   * Note content/body - optional
   */
  @IsString()
  @IsOptional()
  content?: string;

  /**
   * Background color of the note - optional
   */
  @IsString()
  @IsOptional()
  color?: string;

  /**
   * Whether the note should be pinned - optional
   */
  @IsBoolean()
  @IsOptional()
  pinned?: boolean;

  /**
   * Whether the note is private - optional
   */
  @IsBoolean()
  @IsOptional()
  is_private?: boolean;
}
