import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGame } from "../../services/GameContext";
import { useSocket } from "../../services/SocketProvider";
import { isTokenValid, refreshSpotifyToken } from "../../services/spotifyApi";

export default function Round() {
  const { gameCode } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const { state, dispatch } = useGame();

  // Local UI states
  const [isSongSelectionView, setIsSongSelectionView] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showPromptModal, setShowPromptModal] = useState(false);

  // Listen for prompt updates from the server and update state.
  useEffect(() => {
    if (socket) {
      console.log("Listening for prompt-updated event");
      socket.on("prompt-updated", ({ prompt }) => {
        console.log("Received prompt-updated event:", prompt);
        dispatch({ type: "SET_CURRENT_PROMPT", payload: prompt });
      });
    }
    return () => {
      if (socket) socket.off("prompt-updated");
    };
  }, [socket, dispatch]);

  // Request the prompt if not already set.
  useEffect(() => {
    console.log("Round is mounting; currentPrompt is:", state.currentPrompt);
    if (socket && !state.currentPrompt) {
      console.log("Sending request-prompt for game code:", gameCode);
      socket.emit("request-prompt", { gameCode });
    }
  }, [socket, state.currentPrompt, gameCode]);
  

  // Listen for phase updates to enforce correct routing.
  useEffect(() => {
    if (!socket) return;
    socket.on("game-phase-updated", ({ phase }) => {
      if (phase === "lobby") {
        navigate(`/lobby/${gameCode}`, { replace: true });
      }
    });
    return () => socket.off("game-phase-updated");
  }, [socket, gameCode, navigate]);

  // Spotify search logic (unchanged)
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
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          query
        )}&type=track&limit=10`,
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

  return (
    <div className="round-start-songselect-page flex flex-col items-center justify-center text-white p-4">
      {!isSongSelectionView ? (
        // --- Round Start View ---
        <div className="round-start-view flex flex-col items-center">
          <h1 className="text-4xl font-bold mb-4">Round Start</h1>
          <div className="prompt text-2xl mb-2">The prompt is:</div>
          <div className="prompt-text text-xl italic mb-8">
            {state.currentPrompt || "Loading..."}
          </div>
          <button
            onClick={() => setIsSongSelectionView(true)}
            className="green-btn py-2 px-4 rounded-md text-black font-semibold"
          >
            Select Song &raquo;
          </button>
        </div>
      ) : (
        // --- Song Selection View ---
        <div className="song-selection-view flex flex-col h-screen w-full">
          <div className="search-bar px-4 mb-4">
            <input
              type="text"
              placeholder="What do you want to play?"
              className="w-full rounded-md p-2 text-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="results-container flex-1 overflow-y-auto px-4">
            {searchResults.map((track) => {
              const albumCover =
                track.album?.images?.[1]?.url ||
                track.album?.images?.[0]?.url ||
                "";
              return (
                <div
                  key={track.id}
                  className="song-item flex items-center p-2 mb-2 bg-gray-800 rounded-md h-20"
                >
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
          <div className="p-4">
            <button
              onClick={() => setShowPromptModal(true)}
              className="green-btn w-full py-3 rounded-md text-black font-semibold"
            >
              View Prompt
            </button>
          </div>
        </div>
      )}
      {showPromptModal && (
        <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-gray-900 p-6 rounded-md text-center">
            <h2 className="text-2xl font-bold mb-4">Current Prompt</h2>
            <p className="text-xl italic mb-6">
              {state.currentPrompt || "Loading..."}
            </p>
            <button
              onClick={() => setShowPromptModal(false)}
              className="green-btn py-2 px-4 rounded-md text-black font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
