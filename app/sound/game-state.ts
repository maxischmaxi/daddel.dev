import { randomTargetHz, scoreFromFrequencies } from "./frequency";

export type Sound = { freq: number };

export type Phase =
  | "idle"
  | "name-entry"
  | "show"
  | "pick"
  | "reveal"
  | "final";

export type GameMode = "solo" | "team-creator" | "team-participant" | "global";

export const SHOW_MS = 5000;
export const ROUNDS = 5;

export const PREP_SEQUENCE: ReadonlyArray<{ text: string; duration: number }> =
  [
    { text: "ready", duration: 500 },
    { text: "set", duration: 500 },
    { text: "go", duration: 800 },
  ];

export const randomTarget = (): Sound => ({ freq: randomTargetHz() });

export const scoreRound = (target: Sound, guess: Sound): number =>
  scoreFromFrequencies(target.freq, guess.freq);

export type GameState = {
  phase: Phase;
  round: number;
  targets: Sound[];
  guesses: Sound[];
  scores: number[];
};

export const initialState: GameState = {
  phase: "idle",
  round: 0,
  targets: [],
  guesses: [],
  scores: [],
};

export type Action =
  | { type: "START"; target: Sound }
  | { type: "ENTER_NAME_ENTRY" }
  | { type: "ENTER_PICK" }
  | { type: "SUBMIT_GUESS"; guess: Sound; points: number }
  | { type: "NEXT_ROUND"; target: Sound }
  | { type: "FINISH" }
  | {
      type: "RESTORE_FINAL";
      targets: Sound[];
      guesses: Sound[];
      scores: number[];
    }
  | { type: "RESET" };

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "RESET":
      return initialState;
    case "ENTER_NAME_ENTRY":
      return { ...initialState, phase: "name-entry" };
    case "START":
      return {
        phase: "show",
        round: 0,
        targets: [action.target],
        guesses: [],
        scores: [],
      };
    case "ENTER_PICK":
      return { ...state, phase: "pick" };
    case "SUBMIT_GUESS":
      return {
        ...state,
        phase: "reveal",
        guesses: [...state.guesses, action.guess],
        scores: [...state.scores, action.points],
      };
    case "NEXT_ROUND":
      return {
        ...state,
        phase: "show",
        round: state.round + 1,
        targets: [...state.targets, action.target],
      };
    case "FINISH":
      return { ...state, phase: "final", round: state.round + 1 };
    case "RESTORE_FINAL":
      return {
        phase: "final",
        round: ROUNDS,
        targets: action.targets,
        guesses: action.guesses,
        scores: action.scores,
      };
    default:
      return state;
  }
}
