import React from 'react'
import recordLogo from './record-logo.svg'
import "./songs.css"

export default function Song({ track, artist, albumCover, player, rating, winner}) {
    if (winner){
    return (
        <div className='song-container-winner'>
            <div className='album-cover'>
                <img img src={recordLogo}  className='album-image' alt="Album Cover"/>
            </div>
            <div>
                <h3>{player}</h3>
                <h5>{track}</h5>
                <p>{artist}</p>
            </div>
            <div>
                <h5>{rating}</h5>
                <img img src={recordLogo} className='record-image'  alt="Record Logo"/>
            </div>
        </div>
        );
    }else{
        return(
            <div className='song-container-not-winner'>
                <div className='album-cover'>
                    <img img src={albumCover} alt="Album Cover"/>
                </div>
                <div>
                    <h3>{player}</h3>
                    <h5>{track}</h5>
                    <p>{artist}</p>
                </div>
                <div>
                    <h5>{rating}</h5>
                    <img img src={recordLogo} alt="Record Logo"/>
                </div>
            </div>
        );
    }
}