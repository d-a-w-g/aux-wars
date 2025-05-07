import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../../services/GameContext';
import { useSocket, useSocketConnection, useGameTransition } from '../../services/SocketProvider';
import Song from '../../components/Song';

export default function GameWinner() {
  const { gameCode } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const isConnected = useSocketConnection();
  const setGameTransition = useGameTransition();
  const { state, dispatch } = useGame();
  const { roundResults, allRoundResults } = state;
  
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
    if (!isConnected) {
      navigate("/lobby", { replace: true });
    }
  }, [isConnected, navigate]);
  
  // Compute the overall winners based on all round results
  const computeOverallWinners = () => {
    // If we don't have allRoundResults, use the current round results
    if (!allRoundResults || Object.keys(allRoundResults).length === 0) {
      return roundResults?.songs || [];
    }
    
    // Create a map to track total points by player
    const playerScores = {};
    
    // Tally up scores from all rounds
    Object.values(allRoundResults).forEach(round => {
      if (!round.songs) return;
      
      round.songs.forEach(song => {
        const playerId = song.player?.id;
        if (!playerId) return;
        
        const playerName = song.player.name;
        
        if (!playerScores[playerId]) {
          playerScores[playerId] = {
            playerId,
            playerName,
            totalScore: 0,
            songCount: 0,
            bestSong: null
          };
        }
        
        playerScores[playerId].totalScore += song.averageRating || 0;
        playerScores[playerId].songCount += 1;
        
        // Track player's best song
        if (!playerScores[playerId].bestSong || 
            (song.averageRating > playerScores[playerId].bestSong.averageRating)) {
          playerScores[playerId].bestSong = song;
        }
      });
    });
    
    // Convert to array and sort by average score
    return Object.values(playerScores)
      .map(player => ({
        ...player,
        averageScore: player.songCount > 0 ? player.totalScore / player.songCount : 0
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .map((player, index) => ({
        ...player.bestSong,
        isWinner: index === 0,
        playerScore: player.averageScore.toFixed(1),
        player: { id: player.playerId, name: player.playerName }
      }));
  };
  
  const winners = computeOverallWinners();
  
  const handleReturnToLobby = () => {
    // Signal we're handling a transition
    setGameTransition(true);
    
    // Reset game state
    dispatch({ type: "RESET_GAME" });
    
    // Emit event to return to lobby
    socket.emit("return-to-lobby", { gameCode });
    
    // Navigate to lobby
    navigate(`/lobby/${gameCode}`, { replace: true });
  };

  return (
    <div className="relative flex flex-col items-center w-full max-w-7xl mx-auto p-5 md:p-6">
      <div className="text-center w-full mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Game Over!</h1>
        <p className="text-xl text-gray-300">Final Results</p>
      </div>
      
      {winners.length > 0 && (
        <div className="w-full mb-10">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-[#68d570]">Game Winner</h2>
            <p className="text-gray-300 mt-2">
              {winners[0].player.name} - Average Score: {winners[0].playerScore}
            </p>
          </div>
          
          <div className="w-full flex flex-col items-center">
            {winners.map((winner, index) => (
              <div key={index} className="w-full mb-6">
                {index === 0 && (
                  <div className="text-center text-lg text-white mb-2">
                    🏆 Best Song 🏆
                  </div>
                )}
                <Song 
                  track={winner.name}
                  artist={winner.artist}
                  player={winner.player?.name || 'Unknown Player'}
                  albumCover={winner.albumCover}
                  rating={winner.playerScore} // Show player's average score
                  winner={winner.isWinner ? "winner" : "false"}
                />
                {index === 0 && <div className="h-8 md:h-10"></div>}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {winners.length === 0 && (
        <div className="text-center text-white mt-10 p-6 border border-gray-700 rounded-lg">
          <p className="mb-4">No results available</p>
        </div>
      )}
      
      <button 
        className="mt-6 px-6 py-3 md:px-8 md:py-4 bg-[#68d570] text-[#121212] border-none rounded-full cursor-pointer font-bold text-lg transition-all hover:scale-105 hover:bg-[#7de884]"
        onClick={handleReturnToLobby}
      >
        Return to Lobby
      </button>
    </div>
  );
}; 