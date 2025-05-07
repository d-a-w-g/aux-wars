import React from "react";
import searchIcon from "../assets/search-icon.svg";

export default function PromptDisplay({ prompt = "Prompt Here" }) {
  return (
    <div className="search-area flex justify-center">
      <div
        className="search-bar flex items-center gap-2.5 rounded-md"
        style={{
          width: "356px",
          height: "56px",
          backgroundColor: "#242424",
          opacity: 0.85,
          padding: "1rem",
          fontSize: "16px",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "white",
        }}
      >
        <img src={searchIcon} alt="Search Icon" className="w-5 flex-shrink-0" />
        <span className="text-white">{prompt}</span>
      </div>
    </div>
  );
}
