# Overview

RefineAI is an AI-powered quote generation system for bathroom refinishing services. The application allows customers to upload photos of their bathrooms and receive instant, accurate pricing quotes using AI analysis. It features a modern landing page with service showcases, an AI chat assistant, a quote generation system, and an admin dashboard for managing services and configurations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Library**: Radix UI components with shadcn/ui design system for consistent, accessible interface
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

## Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **File Upload**: Multer middleware for handling photo uploads with size and type validation
- **Real-time Communication**: WebSocket server for chat functionality
- **Development**: Vite integration for development mode with HMR

## Database Design
- **Users**: Admin authentication and user management
- **Service Types**: Configurable service offerings with pricing parameters
- **Quotes**: Customer quote requests with AI analysis and pricing
- **Chat Messages**: Real-time chat history with AI assistant
- **Admin Config**: System configuration for webhooks and AI providers

## AI Integration
- **Multi-Provider Support**: Configurable AI providers (OpenAI, Anthropic, Google Gemini)
- **Photo Analysis**: AI-powered analysis of uploaded bathroom photos
- **Dynamic Pricing**: Intelligent pricing based on complexity, area, and condition assessment
- **Chat Assistant**: Real-time AI chat for customer support and design assistance

## Storage Strategy
- **Development**: In-memory storage implementation for rapid prototyping
- **Production**: PostgreSQL database with Neon serverless for scalability
- **File Storage**: Local upload directory with multer (configurable for cloud storage)

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL for production data storage
- **Drizzle Kit**: Database migration and schema management

## AI Services
- **Anthropic Claude**: Advanced AI for photo analysis and chat
- **Google Gemini**: Alternative AI provider for content generation
- **OpenAI**: Fallback AI service for compatibility

## Development Tools
- **Vite**: Build tool and development server with React plugin
- **ESBuild**: Fast bundling for production builds
- **TypeScript**: Type safety across frontend and backend

## UI Components
- **Radix UI**: Headless UI component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography

## File Upload
- **Multer**: Express middleware for multipart/form-data handling
- **Local Storage**: File system storage for uploaded images

## Real-time Features
- **WebSocket**: Native WebSocket implementation for chat functionality
- **Session Management**: UUID-based session tracking for chat continuity