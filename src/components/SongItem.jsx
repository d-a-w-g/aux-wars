import React from "react";

export default function SongItem({ track }) {
  // Attempt to get a medium/small album image
  const albumCover =
    track.album?.images?.[1]?.url ||
    track.album?.images?.[0]?.url ||
    "";

  return (
    <div
      className="song-item flex items-center p-2 mb-2 rounded-md h-20"
    >
      <img
        src={albumCover}
        alt={track.name}
        className="w-16 h-16 object-cover rounded-md mr-4"
      />
      <div className="flex flex-col justify-center">
        <p className="font-semibold">{track.name}</p>
        <p className="text-sm text-gray-300">
          {track.artists.map((a) => a.name).join(", ")}
        </p>
      </div>
    </div>
  );
}
