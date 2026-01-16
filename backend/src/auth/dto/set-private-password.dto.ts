import { IsString, MinLength, Matches } from 'class-validator';

/**
 * Data Transfer Object for setting a private password
 * Private passwords are used to protect private notes
 * Requires password and confirmation to match
 */
export class SetPrivatePasswordDto {
  /**
   * Private password
   * Must be at least 6 characters
   */
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  /**
   * Password confirmation
   * Must match the password field
   * Must be at least 6 characters
   */
  @IsString()
  @MinLength(6)
  confirm: string;
}