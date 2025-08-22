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

MONGO_URI=mongodb+srv://pappusheth:6P%23m%405qW7b3S9-%25@cluster0.zjfovlk.mongodb.net/dating_auth?retryWrites=true&w=majority&appName=Cluster0


# signaling
User A & B are matched via match-service.
Both connect to call-service via Socket.IO with JWT.
A sends offer → call-service relays to B.
B sends answer → relayed to A.
ICE candidates exchanged.
Call established peer-to-peer (encrypted).