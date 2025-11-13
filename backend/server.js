import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: false
  }
});

let waitingUser = null;

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  socket.on("find_stranger", () => {
    console.log("find_stranger from", socket.id);

    if (!waitingUser) {
      waitingUser = socket;
      socket.emit("searching");
      return;
    }

    if (waitingUser.id === socket.id) return;

    const partner = waitingUser;
    waitingUser = null;

    const roomId = `${socket.id}-${partner.id}`;

    socket.join(roomId);
    partner.join(roomId);

    socket.partnerId = partner.id;
    partner.partnerId = socket.id;

    socket.roomId = roomId;
    partner.roomId = roomId;

    socket.emit("matched", { roomId, partnerId: partner.id });
    partner.emit("matched", { roomId, partnerId: socket.id });

    setTimeout(() => {
      socket.emit("ready");
      partner.emit("ready");
    }, 200);
  });

  socket.on("signal", ({ to, type, data }) => {
    io.to(to).emit("signal", { type, data });
  });

  socket.on("skip", ({ roomId }) => {
    socket.to(roomId).emit("skipped");
    socket.leave(roomId);

    if (socket.partnerId) {
      io.sockets.sockets.get(socket.partnerId)?.leave(roomId);
    }

    socket.partnerId = null;
    socket.roomId = null;

    socket.emit("searching");
    socket.emit("find_stranger");
  });

  socket.on("disconnect", () => {
    console.log("disconnect", socket.id);

    if (waitingUser && waitingUser.id === socket.id) {
      waitingUser = null;
    }

    if (socket.roomId) {
      socket.to(socket.roomId).emit("partner_disconnected");
    }
  });
});

// IMPORTANT: Host must be 0.0.0.0
const PORT = 4000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on http://0.0.0.0:${PORT}`);
});
