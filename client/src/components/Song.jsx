import React from 'react'
import recordLogo from './record-logo.svg'

export default function Song({ track, artist, albumCover, player, rating, winner }) {
    if (winner === 'winner') {
        return (
            <div className="flex flex-col items-center text-center w-full max-w-md mx-auto mb-5 p-4">
                <div className="relative flex flex-col items-center mb-4">
                    <img 
                        src={albumCover} 
                        className="w-44 h-44 md:w-[180px] md:h-[180px] rounded-lg shadow-lg" 
                        alt="Album Cover"
                    />
                </div>
                <div className="text-center w-full">
                    <h3 className="text-xl md:text-2xl font-bold m-0 text-white">{player}</h3>
                    <h5 className="text-lg truncate max-w-[250px] mx-auto my-0.5 text-white">{track}</h5>
                    <p className="text-sm text-gray-300 truncate max-w-[250px] mx-auto">{artist}</p>
                </div>
            </div>
        );
    } else {
        return (
            <div className="flex items-center justify-between w-[95%] max-w-[580px] mx-auto my-4 p-3 rounded-lg text-white">
                <div className="mr-4">
                    <img 
                        src={albumCover} 
                        className="w-[60px] h-[60px] md:w-[80px] md:h-[80px] rounded-md shadow-md" 
                        alt="Album Cover"
                    />
                </div>
                <div className="flex-1 overflow-hidden">
                    <h3 className="text-xl font-bold m-0 text-white">{player}</h3>
                    <h5 className="text-base truncate my-0.5 text-white">{track}</h5>
                    <p className="text-sm text-gray-300 truncate">{artist}</p>
                </div>
                <div className="flex items-center whitespace-nowrap">
                    <img src={recordLogo} className="w-12 h-12 md:w-16 md:h-16 mr-1" alt="Record Logo"/>
                    <span className="text-white font-bold text-2xl">{rating}</span>
                </div>
            </div>
        );
    }
}