// src/notes/notes.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './notes.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { UsersService } from '../users/users.service';

/**
 * Notes service
 * Contains all business logic for note management operations
 * Ensures users can only access and modify their own notes
 */
@Injectable()
export class NotesService {
  constructor(
    // Inject the TypeORM repository for Note entity
    @InjectRepository(Note)
    private notesRepository: Repository<Note>,
    // Inject UsersService to access user information
    private usersService: UsersService,   
  ) {}

  /**
   * Retrieves all notes belonging to a specific user
   * Notes are ordered by pinned status (pinned first) and creation date (newest first)
   * @param {number} userId - The ID of the user whose notes to retrieve
   * @returns {Promise<Note[]>} Array of user's notes
   */
  async findAll(userId: number): Promise<Note[]> {
    return this.notesRepository.find({
      where: { user: { id: userId } },
      order: { pinned: 'DESC', created_at: 'DESC' },
    });
  }

  /**
   * Retrieves a single note by its ID (only if it belongs to the specified user)
   * @param {number} id - The note ID
   * @param {number} userId - The ID of the user who owns the note
   * @returns {Promise<Note>} The note with the specified ID
   * @throws {NotFoundException} If the note is not found or doesn't belong to the user
   */
  async findOne(id: number, userId: number): Promise<Note> {
    const note = await this.notesRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  /**
   * Creates a new note for a specific user
   * Sets the creation timestamp automatically
   * @param {CreateNoteDto} createNoteDto - Note data to create
   * @param {number} userId - The ID of the user creating the note
   * @returns {Promise<Note>} The newly created note
   */
  async create(createNoteDto: CreateNoteDto, userId: number): Promise<Note> {
    const user = await this.usersService.findOne(userId);
    const note = this.notesRepository.create({
      ...createNoteDto,
      user,                     
      created_at: new Date(),
    });
    return this.notesRepository.save(note);
  }

  /**
   * Updates an existing note (only if it belongs to the specified user)
   * @param {number} id - The note ID to update
   * @param {UpdateNoteDto} updateNoteDto - Partial note data to update
   * @param {number} userId - The ID of the user who owns the note
   * @returns {Promise<Note>} The updated note
   */
  async update(id: number, updateNoteDto: UpdateNoteDto, userId: number): Promise<Note> {
    const note = await this.findOne(id, userId);
    Object.assign(note, updateNoteDto);
    return this.notesRepository.save(note);
  }

  /**
   * Deletes a note by its ID (only if it belongs to the specified user)
   * @param {number} id - The note ID to delete
   * @param {number} userId - The ID of the user who owns the note
   * @returns {Promise<void>} Promise that resolves when the note is deleted
   */
  async delete(id: number, userId: number): Promise<void> {
    const note = await this.findOne(id, userId);
    await this.notesRepository.delete(note.id);
  }
}