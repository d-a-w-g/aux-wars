import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGame } from "../../services/GameContext";
import { useSocket } from "../../services/SocketProvider";

export default function RoundStart() {
  const { gameCode } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const { state, dispatch } = useGame();

  const [timeLeft, setTimeLeft] = useState(0);

  // On mount, set a prompt if not already set
  useEffect(() => {
    if (!state.currentPrompt && state.selectedPrompts.length > 0) {
      const randomIndex = Math.floor(Math.random() * state.selectedPrompts.length);
      const chosenPrompt = state.selectedPrompts[randomIndex];
      dispatch({ type: "SET_CURRENT_PROMPT", payload: chosenPrompt });
    }

    // Set roundEndTime if not set. (We only do this once per round.)
    if (!state.roundEndTime) {
      const newEndTime = Date.now() + state.roundLength * 1000;
      dispatch({ type: "SET_ROUND_END_TIME", payload: newEndTime });
    }
  }, [state, dispatch]);

  // Listen for phase updates and force redirect if needed
  useEffect(() => {
    if (!socket) return;
    socket.on("game-phase-updated", ({ phase }) => {
      if (phase !== "roundStart") {
        // For example, if phase reverts back to lobby, force navigation.
        if (phase === "lobby") {
          navigate(`/lobby/${gameCode}`, { replace: true });
        }
      }
    });
    return () => socket.off("game-phase-updated");
  }, [socket, gameCode, navigate]);

  // Countdown logic, referencing roundEndTime in context
  useEffect(() => {
    const interval = setInterval(() => {
      if (!state.roundEndTime) return; // not set yet
      const now = Date.now();
      const remaining = Math.floor((state.roundEndTime - now) / 1000);
      setTimeLeft(remaining);

      // If time is up, go to song selection
      if (remaining <= 0) {
        clearInterval(interval);
        navigate(`/lobby/${gameCode}/songselect`, { replace: true });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.roundEndTime, gameCode, navigate]);

  const handleSelectSong = () => {
    navigate(`/lobby/${gameCode}/songselect`, { replace: true });
  };

  return (
    <div className="round-start-page flex flex-col items-center justify-center text-white p-4">
      <div className="timer text-5xl font-bold my-4">{timeLeft}</div>
      <div className="prompt text-2xl my-4">The prompt is:</div>
      <div className="prompt-text text-xl italic mb-8">
        {state.currentPrompt || "Loading..."}
      </div>
      <button
        onClick={handleSelectSong}
        className="green-btn py-2 px-4 rounded-md text-black font-semibold"
      >
        Select Song &raquo;
      </button>
    </div>
  );
}
