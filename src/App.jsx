import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppDisplay from "./components/AppDisplay";
import Login from "./features/login/Login";
import Landing from "./features/lobby/Landing";
import HowToPlay from "./features/how_to_play/HowToPlay";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* all routes/views are wrapped inside the AppDisplay so our background is consistent */}
        <Route path="/" element={<AppDisplay />}>
          <Route index element={<Login />} />
          <Route path="/lobby" element={<Landing />} />
          <Route path="/how_to_play" element={<HowToPlay />} />
        </Route>
      </Routes>
    </Router>
  );
}
