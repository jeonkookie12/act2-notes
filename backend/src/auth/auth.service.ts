import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SetPrivatePasswordDto } from './dto/set-private-password.dto';
import { ValidatePrivatePasswordDto } from './dto/validate-private-password.dto';
import * as bcrypt from 'bcrypt';

/**
 * Authentication service
 * Contains all business logic for authentication and authorization
 * Handles user registration, login, and private password management
 */
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Registers a new user and returns a JWT access token
   * @param {RegisterDto} registerDto - User registration data
   * @returns {Promise<{access_token: string}>} JWT access token
   */
  async register(registerDto: RegisterDto): Promise<{ access_token: string }> {
    const user = await this.usersService.create(registerDto);
    // Create JWT payload with user email and ID
    const payload = { email: user.email, sub: user.id };
    return { access_token: this.jwtService.sign(payload) };
  }

  /**
   * Authenticates a user and returns a JWT access token
   * Validates email and password against stored credentials
   * @param {LoginDto} loginDto - User login credentials
   * @returns {Promise<{access_token: string}>} JWT access token
   * @throws {UnauthorizedException} If credentials are invalid
   */
  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail(email);
    // Compare provided password with hashed password in database
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // Create JWT payload with user email and ID
    const payload = { email: user.email, sub: user.id };
    return { access_token: this.jwtService.sign(payload) };
  }

  /**
   * Sets a private password for a user
   * Private passwords are used to protect private notes
   * @param {number} userId - The ID of the user
   * @param {SetPrivatePasswordDto} dto - Private password data (password and confirmation)
   * @returns {Promise<{message: string}>} Success message
   * @throws {BadRequestException} If passwords do not match
   */
  async setPrivatePassword(
    userId: number,
    dto: SetPrivatePasswordDto,
  ): Promise<{ message: string }> {
    if (dto.password !== dto.confirm) {
      throw new BadRequestException('Passwords do not match');
    }
    // Hash the private password with bcrypt (10 salt rounds)
    const hash = await bcrypt.hash(dto.password, 10);

    // Update user with hashed private password
    await this.usersService.update(userId, { private_password_hash: hash });

    return { message: 'Private password set' };
  }

  /**
   * Validates a private password for a user
   * Used to verify access to private notes
   * @param {number} userId - The ID of the user
   * @param {ValidatePrivatePasswordDto} dto - Private password to validate
   * @returns {Promise<{valid: boolean, message?: string}>} Validation result
   */
  async validatePrivatePassword(
    userId: number,
    dto: ValidatePrivatePasswordDto,
  ): Promise<{ valid: boolean; message?: string }> {
    const user = await this.usersService.findOne(userId);

    // Check if user has set a private password
    if (!user.private_password_hash) {
      return { valid: false, message: 'No private password set' };
    }

    // Compare provided password with stored hash
    const match = await bcrypt.compare(dto.password, user.private_password_hash);
    return { valid: match };
  }
}