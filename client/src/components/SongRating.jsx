import React from 'react'
import record from '../assets/record.svg'
import { useState } from 'react';

export default function SongRating({ track }) {
    const albumCover =
        track.album?.images?.[1]?.url ||
        track.album?.images?.[0]?.url ||
        null;

    const [selectedIndex, setSelectedIndex] = useState(-1);

    const handleClick = (index) => {
        setSelectedIndex(index);
    };

    return (
        <div className="flex flex-col items-center w-full">

            {/*album cover image*/}
            {albumCover && (
                <img
                    src={albumCover}
                    alt={track.name}
                    className="w-[250px] md:w-[200px] sm:w-[180px] rounded-lg shadow-md"
                />
            )}


            {/*track name and artist name*/}
            <div className="flex flex-col justify-center items-center mt-3">
                <p className="text-2xl md:text-xl sm:text-lg font-semibold mt-2.5 text-white text-center max-w-[300px] truncate">{track.name}</p>
                <p className="text-sm text-gray-300 mb-5 text-center max-w-[300px] truncate">
                    {track.artists.map((a) => a.name).join(", ")}
                </p>
            </div>

            {/*rating system*/}
            <div className="flex flex-row justify-center items-center">
                {[...Array(5)].map((_, index) => (
                    <img
                        key={index}
                        src={record}
                        alt={`rate this song ${index + 1} records`}
                        className={`w-[45px] md:w-[40px] sm:w-[32px] m-2 md:m-1.5 sm:m-1 mb-10 md:mb-8 sm:mb-7 cursor-pointer transition-all duration-300 hover:scale-110 ${
                            index <= selectedIndex ? "opacity-100" : "opacity-50"
                            }`}
                        onClick={() => handleClick(index)}
                    />
                ))}
            </div>

            {/*submit button*/}
            <button className="bg-[#68d570] text-black font-bold w-[200px] md:w-[180px] h-[45px] md:h-[40px] rounded-full cursor-pointer transition-all hover:scale-105 hover:bg-[#7de884]">
                Submit
            </button>

        </div>
    )
}
