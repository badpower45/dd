# DeliverEase - Delivery Management System

## Overview

DeliverEase is a multi-role delivery management mobile application built with Expo (React Native) and Express.js backend. The system supports four distinct user roles (Admin, Dispatcher, Restaurant, Driver) with role-based routing and features for managing delivery orders, real-time driver tracking, and order assignment workflows.

The application uses a hybrid architecture with a React Native mobile client that can work with either a local Express.js backend or Supabase for authentication and real-time features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Expo SDK 54+ with React Native 0.81 (Managed Workflow)
- **Navigation**: React Navigation v7 with native stack and bottom tab navigators
- **State Management**: React Context for auth state, TanStack React Query for server state
- **Styling**: Custom theme system with light/dark mode support (not NativeWind despite design docs)
- **Animations**: React Native Reanimated for smooth UI animations
- **Maps**: react-native-maps for dispatcher "God View" and location visualization

### Role-Based Navigation Structure
Each role has isolated navigation stacks:
- **Restaurant**: Tab nav (Orders, Profile) + floating action button for order creation
- **Dispatcher**: Tab nav (Map, Orders, Profile) + order assignment modal
- **Driver**: Tab nav (Tasks, Wallet, Profile) with live location tracking
- **Admin**: Tab nav (Dashboard, Orders, Users, Profile)

### Backend Architecture
- **Server**: Express.js with TypeScript running on port 5000
- **API Design**: RESTful endpoints under `/api/` prefix
- **Storage**: In-memory storage implementation (`MemStorage` class) with PostgreSQL schema defined via Drizzle ORM
- **Database Schema**: Two main tables - `users` (with roles) and `orders` (with status workflow)

### Data Flow
1. Client makes requests to Express API or Supabase directly
2. Local storage (`AsyncStorage`) used for offline-first order management and session persistence
3. Real-time driver location updates use a pub/sub pattern in local storage with subscription callbacks

### Authentication
- Demo mode with hardcoded users (admin, dispatcher, restaurant, driver - all use password "demo123")
- Session persistence via AsyncStorage
- Role-based redirect after login to appropriate navigator

### Key Features Implementation
- **Address Geocoding**: Uses `expo-location` geocodeAsync with Cairo fallback coordinates
- **Driver Location Tracking**: `Location.watchPositionAsync` with 10s/50m update intervals
- **Dispatcher Map**: Real-time driver markers + pending order pins with Supabase Realtime subscriptions (when configured)

## External Dependencies

### Third-Party Services
- **Supabase** (Optional): Auth, Database, and Realtime subscriptions - configured via `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` environment variables
- **Expo Location**: For geocoding addresses and driver GPS tracking

### Database
- **PostgreSQL**: Schema defined in `shared/schema.ts` using Drizzle ORM
- **Drizzle Kit**: For database migrations (`drizzle.config.ts`)
- Tables: `users` (id, email, password, role, fullName, phoneNumber) and `orders` (full delivery order details with status workflow)

### Key npm Dependencies
- `@supabase/supabase-js`: Supabase client for auth and realtime
- `@tanstack/react-query`: Server state management
- `react-native-maps`: Map visualization for dispatcher view
- `expo-location`: GPS and geocoding services
- `drizzle-orm` + `drizzle-zod`: Type-safe database schema with validation
- `lucide-react-native`: Icon library

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string (for Drizzle migrations)
- `EXPO_PUBLIC_SUPABASE_URL`: Supabase project URL (optional)
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key (optional)
- `EXPO_PUBLIC_DOMAIN`: Domain for API requests in production