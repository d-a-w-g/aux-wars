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

// In-memory storage for game rooms
const gameRooms = new Map();

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
    // Create a new room with the host as the first player.
    gameRooms.set(gameCode, [{ id: socket.id, name: "", isHost: true }]);
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
    const players = gameRooms.get(gameCode);
    // Check if this socket is already in the players list.
    const existingPlayer = players.find((player) => player.id === socket.id);
    if (!existingPlayer) {
      // If not present, add it.
      players.push({ id: socket.id, name, isHost: false });
    } else {
      // If already present, update the name if it has changed.
      existingPlayer.name = name;
    }
    socket.join(gameCode);
    io.to(gameCode).emit("update-players", players);
    console.log(`${socket.id} joined game ${gameCode}`);
    callback({ success: true });
  });

  socket.on("update-player-name", (data) => {
    const { gameCode, name, isReady } = data;
    if (!gameRooms.has(gameCode)) return;
    const players = gameRooms.get(gameCode);
    const updatedPlayers = players.map((p) =>
      p.id === socket.id ? { ...p, name, isReady } : p
    );
    gameRooms.set(gameCode, updatedPlayers);
    io.to(gameCode).emit("update-players", updatedPlayers);
  });

  socket.on("update-game-settings", (data) => {
    const { gameCode, numberOfRounds, roundLength, selectedPrompts } = data;
    if (!gameRooms.has(gameCode)) return;
    const room = gameRooms.get(gameCode);
    room.settings = { numberOfRounds, roundLength, selectedPrompts };
    io.to(gameCode).emit("game-settings-updated", room.settings);
    console.log(`Game settings updated in room ${gameCode} by ${socket.id}`);
  });

  socket.on("leave-game", (data) => {
    const { gameCode } = data;
    socket.leave(gameCode);
    if (gameRooms.has(gameCode)) {
      const players = gameRooms.get(gameCode);
      const updatedPlayers = players.filter(
        (player) => player.id !== socket.id
      );
      // If the host left, assign a new host (if available)
      if (
        players.find((player) => player.id === socket.id && player.isHost) &&
        updatedPlayers.length > 0
      ) {
        updatedPlayers[0].isHost = true;
      }
      gameRooms.set(gameCode, updatedPlayers);
      io.to(gameCode).emit("update-players", updatedPlayers);
      console.log(`${socket.id} left game ${gameCode}`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    gameRooms.forEach((players, gameCode) => {
      const updatedPlayers = players.filter(
        (player) => player.id !== socket.id
      );
      if (updatedPlayers.length !== players.length) {
        gameRooms.set(gameCode, updatedPlayers);
        io.to(gameCode).emit("update-players", updatedPlayers);
        console.log(`${socket.id} removed from game ${gameCode}`);
      }
    });
  });
});

server.listen(3001, () => {
  console.log("Server running on port 3001");
});
