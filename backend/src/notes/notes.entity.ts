import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/users.entity';

/**
 * Note entity
 * Represents a note in the database
 * Maps to the 'notes' table in MySQL
 * Each note belongs to a user
 */
@Entity('notes')
export class Note {
  /**
   * Primary key - auto-generated unique identifier for each note
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Note title
   * Maximum length: 255 characters
   */
  @Column({ length: 255 })
  title: string;

  /**
   * Note content/body
   * Stored as text to support long content
   */
  @Column({ type: 'text' })
  content: string;

  /**
   * Background color of the note
   * Defaults to white (#ffffff)
   */
  @Column({ default: '#ffffff' })
  color: string;

  /**
   * Whether the note is pinned to the top
   * Defaults to false
   */
  @Column({ default: false })
  pinned: boolean;

  /**
   * Whether the note is private (requires private password to view)
   * Defaults to false
   */
  @Column({ default: false })
  is_private: boolean;

  /**
   * Timestamp when the note was created
   * Automatically set to current timestamp
   */
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  /**
   * Foreign key reference to the user who owns this note
   * Maps to the 'userId' column in the database
   */
  @Column({ name: 'userId' })
  userId: number;

  /**
   * Many-to-One relationship with User entity
   * Many notes can belong to one user
   */
  @ManyToOne(() => User, (user) => user.notes)
  @JoinColumn({ name: 'userId' })  
  user: User;
}