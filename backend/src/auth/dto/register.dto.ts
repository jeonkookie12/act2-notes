import { IsString, IsEmail, MinLength, Matches } from 'class-validator';

/**
 * Data Transfer Object for user registration
 * Defines the structure of data required to register a new user
 * Includes strict validation rules for security
 */
export class RegisterDto {
  /**
   * User's full name
   * Must contain only letters and spaces
   */
  @IsString()
  @Matches(/^[A-Za-z\s]+$/, { message: 'Name should contain only letters and spaces' })
  name: string;

  /**
   * User's email address
   * Must be a valid email format
   */
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  /**
   * User's password
   * Must be at least 12 characters and include:
   * - At least one lowercase letter
   * - At least one uppercase letter
   * - At least one number
   * - At least one special character
   */
  @IsString()
  @MinLength(12, { message: 'Password must be at least 12 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/, {
    message: 'Password must include uppercase, lowercase, number, and special character',
  })
  password: string;
}