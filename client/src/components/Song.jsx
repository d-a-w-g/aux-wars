import React from 'react'
import recordLogo from './record-logo.svg'
import "./songs.css"

export default function Song({ track, artist, albumCover, player, rating, winner}) {
    if (winner === 'winner'){
    return (
        <div className='song-container-winner'>
            <div className='album-cover'>
                <img src={albumCover} className='album-image-winner' alt="Album Cover"/>
            </div>
            <div>
                <h3>{player}</h3>
                <h5>{track}</h5>
                <p>{artist}</p>
            </div>
            <div className='record-rating'>
                <img src={recordLogo} className='record-image-winner' alt="Record Logo"/>
                <h5>x {rating}</h5>
            </div>
        </div>
        );
    }else{
        return(
            <div className='song-container-not-winner'>
                <div className='album-cover'>
                    <img src={albumCover} className='album-image-not-winner' alt="Album Cover"/>
                </div>
                <div>
                    <h3>{player}</h3>
                    <h5>{track}</h5>
                    <p>{artist}</p>
                </div>
                <div>
                    <h5>{rating}</h5>
                    <img src={recordLogo} className='record-image-not-winner' alt="Record Logo"/>
                </div>
            </div>
        );
    }
}