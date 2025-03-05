import React from 'react';
import './how_to_play.css';
import logo from './landing-logo.png';

export default function HowToPlay() {
  return (
    <div className="rules-background">
        <img src={logo} alt="Game Logo" className="rules-logo" />
        <h2  className="rules-title">How to Play:</h2>
        <ol className="rules-body">
          <li>1. Join a lobby with friends using the game code provided by the host.</li>
          <li>2. Each round, you’ll receive a prompt and have a set amount of time to choose a song, selecting the section that best fits the prompt.</li>
          <li>3. Once all songs are submitted, players will rate each entry on a scale of 1 to 5 records.</li>
          <li>4. Repeat until all rounds are done.</li>
          <li>5. At the end of the game, the player with the most records wins!</li>
        </ol>
        
        <h2 className="rules-title">Rules:</h2>
        <ol className="rules-body">
        <li>1. Replace this with rules.</li>
          <li>2. Rules rules rules.</li>
          <li>3. Once all songs are submitted, players will rate each entry on a scale of 1 to 5 records.</li>
          <li>4. Repeat until all rounds are done.</li>
          <li>5. At the end of the game, the player with the most records wins!</li>
        </ol>
      
      <button className="back-to-login-button">Back to login</button>
    </div>
  );
}
