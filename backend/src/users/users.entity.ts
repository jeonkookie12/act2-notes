import { Entity, Column, PrimaryGeneratedColumn, Index, OneToMany } from 'typeorm';
import { Note } from '../notes/notes.entity';

/**
 * User entity
 * Represents a user in the database
 * Maps to the 'users' table in MySQL
 * Each user can have multiple notes
 */
@Entity('users')
export class User {
  /**
   * Primary key - auto-generated unique identifier for each user
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * User's email address
   * Unique index ensures no duplicate emails
   * Maximum length: 255 characters
   */
  @Index({ unique: true })
  @Column({ length: 255 })
  email: string;

  /**
   * User's hashed password
   * Stored as bcrypt hash, never as plain text
   * Maximum length: 255 characters
   */
  @Column({ length: 255 })
  password: string;

  /**
   * User's full name
   * Maximum length: 100 characters
   */
  @Column({ length: 100 })
  name: string;

  /**
   * One-to-Many relationship with Note entity
   * One user can have many notes
   */
  @OneToMany(() => Note, (note) => note.user)
  notes: Note[];

  /**
   * Hashed private password for accessing private notes
   * Optional - only set if user has configured a private password
   * Stored as bcrypt hash
   */
  @Column({ name: 'private_password_hash', nullable: true })
  private_password_hash?: string;
}