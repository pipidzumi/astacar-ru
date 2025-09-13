# Astacar C2C Car Auction Platform

## Overview

Astacar is a production-ready MVP for a C2C (consumer-to-consumer) used car auction platform specifically designed for the Russian market. The platform facilitates secure, transparent car auctions with features including identity verification, expert vehicle inspections, time-bound bidding with anti-sniping mechanisms, refundable deposits, and escrow-like payment processing. The system supports both buyers and sellers with comprehensive admin tools for moderation and management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with React and TypeScript, utilizing modern component-based architecture with:
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system for auction-specific themes
- **State Management**: React Context API for filter management, React Hook Form for form handling
- **Routing**: React Router for client-side navigation
- **Real-time Updates**: Planned integration with Supabase Realtime for live auction updates

### Backend Architecture
The system follows a dual-architecture approach:
- **Primary Backend**: Supabase Edge Functions for secure server-side operations
- **Secondary Backend**: Express.js server with Drizzle ORM for database operations
- **Authentication**: JWT-based authentication with role-based access control
- **Security**: Row Level Security (RLS) policies, input sanitization, rate limiting

### Database Design
PostgreSQL database with comprehensive schema including:
- **User Management**: Users, profiles, KYC verification
- **Auction System**: Listings, bids, deposits, transactions
- **Content Management**: Media uploads, Q&A threads, audit logs
- **Administration**: Notifications, settings, dispute resolution

### Key Business Logic Components

#### Auction Engine
- Time-bound auctions with automatic extensions to prevent sniping
- Server-authoritative bid validation with atomic transactions
- Deposit requirement enforcement before bidding eligibility
- Reserve price handling and no-reserve auction support

#### Security Layer
- Multi-level authentication (guest, buyer, seller, expert, moderator, admin)
- Input sanitization for all user-generated content
- Audit logging for sensitive operations
- Rate limiting to prevent abuse

#### Filter System
- Comprehensive vehicle filtering matching auto.ru standards
- Dependent selects for make/model/generation
- Advanced facets for condition, history, auction parameters
- URL synchronization and saved searches functionality

## External Dependencies

### Core Infrastructure
- **Supabase**: Primary backend-as-a-service for authentication, database, and edge functions
- **Neon Database**: PostgreSQL hosting (configured as backup/alternative to Supabase)
- **Drizzle ORM**: Type-safe database operations and migrations

### Frontend Libraries
- **React**: Core UI framework
- **TypeScript**: Type safety and development experience
- **Tailwind CSS**: Utility-first styling framework
- **shadcn/ui**: Pre-built component library
- **React Router**: Client-side routing
- **React Hook Form**: Form management with validation
- **TanStack Query**: Server state management

### Development Tools
- **Vite**: Build tool and development server
- **ESLint**: Code linting and quality enforcement
- **PostCSS**: CSS processing and optimization
- **date-fns**: Date manipulation and formatting

### Planned Integrations
- **Payment Gateways**: For deposit and transaction processing
- **SMS/Email Services**: For notifications and verification
- **Image Processing**: For media optimization and quality scoring
- **Map Services**: For location-based filtering and logistics