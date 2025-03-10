import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGame } from "../../services/GameContext";
import { useSocket } from "../../services/SocketProvider";
import { searchSpotifyTracks } from "../../services/spotifyApi";
import SongList from "../../components/SongList";
import SearchBar from "../../components/SearchBar";
import nextIcon from "../../assets/next-icon.svg";

export default function Round() {
  const { gameCode } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const { state, dispatch } = useGame();

  const [isSongSelectionView, setIsSongSelectionView] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showPromptModal, setShowPromptModal] = useState(false);

  // Listen for prompt updates
  useEffect(() => {
    if (socket) {
      socket.on("prompt-updated", ({ prompt }) => {
        dispatch({ type: "SET_CURRENT_PROMPT", payload: prompt });
      });
    }
    return () => {
      if (socket) socket.off("prompt-updated");
    };
  }, [socket, dispatch]);

  // If we have no prompt, request it from the server
  useEffect(() => {
    if (socket && !state.currentPrompt) {
      socket.emit("request-prompt", { gameCode });
    }
  }, [socket, state.currentPrompt, gameCode]);

  // Listen for phase changes (e.g., back to lobby)
  useEffect(() => {
    if (!socket) return;
    socket.on("game-phase-updated", ({ phase }) => {
      if (phase === "lobby") {
        navigate(`/lobby/${gameCode}`, { replace: true });
      }
    });
    return () => socket.off("game-phase-updated");
  }, [socket, gameCode, navigate]);

  // Spotify search logic
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      const tracksOrError = await searchSpotifyTracks(searchTerm);
      if (tracksOrError?.error === "refresh_revoked") {
        // Refresh token was revoked
        alert("Your Spotify login has expired. Please log in again.");
        // Option 1: navigate user to login
        navigate("/", { replace: true });
        return;
      }
      // Otherwise, it's an array of tracks (or empty)
      setSearchResults(tracksOrError);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, navigate]);

  return (
    <div className="round-start flex flex-col items-center justify-center text-white p-4">
      {!isSongSelectionView ? (
        /* -------- Round Start View -------- */
        <div className="flex flex-col items-center gap-10">
          <h1 className="text-7xl font-bold">The prompt is:</h1>

          {/* Reuse SearchBar for displaying the prompt (readOnly) */}
          <SearchBar
            value={state.currentPrompt || ""}
            onChange={() => {}}
            readOnly
          />

          <button
            onClick={() => setIsSongSelectionView(true)}
            className="flex items-center justify-center gap-2 py-2 px-4 rounded-md text-white font-semibold cursor-pointer"
          >
            <span>Select Song</span>
            <img src={nextIcon} alt="Arrow Right" className="w-5 h-5 pt-0.5" />
          </button>
        </div>
      ) : (
        /* -------- Song Selection View -------- */
        <div
          className={`song-selection-view flex flex-col h-screen w-full ${
            showPromptModal ? "blur-sm" : ""
          }`}
        >
          <div className="flex justify-center mt-32 mb-4 px-4">
            {/* Reuse SearchBar for searching songs (NOT readOnly) */}
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="What do you want to play?"
            />
          </div>

          <SongList tracks={searchResults} />

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

      {/* Prompt Modal */}
      {showPromptModal && (
        <div className="prompt-modal fixed inset-0 flex items-center justify-center bg-black">
          <div className="prompt-modal-content p-6 rounded-md text-center flex flex-col items-center gap-6">
            <h1 className="text-7xl font-bold">The prompt is:</h1>

            {/* Use SearchBar to display the prompt (readOnly) */}
            <SearchBar
              value={state.currentPrompt || "Loading..."}
              onChange={() => {}}
              readOnly
            />

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
