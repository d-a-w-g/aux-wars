import React from "react";
import searchIcon from "../assets/search-icon.svg";

export default function SearchBar({
  value,
  onChange,
  placeholder = "",
  readOnly = false,
}) {
  return (
    <div className="search-area flex justify-center">
      <div
        className="search-bar flex gap-2.5 rounded-md"
        style={{
          width: "356px",
          height: "56px",
          backgroundColor: "#242424",
          opacity: 0.85,
          padding: "1rem",
          fontSize: "16px",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Optional search icon if needed */}
        <img src={searchIcon} alt="Search Icon" className="w-5 flex-shrink-0" />
        <input
          type="text"
          className={
            readOnly
              ? "w-full text-white focus:outline-none opacity-50"
              : "w-full text-white focus:outline-none"
          }
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}
