import React from "react";
import SongItem from "./SongItem";

export default function SongList({ tracks }) {
  return (
    <div className="results-container flex-1 overflow-y-auto px-4">
      {tracks.map((track) => (
        <SongItem key={track.id} track={track} />
      ))}
    </div>
  );
}
