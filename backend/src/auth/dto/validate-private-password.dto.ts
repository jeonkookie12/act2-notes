import { IsString } from 'class-validator';

/**
 * Data Transfer Object for validating a private password
 * Used to verify access to private notes
 */
export class ValidatePrivatePasswordDto {
  /**
   * Private password to validate
   */
  @IsString()
  password: string;
}