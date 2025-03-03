import React, { useEffect, useState } from "react";
import { useSocket } from "../../services/SocketProvider";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import PlayerList from "../../components/PlayerList";
import SettingsModal from "../../components/SettingsModal";
import logo from "../../assets/aux-wars-logo.svg";
import spotifyIcon from "../../assets/spotify-icon.svg";

export default function Lobby() {
  const socket = useSocket();
  const navigate = useNavigate();
  const { gameCode: routeGameCode } = useParams();
  const [players, setPlayers] = useState([]);
  const [gameCode, setGameCode] = useState(routeGameCode || "");
  const [name, setName] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [animateInput, setAnimateInput] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const allPlayersReady = players.every((player) => player.isReady);

  // Join the game immediately when the component mounts.
  useEffect(() => {
    if (!socket) return;

    if (!routeGameCode) {
      // Host a new game if no game code is in the URL.
      socket.emit("host-game", (response) => {
        if (response.success) {
          setGameCode(response.gameCode);
          // Immediately join the newl y hosted game (even if name is empty).
          socket.emit("join-game", { gameCode: response.gameCode, name }, (res) => {
            if (!res.success) console.error(res.message);
          });
        } else {
          console.error("Failed to host game");
        }
      });
    } else {
      setGameCode(routeGameCode);
      // Immediately join the existing game regardless of name.
      socket.emit("join-game", { gameCode: routeGameCode, name }, (response) => {
        if (!response.success) console.error(response.message);
      });
    }

    // Listen for updates on the player list.
    socket.on("update-players", (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    return () => {
      socket.off("update-players");
    };
  }, [socket, routeGameCode]);

  // Update host status based on the players list.
  useEffect(() => {
    const currentPlayer = players.find((player) => player.id === socket?.id);
    if (currentPlayer) {
      setIsHost(currentPlayer.isHost);
    }
  }, [players, socket]);

  const handleLeaveGame = () => {
    if (gameCode) {
      socket.emit("leave-game", { gameCode });
      navigate("/");
    }
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: { duration: 1, repeat: 3, ease: "easeInOut" },
  };

  // Toggle readiness and update the server.
  const handleReady = () => {
    setIsReady((prev) => !prev);
    socket.emit("update-player-name", { gameCode, name, isReady: !isReady });
  };

  return (
    <>
      <div className={`player-lobby h-svh flex flex-col relative z-10 ${showModal ? "blur-sm" : ""}`}>
        {/* Header */}
        <div className="lobby-header flex justify-between items-center mt-10 container mx-auto p-5">
          <div className="lobby-header-left flex items-center gap-2">
            <img src={logo} alt="Logo" className="min-w-10" />
            <p className="text-2xl text-white">Lobby</p>
          </div>
          <motion.div
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <button className="leave-btn rounded-full py-2 px-4" onClick={handleLeaveGame}>
              <p className="text-xs md:text-sm">Leave Lobby</p>
            </button>
          </motion.div>
        </div>

        {/* Body */}
        <div className="lobby-body">
          <div className="lobby-info flex flex-col sm:items-start container mx-auto px-5 py-4 text-white gap-10">
            <p className="text-xl">Nickname:</p>
            <div className="flex flex-col gap-5 w-full">
              <motion.input
                type="text"
                className="w-full rounded-md"
                placeholder="Enter your nickname"
                value={name}
                onChange={(e) => {
                  const newName = e.target.value;
                  setName(newName);
                  // Update the player's name immediately on change.
                  socket.emit("update-player-name", { gameCode, name: newName, isReady });
                }}
                animate={animateInput ? pulseAnimation : {}}
              />
              <div className="lobby-code-count flex gap-5">
                <div className="lobby-container rounded-md lobby-code flex flex-col gap-2">
                  <p className="text-xs font-normal">Code</p>
                  <p className="text-2xl">{gameCode}</p>
                </div>
                <div className="lobby-container rounded-md lobby-count flex flex-col gap-2">
                  <p className="text-xs font-normal">Players</p>
                  <p className="text-2xl">{players.length}/8</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-5">
                <motion.div
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <button
                    className={
                      isReady
                        ? "join-btn rounded-full py-2 px-8"
                        : "spotify-btn rounded-full py-2 px-8"
                    }
                    onClick={handleReady}
                  >
                    <p className="text-sm md:text-base">{isReady ? "Ready" : "Not Ready"}</p>
                  </button>
                </motion.div>
                <motion.div
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <button className="spotify-btn rounded-full py-2 px-8">
                    <img src={spotifyIcon} alt="Spotify Icon" className="min-w-8" />
                    <p className="text-sm md:text-base">Powered By SpotifyAPI</p>
                  </button>
                </motion.div>
              </div>
            </div>
            <div className="flex w-full items-center justify-between">
              <p className="text-center text-2xl">Players</p>
              <button onClick={() => setShowModal(true)}>
                {/* You can add a settings icon here if desired */}
              </button>
            </div>
            <PlayerList players={players} />
          </div>
          {isHost && allPlayersReady && (
            <button className="start-btn fixed bottom-0 w-full text-black py-3 text-center">
              Start Game
            </button>
          )}
        </div>
      </div>
      <SettingsModal showModal={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
