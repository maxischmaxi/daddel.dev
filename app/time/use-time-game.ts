"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import {
  createTimeTeamGame,
  fetchTimeTeamLobby,
  postTimeGlobalScore,
  postTimeTeamScore,
  type TimeGlobalRanking,
  type TimeTeamLobby,
} from "@/lib/api-client";
import { trackEvent } from "@/lib/analytics-client";
import { useAnalyticsSession } from "@/lib/use-analytics-session";
import { armAudioOnFirstGesture, unlockAudio } from "@/lib/audio";
import { useDict, useLocale } from "@/lib/i18n/use-t";
import {
  getClientId,
  getStoredName,
  sanitizeName,
  setStoredName,
} from "@/lib/player";

import {
  gameReducer,
  initialState,
  PREP_SEQUENCE,
  randomTarget,
  ROUNDS,
  scoreRound,
  type GameMode,
  type TimeGuess,
  type TimeTarget,
} from "./game-state";
import { useMuffledSound } from "./use-muffled-sound";

export type SubmissionState = "idle" | "sending" | "done" | "error";

export type TimeGameOptions = {
  mode?: GameMode;
  gameId?: string;
  initialTargets?: TimeTarget[];
};

export function useTimeGame(options: TimeGameOptions = {}) {
  const {
    mode: initialMode = "solo",
    gameId: presetGameId,
    initialTargets,
  } = options;

  const dict = useDict();
  const { locale } = useLocale();
  const missingNameMsg = dict.common.missingName;
  const unknownErrorMsg = dict.common.unknownError;

  const [mode, setMode] = useState<GameMode>(initialMode);
  const session = useAnalyticsSession({ game: "time", mode, locale });
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [prepText, setPrepText] = useState("");
  const [targetVisible, setTargetVisible] = useState(false);
  const [prepStep, setPrepStep] = useState<number | null>(null);
  const [endTimeMs, setEndTimeMs] = useState<number | null>(null);
  const [holdElapsedMs, setHoldElapsedMs] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [playerName, setPlayerName] = useState<string | null>(null);

  const [submissionState, setSubmissionState] =
    useState<SubmissionState>("idle");
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [teamShareId, setTeamShareId] = useState<string | null>(
    presetGameId ?? null,
  );
  const [teamLobby, setTeamLobby] = useState<TimeTeamLobby | null>(null);
  const [globalRanking, setGlobalRanking] =
    useState<TimeGlobalRanking | null>(null);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdStartRef = useRef<number | null>(null);
  const holdRafRef = useRef<number | null>(null);
  const submittedRef = useRef(false);
  const phaseRef = useRef(state.phase);

  const { start: soundStart, stop: soundStop } = useMuffledSound();

  useEffect(() => {
    phaseRef.current = state.phase;
  }, [state.phase]);

  useEffect(() => {
    setPlayerName(getStoredName());
    armAudioOnFirstGesture();
  }, []);

  useEffect(() => {
    if (initialMode !== "team-participant" || !presetGameId) return;
    if (typeof window === "undefined") return;
    let cancelled = false;
    (async () => {
      try {
        const clientId = getClientId();
        const lobby = await fetchTimeTeamLobby(presetGameId, clientId);
        if (cancelled) return;
        const phase = phaseRef.current;
        if (phase !== "idle" && phase !== "name-entry") return;
        if (lobby.your) {
          submittedRef.current = true;
          setTeamLobby(lobby);
          setSubmissionState("done");
          const guesses: TimeGuess[] = lobby.your.guesses.map((durationMs) => ({
            durationMs,
          }));
          dispatch({
            type: "RESTORE_FINAL",
            targets: lobby.targets,
            guesses,
            scores: lobby.your.scores,
          });
        }
      } catch {
        /* ignore */
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

  const stopHoldClock = useCallback(() => {
    if (holdRafRef.current !== null) {
      cancelAnimationFrame(holdRafRef.current);
      holdRafRef.current = null;
    }
    holdStartRef.current = null;
    setIsHolding(false);
  }, []);

  const nextTarget = useCallback(
    (round: number): TimeTarget => {
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
      soundStop();
      if (state.phase === "pick") {
        setPrepText("");
        setHoldElapsedMs(0);
      }
      return;
    }

    stopHoldClock();
    setTargetVisible(false);
    setPrepText("");
    setPrepStep(null);
    setEndTimeMs(null);

    const revealTarget = () => {
      const target = state.targets[state.round];
      if (!target) return;
      setPrepStep(null);
      setTargetVisible(true);
      setEndTimeMs(performance.now() + target.durationMs);
      soundStart(target);
      timeoutRef.current = setTimeout(() => {
        clearTimers();
        soundStop();
        dispatch({ type: "ENTER_PICK" });
      }, target.durationMs);
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

    return () => {
      clearTimers();
      soundStop();
    };
  }, [
    state.phase,
    state.round,
    state.targets,
    clearTimers,
    soundStart,
    soundStop,
    stopHoldClock,
  ]);

  useEffect(() => {
    return () => {
      stopHoldClock();
      clearTimers();
    };
  }, [clearTimers, stopHoldClock]);

  const beginPlay = useCallback(() => {
    clearTimers();
    stopHoldClock();
    soundStop();
    setHoldElapsedMs(0);
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
  }, [clearTimers, initialMode, nextTarget, soundStop, stopHoldClock]);

  const startGame = useCallback(
    (nextMode?: GameMode) => {
      unlockAudio();
      const m = nextMode ?? mode;
      setMode(m);
      if (m === "solo") {
        session.begin();
        trackEvent("game_started", { game: "time", mode: m, locale });
        beginPlay();
        return;
      }
      const name = getStoredName();
      if (name) {
        setPlayerName(name);
        session.begin();
        trackEvent("game_started", { game: "time", mode: m, locale });
        beginPlay();
      } else {
        clearTimers();
        dispatch({ type: "ENTER_NAME_ENTRY" });
      }
    },
    [beginPlay, clearTimers, locale, mode, session],
  );

  const confirmName = useCallback(
    (raw: string) => {
      unlockAudio();
      const clean = sanitizeName(raw);
      if (clean.length === 0) return;
      setStoredName(clean);
      setPlayerName(clean);
      session.begin();
      trackEvent("game_started", { game: "time", mode, locale });
      beginPlay();
    },
    [beginPlay, locale, mode, session],
  );

  const resetToIdle = useCallback(() => {
    clearTimers();
    stopHoldClock();
    soundStop();
    setHoldElapsedMs(0);
    submittedRef.current = false;
    setSubmissionState("idle");
    setSubmissionError(null);
    setTeamLobby(null);
    setGlobalRanking(null);
    if (initialMode === "team-participant") {
      dispatch({ type: "RESET" });
    } else {
      setMode("solo");
      setTeamShareId(null);
      dispatch({ type: "RESET" });
    }
  }, [clearTimers, initialMode, soundStop, stopHoldClock]);

  const submitGuess = useCallback(
    (durationMs: number) => {
      if (state.phase !== "pick") return;
      clearTimers();
      stopHoldClock();
      soundStop();
      const target = state.targets[state.round];
      if (!target) return;
      const guess: TimeGuess = { durationMs: Math.max(0, durationMs) };
      const points = scoreRound(target, guess);
      dispatch({ type: "SUBMIT_GUESS", guess, points });
    },
    [clearTimers, soundStop, state.phase, state.round, state.targets, stopHoldClock],
  );

  const beginGuessHold = useCallback(() => {
    if (state.phase !== "pick") return;
    if (holdStartRef.current !== null) return;

    const target = state.targets[state.round];
    if (target) soundStart(target);

    const startedAt = performance.now();
    holdStartRef.current = startedAt;
    setHoldElapsedMs(0);
    setIsHolding(true);

    const tick = () => {
      if (holdStartRef.current === null) return;
      setHoldElapsedMs(performance.now() - holdStartRef.current);
      holdRafRef.current = requestAnimationFrame(tick);
    };
    holdRafRef.current = requestAnimationFrame(tick);
  }, [soundStart, state.phase, state.round, state.targets]);

  const endGuessHold = useCallback(() => {
    if (state.phase !== "pick") return;
    const startedAt = holdStartRef.current;
    if (startedAt === null) return;
    const elapsed = performance.now() - startedAt;
    setHoldElapsedMs(elapsed);
    submitGuess(elapsed);
  }, [state.phase, submitGuess]);

  const cancelGuessHold = useCallback(() => {
    if (state.phase !== "pick") return;
    const startedAt = holdStartRef.current;
    if (startedAt === null) return;
    const elapsed = performance.now() - startedAt;
    setHoldElapsedMs(elapsed);
    submitGuess(elapsed);
  }, [state.phase, submitGuess]);

  const advance = useCallback(() => {
    if (state.phase !== "reveal") return;
    if (state.round + 1 >= ROUNDS) {
      const total = state.scores.reduce((a, b) => a + b, 0);
      const durationMs = session.end();
      trackEvent("game_finished", {
        game: "time",
        mode,
        totalScore: total,
        durationMs,
        locale,
      });
      dispatch({ type: "FINISH" });
    } else {
      dispatch({ type: "NEXT_ROUND", target: nextTarget(state.round + 1) });
    }
  }, [locale, mode, nextTarget, session, state.phase, state.round, state.scores]);

  const totalScore = state.scores.reduce((a, b) => a + b, 0);
  const displayedRound = Math.min(state.round + 1, ROUNDS);

  const runSubmission = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const name = playerName ?? getStoredName();
    if (mode !== "solo" && !name) {
      setSubmissionState("error");
      setSubmissionError(missingNameMsg);
      return;
    }
    setSubmissionState("sending");
    setSubmissionError(null);
    const guessesMs = state.guesses.map((g) => g.durationMs);
    try {
      if (mode === "global") {
        const clientId = getClientId();
        const result = await postTimeGlobalScore({
          name: name!,
          clientId,
          total: totalScore,
          targets: state.targets,
          scores: state.scores,
          guesses: guessesMs,
        });
        setGlobalRanking(result);
      } else if (mode === "team-creator") {
        const clientId = getClientId();
        const { id } = await createTimeTeamGame({
          name: name!,
          clientId,
          targets: state.targets,
          creatorScore: {
            total: totalScore,
            scores: state.scores,
            guesses: guessesMs,
          },
        });
        setTeamShareId(id);
        if (typeof window !== "undefined") {
          try {
            window.history.replaceState({}, "", `/time/t/${id}`);
          } catch {
            /* ignore */
          }
        }
        const lobby = await fetchTimeTeamLobby(id, clientId);
        setTeamLobby(lobby);
      } else if (mode === "team-participant" && presetGameId) {
        const clientId = getClientId();
        try {
          const lobby = await postTimeTeamScore(presetGameId, {
            name: name!,
            clientId,
            total: totalScore,
            scores: state.scores,
            guesses: guessesMs,
          });
          setTeamLobby(lobby);
        } catch (err) {
          const e = err as Error & { status?: number };
          if (e.status === 409) {
            const lobby = await fetchTimeTeamLobby(presetGameId, clientId);
            setTeamLobby(lobby);
          } else {
            throw err;
          }
        }
      }
      setSubmissionState("done");
    } catch (err) {
      console.error("time submission failed", err);
      submittedRef.current = false;
      setSubmissionState("error");
      setSubmissionError(
        err instanceof Error ? err.message : unknownErrorMsg,
      );
      trackEvent("score_submission_failed", {
        game: "time",
        mode,
        locale,
        reason: err instanceof Error ? err.message : "unknown",
      });
    }
  }, [
    locale,
    missingNameMsg,
    mode,
    playerName,
    presetGameId,
    state.guesses,
    state.scores,
    state.targets,
    totalScore,
    unknownErrorMsg,
  ]);

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
    prepText,
    targetVisible,
    prepStep,
    endTimeMs,
    totalScore,
    displayedRound,
    holdElapsedMs,
    isHolding,
    playerName,
    startGame,
    confirmName,
    beginGuessHold,
    endGuessHold,
    cancelGuessHold,
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
