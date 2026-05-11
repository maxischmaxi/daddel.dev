"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import {
  type Color,
  PREP_SEQUENCE,
  ROUNDS,
  SHOW_MS,
  TICK_MS,
  gameReducer,
  initialState,
  randomTarget,
  scoreRound,
} from "./game-state";
import { getRandomQuip } from "./quips";

const INITIAL_HSL: Color = { h: 180, s: 50, l: 50 };

export function useColorGame() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [hsl, setHsl] = useState<Color>(INITIAL_HSL);
  const [countdownText, setCountdownText] = useState("");
  const [targetVisible, setTargetVisible] = useState(false);
  const [prepStep, setPrepStep] = useState<number | null>(null);
  const [currentQuip, setCurrentQuip] = useState("");

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    clearTimers();

    if (state.phase !== "show") {
      setTargetVisible(false);
      setPrepStep(null);
      if (state.phase === "pick") {
        setHsl(INITIAL_HSL);
        setCountdownText("");
      }
      return;
    }

    setTargetVisible(false);
    setCountdownText("");
    setPrepStep(null);

    const revealTarget = () => {
      setPrepStep(null);
      setTargetVisible(true);
      const endTime = performance.now() + SHOW_MS;
      const tick = () => {
        const remaining = Math.max(0, endTime - performance.now());
        setCountdownText((remaining / 1000).toFixed(1));
      };
      tick();
      intervalRef.current = setInterval(tick, TICK_MS);
      timeoutRef.current = setTimeout(() => {
        clearTimers();
        dispatch({ type: "ENTER_PICK" });
      }, SHOW_MS);
    };

    if (state.round === 0) {
      let i = 0;
      const step = () => {
        if (i >= PREP_SEQUENCE.length) {
          revealTarget();
          return;
        }
        const entry = PREP_SEQUENCE[i];
        setPrepStep(i);
        setCountdownText(entry.text);
        i++;
        timeoutRef.current = setTimeout(step, entry.duration);
      };
      step();
    } else {
      revealTarget();
    }

    return clearTimers;
  }, [state.phase, state.round, clearTimers]);

  const startGame = useCallback(() => {
    clearTimers();
    dispatch({ type: "START", target: randomTarget() });
  }, [clearTimers]);

  const submitGuess = useCallback(() => {
    if (state.phase !== "pick") return;
    clearTimers();
    const target = state.targets[state.round];
    const points = scoreRound(target, hsl);
    setCurrentQuip(getRandomQuip(points));
    dispatch({ type: "SUBMIT_GUESS", guess: hsl, points });
  }, [clearTimers, hsl, state.phase, state.round, state.targets]);

  const advance = useCallback(() => {
    if (state.phase !== "reveal") return;
    if (state.round + 1 >= ROUNDS) {
      dispatch({ type: "FINISH" });
    } else {
      dispatch({ type: "NEXT_ROUND", target: randomTarget() });
    }
  }, [state.phase, state.round]);

  const totalScore = state.scores.reduce((a, b) => a + b, 0);
  const displayedRound = Math.min(state.round + 1, ROUNDS);

  return {
    state,
    hsl,
    setHsl,
    countdownText,
    targetVisible,
    prepStep,
    totalScore,
    displayedRound,
    currentQuip,
    startGame,
    submitGuess,
    advance,
  };
}
