import './App.css';
import ReactDOM from 'react-dom/client';
import {useState} from'react';


export default function App() {
  const [gameCode, setGameCode] = useState('Enter Code');
    // const inputCode = (e) => {
    //   const { value } = e.target;
    //   if (/^\d{0,6}$/.test(value)) {
    //     setGameCode(value)
    //   };
    // }; 
  
    
  return (
    <>
      <h1>AuxWars Logo!</h1>
      <form className='Enter-game-code'>
        <div>
          <input 
            value={gameCode}
            onChange={e => setGameCode(e.target.value)}
            type="text"
            id="item"
            maxLength="6"
            pattern="\d*"
            inputMode="numeric"
            />
          <button type="submit">Join Game</button>
        </div>
      </form>
      
    </>
  );
};


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>)

