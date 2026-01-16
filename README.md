# Act2 - Notes Application

A full-stack Notes application with authentication and private notes functionality, built with NestJS backend and React frontend.

## 🚀 Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **JWT** - JSON Web Token authentication
- **RESTful API** - Standard HTTP methods

### Frontend
- **React** - UI library
- **Vite** - Fast build tool
- **CSS** - Styling

## 📁 Project Structure

```
Act2-Notes/
├── backend/              # NestJS REST API
│   ├── src/
│   │   ├── auth/         # Authentication module (JWT, login, register)
│   │   ├── users/        # Users module (entity, service, controller)
│   │   ├── notes/        # Notes module (CRUD operations)
│   │   └── main.ts       # Entry point
│   └── package.json
└── frontend/             # React application
    ├── src/
    │   ├── App.jsx       # Main component
    │   └── main.jsx      # Entry point
    └── package.json
```

## 🎯 Features

### Authentication
- ✅ User registration
- ✅ User login with JWT
- ✅ Protected routes
- ✅ Token-based authentication

### Notes Management
- ✅ Create notes
- ✅ View all user notes
- ✅ Update notes
- ✅ Delete notes
- ✅ Private notes with password protection
- ✅ Set/validate private note passwords

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file in the backend directory
   - Add the following variables:
     ```
     JWT_SECRET=your_jwt_secret_key
     PORT=3000
     ```

4. Start the development server:
   ```bash
   npm run start:dev
   ```

The backend will run on `http://localhost:3000` (default)

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (if needed):
   - Create a `.env` file in the frontend directory
   - Add your API base URL:
     ```
     VITE_API_URL=http://localhost:3000
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173` (default for Vite)

## 📝 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user and receive JWT token

### Notes
- `GET /notes` - Get all notes for authenticated user
- `GET /notes/:id` - Get note by ID
- `POST /notes` - Create new note
- `PATCH /notes/:id` - Update note
- `DELETE /notes/:id` - Delete note
- `POST /notes/:id/set-private-password` - Set password for private note
- `POST /notes/:id/validate-private-password` - Validate private note password

### Users
- `GET /users` - Get all users (admin)
- `GET /users/:id` - Get user by ID

## 🔐 Authentication Flow

1. **Register**: Create a new account with username and password
2. **Login**: Receive a JWT token
3. **Protected Requests**: Include the token in the Authorization header:
   ```
   Authorization: Bearer <your_jwt_token>
   ```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm run test
```

### End-to-End Tests
```bash
cd backend
npm run test:e2e
```

## 📚 Documentation

- Backend API documentation: [backend/BACKEND_DOCUMENTATION.md](backend/BACKEND_DOCUMENTATION.md)
- Backend README: [backend/README.md](backend/README.md)
- Frontend README: [frontend/README.md](frontend/README.md)

## 👨‍💻 Development

### Backend Architecture
The backend uses NestJS with the following structure:
- **Auth Module** - Handles user authentication with JWT strategy
- **Users Module** - Manages user entities and operations
- **Notes Module** - Handles note CRUD operations and privacy features
- **DTOs** - Data validation for requests
- **Entities** - Database models using TypeORM/other ORM

### Frontend Development
The frontend is built with React and uses:
- Functional components with hooks
- State management for authentication
- Protected routes for authenticated users
- API integration with JWT tokens

## 🔒 Private Notes

Private notes require an additional password:
1. Create a note
2. Set it as private and provide a password
3. Access requires both user authentication and the private password

## 🚢 Deployment

Refer to individual README files in backend and frontend directories for deployment instructions.

## 📄 License

This project is part of Laboratory Activities coursework.
