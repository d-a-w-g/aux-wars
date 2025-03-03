import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppDisplay from "./components/AppDisplay";
import Login from "./features/login/Login";
import Landing from "./features/lobby/Landing";
import SpotifyCallback from "./features/login/SpotifyCallback";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppDisplay />}>
          <Route index element={<Login />} />
          <Route path="lobby" element={<Landing />} />
          <Route path="callback" element={<SpotifyCallback />} />
        </Route>
      </Routes>
    </Router>
  );
}
