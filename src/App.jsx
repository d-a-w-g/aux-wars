import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppDisplay from "./components/AppDisplay";
import Login from "./features/login/Login";
import Landing from "./features/lobby/Landing";
import RoundWinner from "./features/round-winner/RoundWinner";
import Song from './components/Song';
import album from "../src/features/round-winner/album-placeholder.jpg";

const song1 = <Song track='Track' artist='Artist' player='Player' albumCover={album} rating="20" winner='winner' ></Song>
const song2 = <Song track='Software' artist='Sputnik Kaputnik' player='Firestone' albumCover={album} rating="15" winner='false' ></Song>
const song3 = <Song track='Star Spangled Banner' artist='George Washington' player='Steve' albumCover={album} rating="10" winner='false' ></Song>
const song4 = <Song track='Really Long Songggggggggggggggg' artist='Also a really long artistttttt' player='software luvr <3' albumCover={album} rating="0" winner='false' ></Song>

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
