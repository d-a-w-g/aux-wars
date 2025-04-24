import React, { createContext, useReducer, useContext } from "react";

const GameContext = createContext();

const defaultState = {
  numberOfRounds: 3,
  roundLength: 30,
  availablePrompts: [
    "This song makes me feel like the main character.",
    "The soundtrack to a late-night drive.",
    "This song makes me wanna text my ex (or block them).",
    "A song that defines high school memories.",
    "The perfect song to play while getting ready to go out.",
    "This song could start a mosh pit.",
    "A song that instantly boosts your confidence.",
    "This song would play in the background of my villain arc.",
    "A song that could make me cry on the right day.",
    "The ultimate cookout anthem.",
    "A song that just feels like summertime.",
    "This song is pure nostalgia.",
    "A song that makes you feel unstoppable.",
    "If life had a montage, this song would play in mine.",
    "A song that instantly hypes up the whole room."
  ],
  selectedPrompts: [
    "This song makes me feel like the main character.",
    "The soundtrack to a late-night drive.",
    "This song makes me wanna text my ex (or block them).",
    "A song that defines high school memories.",
    "The perfect song to play while getting ready to go out.",
    "This song could start a mosh pit.",
    "A song that instantly boosts your confidence.",
    "This song would play in the background of my villain arc.",
    "A song that could make me cry on the right day.",
    "The ultimate cookout anthem.",
    "A song that just feels like summertime.",
    "This song is pure nostalgia.",
    "A song that makes you feel unstoppable.",
    "If life had a montage, this song would play in mine.",
    "A song that instantly hypes up the whole room."
  ],
  roundEndTime: null,
  currentPrompt: null,
};

function gameReducer(state, action) {
  switch (action.type) {
    case "SET_ROUNDS":
      return { ...state, numberOfRounds: action.payload };
    case "SET_ROUND_LENGTH":
      return { ...state, roundLength: action.payload };
    case "SET_SELECTED_PROMPTS":
      return { ...state, selectedPrompts: action.payload };
    case "SET_ROUND_END_TIME":
      return { ...state, roundEndTime: action.payload };
    case "SET_CURRENT_PROMPT":
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
