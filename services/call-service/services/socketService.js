const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

function initSockets(server) {
  io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    console.warn("⚠️ JWT_SECRET is not set. Socket authentication may fail.");
  }

  // -----------------------
  // Helper: Verify Token
  // -----------------------
  const verifyToken = (token) => {
    if (!token) throw new Error("missing_token");
    return jwt.verify(token, JWT_SECRET);
  };

  // -----------------------
  // Notify namespace
  // -----------------------
  const notifyNsp = io.of("/notify");
  notifyNsp.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("missing_token"));
      const payload = verifyToken(token);
      socket.data.uid = payload.uid;
      next();
    } catch (err) {
      next(new Error("unauthorized"));
    }
  });

  notifyNsp.on("connection", (socket) => {
    console.log(`🔔 Notify connected: ${socket.data.uid}`);

    socket.on("register", (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`User ${userId} registered for notifications`);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(
        `🔕 Notify disconnected: ${socket.data.uid}, reason: ${reason}`
      );
    });
  });

  // -----------------------
  // Signaling namespace
  // -----------------------
  const sigNsp = io.of("/signaling");
  sigNsp.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      const payload = verifyToken(token);
      socket.data.uid = payload.uid;
      next();
    } catch (err) {
      next(
        new Error(
          err.message === "missing_token" ? "missing_token" : "unauthorized"
        )
      );
    }
  });

  sigNsp.on("connection", (socket) => {
    console.log(`📞 Signaling connected: ${socket.data.uid}`);

    socket.on("join", ({ room }) => {
      if (!room) return;
      socket.join(room);
      socket.to(room).emit("peer.joined", { uid: socket.data.uid });
      console.log(`User ${socket.data.uid} joined room ${room}`);
    });

    socket.on("offer", ({ room, sdp }) => {
      if (room && sdp)
        socket.to(room).emit("offer", { sdp, from: socket.data.uid });
    });

    socket.on("answer", ({ room, sdp }) => {
      if (room && sdp)
        socket.to(room).emit("answer", { sdp, from: socket.data.uid });
    });

    socket.on("ice", ({ room, candidate }) => {
      if (room && candidate)
        socket.to(room).emit("ice", { candidate, from: socket.data.uid });
    });

    socket.on("end", ({ room, reason }) => {
      if (room) sigNsp.to(room).emit("ended", { reason });
    });

    socket.on("disconnect", (reason) => {
      console.log(
        `📴 Signaling disconnected: ${socket.data.uid}, reason: ${reason}`
      );
      // Optional: Notify peers that user left
      // sigNsp.emit('peer.left', { uid: socket.data.uid });
    });
  });
}

module.exports = {
  initSockets,
  get io() {
    return io;
  },
};
