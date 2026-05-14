export type TimePattern = {
  seed: number;
  hue: number;
  accentHue: number;
  circleCount: number;
  lineCount: number;
  speed: number;
};

export type TimeTarget = {
  durationMs: number;
  toneHz: number;
  pulseHz: number;
  pattern: TimePattern;
};

export type TimeGuess = {
  durationMs: number;
};

export type Phase =
  | "idle"
  | "name-entry"
  | "show"
  | "pick"
  | "reveal"
  | "final";

export type GameMode = "solo" | "team-creator" | "team-participant" | "global";

export const MIN_DURATION_MS = 1000;
export const MAX_DURATION_MS = 5000;
export const DURATION_ZERO_POINT_MS = 3000;
export const ROUNDS = 5;

export const PREP_SEQUENCE: ReadonlyArray<{ text: string; duration: number }> =
  [
    { text: "ready", duration: 500 },
    { text: "set", duration: 500 },
    { text: "go", duration: 800 },
  ];

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randFloat = (min: number, max: number) =>
  Math.random() * (max - min) + min;

export const randomTarget = (): TimeTarget => {
  const hue = randInt(185, 285);
  return {
    durationMs: randInt(MIN_DURATION_MS, MAX_DURATION_MS),
    toneHz: randFloat(48, 82),
    pulseHz: randFloat(0.8, 1.8),
    pattern: {
      seed: randInt(1, 2_147_483_647),
      hue,
      accentHue: (hue + randInt(70, 150)) % 360,
      circleCount: randInt(7, 12),
      lineCount: randInt(9, 16),
      speed: randFloat(0.85, 1.35),
    },
  };
};

export const scoreRound = (
  target: TimeTarget,
  guess: TimeGuess,
): number => {
  const error = Math.abs(target.durationMs - guess.durationMs);
  return Math.max(0, 10 * (1 - error / DURATION_ZERO_POINT_MS));
};

export const formatDuration = (durationMs: number): string =>
  `${(durationMs / 1000).toFixed(2)} s`;

export type GameState = {
  phase: Phase;
  round: number;
  targets: TimeTarget[];
  guesses: TimeGuess[];
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
  | { type: "START"; target: TimeTarget }
  | { type: "ENTER_NAME_ENTRY" }
  | { type: "ENTER_PICK" }
  | { type: "SUBMIT_GUESS"; guess: TimeGuess; points: number }
  | { type: "NEXT_ROUND"; target: TimeTarget }
  | { type: "FINISH" }
  | {
      type: "RESTORE_FINAL";
      targets: TimeTarget[];
      guesses: TimeGuess[];
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
