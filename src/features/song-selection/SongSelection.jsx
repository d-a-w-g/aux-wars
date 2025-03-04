// SongSelection.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGame } from "../../services/GameContext";
import { useSocket } from "../../services/SocketProvider";
import { isTokenValid, refreshSpotifyToken } from "../../services/spotifyApi";

export default function SongSelection() {
  const { gameCode } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const { state } = useGame(); // Contains roundEndTime, currentPrompt, etc.

  // We'll display the *same* timeLeft as RoundStart
  const [timeLeft, setTimeLeft] = useState(0);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Phase enforcement (if your server has a "songSelection" phase)
  useEffect(() => {
    if (!socket) return;
    socket.on("game-phase-updated", ({ phase }) => {
      // If the phase changes to something else, redirect
      if (phase !== "songSelection") {
        // e.g., if it goes back to "roundStart" or "lobby"
        if (phase === "roundStart") {
          navigate(`/lobby/${gameCode}/roundstart`, { replace: true });
        } else if (phase === "lobby") {
          navigate(`/lobby/${gameCode}`, { replace: true });
        }
      }
    });
    return () => socket.off("game-phase-updated");
  }, [socket, gameCode, navigate]);

  // Timer logic: same end time as RoundStart
  useEffect(() => {
    const interval = setInterval(() => {
      if (!state.roundEndTime) return;
      const now = Date.now();
      const remaining = Math.floor((state.roundEndTime - now) / 1000);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        console.log("Time is up - finalize selection");
        // Optionally navigate to next phase or auto-submit
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.roundEndTime]);

  // Debounced search effect
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(() => {
      searchSpotifyTracks(searchTerm).then((tracks) => {
        setSearchResults(tracks);
      });
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  async function searchSpotifyTracks(query) {
    let accessToken = localStorage.getItem("spotify_access_token");
    // Refresh if needed
    if (!isTokenValid()) {
      try {
        accessToken = await refreshSpotifyToken();
      } catch (error) {
        console.error("Failed to refresh token:", error);
        return [];
      }
    }

    try {
      const res = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = await res.json();
      if (data.tracks) {
        return data.tracks.items;
      }
    } catch (err) {
      console.error("Spotify search failed:", err);
    }
    return [];
  }

  // Show prompt if user wants to see it again
  const handleViewPrompt = () => {
    navigate(`/lobby/${gameCode}/roundstart`, { replace: true });
  };

  return (
    <div className="song-selection-page flex flex-col h-screen text-white">
      {/* Timer at top center */}
      <div className="timer text-center text-3xl font-bold my-4">{timeLeft}</div>

      {/* Search bar */}
      <div className="search-bar px-4 mb-4">
        <input
          type="text"
          placeholder="What do you want to play?"
          className="w-full rounded-md p-2 text-black"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Scrollable list of results */}
      <div className="results-container flex-1 overflow-y-auto px-4">
        {searchResults.map((track) => {
          // Attempt to get a medium/small album image
          const albumCover =
            track.album?.images?.[1]?.url ||
            track.album?.images?.[0]?.url ||
            "";

          return (
            <div
              key={track.id}
              className="song-item flex items-center p-2 mb-2 bg-gray-800 rounded-md h-20"
            >
              {/* Album cover on the left, consistent sizing */}
              <img
                src={albumCover}
                alt={track.name}
                className="w-16 h-16 object-cover rounded-md mr-4"
              />
              <div className="flex flex-col justify-center">
                <p className="font-semibold">{track.name}</p>
                <p className="text-sm text-gray-300">
                  {track.artists.map((a) => a.name).join(", ")}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer button */}
      <div className="p-4">
        <button
          onClick={handleViewPrompt}
          className="green-btn w-full py-3 rounded-md text-black font-semibold"
        >
          View Prompt
        </button>
      </div>
    </div>
  );
}
