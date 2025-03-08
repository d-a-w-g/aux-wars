import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppDisplay from "./components/AppDisplay";
import Login from "./features/login/Login";
import Landing from "./features/lobby/Landing";
import RoundWinner from "./features/round-winner/RoundWinner";
import Song from './components/Song';

const song1 = <Song track='ABC' artist='Singer' player='Firestone' albumCover="ALBUM" rating="15" winner='false' ></Song>
const song2 = <Song track='ABC' artist='Singer' player='Firestone' albumCover="ALBUM" rating="15" winner='false' ></Song>
const song3 = <Song track='ABC' artist='Singer' player='Firestone' albumCover="ALBUM" rating="15" winner='false' ></Song>
const song4 = <Song track='ABC' artist='Singer' player='Firestone' albumCover="ALBUM" rating="15" winner='false' ></Song>

const songs = [song1, song2, song3, song4]

export default function App() {

  return (
    <Router>
      <Routes>
        {/* all routes/views are wrapped inside the AppDisplay so our background is consistent */}
        <Route path="/" element={<AppDisplay />}>
          <Route index element={<Login />} />
          <Route path="/lobby" element={<Landing />} />
          <Route path="/round-winner" element={<RoundWinner songs={songs} />} />
        </Route>
      </Routes>
    </Router>
  );
}
