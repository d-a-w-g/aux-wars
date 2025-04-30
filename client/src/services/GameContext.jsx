import React, { createContext, useContext, useReducer } from 'react';

const GameContext = createContext();

const initialState = {
  currentPrompt: '',
  players: [],
  phase: 'lobby',
  gameCode: '',
  availablePrompts: [
    "A song that makes you feel nostalgic",
    "A song that reminds you of summer",
    "A song that gets you pumped up",
    "A song that makes you want to dance",
    "A song that you love but others might not know",
    "A song that tells a great story",
    "A song that you discovered recently",
    "A song that you associate with a specific memory",
    "A song that you think is underrated",
    "A song that you could listen to on repeat"
  ],
  selectedPrompts: [
    "A song that makes you feel nostalgic",
    "A song that reminds you of summer",
    "A song that gets you pumped up",
    "A song that makes you want to dance",
    "A song that you love but others might not know",
    "A song that tells a great story",
    "A song that you discovered recently",
    "A song that you associate with a specific memory",
    "A song that you think is underrated",
    "A song that you could listen to on repeat"
  ],
  numberOfRounds: 3,
  roundLength: 30,
};

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PROMPT':
      return { ...state, currentPrompt: action.payload };
    case 'SET_PLAYERS':
      return { ...state, players: action.payload };
    case 'SET_PHASE':
      return { ...state, phase: action.payload };
    case 'SET_GAME_CODE':
      return { ...state, gameCode: action.payload };
    case 'SET_AVAILABLE_PROMPTS':
      return { ...state, availablePrompts: action.payload };
    case 'SET_SELECTED_PROMPTS':
      return { ...state, selectedPrompts: action.payload };
    case 'SET_ROUNDS':
      return { ...state, numberOfRounds: action.payload };
    case 'SET_ROUND_LENGTH':
      return { ...state, roundLength: action.payload };
    default:
      return state;
  }
};

export const GameProvider = ({ children, initialState: initialGameState = initialState }) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
