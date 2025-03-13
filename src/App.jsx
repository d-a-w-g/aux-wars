import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppDisplay from "./components/AppDisplay";
import Login from "./features/login/Login";
import Landing from "./features/lobby/Landing";
import SongRating from "./components/SongRating";
import track from "./components/dummyData"

export default function App() {
  return (
    <Router>
      <Routes>
        {/* all routes/views are wrapped inside the AppDisplay so our background is consistent */}
        <Route path="/" element={<AppDisplay />}>
          <Route index element={<Login />} />
          <Route path="/lobby" element={<Landing />} />
          <Route path="/rating" element={<SongRating track={track} />} />
        </Route>
      </Routes>
    </Router>
  );
}
