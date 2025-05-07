import React, { useState } from 'react';
import PromptDisplay from '../../components/PromptDisplay';
import record from '../../assets/record.svg';

const RatingScreen = ({ 
  currentPrompt,
  songToRate, 
  onSubmitRating, 
  currentIndex, 
  totalSongs 
}) => {
  const [selectedRating, setSelectedRating] = useState(-1);
  
  const handleRatingClick = (index) => {
    setSelectedRating(index);
  };

  const handleSubmit = () => {
    if (selectedRating >= 0) {
      // Add 1 to the index to get rating from 1-5 instead of 0-4
      onSubmitRating(songToRate.songId, selectedRating + 1);
    } else {
      alert("Please select a rating before submitting");
    }
  };

  return (
    <div className="w-full max-w-[600px] mx-auto p-5 md:p-6 flex flex-col items-center">
      <div className="w-full mb-8">
        <PromptDisplay prompt={currentPrompt} />
      </div>
      
      <div className="mb-6 text-white text-center">
        <p>Rating Song {currentIndex + 1} of {totalSongs}</p>
      </div>
      
      <div className="flex flex-col items-center w-full">
        {/* Album cover image */}
        {songToRate.albumCover && (
          <img
            src={songToRate.albumCover}
            alt={songToRate.name}
            className="w-[250px] md:w-[200px] sm:w-[180px] rounded-lg shadow-md"
          />
        )}

        {/* Track name and artist name */}
        <div className="flex flex-col justify-center items-center mt-4">
          <p className="text-2xl md:text-xl sm:text-lg font-semibold text-white text-center max-w-[300px] overflow-hidden text-ellipsis">{songToRate.name}</p>
          <p className="text-sm text-gray-300 text-center max-w-[300px] overflow-hidden text-ellipsis">
            {songToRate.artist}
          </p>
          <p className="text-xs text-gray-400 mt-1 text-center">
            Submitted by: {songToRate.player?.name || 'Unknown Player'}
          </p>
        </div>

        {/* Rating system */}
        <div className="flex flex-row justify-center items-center my-8">
          {[...Array(5)].map((_, index) => (
            <img
              key={index}
              src={record}
              alt={`rate this song ${index + 1} records`}
              className={`w-[45px] md:w-[40px] sm:w-[32px] m-2 md:m-1.5 sm:m-1 mb-10 md:mb-8 sm:mb-7 cursor-pointer transition-all duration-300 hover:scale-110 ${
                index <= selectedRating ? "opacity-100" : "opacity-50"
              }`}
              onClick={() => handleRatingClick(index)}
            />
          ))}
        </div>

        {/* Submit button */}
        <button 
          className={`bg-[#68d570] text-black font-bold w-[200px] md:w-[180px] h-[45px] md:h-[40px] rounded-full cursor-pointer transition-all hover:scale-105 hover:bg-[#7de884] ${
            selectedRating < 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={handleSubmit}
          disabled={selectedRating < 0}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default RatingScreen; 