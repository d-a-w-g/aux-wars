import React, { createContext, useReducer, useContext } from "react";

const GameContext = createContext();

const defaultState = {
  numberOfRounds: 3,
  roundLength: 30,
  availablePrompts: ["General", "Party", "Trivia", "Random", "Rock", "Pop", "Hip-Hop", "Jazz"],
  selectedPrompts: ["General"],
  roundEndTime: null,   // NEW: store the end time
  currentPrompt: null,  // NEW: store the current round’s prompt
};

function gameReducer(state, action) {
  switch (action.type) {
    case "SET_ROUNDS":
      return { ...state, numberOfRounds: action.payload };
    case "SET_ROUND_LENGTH":
      return { ...state, roundLength: action.payload };
    case "SET_SELECTED_PROMPTS":
      return { ...state, selectedPrompts: action.payload };
    case "SET_ROUND_END_TIME":  // NEW
      return { ...state, roundEndTime: action.payload };
    case "SET_CURRENT_PROMPT":  // NEW
      return { ...state, currentPrompt: action.payload };
    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, defaultState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
