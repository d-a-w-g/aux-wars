import React from 'react'
import "./login.css"
import logo from "./landing-logo.png";

export default function Login() {
  return (
    <div className="container">
      <img src={logo} alt="Game Logo" className="logo" />
      <input className="text-field" type="text" placeholder="Enter Code"/>
      <button className="join-game-button">Join game</button>
      <button className="host-a-game-button">Host a game</button>
    </div>
  );
}
