// Test suite for song selection functionality in multiplayer game
import { io as Client } from "socket.io-client"
import { server, gameRooms } from "./server.js"
import { describe, beforeAll, afterAll, it, expect } from '@jest/globals'

describe('Song Selection Tests', () => {
  // Setup test server and multiple client sockets for multiplayer testing
  let httpSrv, port, clientSocket1, clientSocket2, gameCode

  // Start server and set up two connected clients with one hosting a game
  beforeAll((done) => {
    httpSrv = server.listen(0, () => {
      port = httpSrv.address().port
      clientSocket1 = new Client(`http://localhost:${port}`)
      clientSocket2 = new Client(`http://localhost:${port}`)
      
      // First client hosts the game
      clientSocket1.on("connect", () => {
        clientSocket1.emit("host-game", ({ success, gameCode: code }) => {
          gameCode = code
          // Second client joins the game
          clientSocket2.emit("join-game", { gameCode: code, name: "Player2" }, () => {
            done()
          })
        })
      })
    })
  })

  // Clean up server and clients after tests
  afterAll((done) => {
    clientSocket1.on("disconnect", () => {
      clientSocket2.on("disconnect", () => {
        httpSrv.close(done)
      })
      clientSocket2.close()
    })
    clientSocket1.close()
  })

  // Test individual song selection by a player
  it("should handle song selection from a player", (done) => {
    const trackId = "test-track-1"
    
    // Listen for song selection event
    clientSocket2.on("song-selected", (data) => {
      expect(data.playerId).toBe(clientSocket2.id)
      expect(data.trackId).toBe(trackId)
      clientSocket2.off("song-selected")
      done()
    })

    // Second player selects a song
    clientSocket2.emit("song-selected", { gameCode, trackId })
  })

  // Test multiple players selecting songs and game phase transition
  it("should track selected songs in the game room", (done) => {
    const trackId1 = "test-track-1"
    const trackId2 = "test-track-2"
    let phaseChangeReceived = false
    
    // Listen for phase change when all players have selected songs
    clientSocket1.on("game-phase-updated", ({ phase }) => {
      if (phase === "voting" && !phaseChangeReceived) {
        phaseChangeReceived = true
        const room = gameRooms.get(gameCode)
        expect(room.selectedSongs.get(clientSocket1.id)).toBe(trackId1)
        expect(room.selectedSongs.get(clientSocket2.id)).toBe(trackId2)
        expect(room.phase).toBe("voting")
        clientSocket1.off("game-phase-updated")
        done()
      }
    })

    // Both players select songs
    clientSocket1.emit("song-selected", { gameCode, trackId: trackId1 })
    clientSocket2.emit("song-selected", { gameCode, trackId: trackId2 })
  })

  // Test security: prevent non-players from selecting songs
  it("should not allow song selection from non-players", (done) => {
    const trackId = "test-track-1"
    const nonPlayerSocket = new Client(`http://localhost:${port}`)
    
    nonPlayerSocket.on("connect", () => {
      nonPlayerSocket.emit("song-selected", { gameCode, trackId })
      
      // The room should not have the song selection
      const room = gameRooms.get(gameCode)
      expect(room.selectedSongs?.get(nonPlayerSocket.id)).toBeUndefined()
      
      nonPlayerSocket.close()
      done()
    })
  })
}) 