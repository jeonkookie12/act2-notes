import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Root application controller
 * Handles basic application-level HTTP requests
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * GET endpoint for root path
   * Returns a simple hello message to verify the API is running
   * @returns {string} Hello World message
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
