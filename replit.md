# Saree E-commerce Application

## Overview

This is a full-stack e-commerce application built for selling sarees online. The application features a modern React frontend with TypeScript, a Node.js/Express backend, and uses PostgreSQL with Drizzle ORM for data persistence. The app includes comprehensive functionality for browsing products, managing cart and wishlist, user authentication, and order processing.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with custom saree-themed color palette
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: TanStack Query for server state, React hooks for local state
- **Animations**: GSAP for smooth page transitions and interactions
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: MongoDB with Mongoose ODM
- **Database Provider**: MongoDB Atlas (cluster0.fs4vkd7.mongodb.net)
- **Session Management**: In-memory sessions with fallback storage
- **API Design**: RESTful API with JSON responses

### Key Components

#### Database Schema
The application uses a comprehensive database schema with the following main entities:
- **Users**: Customer accounts with authentication
- **Categories**: Product categorization (Silk, Cotton, Banarasi, etc.)
- **Products**: Saree listings with detailed attributes (fabric, color, price, images)
- **Cart**: Shopping cart functionality
- **Wishlist**: Saved items for later
- **Orders**: Order management with order items
- **Addresses**: Customer shipping addresses
- **Reviews**: Product reviews and ratings

#### Authentication System
- Multiple authentication methods: email/password and OTP-based phone authentication
- Session-based authentication using PostgreSQL storage
- User registration and login flows
- Authentication state management with custom hooks

#### Product Management
- Product catalog with filtering and search capabilities
- Category-based navigation
- Product detail views with image galleries
- Rating and review system
- Related product recommendations

#### Shopping Experience
- Shopping cart with persistent storage
- Wishlist functionality
- Product quick view modals
- Responsive design for mobile and desktop
- Search functionality with filters (price, fabric, color, etc.)

## Data Flow

1. **Product Discovery**: Users browse categories or search for products
2. **Product Interaction**: Users can view details, add to cart/wishlist
3. **Authentication**: Users authenticate via email/password or phone OTP
4. **Cart Management**: Items are managed in PostgreSQL-backed cart
5. **Checkout Process**: Users provide shipping details and payment information
6. **Order Processing**: Orders are created and stored in the database

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight client-side routing
- **gsap**: Animation library for smooth UI transitions

### UI Libraries
- **@radix-ui/***: Headless UI primitives for accessibility
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: Component variant styling

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Type safety and development experience
- **tsx**: TypeScript execution for Node.js

## Deployment Strategy

### Development
- Frontend served by Vite dev server with HMR
- Backend runs with tsx for TypeScript execution
- Database migrations managed via Drizzle Kit
- Environment variables for database connection

### Production Build
- Frontend built with Vite and output to `dist/public`
- Backend bundled with esbuild to `dist/index.js`
- Static file serving integrated into Express app
- Database schema deployed via `drizzle-kit push`

### Key Scripts
- `npm run dev`: Start development servers
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run db:push`: Deploy database schema changes

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### July 06, 2025 - Session-Based Authentication Implementation
- Implemented secure session-based authentication using express-session and connect-mongo
- Replaced localStorage-based authentication with database-stored sessions
- Added session middleware with MongoDB session store for persistent authentication
- Updated authentication API routes: /api/auth/login, /api/auth/logout, /api/auth/me
- Modified cart and wishlist APIs to use session-based user identification
- Enhanced security with httpOnly cookies and session expiration
- Maintained backward compatibility with existing user data and product functionality

### July 06, 2025 - SM_Products Schema Migration
- Updated database schema to use `sm_products` table instead of `products`
- Migrated to new fields: `sku`, `costPrice`, `stockQuantity`, `minStockLevel`
- Updated image handling to use `/api/images/` URL structure from database
- Modified MongoDB collection name to 'sm_products' 
- Updated frontend components to display SKU, stock levels, and correct pricing
- Maintained backward compatibility with existing cart and authentication systems

### January 06, 2025 - Address Management and Checkout Enhancement
- Implemented comprehensive address CRUD operations in checkout page
- Added address selection functionality with radio button interface
- Created address management modal for adding/editing addresses
- Integrated address management with existing MongoDB storage
- Users can now save multiple addresses and select during checkout
- Enhanced Razorpay payment flow to use selected shipping address
- Added proper validation and error handling for address operations

### July 05, 2025 - Razorpay Payment Integration  
- Successfully integrated Razorpay payment gateway for secure online transactions
- Added backend API routes for order creation and payment verification
- Updated checkout page with Razorpay payment option as the primary choice
- Implemented secure payment flow with proper signature verification
- Added COD (Cash on Delivery) as alternative payment method
- Enhanced user experience with payment status notifications and error handling

## Changelog

Changelog:
- July 05, 2025. Initial setup and Razorpay payment integration completed