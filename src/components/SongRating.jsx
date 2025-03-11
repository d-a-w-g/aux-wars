import React from 'react'

export default function SongRating() {

  return (
    <div className='page-title'>Delia Holman Page</div>
  )

  /* i dont even know if this works im still troubleshooting the rest of it lol
    const albumCover =
        track.album?.images?.[1]?.url ||
        track.album?.images?.[0]?.url ||
        ""; 
    return (
        <div className = "song-rate flex items-center">
            <img>
                src = {albumCover}
                alt = {track.name}
                className = "album"
            </img>

            <div className = "flex flex-col justify-center">
                <p className="font-semibold">{track.name}</p>
                <p className="text-sm text-gray-300">
                {track.artists.map((a) => a.name).join(", ")}
                </p>
            </div>
        </div>
    )
        */
}
