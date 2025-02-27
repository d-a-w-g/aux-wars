import React from 'react'
import "./landing.css"

export default function Landing() {
  return (
    <div className="container">
      <button className="login-with-spotify-button">Login with Spotify</button>
      <button className="play-as-guest-button">Play as Guest</button>
    </div>
  );
}
