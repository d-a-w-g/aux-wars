import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PromptDisplay from '../../components/PromptDisplay.jsx';
import { useGame } from '../../services/GameContext';
import { useSocket, useSocketConnection, useGameTransition } from '../../services/SocketProvider';
import Song from '../../components/Song';

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
  
  // Check if this is the final round
  const isFinalRound = currentRound >= numberOfRounds;
  
  useEffect(() => {
    console.log("RoundWinner mount - state:", JSON.stringify({
      hasRoundResults: !!state.roundResults,
      songsCount: state.roundResults?.songs?.length,
      currentPrompt: state.currentPrompt,
      currentRound: state.currentRound,
      numberOfRounds: state.numberOfRounds,
      isFinalRound: isFinalRound
    }, null, 2));
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
    if (!socket) return;
    
    const handlePhaseUpdate = ({ phase }) => {
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
  }, [socket, gameCode, navigate]);
  
  // If we don't have results yet, request them from the server
  useEffect(() => {
    if (!socket || !isConnected || receivedResults) return;
    
    // Listen for round results if we don't have them yet
    const handleRoundResults = ({ results }) => {
      console.log("Received round results in RoundWinner:", JSON.stringify(results, null, 2));
      dispatch({ type: "SET_ROUND_RESULTS", payload: results });
      setReceivedResults(true);
    };
    
    // Request results from server if we don't have them
    if (!roundResults?.songs || roundResults.songs.length === 0) {
      console.log("No round results yet, listening for them...");
      socket.on("round-results", handleRoundResults);
      
      // Request round results from server
      socket.emit("request-round-results", { gameCode });
    } else {
      setReceivedResults(true);
      console.log("Already have round results:", JSON.stringify(roundResults, null, 2));
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
    <div className="relative flex flex-col items-center w-full max-w-7xl mx-auto p-5 md:p-6"> 
      <div className="flex justify-between items-center w-full mb-5 md:mb-6">
        <div className="flex-1">
          <PromptDisplay prompt={currentPrompt} />
        </div>
        <button 
          disabled={isTransitioning}
          className={`px-4 py-2 md:px-5 md:py-2.5 bg-[#68d570] text-[#121212] border-none rounded-full cursor-pointer font-bold text-base transition-all hover:scale-105 hover:bg-[#7de884] ${isTransitioning ? 'opacity-70 cursor-not-allowed' : ''}`}
          onClick={handleNextRound}
        >
          {buttonText}
        </button>
      </div>
      
      <div className="flex flex-col items-center w-full mb-6">
        <h2 className="text-white text-2xl z-10 mb-2">Round Results</h2>
        <div className="text-gray-300 text-sm">
          Round {currentRound} of {numberOfRounds}
        </div>
      </div>
      
      <div className="w-full flex flex-col items-center">
        {roundResults?.songs && roundResults.songs.length > 0 ? (
          roundResults.songs.map((song, index) => (
            <Song 
              key={index}
              track={song.name}
              artist={song.artist}
              player={song.player?.name || 'Unknown Player'}
              albumCover={song.albumCover}
              rating={Math.round(song.averageRating * 10) / 10} // Round to 1 decimal place
              winner={song.isWinner ? "winner" : "false"}
            />
          ))
        ) : (
          <div className="text-center text-white mt-10 p-6 border border-gray-700 rounded-lg">
            <p className="mb-4">No songs submitted in this round</p>
            <button 
              className="px-4 py-2 bg-[#68d570] text-[#121212] border-none rounded-full cursor-pointer font-bold"
              onClick={() => navigate(`/lobby/${gameCode}`, { replace: true })}
            >
              Return to Lobby
            </button>
          </div>
        )}
      </div>
      
      {/* Final round message */}
      {isFinalRound && (
        <div className="mt-8 mb-4 py-4 px-5 text-center border border-[rgba(104,213,112,0.5)] rounded-lg max-w-lg w-[90%] text-white">
          <h3 className="text-xl font-bold">This was the final round!</h3>
          <p className="mt-2">Click "{buttonText}" to see final game results.</p>
        </div>
      )}
    </div>
  );   
};