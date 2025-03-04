import React from 'react'
import "./landing.css"
import logo from "./main-logo.svg"

export default function Landing() {
  return (
    <div className="container">
      <img src={logo} alt="Game Logo" className="logo" />
      <button className="login-with-spotify-button">Login with Spotify</button>
      <button className="play-as-guest-button">Play as Guest</button>
      <p className='text-to-play'>How do I play?</p>
    </div>
  );
}
