import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// In-memory storage for game rooms.
// Each room is an object with players, settings, and phase.
const gameRooms = new Map();

const defaultSettings = {
  numberOfRounds: 3,
  roundLength: 30, // in seconds
  selectedPrompts: ["General"],
};

const generateGameCode = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("host-game", (callback) => {
    const gameCode = generateGameCode();
    // Create a new room with host, default settings, and starting phase.
    gameRooms.set(gameCode, {
      players: [{ id: socket.id, name: "", isHost: true }],
      settings: defaultSettings,
      phase: "lobby",
    });
    socket.join(gameCode);
    console.log(`Game hosted: ${gameCode} by ${socket.id}`);
    callback({ success: true, gameCode });
  });

  socket.on("join-game", (data, callback) => {
    const { gameCode, name } = data;
    if (!gameRooms.has(gameCode)) {
      callback({ success: false, message: "Game code not found" });
      return;
    }
    const room = gameRooms.get(gameCode);
    // Check if this socket is already in the players list.
    const existingPlayer = room.players.find((player) => player.id === socket.id);
    if (!existingPlayer) {
      room.players.push({ id: socket.id, name, isHost: false });
    } else {
      existingPlayer.name = name;
    }
    socket.join(gameCode);
    // Emit players and phase update so new joiners are in sync.
    io.to(gameCode).emit("update-players", room.players);
    io.to(gameCode).emit("game-phase-updated", { phase: room.phase });
    console.log(`${socket.id} joined game ${gameCode}`);
    callback({ success: true });
  });

  socket.on("update-player-name", (data) => {
    const { gameCode, name, isReady } = data;
    if (!gameRooms.has(gameCode)) return;
    const room = gameRooms.get(gameCode);
    room.players = room.players.map((p) =>
      p.id === socket.id ? { ...p, name, isReady } : p
    );
    io.to(gameCode).emit("update-players", room.players);
  });

  socket.on("update-game-settings", (data) => {
    const { gameCode, numberOfRounds, roundLength, selectedPrompts } = data;
    if (!gameRooms.has(gameCode)) return;
    const room = gameRooms.get(gameCode);
    room.settings = { numberOfRounds, roundLength, selectedPrompts };
    io.to(gameCode).emit("game-settings-updated", room.settings);
    console.log(`Game settings updated in room ${gameCode} by ${socket.id}`);
  });

  socket.on("start-game", (data) => {
    const { gameCode } = data;
    const room = gameRooms.get(gameCode);
    if (room) {
      room.phase = "roundStart";
      // Broadcast the new phase and a game-started event.
      io.to(gameCode).emit("game-phase-updated", { phase: room.phase });
      io.to(gameCode).emit("game-started");
    }
  });

  socket.on("leave-game", (data) => {
    const { gameCode } = data;
    socket.leave(gameCode);
    if (gameRooms.has(gameCode)) {
      const room = gameRooms.get(gameCode);
      room.players = room.players.filter(
        (player) => player.id !== socket.id
      );
      // If the host left, assign a new host (if available)
      if (
        room.players.find((player) => player.id === socket.id && player.isHost) &&
        room.players.length > 0
      ) {
        room.players[0].isHost = true;
      }
      io.to(gameCode).emit("update-players", room.players);
      console.log(`${socket.id} left game ${gameCode}`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    gameRooms.forEach((room, gameCode) => {
      const originalLength = room.players.length;
      room.players = room.players.filter((player) => player.id !== socket.id);
      if (room.players.length !== originalLength) {
        io.to(gameCode).emit("update-players", room.players);
        console.log(`${socket.id} removed from game ${gameCode}`);
      }
    });
  });
});

server.listen(3001, () => {
  console.log("Server running on port 3001");
});
