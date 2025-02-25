import React from 'react'
import "./login.css"

export default function Login() {
  return (
    <div>
      <input className="text-field" type="text" placeholder="Enter Code"/>
      <button className="button">Join game</button>
    </div>
  );
}
