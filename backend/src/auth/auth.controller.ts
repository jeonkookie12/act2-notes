// src/auth/auth.controller.ts
import { Controller, Post, Body, UsePipes, ValidationPipe, Req, UseGuards, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SetPrivatePasswordDto } from './dto/set-private-password.dto';
import { ValidatePrivatePasswordDto } from './dto/validate-private-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * Extended Request interface for JWT authenticated requests
 * Contains user information extracted from JWT token
 */
interface JwtRequest extends Request {
  user: { sub: number; email: string };
}

/**
 * Authentication controller
 * Handles all HTTP requests related to authentication and authorization
 * All endpoints are prefixed with '/auth'
 */
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /auth/register
   * Registers a new user account
   * Validates the request body using RegisterDto
   * @param {RegisterDto} registerDto - User registration data
   * @returns {Promise<{access_token: string}>} JWT access token
   */
  @Post('register')
  @UsePipes(new ValidationPipe()) // Validate request body against DTO
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * POST /auth/login
   * Authenticates a user and returns a JWT token
   * Validates the request body using LoginDto
   * @param {LoginDto} loginDto - User login credentials
   * @returns {Promise<{access_token: string}>} JWT access token
   */
  @Post('login')
  @UsePipes(new ValidationPipe()) // Validate request body against DTO
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * POST /auth/set-private-password
   * Sets a private password for the authenticated user
   * Requires JWT authentication
   * @param {JwtRequest} req - Request object containing authenticated user information
   * @param {SetPrivatePasswordDto} dto - Private password data
   * @returns {Promise<{message: string}>} Success message
   */
  @Post('set-private-password')
  @UseGuards(JwtAuthGuard) // Require JWT authentication
  @UsePipes(new ValidationPipe()) // Validate request body against DTO
  async setPrivatePassword(@Req() req: JwtRequest, @Body() dto: SetPrivatePasswordDto) {
    return this.authService.setPrivatePassword(req.user.sub, dto);
  }

  /**
   * POST /auth/validate-private-password
   * Validates a private password for the authenticated user
   * Requires JWT authentication
   * @param {JwtRequest} req - Request object containing authenticated user information
   * @param {ValidatePrivatePasswordDto} dto - Private password to validate
   * @returns {Promise<{valid: boolean, message?: string}>} Validation result
   */
  @Post('validate-private-password')
  @UseGuards(JwtAuthGuard) // Require JWT authentication
  @UsePipes(new ValidationPipe()) // Validate request body against DTO
  async validatePrivatePassword(@Req() req: JwtRequest, @Body() dto: ValidatePrivatePasswordDto) {
    return this.authService.validatePrivatePassword(req.user.sub, dto);
  }
}