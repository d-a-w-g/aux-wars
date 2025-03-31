import React from 'react'
import PromptDisplay from "/Users/gracehecke/Documents/GitHub/Git-Lab/aux-wars/src/components/PromptDisplay.jsx"
import "./roundWinner.css";

export default function RoundWinner({songs}) {
    
    return (
      <div className="round-winner"> 
        <PromptDisplay />
        <div className="all-songs">
          {songs.map((song, index) => (
            <div key={index}>
              {song}
            </div>
          ))}
        </div>
        </div>
    );   
};