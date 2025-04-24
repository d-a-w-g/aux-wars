import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

export const app = express();
app.use(cors());

export const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// In-memory storage for game rooms.
// Each room is an object with players, settings, phase, and a currentPrompt.
export const gameRooms = new Map();

const defaultSettings = {
  numberOfRounds: 3,
  roundLength: 30, // in seconds
  selectedPrompts: [
    "This song makes me feel like the main character.",
    "The soundtrack to a late-night drive.",
    "This song makes me wanna text my ex (or block them).",
    "A song that defines high school memories.",
    "The perfect song to play while getting ready to go out.",
    "This song could start a mosh pit.",
    "A song that instantly boosts your confidence.",
    "This song would play in the background of my villain arc.",
    "A song that could make me cry on the right day.",
    "The ultimate cookout anthem.",
    "A song that just feels like summertime.",
    "This song is pure nostalgia.",
    "A song that makes you feel unstoppable.",
    "If life had a montage, this song would play in mine.",
    "A song that instantly hypes up the whole room."
  ],
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
      currentPrompt: null, // for prompt synchronization
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
    // Add the player if not already present
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
    // If the prompt is already set, send it to the new joiner.
    if (room.currentPrompt) {
      socket.emit("prompt-updated", { prompt: room.currentPrompt });
    }
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

  // Host triggers start-game. The server randomly selects a prompt
  // from the room's selectedPrompts and broadcasts it.
  socket.on("start-game", (data) => {
    const { gameCode } = data;
    const room = gameRooms.get(gameCode);
    if (room) {
      const prompts = room.settings.selectedPrompts;
      const chosenPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      room.currentPrompt = chosenPrompt;
      room.phase = "roundStart";
      io.to(gameCode).emit("prompt-updated", { prompt: chosenPrompt });
      io.to(gameCode).emit("game-phase-updated", { phase: room.phase });
      // Emit the game-started event with the prompt so clients can update if they missed prompt-updated.
      io.to(gameCode).emit("game-started", { prompt: chosenPrompt });
      console.log(`Game started in room ${gameCode} with prompt: ${chosenPrompt}`);
    }
  });

  // Clients can request the current prompt if needed.
  socket.on("request-prompt", (data) => {
    const { gameCode } = data;
    const room = gameRooms.get(gameCode);
    console.log(`Prompt requested in room ${gameCode} by ${socket.id}`);
    console.log(`Current prompt is: ${room.currentPrompt}`);
    if (room && room.currentPrompt) {
      socket.emit("prompt-updated", { prompt: room.currentPrompt });
    }
  });

  // (Optional) Handle prompt updates from clients if needed.
  socket.on("update-prompt", (data) => {
    const { gameCode, prompt } = data;
    if (gameRooms.has(gameCode)) {
      const room = gameRooms.get(gameCode);
      room.currentPrompt = prompt;
      io.to(gameCode).emit("prompt-updated", { prompt });
      console.log(`Prompt updated in room ${gameCode}: ${prompt}`);
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

  socket.on("song-selected", (data) => {
    const { gameCode, trackId } = data;
    if (!gameRooms.has(gameCode)) return;
    
    const room = gameRooms.get(gameCode);
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    // Initialize selectedSongs if it doesn't exist
    if (!room.selectedSongs) {
      room.selectedSongs = new Map();
    }

    // Store the selected song for this player
    room.selectedSongs.set(socket.id, trackId);
    
    // Notify all players in the room about the song selection
    io.to(gameCode).emit("song-selected", { 
      playerId: socket.id,
      playerName: player.name,
      trackId 
    });

    // Check if all players have selected a song
    const allPlayersSelected = room.players.every(player => 
      room.selectedSongs.has(player.id)
    );

    if (allPlayersSelected) {
      // Move to the next phase (e.g., voting)
      room.phase = "voting";
      io.to(gameCode).emit("game-phase-updated", { phase: "voting" });
    }
  });
});
