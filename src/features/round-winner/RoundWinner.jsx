import React from 'react'
import PromptDisplay from '../../components/PromptDisplay.jsx';
import "./roundWinner.css";

export default function RoundWinner({songs}) {
    
    return (
      <div className="round-winner"> 
      <div className="top-bar">
      <div className="prdisplayompt-">
        <PromptDisplay />
        </div>
        <button className="next-button">Next</button>
      </div>
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