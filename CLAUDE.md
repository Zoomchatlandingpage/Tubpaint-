# CLAUDE.md

Claude's 7 Rules
1. First, think about the problem, scan the codebase to find the relevant files, and write a plan in tasks/todo.md.
2. The plan should have a list of tasks that you can mark as complete.
3. Before you start working, contact me and I'll review the plan.
4. Then, start working on the tasks, marking them as complete as you go.
5. Please, at each step of the way, simply give me a detailed explanation of the changes you made.
6. Make each task and code change as simple as possible. We want to avoid massive or complex changes. Each change should have as little impact on the code as possible. It's all about simplicity.
7. Finally, add a review section to the [todo.md](http://todo.md/) file with a summary of the changes made and any other relevant information.


This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RefineAI is an AI-powered quote generation system for bathroom refinishing services. The application allows customers to upload photos and receive instant pricing quotes using AI analysis. Built as a full-stack TypeScript application with React frontend and Express backend.

## Architecture

### Frontend (client/)
- **React 18** with TypeScript and Vite
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend (server/)
- **Express.js** with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **File Upload**: Multer middleware for photo handling
- **Real-time**: WebSocket for chat functionality
- **AI Integration**: Multi-provider support (OpenAI, Anthropic, Google Gemini)

### Shared (shared/)
- **Database Schema**: Drizzle schema definitions with Zod validation
- **Type Definitions**: Shared TypeScript types between client and server

## Common Development Commands

```bash
# Development
npm run dev          # Start development server (client + server with HMR)

# Building
npm run build        # Build for production (client build + server bundle)
npm run start        # Start production server

# Type Checking
npm run check        # Run TypeScript compiler check

# Database
npm run db:push      # Push schema changes to database
```

## Database Schema

The application uses PostgreSQL with Drizzle ORM. Key tables:
- `users`: Admin authentication
- `service_types`: Configurable service offerings with pricing
- `quotes`: Customer quote requests with AI analysis
- `chat_messages`: Real-time chat history
- `admin_config`: System configuration (webhooks, AI providers)

## File Structure

- `client/src/components/ui/`: shadcn/ui component library
- `server/routes.ts`: Main API route definitions
- `server/storage.ts`: Database connection and storage logic
- `shared/schema.ts`: Database schema and type definitions
- `uploads/`: Local file storage for uploaded images

## Path Aliases

- `@/*`: Points to `client/src/*`
- `@shared/*`: Points to `shared/*`
- `@assets/*`: Points to `attached_assets/*`

## Environment Setup

Database configuration via `DATABASE_URL` environment variable. Development uses in-memory storage for rapid prototyping, production uses Neon PostgreSQL.

## AI Integration

Multi-provider AI system supporting OpenAI, Anthropic Claude, and Google Gemini for photo analysis and chat functionality. Configuration managed through admin dashboard.