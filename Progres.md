Project Summary: Voice-First Anonymous Dating App (MERN + React Native)
Core Vision

A privacy-first, voice/video-based dating app with anonymous onboarding.

Monetization via:

Subscriptions (₹199–699/month)

Microtransactions (Reveal tokens, boosts, gifts)

Focused on Indian market with UPI payments.

Tech Stack

Frontend: React Native (no Expo, no TypeScript)

Backend: Node.js + Express (Microservices)

Databases:

MongoDB: User profiles, daily limits, call sessions.

PostgreSQL: (Planned) For other transactional or structured services (e.g., payments).

Auth: Phone number with OTP (Twilio or custom SMS)

Payments: Razorpay/Cashfree/Paytm (planned)

WebRTC: Peer-to-peer encrypted calls (react-native-webrtc)

Infrastructure: AWS (EC2/Elastic Beanstalk), MongoDB Atlas, S3 for media.

Microservices Implemented / Planned

Auth-Service

Phone number OTP login

JWT generation

Refresh token support (planned)

User-Service

User schema includes:

phone, nickname, avatarType, languages, interests

subscription (tier & expiry)

limits (dailyCalls & lastReset)

Daily call limit reset (cron/middleware at midnight)

/eligible-users endpoint (for match filtering)

Match-Service

Randomized matching engine with filters

/start-call endpoint (initiates match + calls call-service)

Call-Service

WebRTC signaling

CallSession schema (callerId, calleeId, status, timestamps)

Socket.IO integration for real-time call invitations

Accept/reject flow (planned)

API Gateway

Nginx + Express for routing (planned)

Key Features (Planned or In-progress)

Anonymous onboarding (nickname + avatar first)

Random calls (voice/video)

Paid tiers: Unlimited calls, filters, longer calls

Reveal token (mutual consent to show profile)

Boost system (priority matching)

Gifts (animated stickers/voice gifts)

Safety: AI moderation, block/report, encrypted recording for flagged users

Recent Implementation Progress

User schema created with limits and subscription fields.

Daily call limit check added in match-service.

Cron job/middleware set to reset limits nightly.

JWT authentication implemented after OTP verification.

Call-service set up with call session model and initial /call-sessions endpoint.

Match-service integrated with call-service for auto-init calls.

Pending & Next Steps

Call-Service

Add /accept and /reject endpoints.

Auto-expire pending calls after X seconds.

Implement WebRTC signaling (offer/answer/ICE).

Payments Integration

Razorpay for subscriptions & boosts.

Microtransaction APIs for reveal tokens & gifts.

API Gateway Setup

Route traffic to all microservices.

Add rate limiting & JWT validation middleware.

Frontend Integration

Connect OTP flow with auth-service.

Call initiation and incoming call popups.

Subscription and boost purchase screens.

User Preferences

No TypeScript.

No Docker.

Phone number only signup (no email/social).

Wants MERN + React Native with AWS deployment.

Uses MongoDB for user & calls, Postgres for structured services later.

Wants microservice-ready structure but not fully decoupled yet.

Open Questions for Continuation

Should we implement call accept/reject & signaling next, or move to payments integration first?

Should call sessions auto-cancel if unanswered after 30s?

Will PostgreSQL be introduced now (e.g., for payments) or later?

Do we need admin panel or moderation tools planned early on?

Suggested Next Immediate Tasks

Implement accept/reject call flow in call-service.

Add auto-expiry logic for pending calls.

Start basic WebRTC signaling rooms (offer/answer/ICE).

Structured Data (JSON Snapshot)
{
  "project": "Voice-First Anonymous Dating App",
  "tech_stack": {
    "frontend": "React Native (no Expo, no TypeScript)",
    "backend": "Node.js + Express (Microservices)",
    "databases": {
      "mongo": "User profiles, calls",
      "postgres": "Planned for structured services/payments"
    },
    "auth": "Phone number OTP (Twilio/custom)",
    "payments": "Razorpay/Cashfree/Paytm",
    "webrtc": "react-native-webrtc",
    "infrastructure": "AWS (EC2/Elastic Beanstalk), MongoDB Atlas, S3"
  },
  "services": ["auth-service", "user-service", "match-service", "call-service", "api-gateway"],
  "key_features": [
    "Anonymous onboarding",
    "Random voice/video calls",
    "Subscriptions & microtransactions",
    "Reveal token",
    "Boost & gifts",
    "Safety moderation"
  ],
  "user_preferences": {
    "typescript": false,
    "docker": false,
    "signup": "phone number only",
    "microservice_ready": true,
    "deployment": "AWS"
  },
  "recent_progress": [
    "User schema created",
    "Daily limit check and reset",
    "JWT authentication with OTP",
    "Call-service integrated with match-service"
  ],
  "pending": [
    "Call accept/reject endpoints",
    "Call auto-expiry",
    "WebRTC signaling",
    "Payments integration",
    "API Gateway setup"
  ],
  "open_questions": [
    "What is the next highest priority?",
    "Should calls auto-cancel after timeout?",
    "Introduce PostgreSQL now or later?",
    "Admin panel timing?"
  ]
}
