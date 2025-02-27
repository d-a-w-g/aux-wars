import React from "react";
import AnimatedLogo from "../../components/AnimatedLogo";
import spotifyIcon from "../../assets/spotify-icon.svg";
import { motion } from "framer-motion";

export default function Login() {
  return (
    <div className="landing h-screen flex flex-col justify-between py-6 relative z-20">
      <div className="landing-top flex flex-col items-center gap-10 my-10">
        <AnimatedLogo />
        <div className="landing-btns flex flex-col items-center gap-10 w-full max-w-xs">
          {[{
            className: "spotify-btn",
            icon: spotifyIcon,
            text: "Login with Spotify",
          }, {
            className: "guest-btn",
            text: "Play As Guest",
          }].map(({ className, icon, text }, index) => (
            <motion.button
              key={index}
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className={`${className} rounded-full py-3 px-6 flex items-center gap-2 justify-center`}
            >
              {icon && <img src={icon} alt="Button Icon" className="w-5 md:w-8" />}
              <p className="text-sm md:text-lg font-semibold">{text}</p>
            </motion.button>
          ))}
        </div>
      </div>
      <div className="text-center pb-6">
        <p className="text-sm md:text-base cursor-pointer hover:underline">How to play</p>
      </div>
    </div>
  );
}