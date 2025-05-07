import React, { useState } from "react";
import AnimatedLogo from "../../components/AnimatedLogo";
import HomeBtn from "../../components/HomeBtn";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../services/SocketProvider";

export default function Home() {
  const socket = useSocket();
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");
  const [isHosting, setIsHosting] = useState(false);

  const handleHostGame = () => {
    if (!socket || isHosting) return;
    
    setIsHosting(true);
    socket.emit("host-game", (response) => {
      if (response.success) {
        console.log("Game hosted successfully:", response.gameCode);
        navigate(`/lobby/${response.gameCode}`);
      } else {
        console.error("Failed to host game:", response.message);
        setIsHosting(false);
      }
    });
  };

  const handleJoinGame = () => {
    if (!socket || !joinCode.trim()) {
      alert("Please enter a valid game code.");
      return;
    }
    
    socket.emit("join-game", { gameCode: joinCode.trim(), name: "Guest" }, (response) => {
      if (response.success) {
        console.log("Joined game successfully:", joinCode);
        navigate(`/lobby/${joinCode.trim()}`);
      } else {
        alert(response.message || "Failed to join game.");
      }
    });
  };

  return (
    <div className="home h-svh flex flex-col items-center relative z-20">
      <div className="home-top flex flex-col items-center my-10">
        <AnimatedLogo />
        <div className="home-join flex flex-col items-center gap-8 w-full max-w-xs">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Enter Code"
            className="join-code text-center text-2xl py-3 text-white"
          />
        </div>
      </div>
      <div className="home-btns flex flex-col items-center gap-6 mb-10 w-full h-full max-w-xs justify-between">
        <HomeBtn 
          onClick={handleJoinGame} 
          className="spotify-btn" 
          text="Join game" 
        />
        <HomeBtn 
          onClick={handleHostGame} 
          className="guest-btn" 
          text={isHosting ? "Hosting..." : "Host game"} 
          disabled={isHosting}
        />
      </div>
    </div>
  );
}
