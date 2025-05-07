import React from 'react'
import recordLogo from './record-logo.svg'

export default function Song({ track, artist, albumCover, player, rating, winner}) {
    if (winner === 'winner'){
    return (
        <div className="flex flex-col items-center text-center w-full max-w-md mx-auto mb-5 p-4 rounded-xl border-2 border-[rgba(104,213,112,0.5)]">
            <div className="relative flex flex-col items-center mb-4">
                <img 
                    src={albumCover} 
                    className="w-44 h-44 md:w-[180px] md:h-[180px] rounded-lg shadow-lg" 
                    alt="Album Cover"
                />
                <div className="absolute -top-2 -right-2 flex items-center bg-[rgba(104,213,112,0.9)] text-black font-bold py-1 px-2 rounded-xl">
                    <img src={recordLogo} className="w-6 h-6 mr-1" alt="Record Logo"/>
                    <span>{rating}</span>
            </div>
            </div>
            <div className="text-center w-full">
                <h3 className="text-xl md:text-2xl font-bold m-0">{player}</h3>
                <h5 className="text-lg truncate max-w-[250px] mx-auto my-0.5">{track}</h5>
                <p className="text-sm text-gray-300 truncate max-w-[250px] mx-auto">{artist}</p>
            </div>
        </div>
        );
    } else {
        return(
            <div className="flex items-center justify-between w-[95%] max-w-[580px] mx-auto my-4 p-3 rounded-lg text-white">
                <div className="mr-4">
                    <img 
                        src={albumCover} 
                        className="w-[70px] h-[70px] md:w-[70px] md:h-[70px] rounded-md shadow-md" 
                        alt="Album Cover"
                    />
                </div>
                <div className="flex-1 overflow-hidden">
                    <h3 className="text-xl font-bold m-0">{player}</h3>
                    <h5 className="text-base truncate my-0.5">{track}</h5>
                    <p className="text-sm text-gray-300 truncate">{artist}</p>
                </div>
                <div className="flex items-center whitespace-nowrap">
                    <img src={recordLogo} className="w-5 h-5 mr-1" alt="Record Logo"/>
                    <span>{rating}</span>
                </div>
            </div>
        );
    }
}