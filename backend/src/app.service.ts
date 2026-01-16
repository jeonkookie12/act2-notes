import { Injectable } from '@nestjs/common';

/**
 * Root application service
 * Provides basic application-level business logic
 */
@Injectable()
export class AppService {
  /**
   * Returns a simple greeting message
   * @returns {string} Hello World message
   */
  getHello(): string {
    return 'Hello World!';
  }
}
