"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import {
  createTeamGame,
  fetchTeamLobby,
  postGlobalScore,
  postTeamScore,
  type GlobalRanking,
  type TeamLobby,
} from "@/lib/api-client";
import { trackEvent } from "@/lib/analytics-client";
import {
  getClientId,
  getStoredName,
  sanitizeName,
  setStoredName,
} from "@/lib/player";

import {
  type Color,
  type GameMode,
  PREP_SEQUENCE,
  ROUNDS,
  SHOW_MS,
  gameReducer,
  initialState,
  randomTarget,
  scoreRound,
} from "./game-state";
import { getRandomQuip } from "./quips";

const INITIAL_HSL: Color = { h: 180, s: 50, l: 50 };

export type SubmissionState = "idle" | "sending" | "done" | "error";

export type ColorGameOptions = {
  mode?: GameMode;
  gameId?: string;
  initialTargets?: Color[];
};

export function useColorGame(options: ColorGameOptions = {}) {
  const {
    mode: initialMode = "solo",
    gameId: presetGameId,
    initialTargets,
  } = options;

  const [mode, setMode] = useState<GameMode>(initialMode);
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [hsl, setHsl] = useState<Color>(INITIAL_HSL);
  const [prepText, setPrepText] = useState("");
  const [targetVisible, setTargetVisible] = useState(false);
  const [prepStep, setPrepStep] = useState<number | null>(null);
  const [endTimeMs, setEndTimeMs] = useState<number | null>(null);
  const [currentQuip, setCurrentQuip] = useState("");
  const [playerName, setPlayerName] = useState<string | null>(null);

  const [submissionState, setSubmissionState] =
    useState<SubmissionState>("idle");
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [teamShareId, setTeamShareId] = useState<string | null>(
    presetGameId ?? null,
  );
  const [teamLobby, setTeamLobby] = useState<TeamLobby | null>(null);
  const [globalRanking, setGlobalRanking] = useState<GlobalRanking | null>(
    null,
  );

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submittedRef = useRef(false);
  const phaseRef = useRef(state.phase);

  useEffect(() => {
    phaseRef.current = state.phase;
  }, [state.phase]);

  useEffect(() => {
    setPlayerName(getStoredName());
  }, []);

  // Restore final state on mount for team-participant: if this client already
  // submitted a score, jump directly to the final-lobby view instead of
  // forcing them to replay the rounds. If the user has already started a new
  // round by the time the fetch resolves, leave their game intact.
  useEffect(() => {
    if (initialMode !== "team-participant" || !presetGameId) return;
    if (typeof window === "undefined") return;
    let cancelled = false;
    (async () => {
      try {
        const clientId = getClientId();
        const lobby = await fetchTeamLobby(presetGameId, clientId);
        if (cancelled) return;
        const phase = phaseRef.current;
        if (phase !== "idle" && phase !== "name-entry") return;
        if (lobby.your) {
          submittedRef.current = true;
          setTeamLobby(lobby);
          setSubmissionState("done");
          dispatch({
            type: "RESTORE_FINAL",
            targets: lobby.targets,
            guesses: lobby.your.guesses,
            scores: lobby.your.scores,
          });
        }
      } catch {
        /* ignore — page will just show the idle / name-entry flow */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialMode, presetGameId]);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const nextTarget = useCallback(
    (round: number): Color => {
      if (initialTargets && initialTargets[round]) return initialTargets[round];
      return randomTarget();
    },
    [initialTargets],
  );

  useEffect(() => {
    clearTimers();

    if (state.phase !== "show") {
      setTargetVisible(false);
      setPrepStep(null);
      setEndTimeMs(null);
      if (state.phase === "pick") {
        setHsl(INITIAL_HSL);
        setPrepText("");
      }
      return;
    }

    setTargetVisible(false);
    setPrepText("");
    setPrepStep(null);
    setEndTimeMs(null);

    const revealTarget = () => {
      setPrepStep(null);
      setTargetVisible(true);
      setEndTimeMs(performance.now() + SHOW_MS);
      timeoutRef.current = setTimeout(() => {
        clearTimers();
        dispatch({ type: "ENTER_PICK" });
      }, SHOW_MS);
    };

    let i = 0;
    const step = () => {
      if (i >= PREP_SEQUENCE.length) {
        revealTarget();
        return;
      }
      const entry = PREP_SEQUENCE[i];
      setPrepStep(i);
      setPrepText(entry.text);
      i++;
      timeoutRef.current = setTimeout(step, entry.duration);
    };
    step();

    return clearTimers;
  }, [state.phase, state.round, clearTimers]);

  const beginPlay = useCallback(() => {
    clearTimers();
    submittedRef.current = false;
    setSubmissionState("idle");
    setSubmissionError(null);
    setTeamLobby(null);
    setGlobalRanking(null);
    if (initialMode === "team-participant") {
      // Keep server-assigned id; don't reset.
    } else {
      setTeamShareId(null);
    }
    dispatch({ type: "START", target: nextTarget(0) });
  }, [clearTimers, initialMode, nextTarget]);

  const startGame = useCallback(
    (nextMode?: GameMode) => {
      const m = nextMode ?? mode;
      setMode(m);
      if (m === "solo") {
        trackEvent("game_started", { game: "color", mode: m });
        beginPlay();
        return;
      }
      const name = getStoredName();
      if (name) {
        setPlayerName(name);
        trackEvent("game_started", { game: "color", mode: m });
        beginPlay();
      } else {
        clearTimers();
        dispatch({ type: "ENTER_NAME_ENTRY" });
      }
    },
    [beginPlay, clearTimers, mode],
  );

  const confirmName = useCallback(
    (raw: string) => {
      const clean = sanitizeName(raw);
      if (clean.length === 0) return;
      setStoredName(clean);
      setPlayerName(clean);
      trackEvent("game_started", { game: "color", mode });
      beginPlay();
    },
    [beginPlay, mode],
  );

  const resetToIdle = useCallback(() => {
    clearTimers();
    submittedRef.current = false;
    setSubmissionState("idle");
    setSubmissionError(null);
    setTeamLobby(null);
    setGlobalRanking(null);
    if (initialMode === "team-participant") {
      // For participants we always stay in participant flow until navigation away.
      dispatch({ type: "RESET" });
    } else {
      setMode("solo");
      setTeamShareId(null);
      dispatch({ type: "RESET" });
    }
  }, [clearTimers, initialMode]);

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
      const total = state.scores.reduce((a, b) => a + b, 0);
      trackEvent("game_finished", { game: "color", mode, totalScore: total });
      dispatch({ type: "FINISH" });
    } else {
      dispatch({ type: "NEXT_ROUND", target: nextTarget(state.round + 1) });
    }
  }, [mode, nextTarget, state.phase, state.round, state.scores]);

  const totalScore = state.scores.reduce((a, b) => a + b, 0);
  const displayedRound = Math.min(state.round + 1, ROUNDS);

  // Submission side-effect on final phase.
  const runSubmission = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const name = playerName ?? getStoredName();
    if (mode !== "solo" && !name) {
      setSubmissionState("error");
      setSubmissionError("Name fehlt");
      return;
    }
    setSubmissionState("sending");
    setSubmissionError(null);
    try {
      if (mode === "global") {
        const clientId = getClientId();
        const result = await postGlobalScore({
          name: name!,
          clientId,
          targets: state.targets,
          guesses: state.guesses,
        });
        setGlobalRanking(result);
      } else if (mode === "team-creator") {
        const clientId = getClientId();
        const { id } = await createTeamGame({
          name: name!,
          clientId,
          targets: state.targets,
          guesses: state.guesses,
        });
        setTeamShareId(id);
        if (typeof window !== "undefined") {
          try {
            window.history.replaceState({}, "", `/color/t/${id}`);
          } catch {
            /* ignore */
          }
        }
        const lobby = await fetchTeamLobby(id, clientId);
        setTeamLobby(lobby);
      } else if (mode === "team-participant" && presetGameId) {
        const clientId = getClientId();
        try {
          const lobby = await postTeamScore(presetGameId, {
            name: name!,
            clientId,
            guesses: state.guesses,
          });
          setTeamLobby(lobby);
        } catch (err) {
          const e = err as Error & { status?: number };
          if (e.status === 409) {
            const lobby = await fetchTeamLobby(presetGameId, clientId);
            setTeamLobby(lobby);
          } else {
            throw err;
          }
        }
      }
      setSubmissionState("done");
    } catch (err) {
      console.error("submission failed", err);
      submittedRef.current = false;
      setSubmissionState("error");
      setSubmissionError(
        err instanceof Error ? err.message : "Unbekannter Fehler",
      );
      trackEvent("score_submission_failed", {
        game: "color",
        mode,
        reason: err instanceof Error ? err.message : "unknown",
      });
    }
  }, [mode, playerName, presetGameId, state.guesses, state.targets]);

  useEffect(() => {
    if (state.phase !== "final") return;
    if (mode === "solo") return;
    if (submittedRef.current) return;
    void runSubmission();
  }, [mode, runSubmission, state.phase]);

  const retrySubmission = useCallback(() => {
    submittedRef.current = false;
    void runSubmission();
  }, [runSubmission]);

  return {
    state,
    mode,
    hsl,
    setHsl,
    prepText,
    targetVisible,
    prepStep,
    endTimeMs,
    totalScore,
    displayedRound,
    currentQuip,
    playerName,
    startGame,
    confirmName,
    submitGuess,
    advance,
    resetToIdle,
    submissionState,
    submissionError,
    teamShareId,
    teamLobby,
    globalRanking,
    retrySubmission,
  };
}
