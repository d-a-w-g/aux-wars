import React from "react";
import AnimatedLogo from "../../components/AnimatedLogo";
import spotifyIcon from "../../assets/spotify-icon.svg";
import HomeBtn from "../../components/HomeBtn";
import { useNavigate } from "react-router-dom";
import { generateRandomString, generateCodeChallenge } from "../../services/spotifyAuth";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = async (loginType) => {
    if (loginType === "spotify") {
      const existingAccessToken = localStorage.getItem("spotify_access_token");
      if (existingAccessToken) {
        console.log("Access token already exists. Navigating to lobby...");
        navigate("/lobby");
        return;
      }

      const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
      const scope = "user-read-private user-read-email";

      const codeVerifier = generateRandomString(128);
      localStorage.setItem("spotify_code_verifier", codeVerifier);
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = generateRandomString(16);

      const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&scope=${encodeURIComponent(scope)}&state=${state}&code_challenge_method=S256&code_challenge=${codeChallenge}`;

      window.location.href = authUrl;
    } else if (loginType === "guest") {
      navigate("/lobby");
    }
  };

  const buttons = [
    {
      className: "spotify-btn",
      icon: spotifyIcon,
      text: "Login with Spotify",
      type: "spotify",
      padding: "py-3 px-6",
    },
    {
      className: "guest-btn",
      text: "Play As Guest",
      type: "guest",
      padding: "py-3 px-6",
    },
  ];

  return (
    <div className="login h-screen flex flex-col justify-between py-6">
      <div className="login-top flex flex-col items-center gap-10 my-10">
        <AnimatedLogo />
        <div className="login-btns flex flex-col items-center gap-10 w-full max-w-xs">
          {buttons.map(({ className, icon, text, type, padding }, index) => (
            <HomeBtn
              key={index}
              onClick={() => handleLogin(type)}
              className={className}
              icon={icon}
              text={text}
              padding={padding}
            />
          ))}
        </div>
      </div>
      <div className="text-center pb-6 text-white">
        <p className="text-sm md:text-base cursor-pointer hover:underline">
          How to play
        </p>
      </div>
    </div>
  );
}
