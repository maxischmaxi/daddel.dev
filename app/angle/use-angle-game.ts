"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import {
  createAngleTeamGame,
  fetchAngleTeamLobby,
  postAngleGlobalScore,
  postAngleTeamScore,
  type AngleGlobalRanking,
  type AngleTeamLobby,
} from "@/lib/api-client";
import { trackEvent } from "@/lib/analytics-client";
import { useAnalyticsSession } from "@/lib/use-analytics-session";
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
  normalizeDeg,
  PREP_SEQUENCE,
  randomTarget,
  ROUNDS,
  scoreRound,
  SHOW_MS,
  type Angle,
  type GameMode,
} from "./game-state";

export type SubmissionState = "idle" | "sending" | "done" | "error";

export type AngleGameOptions = {
  mode?: GameMode;
  gameId?: string;
  initialTargets?: Angle[];
};

function initialPlayerDeg(): number {
  return 0;
}

export function useAngleGame(options: AngleGameOptions = {}) {
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
  const session = useAnalyticsSession({ game: "angle", mode, locale });
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [playerDeg, setPlayerDegRaw] = useState<number>(initialPlayerDeg);
  const [prepText, setPrepText] = useState("");
  const [targetVisible, setTargetVisible] = useState(false);
  const [prepStep, setPrepStep] = useState<number | null>(null);
  const [endTimeMs, setEndTimeMs] = useState<number | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);

  const [submissionState, setSubmissionState] =
    useState<SubmissionState>("idle");
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [teamShareId, setTeamShareId] = useState<string | null>(
    presetGameId ?? null,
  );
  const [teamLobby, setTeamLobby] = useState<AngleTeamLobby | null>(null);
  const [globalRanking, setGlobalRanking] =
    useState<AngleGlobalRanking | null>(null);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submittedRef = useRef(false);

  const setPlayerDeg = useCallback((deg: number) => {
    setPlayerDegRaw(normalizeDeg(deg));
  }, []);

  useEffect(() => {
    setPlayerName(getStoredName());
  }, []);

  useEffect(() => {
    if (initialMode !== "team-participant" || !presetGameId) return;
    if (typeof window === "undefined") return;
    let cancelled = false;
    (async () => {
      try {
        const clientId = getClientId();
        const lobby = await fetchAngleTeamLobby(presetGameId, clientId);
        if (cancelled) return;
        if (lobby.your) {
          submittedRef.current = true;
          setTeamLobby(lobby);
          setSubmissionState("done");
          const targets: Angle[] = lobby.targets.map((deg) => ({ deg }));
          const guesses: Angle[] = lobby.your.guesses.map((deg) => ({ deg }));
          dispatch({
            type: "RESTORE_FINAL",
            targets,
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

  const nextTarget = useCallback(
    (round: number): Angle => {
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
        setPlayerDegRaw(initialPlayerDeg());
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

    return () => {
      clearTimers();
    };
  }, [state.phase, state.round, state.targets, clearTimers]);

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
        session.begin();
        trackEvent("game_started", { game: "angle", mode: m, locale });
        beginPlay();
        return;
      }
      const name = getStoredName();
      if (name) {
        setPlayerName(name);
        session.begin();
        trackEvent("game_started", { game: "angle", mode: m, locale });
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
      const clean = sanitizeName(raw);
      if (clean.length === 0) return;
      setStoredName(clean);
      setPlayerName(clean);
      session.begin();
      trackEvent("game_started", { game: "angle", mode, locale });
      beginPlay();
    },
    [beginPlay, locale, mode, session],
  );

  const resetToIdle = useCallback(() => {
    clearTimers();
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
  }, [clearTimers, initialMode]);

  const submitGuess = useCallback(() => {
    if (state.phase !== "pick") return;
    clearTimers();
    const target = state.targets[state.round];
    const guess: Angle = { deg: normalizeDeg(playerDeg) };
    const points = scoreRound(target, guess);
    dispatch({ type: "SUBMIT_GUESS", guess, points });
  }, [clearTimers, playerDeg, state.phase, state.round, state.targets]);

  const advance = useCallback(() => {
    if (state.phase !== "reveal") return;
    if (state.round + 1 >= ROUNDS) {
      const total = state.scores.reduce((a, b) => a + b, 0);
      const durationMs = session.end();
      trackEvent("game_finished", {
        game: "angle",
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
    const targetsDeg = state.targets.map((t) => t.deg);
    const guessesDeg = state.guesses.map((g) => g.deg);
    try {
      if (mode === "global") {
        const clientId = getClientId();
        const result = await postAngleGlobalScore({
          name: name!,
          clientId,
          total: totalScore,
          targets: targetsDeg,
          scores: state.scores,
          guesses: guessesDeg,
        });
        setGlobalRanking(result);
      } else if (mode === "team-creator") {
        const clientId = getClientId();
        const { id } = await createAngleTeamGame({
          name: name!,
          clientId,
          targets: targetsDeg,
          creatorScore: {
            total: totalScore,
            scores: state.scores,
            guesses: guessesDeg,
          },
        });
        setTeamShareId(id);
        if (typeof window !== "undefined") {
          try {
            window.history.replaceState({}, "", `/angle/t/${id}`);
          } catch {
            /* ignore */
          }
        }
        const lobby = await fetchAngleTeamLobby(id, clientId);
        setTeamLobby(lobby);
      } else if (mode === "team-participant" && presetGameId) {
        const clientId = getClientId();
        try {
          const lobby = await postAngleTeamScore(presetGameId, {
            name: name!,
            clientId,
            total: totalScore,
            scores: state.scores,
            guesses: guessesDeg,
          });
          setTeamLobby(lobby);
        } catch (err) {
          const e = err as Error & { status?: number };
          if (e.status === 409) {
            const lobby = await fetchAngleTeamLobby(presetGameId, clientId);
            setTeamLobby(lobby);
          } else {
            throw err;
          }
        }
      }
      setSubmissionState("done");
    } catch (err) {
      console.error("angle submission failed", err);
      submittedRef.current = false;
      setSubmissionState("error");
      setSubmissionError(
        err instanceof Error ? err.message : unknownErrorMsg,
      );
      trackEvent("score_submission_failed", {
        game: "angle",
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
    playerDeg,
    setPlayerDeg,
    prepText,
    targetVisible,
    prepStep,
    endTimeMs,
    totalScore,
    displayedRound,
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
