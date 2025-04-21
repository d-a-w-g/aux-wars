import React, { useState } from "react";
import SongItem from "./SongItem";

export default function SongList({ tracks, onSelectSong }) {
  const [selectedTrackId, setSelectedTrackId] = useState(null);

  return (
    <div className="results-container flex-1 overflow-y-auto px-4">
      {tracks.map((track) => (
        <SongItem
          key={track.id}
          track={track}
          selected={track.id === selectedTrackId}
          onSelect={setSelectedTrackId}
          onSelectSong={onSelectSong}
        />
      ))}
    </div>
  );
}
