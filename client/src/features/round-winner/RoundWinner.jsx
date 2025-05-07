import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PromptDisplay from "../../components/PromptDisplay.jsx";
import { useGame } from "../../services/GameContext";
import {
  useSocket,
  useSocketConnection,
  useGameTransition,
} from "../../services/SocketProvider";
import Song from "../../components/Song";
import SearchBar from "../../components/SearchBar";
import recordLogo from "../../components/record-logo.svg";
import nextIcon from "../../assets/next-icon.svg";

export default function RoundWinner() {
  const { gameCode } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const isConnected = useSocketConnection();
  const setGameTransition = useGameTransition();
  const { state, dispatch } = useGame();
  const { roundResults, currentPrompt, currentRound, numberOfRounds } = state;
  const [receivedResults, setReceivedResults] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadingResults, setLoadingResults] = useState(true);

  // Check if this is the final round
  const isFinalRound = currentRound >= numberOfRounds;

  useEffect(() => {
    console.log(
      "RoundWinner mount - state:",
      JSON.stringify(
        {
          hasRoundResults: !!state.roundResults,
          songsCount: state.roundResults?.songs?.length,
          currentPrompt: state.currentPrompt,
          currentRound: state.currentRound,
          numberOfRounds: state.numberOfRounds,
          isFinalRound: isFinalRound,
        },
        null,
        2
      )
    );
  }, [state, isFinalRound]);

  // When this component mounts, we're in a transition
  useEffect(() => {
    setGameTransition(true);

    // Reset transition after a delay
    const timer = setTimeout(() => {
      setGameTransition(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [setGameTransition]);

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected && !isTransitioning) {
      navigate("/lobby", { replace: true });
    }
  }, [isConnected, navigate, isTransitioning]);

  // Check for phase updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handlePhaseUpdate = ({ phase, currentRound }) => {
      if (typeof currentRound !== "undefined") {
        dispatch({ type: "SET_CURRENT_ROUND", payload: currentRound });
      }
      if (phase === "results") {
        // Clear old results and set loading
        dispatch({ type: "SET_ROUND_RESULTS", payload: { songs: [] } });
        setLoadingResults(true);
        setReceivedResults(false);
        // Request new results
        socket.emit("request-round-results", { gameCode });
      }
      if (phase === "lobby") {
        navigate(`/lobby/${gameCode}`, { replace: true });
      } else if (phase === "songSelection") {
        navigate(`/lobby/${gameCode}/round`, { replace: true });
      } else if (phase === "gameOver") {
        navigate(`/lobby/${gameCode}/gamewinner`, { replace: true });
      }
    };

    socket.on("game-phase-updated", handlePhaseUpdate);

    return () => {
      socket.off("game-phase-updated", handlePhaseUpdate);
    };
  }, [socket, gameCode, navigate, dispatch, isConnected]);

  // If we don't have results yet, request them from the server
  useEffect(() => {
    if (!socket || !isConnected || receivedResults) return;

    // Listen for round results if we don't have them yet
    const handleRoundResults = ({ results }) => {
      console.log(
        "Received round results in RoundWinner:",
        JSON.stringify(results, null, 2)
      );
      dispatch({ type: "SET_ROUND_RESULTS", payload: results });
      setReceivedResults(true);
      setLoadingResults(false);
    };

    // Always listen for round-results
    socket.on("round-results", handleRoundResults);

    // If we don't have results, request them
    if (!roundResults?.songs || roundResults.songs.length === 0) {
      setLoadingResults(true);
      socket.emit("request-round-results", { gameCode });
    }

    return () => {
      socket.off("round-results", handleRoundResults);
    };
  }, [socket, isConnected, gameCode, roundResults, dispatch, receivedResults]);

  // Listen for new prompt after next round is initiated
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handlePromptUpdated = ({ prompt }) => {
      dispatch({ type: "SET_PROMPT", payload: prompt });

      // Navigate to round screen with the new prompt
      if (!isTransitioning) {
        setIsTransitioning(true);
        navigate(`/lobby/${gameCode}/round`, { replace: true });
      }
    };

    socket.on("prompt-updated", handlePromptUpdated);

    return () => {
      socket.off("prompt-updated", handlePromptUpdated);
    };
  }, [socket, isConnected, gameCode, navigate, dispatch, isTransitioning]);

  const handleNextRound = () => {
    // Prevent multiple clicks
    if (isTransitioning) return;
    setIsTransitioning(true);

    // Signal we're handling a transition
    setGameTransition(true);

    // Check if this was the final round
    if (isFinalRound) {
      // If this was the last round, emit event but our game-phase-updated handler will
      // redirect to the game winner screen
      dispatch({ type: "SET_GAME_OVER", payload: true });
      socket.emit("next-round", { gameCode });
    } else {
      // Update local state for next round
      dispatch({ type: "NEXT_ROUND" });

      // Emit event to start next round
      socket.emit("next-round", { gameCode });

      // The server will emit a prompt-updated event which we'll catch above
    }
  };

  // Button text changes based on whether this is the final round
  const buttonText = isFinalRound ? "See Final Results" : "Next Round";

  return (
    <div className="relative flex flex-col w-full max-w-7xl mx-auto pt-2 pb-2 px-2 md:p-6 bg-transparent justify-center items-center">
      {/* Next button row */}
      <div className="w-full flex flex-row justify-end mb-2 mt-4">
        <button
          disabled={isTransitioning}
          className={`flex items-center gap-2 py-2 px-4 rounded-md text-white font-semibold cursor-pointer transition-all ${
            isTransitioning ? "opacity-70 cursor-not-allowed" : ""
          }`}
          onClick={handleNextRound}
          style={{ minWidth: "120px" }}
        >
          {buttonText}
          <img src={nextIcon} alt="Arrow Right" className="w-5 h-5 pt-0.5" />
        </button>
      </div>
      {/* Prompt using SearchBar - no extra wrapper */}
      <div className="w-full max-w-3xl mx-auto mb-10 mt-2">
        <SearchBar value={currentPrompt || ""} readOnly onChange={() => {}} />
      </div>
      {/* Winner box: vertical, centered, record count/icon on album top right */}
      {roundResults?.songs && roundResults.songs.length > 0 && (
        <div className="flex flex-col items-center w-full mb-6">
          <div className="relative flex flex-col items-center">
            {/* Winner Song with custom badge */}
            <div className="relative flex flex-col items-center">
              <Song
                track={roundResults.songs[0].name}
                artist={roundResults.songs[0].artist}
                albumCover={roundResults.songs[0].albumCover}
                player={roundResults.songs[0].player?.name}
                rating={roundResults.songs[0].totalRecords}
                winner="winner"
              />
              {/* Custom badge at top right, partially overlapping */}
              <div
                className="absolute -top-5 -right-5 sm:-top-7 sm:-right-7 flex items-center z-20"
                style={{ pointerEvents: "none" }}
              >
                <div className="flex items-center bg-[#191414] bg-opacity-90 rounded-2xl px-2 py-1 shadow-lg">
                  <img
                    src={recordLogo}
                    alt="Record"
                    className="w-8 h-8 sm:w-12 sm:h-12 mr-1"
                  />
                  <span className="text-white text-2xl sm:text-3xl font-bold">
                    x{roundResults.songs[0].totalRecords}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Songs list (not winner) - scrollable if overflow */}
      <div
        className="w-full flex flex-col items-center gap-2 pb-4 overflow-y-auto"
        style={{ maxHeight: "30vh", minHeight: "10rem" }}
      >
        {roundResults?.songs &&
          roundResults.songs.length > 1 &&
          roundResults.songs
            .slice(1)
            .map((song, index) => (
              <Song
                key={song.songId || index}
                track={song.name}
                artist={song.artist}
                albumCover={song.albumCover}
                player={song.player?.name}
                rating={song.totalRecords}
                winner="not-winner"
              />
            ))}
      </div>
      {/* Final round message */}
      {isFinalRound && !loadingResults && (
        <div className="mt-4 mb-2 py-3 px-3 text-center border border-[rgba(104,213,112,0.5)] rounded-lg max-w-lg w-[95%] text-white text-sm md:text-base">
          <h3 className="text-lg md:text-xl font-bold">
            This was the final round!
          </h3>
          <p className="mt-1">
            Click "{buttonText}" to see final game results.
          </p>
        </div>
      )}
    </div>
  );
}
