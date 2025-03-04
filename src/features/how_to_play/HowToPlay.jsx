import React from 'react';
import './how_to_play.css';
import logo from './landing-logo.png'; 

export default function HowToPlay() {
  return (
    <div className="container">
      <div className="text-box">
        <img src={logo} alt="Game Logo" className="logo" />
        <h2>How to Play:</h2>
        <ol className="rule-body">
          <li>1. Join a lobby with friends using the game code provided by the host.</li>
          <li>2. Each round, you’ll receive a prompt and have a set amount of time to choose a song, selecting the section that best fits the prompt.</li>
          <li>3. Once all songs are submitted, players will rate each entry on a scale of 1 to 5 records.</li>
          <li>4. Repeat until all rounds are done.</li>
          <li>5. At the end of the game, the player with the most records wins!</li>
        </ol>
        
        <h2>Rules:</h2>
        <ol className="rule-body">
          <li>1. Rule.</li>
          <li>2. This is a rule.</li>
          <li>3. More rules.</li>
          <li>4. Anotha one.</li>
          <li>5. Yassss</li>
        </ol>
      </div>
      
      <button className="back-to-login-button">Back to login</button>
    </div>
  );
}
