"use client";

import { ChevronRight, Globe, User, Users } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import { NameEntry } from "@/app/color/name-entry";
import {
  AURORA_GRADIENT,
  CUBE_ACTION_BASE,
} from "@/app/color/shared-styles";
import { useBingClick } from "@/app/color/use-click-tone";
import { useHoverEarthquake } from "@/app/color/use-hover-earthquake";
import { useHoverTone, type ToneSpec } from "@/app/color/use-hover-tone";
import { AnimatedScore } from "@/components/animated-score";
import { PrepSequenceDisplay } from "@/components/prep-sequence-display";
import { Button } from "@/components/ui/button";
import { useDict } from "@/lib/i18n/use-t";
import { readStoredClientId } from "@/lib/player";
import { cn } from "@/lib/utils";

import { FinalGlobal } from "./final-global";
import { FinalSolo } from "./final-solo";
import { FinalTeam } from "./final-team";
import {
  formatDuration,
  MAX_DURATION_MS,
  type GameMode,
  type TimeTarget,
} from "./game-state";
import { TimeVisualizer } from "./time-visualizer";
import { useTimeGame } from "./use-time-game";

const SINGLEPLAYER_TONE: readonly ToneSpec[] = [
  { startFreq: 130, endFreq: 520, rampSeconds: 1.4, type: "triangle" },
];

const MULTIPLAYER_TONE: readonly ToneSpec[] = [
  { startFreq: 261.63, endFreq: 1046.5, rampSeconds: 4 },
  { startFreq: 329.63, endFreq: 1318.51, rampSeconds: 4 },
  { startFreq: 392.0, endFreq: 1567.98, rampSeconds: 4 },
];

