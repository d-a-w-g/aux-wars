import React, { useState } from "react";
import SearchBar from "../../components/SearchBar";
import SongList from "../../components/SongList";

export default function SongSelection({ 
  searchTerm, 
  onSearchChange, 
  searchResults, 
  onSelectSong, 
  onShowPrompt,
  showPromptModal 
}) {
  const [selectedTrack, setSelectedTrack] = useState(null);

  // Handle selecting a track
  const handleSelectTrack = (track) => {
    setSelectedTrack(track);
  };

  // Handle final submission
  const handleConfirmTrack = (track) => {
    onSelectSong(track);
  };

  return (
    <div
      className={`song-selection-view flex flex-col h-screen w-full ${
        showPromptModal ? "blur-sm" : ""
      }`}
    >
      <div className="flex justify-center mt-32 mb-4 px-4">
        <SearchBar
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="What do you want to play?"
        />
      </div>

      <SongList 
        tracks={searchResults} 
        selectedTrack={selectedTrack}
        onSelectTrack={handleSelectTrack}
        onConfirmTrack={handleConfirmTrack} 
      />

      <div className="p-4">
        <button
          onClick={onShowPrompt}
          className="green-btn w-full py-3 rounded-md text-black font-semibold cursor-pointer"
        >
          View Prompt
        </button>
      </div>
    </div>
  );
} 