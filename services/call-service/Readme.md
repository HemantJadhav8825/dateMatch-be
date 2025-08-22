5. Flow
User A & B are matched via match-service.
Both connect to call-service via Socket.IO with JWT.
A sends offer → call-service relays to B.
B sends answer → relayed to A.
ICE candidates exchanged.
Call established peer-to-peer (encrypted).



5. Final Call Flow
Match-service starts the call (/start-call).
Call-service creates session + emits event.
Callee receives incoming-call → accepts or rejects.
If accepted → signaling flow (offer/answer/ICE).