# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a **voice-first anonymous dating application backend** built with a microservice architecture. The system consists of the following key components:

### Core Services
- **auth-service** (port: dynamic): Handles phone OTP authentication and JWT token management (30-day expiry)
- **user-service** (port: dynamic): Manages user profiles, nicknames, avatars, subscriptions, and daily call limits with cron-based resets
- **match-service** (port: dynamic): Implements randomized matching algorithm with filters (interests, languages, etc.)
- **call-service** (port: dynamic): Manages WebRTC peer-to-peer voice/video calls with Socket.IO real-time signaling
- **gateway** (port 4000): API Gateway that routes requests to services with rate limiting (300 req/min) and CORS

### Technology Stack
- **Backend**: Node.js + Express.js for all services
- **Database**: MongoDB (Mongoose) for user data and call sessions
- **Real-Time**: Socket.IO for call signaling and events
- **WebRTC**: Peer-to-peer encrypted calls
- **Authentication**: Phone OTP + JWT tokens
- **Development**: nodemon for auto-restart, child_process for service orchestration

### Key Development Patterns
- Microservice architecture where each service has its own `package.json`, `node_modules`, and `.env`
- Root `index.js` orchestrates all services using separate nodemon processes
- Gateway acts as reverse proxy routing `/service-name/*` to respective services
- Environment-based configuration with separate `.env` files per service

## Common Development Commands

### Starting the Application
```bash
# Start all services (recommended for development)
node index.js

# Alternative: Using the shell script
./start-all.command

# Start gateway only (for testing proxy)
cd gateway && npm start

# Start individual service
cd services/{auth-service|user-service|match-service|call-service} && npm start
```

### Testing Sequences (from README)
```bash
# User registration flow
POST /auth/start-otp (body: { phoneNumber })
POST /auth/verify-otp (body: { phoneNumber, otp, nickname })

# Create profile and match
POST /user/profile (create user profile with interests/languages)
GET /match/eligible-users (get available users)
POST /match/find-match (initiate matching)

# Start a call
POST /call/initiate (body: { targetUserId })
POST /call/accept or /call/reject (accept/reject incoming calls)
```

### Service-Specific Development
```bash
# Auth service operations
cd services/auth-service
npm test                    # Run authentication tests
npm run dev                 # Development mode with nodemon

# User service operations
cd services/user-service
npm run reset-limits        # Manually reset daily call limits (cron job)

# Call service operations
cd services/call-service
npm run dev                 # Socket.IO development mode

# Database operations
# MongoDB Atlas connection string in each service's .env
# MONGO_URI points to shared MongoDB instance
```

### Environment Setup
Each service has its own `.env` file:
- `MONGO_URI`: Shared MongoDB connection
- Service-specific ports: `PORT_AUTH`, `PORT_USER`, etc. (gateway uses env vars for routing)
- JWT secrets and external API keys (Twilio for SMS, Razorpay for payments)

### Project Structure
```
/ (root)
├── index.js                 # Service orchestrator (spawns all services)
├── services/
│   ├── auth-service/        # Phone OTP + JWT auth
│   ├── user-service/        # Profiles, subscriptions, limits
│   ├── match-service/       # Matching algorithm
│   └── call-service/        # WebRTC signaling
├── gateway/                 # API Gateway proxy
└── start-all.command        # Alternative start script
```

The architecture emphasizes anonymous user experience with randomized voice matching, privacy-first design, and microservices for scalability.