import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { RegisterDto } from '../auth/dto/register.dto';
import * as bcrypt from 'bcrypt';

/**
 * Users service
 * Contains all business logic for user management operations
 * Handles user creation, retrieval, and updates
 */
@Injectable()
export class UsersService {
  constructor(
    // Inject the TypeORM repository for User entity
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Finds a user by email address
   * @param {string} email - The email address to search for
   * @returns {Promise<User | null>} The user if found, null otherwise
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  /**
   * Finds a user by ID
   * @param {number} id - The user ID
   * @returns {Promise<User>} The user with the specified ID
   * @throws {NotFoundException} If the user is not found
   */
  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * Creates a new user account
   * Hashes the password before storing it
   * @param {RegisterDto} registerDto - User registration data
   * @returns {Promise<User>} The newly created user
   * @throws {ConflictException} If the email already exists
   */
  async create(registerDto: RegisterDto): Promise<User> {
    const { name, email, password } = registerDto;

    // Check if user with this email already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password with bcrypt (10 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      name,
      email,
      password: hashedPassword,
    });
    return this.usersRepository.save(user);
  }

  /**
   * Updates an existing user with partial data
   * @param {number} id - The user ID to update
   * @param {Partial<User>} updates - Partial user data to update
   * @returns {Promise<void>} Promise that resolves when the user is updated
   * @throws {NotFoundException} If the user is not found
   */
  async update(id: number, updates: Partial<User>): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Apply updates to user object
    Object.assign(user, updates);
    await this.usersRepository.save(user); 
  }
}