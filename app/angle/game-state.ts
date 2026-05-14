export type Angle = { deg: number };

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
export const ANGLE_ZERO_POINT = 90;

export const PREP_SEQUENCE: ReadonlyArray<{ text: string; duration: number }> =
  [
    { text: "ready", duration: 500 },
    { text: "set", duration: 500 },
    { text: "go", duration: 800 },
  ];

export const normalizeDeg = (deg: number): number => {
  const m = deg % 360;
  return m < 0 ? m + 360 : m;
};

export const angularDiff = (a: number, b: number): number => {
  const d = Math.abs(normalizeDeg(a) - normalizeDeg(b)) % 360;
  return d > 180 ? 360 - d : d;
};

export const randomTarget = (): Angle => ({ deg: Math.random() * 360 });

export const scoreRound = (target: Angle, guess: Angle): number => {
  const diff = angularDiff(target.deg, guess.deg);
  return Math.max(0, 10 * (1 - diff / ANGLE_ZERO_POINT));
};

export type GameState = {
  phase: Phase;
  round: number;
  targets: Angle[];
  guesses: Angle[];
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
  | { type: "START"; target: Angle }
  | { type: "ENTER_NAME_ENTRY" }
  | { type: "ENTER_PICK" }
  | { type: "SUBMIT_GUESS"; guess: Angle; points: number }
  | { type: "NEXT_ROUND"; target: Angle }
  | { type: "FINISH" }
  | {
      type: "RESTORE_FINAL";
      targets: Angle[];
      guesses: Angle[];
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
