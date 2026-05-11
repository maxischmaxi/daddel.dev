export type Color = { h: number; s: number; l: number };

export type Phase = "idle" | "show" | "pick" | "reveal" | "final";

export const SHOW_MS = 5000;
export const ROUNDS = 5;
export const TICK_MS = 100;
export const DIST_ZERO_POINT = 250;

export const PREP_SEQUENCE: ReadonlyArray<{ text: string; duration: number }> =
  [
    { text: "ready", duration: 500 },
    { text: "set", duration: 500 },
    { text: "go", duration: 500 },
  ];

export const hslToRgb = (
  h: number,
  s: number,
  l: number,
): [number, number, number] => {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [
    Math.round(255 * f(0)),
    Math.round(255 * f(8)),
    Math.round(255 * f(4)),
  ];
};

export const hslCss = (h: number, s: number, l: number) =>
  `hsl(${h}, ${s}%, ${l}%)`;

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const randomTarget = (): Color => ({
  h: randInt(0, 360),
  s: randInt(30, 100),
  l: randInt(25, 75),
});

export const rgbDistance = (
  a: [number, number, number],
  b: [number, number, number],
) => Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);

export const scoreRound = (target: Color, guess: Color): number => {
  const t = hslToRgb(target.h, target.s, target.l);
  const g = hslToRgb(guess.h, guess.s, guess.l);
  const dist = rgbDistance(t, g);
  return Math.max(0, 10 * (1 - dist / DIST_ZERO_POINT));
};

export type GameState = {
  phase: Phase;
  round: number;
  targets: Color[];
  guesses: Color[];
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
  | { type: "START"; target: Color }
  | { type: "ENTER_PICK" }
  | { type: "SUBMIT_GUESS"; guess: Color; points: number }
  | { type: "NEXT_ROUND"; target: Color }
  | { type: "FINISH" };

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
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
    default:
      return state;
  }
}
