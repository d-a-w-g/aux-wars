import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppDisplay from "./components/AppDisplay";
import Login from "./features/login/Login";
import SpotifyCallback from "./features/login/SpotifyCallback";
import Home from "./features/lobby/Home";
import { SocketProvider } from "./services/SocketProvider";
import Lobby from "./features/lobby/Lobby";
import { GameProvider } from "./services/GameContext";

export default function App() {
  return (
    <GameProvider>
      <SocketProvider>
        <Router>
          <Routes>
            <Route path="/" element={<AppDisplay />}>
              <Route index element={<Login />} />
              <Route path="lobby" element={<Home />} />
              <Route path="callback" element={<SpotifyCallback />} />
              <Route path="/lobby/:gameCode" element={<Lobby />} />
            </Route>
          </Routes>
        </Router>
      </SocketProvider>
    </GameProvider>
  );
}
