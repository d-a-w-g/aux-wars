import React from 'react'
import Song from '../../components/Song';



export default function RoundWinner({songs}) {
    
    return (
        <div className="all-songs">
          {songs.map((song, index) => (
            <div key={index}>
              {song}
            </div>
          ))}
        </div>
      );
      
    };