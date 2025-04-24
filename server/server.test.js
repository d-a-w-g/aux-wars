// Test suite for basic server functionality and game creation
import { io as Client } from "socket.io-client"
import { server } from "./server.js"
import { describe, beforeAll, afterAll, it, expect } from '@jest/globals'

describe('Server Tests', () => {
  // Setup test server and client socket
  let httpSrv, port, clientSocket

  // Start server on random port and connect client before tests
  beforeAll((done) => {
    httpSrv = server.listen(0, () => {
      port = httpSrv.address().port
      clientSocket = new Client(`http://localhost:${port}`)
      clientSocket.on("connect", done)
    })
  })

  // Clean up server and client after tests
  afterAll((done) => {
    clientSocket.on("disconnect", () => {
      httpSrv.close(done)
    })
    clientSocket.close()
  })

  // Test game creation functionality
  it("lets a host create a game code", (done) => {
    clientSocket.emit("host-game", ({ success, gameCode }) => {
      expect(success).toBe(true)
      expect(typeof gameCode).toBe("string")
      expect(gameCode).toHaveLength(6)
      done()
    })
  })
})
