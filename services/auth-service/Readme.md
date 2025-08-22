POST /auth/otp/start
{ "phone": "+91XXXXXXXXXX" }

POST /auth/otp/verify
{ "phone":"+91XXXXXXXXXX", "requestId":"<from step 1>", "code":"123456" }  // 123456 in dev mode

POST /auth/token/refresh
{ "refreshToken":"<currentRefreshToken>" }

POST /auth/logout
{ "refreshToken":"<currentRefreshToken>" }

Store refresh tokens hashed (e.g., bcrypt the token before saving; store only the hash). Then on refresh/logout, compare with bcrypt.compare. This avoids storing raw tokens server-side.
Device binding: persist userAgent/ip and optionally reject refresh if context changes drastically.
Short access TTL (10–15 min) + long refresh (30–60 days) is standard.
Rate-limit OTP endpoints (already added) and consider per-phone cooldowns.
Banned users: check flags.banned during OTP verify and deny token issuance.