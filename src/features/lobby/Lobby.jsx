import React, { useState, useEffect } from "react";
import { useSocket } from "../../services/SocketProvider";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import PlayerList from "../../components/PlayerList";
import SettingsModal from "../../components/SettingsModal";
import { useGame } from "../../services/GameContext";
import logo from "../../assets/aux-wars-logo.svg";
import settingsIcon from "../../assets/settings-btn.svg";

export default function Lobby() {
  const socket = useSocket();
  const navigate = useNavigate();
  const { gameCode: routeGameCode } = useParams();
  const { dispatch } = useGame();
  const [players, setPlayers] = useState([]);
  const [gameCode, setGameCode] = useState(routeGameCode || "");
  const [name, setName] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [animateInput, setAnimateInput] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const allPlayersReady = players.every((player) => player.isReady);

  useEffect(() => {
    if (!socket) return;
    if (!routeGameCode) {
      socket.emit("host-game", (response) => {
        if (response.success) {
          setGameCode(response.gameCode);
          socket.emit("join-game", { gameCode: response.gameCode, name }, (res) => {
            if (!res.success) {
              console.error("Join failed:", res.message);
              navigate("/lobby"); // Redirect if join fails
            }
          });
        } else {
          console.error("Failed to host game");
          navigate("/lobby");
        }
      });
    } else {
      setGameCode(routeGameCode);
      socket.emit("join-game", { gameCode: routeGameCode, name }, (response) => {
        console.log("join-game callback response", response);
        if (!response.success) {
          console.error("Join failed:", response.message);
          navigate("/lobby"); // Redirect if game doesn't exist
        }
      });
    }
    socket.on("update-players", (updatedPlayers) => setPlayers(updatedPlayers));
    return () => socket.off("update-players");
  }, [socket, routeGameCode, navigate]);

  useEffect(() => {
    const currentPlayer = players.find((player) => player.id === socket?.id);
    if (currentPlayer) setIsHost(currentPlayer.isHost);
  }, [players, socket]);

  // This useEffect will update the player's name and ready status (and is independent of the join-game effect)
  useEffect(() => {
    if (gameCode) socket.emit("update-player-name", { gameCode, name, isReady });
  }, [name, isReady, gameCode, socket]);

  // Listen for game settings updates from the server
  useEffect(() => {
    if (!socket) return;
    socket.on("game-settings-updated", (updatedSettings) => {
      dispatch({ type: "SET_ROUNDS", payload: updatedSettings.numberOfRounds });
      dispatch({ type: "SET_ROUND_LENGTH", payload: updatedSettings.roundLength });
      dispatch({ type: "SET_SELECTED_PROMPTS", payload: updatedSettings.selectedPrompts });
    });
    return () => socket.off("game-settings-updated");
  }, [socket, dispatch]);

  const handleLeaveGame = () => {
    if (gameCode) {
      socket.emit("leave-game", { gameCode });
      navigate("/");
    }
  };

  const pulseAnimation = { scale: [1, 1.05, 1], transition: { duration: 1, repeat: 3, ease: "easeInOut" } };

  const handleReady = () => {
    if (!name.trim()) {
      alert("Please set your nickname before readying up.");
      return;
    }
    setIsReady((prev) => !prev);
    socket.emit("update-player-name", { gameCode, name, isReady: !isReady });
  };

  return (
    <>
      <div className={`player-lobby h-svh flex flex-col w-full ${showModal ? "blur-sm" : ""}`}>
        <div className="lobby-header flex justify-between items-center mt-10 container mx-auto p-5">
          <div className="lobby-header-left flex items-center gap-2">
            <img src={logo} alt="Logo" className="min-w-10" />
            <p className="text-2xl text-white">Lobby</p>
          </div>
          <motion.div initial={{ scale: 1 }} whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
            <button className="green-btn rounded-full py-2 px-4 font-semibold" onClick={handleLeaveGame}>
              <p className="text-xs md:text-sm">Leave Lobby</p>
            </button>
          </motion.div>
        </div>
        <div className="lobby-body">
          <div className="lobby-info flex flex-col sm:items-start container mx-auto px-5 py-4 text-white gap-10">
            <p className="text-xl">Nickname:</p>
            <div className="flex flex-col gap-5 w-full">
              <motion.input
                type="text"
                className="w-full rounded-md"
                placeholder="Enter your nickname"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                <motion.div className="w-full flex items-center justify-center" initial={{ scale: 1 }} whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
                  <button
                    className={isReady ? "green-btn rounded-full py-2 px-8 text-black font-semibold w-full max-w-md" : "bg-white rounded-full py-2 px-8 text-black w-full max-w-md font-semibold"}
                    onClick={handleReady}
                  >
                    <p className="text-sm md:text-base">{isReady ? "Ready" : "Not Ready"}</p>
                  </button>
                </motion.div>
              </div>
            </div>
            <div className="flex w-full items-center justify-between">
              <p className="text-center text-2xl">Players</p>
              <button onClick={() => setShowModal(true)}>
                <img src={settingsIcon} alt="Settings" className="min-w-6" />
              </button>
            </div>
            <PlayerList players={players} />
          </div>
          {isHost && allPlayersReady && players.length > 2 && (
            <button className="green-btn fixed bottom-0 w-full text-black py-3 text-center">
              Start Game
            </button>
          )}
        </div>
      </div>
      <SettingsModal showModal={showModal} onClose={() => setShowModal(false)} gameCode={gameCode} />
    </>
  );
}
