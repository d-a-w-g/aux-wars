import React from 'react';
import SongItem from './SongItem';

const SongList = ({ tracks, selectedTrack, onSelectTrack, onConfirmTrack }) => {
  return (
    <div className="song-list flex-1 overflow-y-auto px-4">
      {tracks && tracks.length > 0 ? (
        tracks.map((track) => (
        <SongItem
          key={track.id}
          track={track}
            selected={selectedTrack && selectedTrack.id === track.id}
            onSelect={() => onSelectTrack(track)}
            onSelectSong={() => onConfirmTrack(track)}
        />
        ))
      ) : (
        <div className="text-center text-gray-200 py-4">
          No songs found. Try searching for something else.
        </div>
      )}
    </div>
  );
};

export default SongList;
