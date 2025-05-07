import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../../services/GameContext';
import { useSocket, useSocketConnection, useGameTransition } from '../../services/SocketProvider';
import PlayerResult from '../../components/PlayerResult';
import AnimatedLogo from '../../components/AnimatedLogo';
import backIcon from '../../assets/back-icon.svg';

export default function GameWinner() {
  const { gameCode } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const isConnected = useSocketConnection();
  const setGameTransition = useGameTransition();
  const { state, dispatch } = useGame();
  const { allRoundResults } = state;

  useEffect(() => {
    setGameTransition(true);
    const timer = setTimeout(() => {
      setGameTransition(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [setGameTransition]);

  useEffect(() => {
    if (!isConnected) {
      navigate("/lobby", { replace: true });
    }
  }, [isConnected, navigate]);

  // Build player stats: wins, total records, songs per round
  const buildPlayerStats = () => {
    const stats = {};
    Object.values(allRoundResults || {}).forEach((round, roundIdx) => {
      if (!round.songs) return;
      // Find the winner song for this round
      const winnerSongId = round.winnerSongId;
      round.songs.forEach(song => {
        const playerId = song.player?.id;
        if (!playerId) return;
        if (!stats[playerId]) {
          stats[playerId] = {
            playerId,
            playerName: song.player.name,
            wins: 0,
            totalRecords: 0,
            songs: [],
          };
        }
        // Add song for this round
        stats[playerId].songs.push({
          ...song,
          round: roundIdx + 1,
          isRoundWinner: song.songId === winnerSongId
        });
        // Add records
        stats[playerId].totalRecords += song.totalRecords || 0;
        // Add win if this song was the round winner
        if (song.songId === winnerSongId) {
          stats[playerId].wins += 1;
        }
      });
    });
    return Object.values(stats);
  };

  // Sort: most wins, then most records
  const sortedPlayers = buildPlayerStats()
    .sort((a, b) => b.wins - a.wins || b.totalRecords - a.totalRecords);

  // Winner is first in sorted list
  const winner = sortedPlayers[0];
  // Remove winner from the rest of the list
  const rest = sortedPlayers.slice(1);

  const handleReturnToLobby = () => {
    setGameTransition(true);
    dispatch({ type: "RESET_GAME" });
    socket.emit("return-to-lobby", { gameCode });
    navigate(`/lobby/${gameCode}`, { replace: true });
  };

  return (
    <div className="relative flex flex-col w-full max-w-7xl mx-auto pt-2 pb-2 px-2 md:p-6 bg-transparent items-center">
      {/* Back button at top left */}
      <div className="w-full flex flex-row justify-start mb-2 mt-4">
        <button
          className="flex items-center gap-2 py-2 px-4 rounded-md text-white font-semibold cursor-pointer transition-all bg-[#242424] hover:bg-[#191414]"
          onClick={handleReturnToLobby}
        >
          <img src={backIcon} alt="Back" className="w-5 h-5 pt-0.5" />
          <span>Exit</span>
        </button>
      </div>
      {/* Animated Logo at the top */}
      <div className="flex justify-center w-full mb-4">
        <AnimatedLogo />
      </div>
      {/* Winner section */}
      {winner && (
        <PlayerResult
          playerName={winner.playerName}
          albums={winner.songs.map(song => song.albumCover)}
          wins={winner.wins}
          totalRecords={winner.totalRecords}
          isWinner={true}
        />
      )}
      {/* All other players list - scrollable if overflow */}
      <div className="w-full flex flex-col items-center gap-2 pb-4 overflow-y-auto" style={{ maxHeight: '30vh', minHeight: '10rem' }}>
        {rest.map((player, idx) => (
          <PlayerResult
            key={player.playerId}
            playerName={player.playerName}
            albums={player.songs.map(song => song.albumCover)}
            wins={player.wins}
            totalRecords={player.totalRecords}
            isWinner={false}
          />
        ))}
      </div>
    </div>
  );
} 