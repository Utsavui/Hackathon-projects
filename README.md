# Innovation Hacks — AI Productivity Platform

A production-style full-stack project covering all four internship tasks.

## Tasks covered

### Task 1 — Modern Frontend
- Responsive dashboard
- Accessible navigation
- User/profile area
- Project and task cards
- Progress indicators
- Search and filtering
- Loading, empty and error states
- Reusable React components

### Task 2 — Backend & REST API
- User registration/login
- Project CRUD
- Task CRUD
- Task status management
- Validation
- Centralized error handling
- Meaningful HTTP status codes
- Environment configuration
- API documentation in this README

### Task 3 — Database Integration
- MongoDB + Mongoose
- User, Project and Task models
- References between entities
- Schema validation
- CRUD persistence
- No hard-coded database credentials

### Task 4 — Final Full-Stack Application
- Authentication + protected routes
- Project dashboard
- Task statistics
- Project management
- Task assignment/status/priority/due date
- Search/filter
- AI task generation
- AI productivity suggestions
- Responsive UI
- Ready for Vercel/Netlify + Render/Railway deployment

## Setup

Requirements:
- Node.js 18+
- MongoDB local installation OR MongoDB Atlas

Then:

```bash
npm install
npm --prefix server install
npm --prefix client install
cp server/.env.example server/.env
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

## Environment

`server/.env`

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/innovation_hacks
JWT_SECRET=replace_with_a_long_random_secret
OPENAI_API_KEY=
CLIENT_URL=http://localhost:5173
```

OPENAI_API_KEY is optional. Without it, the AI endpoints use a useful local fallback so the application still works.

## API

### Auth
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`

### Projects
- GET `/api/projects`
- GET `/api/projects/:id`
- POST `/api/projects`
- PUT `/api/projects/:id`
- DELETE `/api/projects/:id`

### Tasks
- GET `/api/tasks`
- GET `/api/tasks/:id`
- POST `/api/tasks`
- PUT `/api/tasks/:id`
- DELETE `/api/tasks/:id`

Task status:
`todo | in-progress | done`

Task priority:
`low | medium | high | urgent`

### AI
- POST `/api/ai/generate-tasks`
- POST `/api/ai/productivity`

## Security
Never commit `.env`, passwords, database credentials or API keys.