function IdleActions({
  onSolo,
  onTeam,
  onGlobal,
}: {
  onSolo: () => void;
  onTeam: () => void;
  onGlobal: () => void;
}) {
  const dict = useDict();
  const singleplayerHoverTone = useHoverTone(SINGLEPLAYER_TONE);
  const multiplayerHoverTone = useHoverTone(MULTIPLAYER_TONE);
  const globeHoverEarthquake = useHoverEarthquake();
  const handleSoloClick = useBingClick<HTMLButtonElement>(onSolo);
  const handleTeamClick = useBingClick<HTMLButtonElement>(onTeam);
  const handleGlobalClick = useBingClick<HTMLButtonElement>(onGlobal);

  return (
    <div className="flex gap-2 px-4 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className={cn(CUBE_ACTION_BASE, "group relative size-14 sm:size-16")}
        type="button"
        aria-label={dict.common.soloAria}
        onClick={handleSoloClick}
        {...singleplayerHoverTone}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-2 rounded-full opacity-0 blur-[14px] transition-opacity duration-300 group-hover:opacity-70 motion-safe:group-hover:animate-aurora-spin"
          style={{ background: AURORA_GRADIENT }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-safe:group-hover:animate-aurora-spin"
          style={{ background: AURORA_GRADIENT }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full border-2 border-white/85 opacity-0 motion-safe:group-hover:animate-pulse-ring"
        />
        <User
          aria-hidden="true"
          strokeWidth={2.25}
          style={{ width: 26, height: 26 }}
          className="relative z-10 transition-transform duration-300 group-hover:scale-110"
        />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn(CUBE_ACTION_BASE, "group relative size-14 sm:size-16")}
        type="button"
        aria-label={dict.common.teamAria}
        onClick={handleTeamClick}
        {...multiplayerHoverTone}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-2 rounded-full opacity-0 blur-[14px] transition-opacity duration-300 group-hover:opacity-70 motion-safe:group-hover:animate-aurora-spin"
          style={{ background: AURORA_GRADIENT }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-safe:group-hover:animate-aurora-spin"
          style={{ background: AURORA_GRADIENT }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full border-2 border-cyan-300 opacity-0 motion-safe:group-hover:animate-pulse-ring"
        />
        <span
          aria-hidden="true"
          style={{ animationDelay: "0.6s" }}
          className="pointer-events-none absolute inset-0 rounded-full border-2 border-fuchsia-300 opacity-0 motion-safe:group-hover:animate-pulse-ring"
        />
        <span
          aria-hidden="true"
          style={{ animationDelay: "1.2s" }}
          className="pointer-events-none absolute inset-0 rounded-full border-2 border-amber-300 opacity-0 motion-safe:group-hover:animate-pulse-ring"
        />
        <Users
          aria-hidden="true"
          strokeWidth={2.25}
          style={{ width: 26, height: 26 }}
          className="relative z-10 transition-transform duration-300 group-hover:scale-110"
        />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn(CUBE_ACTION_BASE, "group relative ml-auto size-14 sm:size-16")}
        type="button"
        aria-label={dict.common.globalAria}
        data-globe-rumble
        onClick={handleGlobalClick}
        {...globeHoverEarthquake}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-3 rounded-full opacity-0 blur-lg transition-opacity duration-200 group-hover:opacity-60 motion-safe:group-hover:animate-aurora-spin"
          style={{ background: AURORA_GRADIENT }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-1.5 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 motion-safe:group-hover:animate-aurora-spin"
          style={{
            background: AURORA_GRADIENT,
            mask: "radial-gradient(closest-side, transparent 75%, #000 78%)",
            WebkitMask:
              "radial-gradient(closest-side, transparent 75%, #000 78%)",
          }}
        />
        <Globe
          aria-hidden="true"
          strokeWidth={2.25}
          style={{ width: 26, height: 26 }}
          className="relative z-10 transition-transform duration-300 group-hover:scale-110"
        />
      </Button>
    </div>
  );
}

export type TimeGameProps = {
  mode?: GameMode;
  gameId?: string;
  initialTargets?: TimeTarget[];
};

export default function TimeGame({
  mode: initialMode,
  gameId,
  initialTargets,
}: TimeGameProps = {}) {
  const dict = useDict();
  const {
    state,
    mode,
    prepText,
    targetVisible,
    prepStep,
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
  } = useTimeGame({ mode: initialMode, gameId, initialTargets });

  const isIdle = state.phase === "idle";
  const isNameEntry = state.phase === "name-entry";
  const isShow = state.phase === "show";
  const isPick = state.phase === "pick";
  const isReveal = state.phase === "reveal";
  const isFinal = state.phase === "final";
  const currentTarget = state.targets[state.round];
  const revealTarget = isReveal ? state.targets[state.round] : null;
  const revealGuess = isReveal ? state.guesses[state.round] : null;
  const roundPoints = state.scores[state.scores.length - 1] ?? 0;
  const holdProgress = Math.min(1, holdElapsedMs / MAX_DURATION_MS);

  const pointerIdRef = useRef<number | null>(null);
  const keyHoldingRef = useRef(false);

  useEffect(() => {
    if (!isPick) {
      pointerIdRef.current = null;
      keyHoldingRef.current = false;
    }
  }, [isPick]);

  const releasePointer = (event: PointerEvent<HTMLDivElement>) => {
    const pointerId = pointerIdRef.current;
    if (pointerId === null || pointerId !== event.pointerId) return false;
    try {
      event.currentTarget.releasePointerCapture(pointerId);
    } catch {
      /* ignore */
    }
    pointerIdRef.current = null;
    return true;
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!isPick || pointerIdRef.current !== null) return;
    event.preventDefault();
    pointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    beginGuessHold();
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!isPick) return;
    event.preventDefault();
    if (releasePointer(event)) endGuessHold();
  };

  const handlePointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    if (!isPick) return;
    event.preventDefault();
    if (releasePointer(event)) cancelGuessHold();
  };

  const isHoldKey = (key: string) => key === " " || key === "Enter";

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isPick || !isHoldKey(event.key)) return;
    event.preventDefault();
    if (event.repeat || keyHoldingRef.current) return;
    keyHoldingRef.current = true;
    beginGuessHold();
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isPick || !isHoldKey(event.key)) return;
    event.preventDefault();
    if (!keyHoldingRef.current) return;
    keyHoldingRef.current = false;
    endGuessHold();
  };

  const isParticipant = initialMode === "team-participant";
  const onHome = () => {
    if (
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/time/t/")
    ) {
      window.location.href = "/";
      return;
    }
    resetToIdle();
  };

  const handleParticipantStart = useBingClick<HTMLButtonElement>(() =>
    startGame("team-participant"),
  );

  const idleTitle = isParticipant
    ? dict.game.time.idleInvitedTitle
    : dict.game.time.idleTitle;
  const idleDescription = isParticipant ? (
    <>
      <br />
      {dict.game.time.teamIntro1}
      <br />
      {dict.game.time.teamIntro2}
    </>
  ) : (
    <>
      <br />
      {dict.game.time.soloIntro1}
      <br />
      {dict.game.time.soloIntro2}
      <br />
      <br />
      {dict.game.time.soloIntro3}
      <br />
      {dict.game.time.soloIntro4}
    </>
  );

  const [localClientId, setLocalClientId] = useState<string | null>(null);
  useEffect(() => {
    setLocalClientId(readStoredClientId());
  }, []);

  return (
    <div
      className={cn(
        "game-shell-time shadow-xl relative overflow-hidden rounded-xl bg-cube-dark flex flex-col flex-nowrap aspect-[1/1.05] py-4 transition-colors duration-300 ease-out sm:aspect-[1/0.8] sm:py-6",
        isPick && "touch-none cursor-pointer select-none outline-none",
      )}
      role={isPick ? "button" : undefined}
      tabIndex={isPick ? 0 : undefined}
      aria-label={isPick ? dict.game.time.holdAria : undefined}
      onPointerDown={isPick ? handlePointerDown : undefined}
      onPointerUp={isPick ? handlePointerUp : undefined}
      onPointerCancel={isPick ? handlePointerCancel : undefined}
      onKeyDown={isPick ? handleKeyDown : undefined}
      onKeyUp={isPick ? handleKeyUp : undefined}
    >
      {isShow && targetVisible && currentTarget && (
        <TimeVisualizer target={currentTarget} active />
      )}

      {isPick && currentTarget && (
        <TimeVisualizer
          target={currentTarget}
          active={isHolding}
          pressed={isHolding}
          className={cn(isHolding ? "opacity-85" : "opacity-25")}
        />
      )}

      {isIdle && (
        <>
          <div className="flex-1 min-h-0 flex flex-col items-start justify-center gap-3 px-4 sm:gap-4 sm:px-6">
            <h1 className="m-0 w-full text-center text-[clamp(2.5rem,14vw,4rem)] leading-none font-bold tracking-tight text-white">
              {idleTitle}
            </h1>
            <p className="w-full text-center text-sm leading-snug tracking-tight text-white sm:text-base">
              {idleDescription}
            </p>
          </div>
          {isParticipant ? (
            <div className="flex justify-center px-4 sm:px-6">
              <Button
                variant="ghost"
                size="icon"
                className={cn(CUBE_ACTION_BASE, "size-14 sm:size-16")}
                type="button"
                aria-label={dict.common.play}
                onClick={handleParticipantStart}
              >
                <ChevronRight
                  aria-hidden="true"
                  strokeWidth={2.25}
                  style={{ width: 26, height: 26 }}
                />
              </Button>
            </div>
          ) : (
            <IdleActions
              onSolo={() => startGame("solo")}
              onTeam={() => startGame("team-creator")}
              onGlobal={() => startGame("global")}
            />
          )}
        </>
      )}

      {isNameEntry && (
        <NameEntry
          initial={playerName ?? ""}
          onConfirm={confirmName}
          title={
            mode === "global"
              ? dict.nameEntry.globalTitle
              : mode === "team-creator"
                ? dict.nameEntry.teamCreatorTitle
                : dict.nameEntry.teamParticipantTitle
          }
          hint={
            mode === "global"
              ? dict.nameEntry.globalHint
              : dict.nameEntry.teamHint
          }
        />
      )}

      {isShow && <PrepSequenceDisplay step={prepStep} text={prepText} />}

      {isShow && targetVisible && (
        <span className="pointer-events-none absolute left-4 top-3.5 z-2 select-none text-sm font-medium text-white/70">
          {dict.game.time.memorizeLabel}
        </span>
      )}

      {isPick && (
        <div className="relative z-2 flex flex-1 min-h-0 flex-col items-center justify-center gap-4 px-5 text-center text-white sm:px-8">
          <div className="flex flex-col items-center gap-2">
            <p className="m-0 text-[clamp(2rem,11vw,3.2rem)] font-bold leading-none tracking-tight text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.45)]">
              {isHolding ? dict.game.time.releaseLabel : dict.game.time.holdAction}
            </p>
            <p className="max-w-80 text-sm font-medium leading-snug text-white/70 [text-shadow:0_1px_3px_rgba(0,0,0,0.4)] sm:text-base">
              {isHolding
                ? dict.game.time.releaseHint
                : dict.game.time.holdHint}
            </p>
          </div>
          <div className="h-2 w-44 overflow-hidden rounded-full bg-white/10 sm:w-56">
            <div
              className="h-full rounded-full bg-white/80 transition-[width] duration-75 ease-linear"
              style={{ width: `${holdProgress * 100}%` }}
            />
          </div>
        </div>
      )}

      {isReveal && revealTarget && revealGuess && (
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-2 px-5 pb-14 sm:gap-3 sm:px-8 sm:pb-16">
          <p className="m-0 text-center text-4xl font-bold tabular-nums tracking-tight text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.35)] sm:text-5xl">
            <AnimatedScore
              key={state.scores.length}
              value={roundPoints}
              decimals={3}
              prefix="+"
              maxValue={10}
            />
          </p>
          <div className="flex flex-col items-center gap-0.5 text-sm text-white/90 [text-shadow:0_1px_3px_rgba(0,0,0,0.4)]">
            <span className="tabular-nums">
              <span className="text-white/60">{dict.game.time.targetLabel}</span>{" "}
              <span className="font-semibold">
                {formatDuration(revealTarget.durationMs)}
              </span>
            </span>
            <span className="tabular-nums">
              <span className="text-white/60">{dict.game.time.youLabel}</span>{" "}
              <span className="font-semibold">
                {formatDuration(revealGuess.durationMs)}
              </span>
            </span>
            <span className="mt-1 text-xs tabular-nums text-white/75">
              {revealGuess.durationMs >= revealTarget.durationMs ? "+" : "-"}
              {formatDuration(
                Math.abs(revealGuess.durationMs - revealTarget.durationMs),
              )}
            </span>
          </div>
        </div>
      )}

      {isFinal && mode === "solo" && (
        <FinalSolo
          totalScore={totalScore}
          targets={state.targets}
          guesses={state.guesses}
          scores={state.scores}
          onHome={onHome}
          onReplay={() => startGame("solo")}
        />
      )}

      {isFinal && mode === "global" && (
        <FinalGlobal
          totalScore={totalScore}
          ranking={globalRanking}
          state={submissionState}
          errorMessage={submissionError}
          yourClientId={localClientId}
          onHome={onHome}
          onReplay={() => startGame("global")}
          onRetry={retrySubmission}
        />
      )}

      {isFinal && (mode === "team-creator" || mode === "team-participant") && (
        <FinalTeam
          role={mode === "team-creator" ? "creator" : "participant"}
          totalScore={totalScore}
          shareId={
            mode === "team-creator" ? teamShareId : (teamLobby?.id ?? null)
          }
          targets={state.targets}
          guesses={state.guesses}
          scores={state.scores}
          lobby={teamLobby}
          yourClientId={localClientId}
          state={submissionState}
          errorMessage={submissionError}
          onHome={onHome}
          onRetry={retrySubmission}
        />
      )}

      {(isPick || isReveal) && (
        <span className="pointer-events-none absolute right-3 top-3 z-2 select-none text-sm font-semibold tabular-nums text-white/95 [text-shadow:0_1px_2px_rgba(0,0,0,0.35)] sm:right-4.5 sm:top-3.5 sm:text-base">
          {displayedRound}/5
        </span>
      )}

      {isReveal && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            CUBE_ACTION_BASE,
            "absolute bottom-3 right-3 z-2 size-12 sm:size-13",
          )}
          type="button"
          aria-label={dict.common.next}
          onClick={advance}
        >
          <ChevronRight
            aria-hidden="true"
            strokeWidth={2.5}
            style={{ width: 22, height: 22 }}
          />
        </Button>
      )}
    </div>
  );
}
