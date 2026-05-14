"use client";

import { useCallback, useEffect, useRef } from "react";

import { trackEvent } from "@/lib/analytics-client";
import type {
  AnalyticsEvent,
  AnalyticsGame,
  AnalyticsLocale,
  AnalyticsMode,
} from "@/lib/analytics";

type Options = {
  game: AnalyticsGame;
  mode: AnalyticsMode;
  locale: AnalyticsLocale;
};

export type AnalyticsSession = {
  /** Mark the start of a game. Captures the timestamp for duration tracking. */
  begin: () => void;
  /** Mark the end of a game and return the elapsed duration in ms (rounded). */
  end: () => number | undefined;
  /** Emit a tracked event with the current game/mode/locale context applied. */
  track: (event: AnalyticsEvent, extras?: { reason?: string; totalScore?: number }) => void;
};

/**
 * Tracks an in-progress game session. Emits a `game_abandoned` event with
 * `durationMs` when the user navigates away while a game is active.
 */
export function useAnalyticsSession({ game, mode, locale }: Options): AnalyticsSession {
  const startedAtRef = useRef<number | null>(null);
  const gameRef = useRef(game);
  const modeRef = useRef(mode);
  const localeRef = useRef(locale);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  useEffect(() => {
    localeRef.current = locale;
  }, [locale]);

  const begin = useCallback(() => {
    startedAtRef.current = performance.now();
  }, []);

  const end = useCallback((): number | undefined => {
    const startedAt = startedAtRef.current;
    if (startedAt === null) return undefined;
    startedAtRef.current = null;
    return Math.round(performance.now() - startedAt);
  }, []);

  const track = useCallback(
    (
      event: AnalyticsEvent,
      extras?: { reason?: string; totalScore?: number },
    ) => {
      trackEvent(event, {
        game: gameRef.current,
        mode: modeRef.current,
        locale: localeRef.current,
        reason: extras?.reason,
        totalScore: extras?.totalScore,
      });
    },
    [],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handlePageHide = () => {
      const startedAt = startedAtRef.current;
      if (startedAt === null) return;
      const durationMs = Math.round(performance.now() - startedAt);
      startedAtRef.current = null;
      trackEvent("game_abandoned", {
        game: gameRef.current,
        mode: modeRef.current,
        locale: localeRef.current,
        durationMs,
      });
    };
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);

  return { begin, end, track };
}
