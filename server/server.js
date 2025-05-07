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
    const room = {
      players: [{ id: socket.id, name: "", isHost: true }],
      settings: defaultSettings,
      phase: "lobby",
      currentPrompt: null,
      originalHostId: socket.id // Store the original host's socket ID
    };
    
    gameRooms.set(gameCode, room);
    socket.join(gameCode);
    
    console.log(`Game hosted: ${gameCode} by ${socket.id}`);
    console.log('Room state:', JSON.stringify(room, null, 2));
    
    callback({ success: true, gameCode });
  });

  socket.on("join-game", (data, callback) => {
    const { gameCode, name } = data;
    if (!gameRooms.has(gameCode)) {
      callback({ success: false, message: "Game code not found" });
      return;
    }
    
    const room = gameRooms.get(gameCode);
    
    // Check if player is already in the room
    const existingPlayerIndices = [];
    room.players.forEach((player, index) => {
      if (player.id === socket.id) {
        existingPlayerIndices.push(index);
      }
    });
    
    // Remove any duplicate entries for this socket
    if (existingPlayerIndices.length > 0) {
      // Keep only the first instance and remove others
      existingPlayerIndices.slice(1).reverse().forEach(index => {
        room.players.splice(index, 1);
      });
      
      // Update the remaining player's name if needed
      const existingPlayer = room.players.find(player => player.id === socket.id);
      if (existingPlayer) {
      existingPlayer.name = name;
        io.to(gameCode).emit("update-players", room.players);
        callback({ success: true });
        
        console.log(`Updated existing player ${socket.id} in game ${gameCode}`);
        console.log('Updated room state:', JSON.stringify(room.players, null, 2));
        return;
      }
    }

    // Determine if this player should be host
    let isHost = false;
    
    if (socket.id === room.originalHostId) {
      // This is the original host
      isHost = true;
    } else if (!room.players.some(p => p.isHost)) {
      // No current host, make this player the host
      isHost = true;
      room.originalHostId = socket.id;
    }

    // Add new player
    room.players.push({ id: socket.id, name, isHost });
    socket.join(gameCode);
    
    // Emit updates
    io.to(gameCode).emit("update-players", room.players);
    io.to(gameCode).emit("game-phase-updated", { phase: room.phase });
    
    if (room.currentPrompt) {
      socket.emit("prompt-updated", { prompt: room.currentPrompt });
    }
    
    console.log(`${socket.id} joined game ${gameCode}`);
    console.log('Updated room state:', JSON.stringify(room.players, null, 2));
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
      try {
      const prompts = room.settings.selectedPrompts;
      const chosenPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      room.currentPrompt = chosenPrompt;
        room.phase = "songSelection";
        
        // First update the phase so clients know what's coming
        io.to(gameCode).emit("game-phase-updated", { phase: room.phase });
        
        // Then send the prompt details
      io.to(gameCode).emit("prompt-updated", { prompt: chosenPrompt });
        
        // Finally emit the game-started event with the prompt
      io.to(gameCode).emit("game-started", { prompt: chosenPrompt });
        
      console.log(`Game started in room ${gameCode} with prompt: ${chosenPrompt}`);
      } catch (error) {
        console.error("Error starting game:", error);
        io.to(gameCode).emit("game-error", { message: "Failed to start game" });
      }
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
      
      // Check if this player was the host
      const wasHost = room.players.find(player => player.id === socket.id && player.isHost);
      
      // Remove the player
      room.players = room.players.filter(player => player.id !== socket.id);
      
      // If the host left and there are still players, assign a new host
      if (wasHost && room.players.length > 0) {
        room.players[0].isHost = true;
        room.originalHostId = room.players[0].id;
        console.log(`Assigned new host: ${room.players[0].id}`);
      }
      
      io.to(gameCode).emit("update-players", room.players);
      console.log(`${socket.id} left game ${gameCode}`);
      console.log('Updated room state:', JSON.stringify(room.players, null, 2));
      
      // Check if game is still viable after player left
      checkGameViability(gameCode, room);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    gameRooms.forEach((room, gameCode) => {
      // Check if this player was in this room
      const playerIndex = room.players.findIndex(player => player.id === socket.id);
      
      if (playerIndex !== -1) {
        // Check if this player was the host
        const wasHost = room.players[playerIndex].isHost;
        
        // Remove the player
        room.players.splice(playerIndex, 1);
        
        // If the host left and there are still players, assign a new host
        if (wasHost && room.players.length > 0) {
          room.players[0].isHost = true;
          room.originalHostId = room.players[0].id;
          console.log(`Assigned new host: ${room.players[0].id}`);
        }
        
        io.to(gameCode).emit("update-players", room.players);
        console.log(`${socket.id} removed from game ${gameCode}`);
        console.log('Updated room state:', JSON.stringify(room.players, null, 2));
        
        // Check if game is still viable after player left
        checkGameViability(gameCode, room);
      }
    });
  });

  socket.on("song-selected", (data) => {
    const { gameCode, trackId, trackDetails } = data;
    if (!gameRooms.has(gameCode)) return;
    
    const room = gameRooms.get(gameCode);
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    // Initialize selectedSongs if it doesn't exist
    if (!room.selectedSongs) {
      room.selectedSongs = new Map();
    }

    // Store the selected song for this player
    room.selectedSongs.set(socket.id, {
      songId: trackId, // Unique ID for the song
      trackId,
      player: {
        id: socket.id,
        name: player.name
      },
      ...trackDetails
    });
    
    // Calculate submission counts
    const submittedCount = room.selectedSongs.size;
    const totalPlayers = room.players.length;
    
    // Notify all players in the room about the song selection and counts
    io.to(gameCode).emit("song-selected", { 
      playerId: socket.id,
      playerName: player.name
    });
    
    // Send updated submission counts
    io.to(gameCode).emit("song-submission-update", {
      submitted: submittedCount,
      total: totalPlayers
    });

    // Check if all players have selected a song
    const allPlayersSelected = room.players.every(player => 
      room.selectedSongs.has(player.id)
    );

    if (allPlayersSelected) {
      // Collect all song data
      const submittedSongs = Array.from(room.selectedSongs.values());
      
      // Set up room for rating phase
      room.phase = "rating";
      room.currentRatingIndex = 0;
      room.songRatings = {};
      room.songsToRate = submittedSongs;
      room.playerVotes = new Map(); // Track which players have voted in current rating round
      
      // Start the first rating round
      startRatingRound(gameCode, room);
    }
  });
  
  // Start a rating round for a specific song
  function startRatingRound(gameCode, room) {
    try {
      // Get the song to rate for this round
      const songToRate = room.songsToRate[room.currentRatingIndex];
      
      // Reset player votes for this round
      room.playerVotes = new Map();
      
      console.log(`Starting rating round ${room.currentRatingIndex + 1}/${room.songsToRate.length} for song: ${songToRate.name}`);
      
      // First update phase to rating if not already
      if (room.phase !== "rating") {
        room.phase = "rating";
        io.to(gameCode).emit("game-phase-updated", { phase: "rating" });
      }
      
      // Then emit event to all clients to start rating this song after a short delay
      setTimeout(() => {
        io.to(gameCode).emit("start-rating", {
          ratingIndex: room.currentRatingIndex,
          totalSongs: room.songsToRate.length,
          songToRate: songToRate
        });
      }, 500);
    } catch (error) {
      console.error("Error starting rating round:", error);
      io.to(gameCode).emit("game-error", { message: "Failed to start rating round" });
    }
  }
  
  // Handle song rating submissions
  socket.on("submit-rating", (data) => {
    const { gameCode, songId, rating } = data;
    if (!gameRooms.has(gameCode)) return;
    
    const room = gameRooms.get(gameCode);
    if (room.phase !== "rating") return;
    
    // Record this player's vote
    room.playerVotes.set(socket.id, { songId, rating });
    
    // Initialize ratings for this song if needed
    if (!room.songRatings[songId]) {
      room.songRatings[songId] = [];
    }
    
    // Only add actual ratings (not skips which are -1)
    if (rating > 0) {
      // Add the rating
      room.songRatings[songId].push({
        voterId: socket.id,
        rating
      });
    }
    
    // Calculate votes submitted for this round
    const submittedVotes = room.playerVotes.size;
    const totalPlayers = room.players.length;
    
    // Notify about vote status
    io.to(gameCode).emit("rating-update", {
      submitted: submittedVotes,
      total: totalPlayers,
      songId
    });
    
    console.log(`Rating submitted for song ${songId}: ${rating} stars (${submittedVotes}/${totalPlayers} votes)`);
    
    // Check if all players have voted
    const allPlayersVoted = room.players.every(player => 
      room.playerVotes.has(player.id) || player.id === room.songsToRate[room.currentRatingIndex].player.id
    );
    
    if (allPlayersVoted) {
      // Move to the next song
      room.currentRatingIndex++;
      
      // Check if we've rated all songs
      if (room.currentRatingIndex >= room.songsToRate.length) {
        // Calculate results and move to results phase
        calculateRoundResults(gameCode, room);
      } else {
        // Start the next rating round
        startRatingRound(gameCode, room);
      }
    }
  });
  
  // Calculate the results of a round
  function calculateRoundResults(gameCode, room) {
    console.log("Calculating round results");
    console.log("Current room state:", JSON.stringify({
      phase: room.phase,
      hasSongRatings: !!room.songRatings,
      songRatingsCount: Object.keys(room.songRatings || {}).length,
      songsToRateCount: room.songsToRate ? room.songsToRate.length : 0
    }, null, 2));
    
    try {
      // First update phase to results
      room.phase = "results";
      io.to(gameCode).emit("game-phase-updated", { phase: "results" });
      
      // Calculate average rating for each song
      const songScores = {};
      
      // Log ratings data
      console.log("Song ratings:", JSON.stringify(room.songRatings, null, 2));
      
      for (const [songId, ratings] of Object.entries(room.songRatings)) {
        // Calculate average rating (ignore -1 ratings which are skips)
        const validRatings = ratings.filter(r => r.rating > 0);
        const totalRating = validRatings.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = validRatings.length > 0 ? totalRating / validRatings.length : 0;
        
        // Find the song details
        const songDetails = room.songsToRate.find(s => s.songId === songId);
        
        console.log(`Processing song ${songId}: valid ratings: ${validRatings.length}, average: ${averageRating}`);
        
        if (songDetails) {
          songScores[songId] = {
            ...songDetails,
            averageRating: averageRating,
            totalRating: totalRating,
            ratings: validRatings
          };
        } else {
          console.error(`Could not find song details for songId: ${songId}`);
        }
      }
      
      // Sort songs by average rating to determine winner
      const sortedSongs = Object.values(songScores).sort(
        (a, b) => b.averageRating - a.averageRating
      );
      
      console.log(`Sorted ${sortedSongs.length} songs for results`);
      
      // Mark the winner
      if (sortedSongs.length > 0) {
        sortedSongs[0].isWinner = true;
        console.log(`Winner is: ${sortedSongs[0].name} by ${sortedSongs[0].artist} with rating ${sortedSongs[0].averageRating}`);
      } else {
        console.warn("No songs to display in results!");
      }
      
      // Update room results
      room.roundResults = {
        songs: sortedSongs,
        winnerSongId: sortedSongs.length > 0 ? sortedSongs[0].songId : null
      };
      
      console.log("Final round results:", JSON.stringify(room.roundResults, null, 2));
      
      // Wait a short delay before sending results to ensure phase update is processed
      setTimeout(() => {
        // Emit results to all players
        io.to(gameCode).emit("round-results", {
          results: room.roundResults
        });
        console.log("Emitted round-results event to all players");
      }, 500);
    } catch (error) {
      console.error("Error calculating round results:", error);
      io.to(gameCode).emit("game-error", { message: "Failed to calculate round results" });
    }
  }
  
  // Handle next round requests
  socket.on("next-round", (data) => {
    const { gameCode } = data;
    if (!gameRooms.has(gameCode)) return;
    
    const room = gameRooms.get(gameCode);
    
    try {
      // Determine if this is the last round
      const isLastRound = room.currentRound >= room.settings.numberOfRounds;
      
      if (isLastRound) {
        // Game is over, update phase
        room.phase = "gameOver";
        
        // Emit phase change
        io.to(gameCode).emit("game-phase-updated", { phase: "gameOver" });
        
        console.log(`Game ${gameCode} is over after ${room.currentRound} rounds`);
      } else {
        // Move to next round
        
        // Track current round
        room.currentRound = (room.currentRound || 0) + 1;
        
        // Clear round data
        room.selectedSongs = new Map();
        room.songRatings = {};
        room.currentRatingIndex = 0;
        
        // Update phase
        room.phase = "songSelection";
        
        // Emit phase change first
        io.to(gameCode).emit("game-phase-updated", { phase: "songSelection" });
        
        // Choose a new prompt
        const prompts = room.settings.selectedPrompts;
        const chosenPrompt = prompts[Math.floor(Math.random() * prompts.length)];
        room.currentPrompt = chosenPrompt;
        
        // Emit new prompt after a short delay
        setTimeout(() => {
          io.to(gameCode).emit("prompt-updated", { prompt: chosenPrompt });
        }, 500);
        
        console.log(`Starting round ${room.currentRound} in game ${gameCode} with prompt: ${chosenPrompt}`);
      }
    } catch (error) {
      console.error("Error starting new round:", error);
      io.to(gameCode).emit("game-error", { message: "Failed to start new round" });
    }
  });

  // Add this handler for returning to lobby after game is over
  socket.on("return-to-lobby", (data) => {
    const { gameCode } = data;
    if (!gameRooms.has(gameCode)) return;
    
    const room = gameRooms.get(gameCode);
    
    try {
      // Reset game state
      room.phase = "lobby";
      room.selectedSongs = new Map();
      room.songRatings = {};
      room.currentRatingIndex = 0;
      room.roundResults = {};
      room.currentRound = 1;
      
      // Save the original settings and players
      const settings = room.settings;
      const players = room.players;
      
      // Emit phase change to redirect clients
      io.to(gameCode).emit("game-phase-updated", { phase: "lobby" });
      
      console.log(`Game ${gameCode} returned to lobby`);
    } catch (error) {
      console.error("Error returning to lobby:", error);
      io.to(gameCode).emit("game-error", { message: "Failed to return to lobby" });
    }
  });

  // Handle requests for current submission status
  socket.on("get-submission-status", (data) => {
    const { gameCode } = data;
    if (!gameRooms.has(gameCode)) return;
    
    const room = gameRooms.get(gameCode);
    
    // Calculate counts
    const submittedCount = room.selectedSongs ? room.selectedSongs.size : 0;
    const totalPlayers = room.players.length;
    
    // Send counts to the requesting client
    socket.emit("song-submission-update", {
      submitted: submittedCount,
      total: totalPlayers
    });
    
    // If the player has already submitted, mark them as submitted
    if (room.selectedSongs && room.selectedSongs.has(socket.id)) {
      socket.emit("song-selected", { 
        playerId: socket.id
      });
    }
  });

  // Add this handler near the other event handlers
  socket.on("request-round-results", (data) => {
    const { gameCode } = data;
    if (!gameRooms.has(gameCode)) return;
    
    const room = gameRooms.get(gameCode);
    
    // Only respond if we're in the results phase and have results
    if (room.phase === "results" && room.roundResults) {
      console.log(`Sending round results to client ${socket.id} who requested them`);
      socket.emit("round-results", {
        results: room.roundResults
      });
    } else {
      console.log(`Client ${socket.id} requested round results but we're not in results phase or don't have results`);
      console.log(`Current phase: ${room.phase}, Have results: ${!!room.roundResults}`);
    }
  });
});

// Add this new function to check if a game has enough players
function checkGameViability(gameCode, room) {
  const MIN_PLAYERS = 3;
  
  // If player count drops below minimum and game is in progress
  if (room.players.length < MIN_PLAYERS && room.phase !== "lobby") {
    console.log(`Game ${gameCode} has only ${room.players.length} players, returning to lobby`);
    
    // Reset game to lobby phase
    room.phase = "lobby";
    room.selectedSongs = new Map();
    room.songRatings = {};
    room.currentRatingIndex = 0;
    
    // Notify all players
    io.to(gameCode).emit("game-error", { message: "Not enough players to continue the game" });
    io.to(gameCode).emit("game-phase-updated", { phase: "lobby" });
    
    return false;
  }
  
  return true;
}
