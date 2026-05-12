# Smart Attendance & Absence Monitoring SaaS

A production-grade SaaS platform for schools and companies to manage attendance, sessions, and justifications with modern features like dynamic QR codes and advanced analytics.

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: Zustand
- **Data Fetching**: React Query
- **Animations**: Framer Motion

### Backend
- **Runtime**: Node.js + Express
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Auth**: JWT with Refresh Tokens & RBAC
- **Real-time**: Socket.io (WebSockets)

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Security**: Bcrypt, Helmet, Rate Limiting
- **Documentation**: Swagger/OpenAPI

## Project Structure

```text
.
├── frontend/             # Next.js Application
│   ├── src/
│   │   ├── app/         # Routes & Pages
│   │   ├── components/  # UI & Business Components
│   │   ├── hooks/       # Custom React Hooks
│   │   ├── store/       # Zustand Stores
│   │   ├── services/    # API Services
│   │   └── lib/         # Shared Utilities
├── backend/              # Express API
│   ├── src/
│   │   ├── controllers/ # Request Handlers
│   │   ├── middleware/  # Auth & Validation
│   │   ├── routes/      # API Routes
│   │   ├── services/    # Business Logic
│   │   ├── prisma/      # Database Schema
│   │   └── utils/       # Helper Functions
├── docker-compose.yml    # Infrastructure orchestration
└── README.md
```

## Getting Started

1. **Clone the repository**
2. **Setup Backend**:
   - `cd backend`
   - `npm install`
   - Set `.env` variables
   - `npx prisma migrate dev`
3. **Setup Frontend**:
   - `cd frontend`
   - `npm install`
   - Set `.env.local` variables
   - `npm run dev`

## Features

- **RBAC**: Multi-role support (Admin, Teacher, Student, Parent).
- **Dynamic QR**: Secure, expiring QR codes for session attendance.
- **Justification System**: Document upload and approval workflow.
- **Analytics**: Beautiful charts for attendance trends and risk detection.
- **Audit Logs**: Full system activity tracking.
- **Notifications**: Real-time alerts for absences.
# Attendance-monitor
