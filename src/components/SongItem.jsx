import React from "react";
import { motion } from "framer-motion";
import nextIcon from "../assets/next-icon.svg";

export default function SongItem({ track, selected, onSelect, onSelectSong }) {
  // Attempt to get a medium/small album image
  const albumCover =
    track.album?.images?.[1]?.url ||
    track.album?.images?.[0]?.url ||
    "";

  return (
    <motion.div
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className={`song-item flex items-center justify-between p-3 mb-3 rounded-md h-auto ${
        selected ? "bg-gray-800" : "cursor-pointer"
      }`}
      onClick={() => onSelect(track.id)}
    >
      {/* Song Info */}
      <div className="flex items-center gap-4 w-full">
        <img
          src={albumCover}
          alt={track.name}
          className="w-16 h-16 object-cover rounded-md"
        />
        <div className="flex flex-col justify-center flex-1">
          <p className="font-semibold">{track.name}</p>
          <p className="text-sm text-gray-300">
            {track.artists.map((a) => a.name).join(", ")}
          </p>
        </div>

        {/* "Select Song" Button (Only Show If Selected) */}
        {selected && (
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="flex items-center gap-2 green-btn text-black font-semibold py-2 px-4 rounded-md cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onSelectSong(track.id);
            }}
          >
            Select Song
            <img 
              src={nextIcon} 
              alt="Arrow Right" 
              className="w-4 h-4 filter invert pt-0.5"
            />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
