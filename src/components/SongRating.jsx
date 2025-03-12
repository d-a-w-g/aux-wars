import React from 'react'
import record from '../assets/record.svg'

export default function SongRating() {
    const albumCover =
        track.album?.images?.[1]?.url ||
        track.album?.images?.[0]?.url ||
        ""; 

    return (
        <div className = "song-rate flex items-center">

            {/*album cover image*/}
            <img>
                src = {albumCover}
                alt = {track.name}
                className = "album"
            </img>

            {/*track name and artist name*/}
            <div className = "flex flex-col justify-center">
                <p className="font-semibold">{track.name}</p>
                <p className="text-sm text-gray-300">
                {track.artists.map((a) => a.name).join(", ")}
                </p>
            </div>

            {/*rating system*/}
            <div className = "flex flex-col justify center">
                <img>src ={record} alt = "rate this song 1 record" className = "records"</img>
                <img>src ={record} alt = "rate this song 2 records" className = "records"</img>
                <img>src ={record} alt = "rate this song 3 records" className = "records"</img>
                <img>src ={record} alt = "rate this song 4 records" className = "records"</img>
                <img>src ={record} alt = "rate this song 5 records" className = "records"</img>
            </div>

            {/*submit button*/}
            <button class="submit-button">Submit Rating</button>
        </div>
    )

    /* part that does? work
    return (
        <div className='page-title'>Delia Holman Page</div>
    )
    */
}
