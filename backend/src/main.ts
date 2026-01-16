import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Bootstrap function to initialize and start the NestJS application
 * This is the entry point of the Notes application
 */
async function bootstrap() {
  // Create the NestJS application instance
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS (Cross-Origin Resource Sharing) to allow frontend requests
  // Configured to allow requests from the frontend with authorization headers
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization', // Allow JWT tokens in Authorization header
    credentials: true,
  });
  // Start the server on port 3000
  await app.listen(3000);
}
bootstrap();