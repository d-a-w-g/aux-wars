import { io as Client } from "socket.io-client"
import { server } from "./server.js"
import { describe, beforeAll, afterAll, it, expect } from '@jest/globals'

describe('Server Tests', () => {
  let httpSrv, port, clientSocket

  beforeAll((done) => {
    httpSrv = server.listen(0, () => {
      port = httpSrv.address().port
      clientSocket = new Client(`http://localhost:${port}`)
      clientSocket.on("connect", done)
    })
  })

  afterAll((done) => {
    clientSocket.on("disconnect", () => {
      httpSrv.close(done)
    })
    clientSocket.close()
  })

  it("lets a host create a game code", (done) => {
    clientSocket.emit("host-game", ({ success, gameCode }) => {
      expect(success).toBe(true)
      expect(typeof gameCode).toBe("string")
      expect(gameCode).toHaveLength(6)
      done()
    })
  })
})
