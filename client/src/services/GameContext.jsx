import React, { createContext, useContext, useReducer } from 'react';

const GameContext = createContext();

const initialState = {
  currentPrompt: '',
  players: [],
  phase: 'lobby',
  gameCode: '',
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
