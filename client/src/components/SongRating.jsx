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
        <div className="song-rate flex flex-col items-center">

            {/*album cover image*/}
            {albumCover && (
                <img
                    src={albumCover}
                    alt={track.name}
                    className="album"
                />
            )}


            {/*track name and artist name*/}
            <div className="flex flex-col justify-center items-center">
                <p className="song-title font-semibold">{track.name}</p>
                <p className="artist-name text-sm text-gray-300">
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
                        className={`records transition-opacity duration-300 ${index <= selectedIndex ? "opacity-100" : "opacity-50"
                            }`}
                        /*records turn opaque when clicked*/
                        onClick={() => handleClick(index)}
                    />
                ))}
            </div>

            {/*submit button*/}
            <button className="submit-button">Submit</button>

        </div>
    )
}
