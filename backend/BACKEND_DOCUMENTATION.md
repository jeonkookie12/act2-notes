# Act2-Notes - Backend Documentation

## Overview
A secure notes management API with user authentication. Users can create, read, update, and delete their own notes. Features JWT-based authentication and private password protection for sensitive notes.

## Architecture

### Technology Stack
- **Framework**: NestJS
- **Database**: MySQL with TypeORM
- **Authentication**: JWT (JSON Web Tokens) with Passport
- **Password Hashing**: bcrypt
- **Language**: TypeScript

### Project Structure
```
backend/src/
├── main.ts                 # Application entry point
├── app.module.ts          # Root module configuration
├── auth/                   # Authentication module
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts    # Passport JWT strategy
│   ├── jwt-auth.guard.ts  # Route protection guard
│   └── dto/
│       ├── login.dto.ts
│       ├── register.dto.ts
│       ├── set-private-password.dto.ts
│       └── validate-private-password.dto.ts
├── users/                  # User management module
│   ├── users.module.ts
│   ├── users.service.ts
│   └── users.entity.ts
└── notes/                  # Notes feature module
    ├── notes.module.ts
    ├── notes.controller.ts
    ├── notes.service.ts
    ├── notes.entity.ts
    └── dto/
        ├── create-note.dto.ts
        └── update-note.dto.ts
```

## File-by-File Breakdown

### 1. `main.ts`
**Purpose**: Application bootstrap and server configuration

**Process**:
1. Creates NestJS application instance
2. Enables CORS with specific configuration:
   - Allows requests from `http://localhost:5173`
   - Allows `Authorization` header for JWT tokens
   - Enables credentials
3. Starts HTTP server on port 3000

**Key Features**:
- CORS configured for JWT authentication
- Authorization header support

### 2. `app.module.ts`
**Purpose**: Root application module - configures all dependencies

**Process**:
1. Imports `ConfigModule` globally for environment variables
2. Configures TypeORM with async factory:
   - Reads database config from `.env`
   - Auto-loads entities
3. Imports feature modules: `UsersModule`, `NotesModule`, `AuthModule`

### 3. `users.entity.ts`
**Purpose**: Defines User database table structure

**Properties**:
- `id`: Primary key
- `email`: User email (unique)
- `password`: Hashed password
- `private_password_hash`: Optional private password for note protection
- `created_at`: Creation timestamp

### 4. `users.service.ts`
**Purpose**: User data management

**Methods**:
- `create()`: Creates new user with hashed password
- `findOne()`: Finds user by ID
- `findByEmail()`: Finds user by email
- `update()`: Updates user fields

**Process**:
- Uses bcrypt to hash passwords before storage
- Validates email uniqueness

### 5. `auth.module.ts`
**Purpose**: Authentication module configuration

**Process**:
1. Imports `JwtModule` with secret from environment
2. Imports `PassportModule` with JWT strategy
3. Registers `AuthService` and `JwtStrategy`
4. Exports `AuthService` and `JwtModule`

### 6. `jwt.strategy.ts`
**Purpose**: Defines how JWT tokens are validated

**Process**:
1. Extracts token from `Authorization: Bearer <token>` header
2. Validates token signature using secret
3. Extracts user information from token payload
4. Returns user object for request

### 7. `jwt-auth.guard.ts`
**Purpose**: Protects routes requiring authentication

**Process**:
1. Checks if valid JWT token is present
2. Validates token using JwtStrategy
3. Attaches user information to request object
4. Blocks request if token is invalid/missing

### 8. `auth.service.ts`
**Purpose**: Authentication business logic

**Methods**:

#### `register(registerDto)`
- **Process**:
  1. Creates new user via UsersService
  2. Generates JWT token with user email and ID
  3. Returns access token
- **Returns**: `{ access_token: string }`

#### `login(loginDto)`
- **Process**:
  1. Finds user by email
  2. Compares provided password with hashed password
  3. Throws `UnauthorizedException` if invalid
  4. Generates and returns JWT token
- **Returns**: `{ access_token: string }`

#### `setPrivatePassword(userId, dto)`
- **Process**:
  1. Validates password confirmation matches
  2. Hashes private password with bcrypt
  3. Updates user's `private_password_hash`
- **Returns**: Success message

#### `validatePrivatePassword(userId, dto)`
- **Process**:
  1. Checks if user has private password set
  2. Compares provided password with stored hash
  3. Returns validation result
