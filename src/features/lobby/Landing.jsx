import React from "react";
import AnimatedLogo from "../../components/AnimatedLogo";
import HomeBtn from "../../components/HomeBtn";

export default function Landing() {
  return (
    <div className="landing h-svh flex flex-col items-center relative z-20 landing-bg">
      <div className="landing-top flex flex-col items-center my-10">
        <AnimatedLogo />
        <div className="landing-join flex flex-col items-center gap-8 w-full max-w-xs">
          <input
            type="text"
            placeholder="Enter Code"
            className="join-code text-center text-2xl py-3 text-white"
          />
        </div>
      </div>
      <div className="landing-btns flex flex-col items-center gap-6 mb-10 w-full h-full max-w-xs justify-between">
        <HomeBtn className="spotify-btn" text="Join game" />
        <HomeBtn className="guest-btn" text="Host game" />
      </div>
    </div>
  );
}
