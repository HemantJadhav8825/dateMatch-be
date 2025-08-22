9) Quick test sequence (via gateway on :4000)

Start OTP
POST /auth/otp/start → { "phone":"+91xxxxxxxxxx" }

Verify
POST /auth/otp/verify → { "phone":"+91...", "code":"<from SMS or console>", "nickname":"Hemant" }
Save accessToken.

Get/Update profile
GET /user/me with Authorization: Bearer <token>
PATCH /user/me with JSON body to update interests/language.

Find match
POST /match/find with Authorization: Bearer <token>

Create payment order
POST /payment/create-order → { "amount": 19900, "userId":"<uid>", "type":"subscription" }