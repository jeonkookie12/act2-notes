import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UsePipes, ValidationPipe, Request } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from 'src/users/users.entity';

/**
 * Notes controller
 * Handles all HTTP requests related to note management
 * All endpoints require JWT authentication
 * All endpoints are prefixed with '/notes'
 */
@Controller('notes')
@UseGuards(JwtAuthGuard) // Protect all routes in this controller with JWT authentication
export class NotesController {
  notesRepository: any;
  constructor(private notesService: NotesService) {}

  /**
   * GET /notes
   * Retrieves all notes belonging to the authenticated user
   * Notes are ordered by pinned status (pinned first) and creation date (newest first)
   * @param {Request} req - Request object containing authenticated user information
   * @returns {Promise<Note[]>} Array of user's notes
   */
  @Get()
  async findAll(@Request() req) {
    return this.notesService.findAll(req.user.sub);  
  }

  /**
   * GET /notes/:id
   * Retrieves a single note by its ID (only if it belongs to the authenticated user)
   * @param {string} id - The note ID from the URL parameter
   * @param {Request} req - Request object containing authenticated user information
   * @returns {Promise<Note>} The note with the specified ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.notesService.findOne(+id, req.user.sub);
  }

  /**
   * POST /notes
   * Creates a new note for the authenticated user
   * Validates the request body using CreateNoteDto
   * @param {CreateNoteDto} createNoteDto - Note data from the request body
   * @param {Request} req - Request object containing authenticated user information
   * @returns {Promise<Note>} The newly created note
   */
  @Post()
  @UsePipes(new ValidationPipe()) // Validate request body against DTO
  async create(@Body() createNoteDto: CreateNoteDto, @Request() req) {
    return this.notesService.create(createNoteDto, req.user.sub);
  }

  /**
   * PUT /notes/:id
   * Updates an existing note (only if it belongs to the authenticated user)
   * @param {string} id - The note ID from the URL parameter
   * @param {UpdateNoteDto} updateNoteDto - Partial note data to update
   * @param {Request} req - Request object containing authenticated user information
   * @returns {Promise<Note>} The updated note
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto, @Request() req) {
    return this.notesService.update(+id, updateNoteDto, req.user.sub);
  }

  /**
   * DELETE /notes/:id
   * Deletes a note by its ID (only if it belongs to the authenticated user)
   * @param {string} id - The note ID from the URL parameter
   * @param {Request} req - Request object containing authenticated user information
   * @returns {Promise<{message: string}>} Success message
   */
  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    await this.notesService.delete(+id, req.user.sub);
    return { message: 'Note deleted' };
  }
}