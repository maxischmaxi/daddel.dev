"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import {
  createSoundTeamGame,
  fetchSoundTeamLobby,
  postSoundGlobalScore,
  postSoundTeamScore,
  type SoundGlobalRanking,
  type SoundTeamLobby,
} from "@/lib/api-client";
import { trackEvent } from "@/lib/analytics-client";
import { armAudioOnFirstGesture, unlockAudio } from "@/lib/audio";
import {
  getClientId,
  getStoredName,
  sanitizeName,
  setStoredName,
} from "@/lib/player";

import { sliderToFreq, SLIDER_MAX } from "./frequency";
import {
  gameReducer,
  initialState,
  PREP_SEQUENCE,
  randomTarget,
  ROUNDS,
  scoreRound,
  SHOW_MS,
  type GameMode,
  type Sound,
} from "./game-state";
import { useToneOscillator } from "./use-tone-oscillator";

const INITIAL_SLIDER = Math.round(SLIDER_MAX / 2);

export type SubmissionState = "idle" | "sending" | "done" | "error";

export type SoundGameOptions = {
  mode?: GameMode;
  gameId?: string;
  initialTargets?: Sound[];
};

export function useSoundGame(options: SoundGameOptions = {}) {
  const {
    mode: initialMode = "solo",
    gameId: presetGameId,
    initialTargets,
  } = options;

  const [mode, setMode] = useState<GameMode>(initialMode);
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [slider, setSlider] = useState<number>(INITIAL_SLIDER);
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
  const [teamLobby, setTeamLobby] = useState<SoundTeamLobby | null>(null);
  const [globalRanking, setGlobalRanking] =
    useState<SoundGlobalRanking | null>(null);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submittedRef = useRef(false);

  const {
    start: toneStart,
    setFreq: toneSetFreq,
    stop: toneStop,
    analyserRef: toneAnalyserRef,
  } = useToneOscillator();
  const toneStartedRef = useRef(false);

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
        const lobby = await fetchSoundTeamLobby(presetGameId, clientId);
        if (cancelled) return;
        if (lobby.your) {
          submittedRef.current = true;
          setTeamLobby(lobby);
          setSubmissionState("done");
          const targets: Sound[] = lobby.targets.map((freq) => ({ freq }));
          const guesses: Sound[] = lobby.your.guesses.map((freq) => ({ freq }));
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
    (round: number): Sound => {
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
        setSlider(INITIAL_SLIDER);
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
      const target = state.targets[state.round];
      if (target) {
        toneStart(target.freq);
        toneStartedRef.current = true;
      }
      timeoutRef.current = setTimeout(() => {
        clearTimers();
        toneStop();
        toneStartedRef.current = false;
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
      if (toneStartedRef.current) {
        toneStop();
        toneStartedRef.current = false;
      }
    };
  }, [
    state.phase,
    state.round,
    state.targets,
    clearTimers,
    toneStart,
    toneStop,
  ]);

  useEffect(() => {
    if (state.phase !== "pick") return;
    toneStart(sliderToFreq(slider));
    toneStartedRef.current = true;
    return () => {
      toneStop();
      toneStartedRef.current = false;
    };
    // Only run when phase enters "pick"; slider updates handled separately below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== "pick") return;
    if (!toneStartedRef.current) return;
    toneSetFreq(sliderToFreq(slider));
  }, [slider, state.phase, toneSetFreq]);

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
      unlockAudio();
      const m = nextMode ?? mode;
      setMode(m);
      if (m === "solo") {
        trackEvent("game_started", { game: "sound", mode: m });
        beginPlay();
        return;
      }
      const name = getStoredName();
      if (name) {
        setPlayerName(name);
        trackEvent("game_started", { game: "sound", mode: m });
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
      unlockAudio();
      const clean = sanitizeName(raw);
      if (clean.length === 0) return;
      setStoredName(clean);
      setPlayerName(clean);
      trackEvent("game_started", { game: "sound", mode });
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
    const guess: Sound = { freq: sliderToFreq(slider) };
    const points = scoreRound(target, guess);
    toneStop();
    toneStartedRef.current = false;
    dispatch({ type: "SUBMIT_GUESS", guess, points });
  }, [
    clearTimers,
    slider,
    state.phase,
    state.round,
    state.targets,
    toneStop,
  ]);

  const advance = useCallback(() => {
    if (state.phase !== "reveal") return;
    if (state.round + 1 >= ROUNDS) {
      const total = state.scores.reduce((a, b) => a + b, 0);
      trackEvent("game_finished", { game: "sound", mode, totalScore: total });
      dispatch({ type: "FINISH" });
    } else {
      dispatch({ type: "NEXT_ROUND", target: nextTarget(state.round + 1) });
    }
  }, [mode, nextTarget, state.phase, state.round, state.scores]);

  const totalScore = state.scores.reduce((a, b) => a + b, 0);
  const displayedRound = Math.min(state.round + 1, ROUNDS);

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
    const targetsHz = state.targets.map((t) => t.freq);
    const guessesHz = state.guesses.map((g) => g.freq);
    try {
      if (mode === "global") {
        const clientId = getClientId();
        const result = await postSoundGlobalScore({
          name: name!,
          clientId,
          total: totalScore,
          targets: targetsHz,
          scores: state.scores,
          guesses: guessesHz,
        });
        setGlobalRanking(result);
      } else if (mode === "team-creator") {
        const clientId = getClientId();
        const { id } = await createSoundTeamGame({
          name: name!,
          clientId,
          targets: targetsHz,
          creatorScore: {
            total: totalScore,
            scores: state.scores,
            guesses: guessesHz,
          },
        });
        setTeamShareId(id);
        if (typeof window !== "undefined") {
          try {
            window.history.replaceState({}, "", `/sound/t/${id}`);
          } catch {
            /* ignore */
          }
        }
        const lobby = await fetchSoundTeamLobby(id, clientId);
        setTeamLobby(lobby);
      } else if (mode === "team-participant" && presetGameId) {
        const clientId = getClientId();
        try {
          const lobby = await postSoundTeamScore(presetGameId, {
            name: name!,
            clientId,
            total: totalScore,
            scores: state.scores,
            guesses: guessesHz,
          });
          setTeamLobby(lobby);
        } catch (err) {
          const e = err as Error & { status?: number };
          if (e.status === 409) {
            const lobby = await fetchSoundTeamLobby(presetGameId, clientId);
            setTeamLobby(lobby);
          } else {
            throw err;
          }
        }
      }
      setSubmissionState("done");
    } catch (err) {
      console.error("sound submission failed", err);
      submittedRef.current = false;
      setSubmissionState("error");
      setSubmissionError(
        err instanceof Error ? err.message : "Unbekannter Fehler",
      );
      trackEvent("score_submission_failed", {
        game: "sound",
        mode,
        reason: err instanceof Error ? err.message : "unknown",
      });
    }
  }, [
    mode,
    playerName,
    presetGameId,
    state.guesses,
    state.scores,
    state.targets,
    totalScore,
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
    slider,
    setSlider,
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
    analyserRef: toneAnalyserRef,
  };
}