- **Returns**: `{ valid: boolean, message?: string }`

### 9. `auth.controller.ts`
**Purpose**: Authentication endpoints

**Endpoints**:
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/set-private-password` - Set private password (protected)
- `POST /auth/validate-private-password` - Validate private password (protected)

**Process**:
- Uses `ValidationPipe` to validate DTOs
- Uses `JwtAuthGuard` to protect certain routes

### 10. `notes.entity.ts`
**Purpose**: Defines Note database table structure

**Properties**:
- `id`: Primary key
- `title`: Note title
- `content`: Note content
- `pinned`: Whether note is pinned (boolean)
- `user`: Foreign key to User (many-to-one relationship)
- `created_at`: Creation timestamp

### 11. `notes.service.ts`
**Purpose**: Notes business logic with user isolation

**Methods**:

#### `findAll(userId)`
- **Process**:
  1. Queries notes filtered by user ID
  2. Orders by pinned status (pinned first), then creation date (newest first)
- **Returns**: Array of user's notes

#### `findOne(id, userId)`
- **Process**:
  1. Finds note by ID and user ID
  2. Throws `NotFoundException` if not found or doesn't belong to user
- **Returns**: Single note

#### `create(createNoteDto, userId)`
- **Process**:
  1. Gets user object from UsersService
  2. Creates note with user relationship
  3. Sets creation timestamp
  4. Saves to database
- **Returns**: Created note

#### `update(id, updateNoteDto, userId)`
- **Process**:
  1. Verifies note belongs to user (via `findOne`)
  2. Updates note fields
  3. Saves changes
- **Returns**: Updated note

#### `delete(id, userId)`
- **Process**:
  1. Verifies note belongs to user
  2. Deletes note from database
- **Returns**: Promise that resolves when deleted

### 12. `notes.controller.ts`
**Purpose**: Notes HTTP endpoints (all protected)

**Endpoints**:
- `GET /notes` - Get all user's notes
- `GET /notes/:id` - Get single note
- `POST /notes` - Create note
- `PUT /notes/:id` - Update note
- `DELETE /notes/:id` - Delete note

**Process**:
- All routes protected with `@UseGuards(JwtAuthGuard)`
- Extracts user ID from JWT token (`req.user.sub`)
- Passes user ID to service methods for data isolation

## Data Flow

### User Registration
```
Client Request (POST /auth/register)
    ↓
AuthController.register()
    ↓
AuthService.register()
    ↓
UsersService.create() → Hash password
    ↓
Save to Database
    ↓
Generate JWT Token
    ↓
Response ({ access_token })
```

### Creating a Note (Authenticated)
```
Client Request (POST /notes)
    ↓
JwtAuthGuard validates token
    ↓
NotesController.create() → Extracts userId from token
    ↓
NotesService.create()
    ↓
Associate note with user
    ↓
Save to Database
    ↓
Response (Note object)
```

### Reading User's Notes
```
Client Request (GET /notes)
    ↓
JwtAuthGuard validates token
    ↓
NotesController.findAll() → Extracts userId
    ↓
NotesService.findAll(userId)
    ↓
Query filtered by userId
    ↓
Response (Array of user's notes)
```

## Database Schema

### Users Table
```sql
CREATE TABLE user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    private_password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Notes Table
```sql
CREATE TABLE note (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    pinned BOOLEAN DEFAULT FALSE,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id)
);
```

## Environment Variables

Required in `.env` file:
```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_NAME=notes_db
JWT_SECRET=your-secret-key-here
```

## Security Features

1. **Password Hashing**: All passwords hashed with bcrypt (10 salt rounds)
2. **JWT Authentication**: Secure token-based authentication
3. **Route Protection**: Guards prevent unauthorized access
4. **User Isolation**: Users can only access their own notes
5. **Private Password**: Additional password protection for sensitive notes

## Error Handling

- **401 Unauthorized**: Invalid credentials or missing/invalid token
- **404 Not Found**: Note doesn't exist or doesn't belong to user
- **400 Bad Request**: Invalid input data or password mismatch

## Testing Recommendations

1. Test registration and login flows
2. Test accessing notes without token (should fail)
3. Test accessing other users' notes (should fail)
4. Test private password functionality
5. Test note CRUD operations
6. Verify JWT token expiration handling


