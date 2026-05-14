"use client";

import { Check, ChevronRight, Globe, User, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useBingClick } from "@/app/color/use-click-tone";
import { useHoverEarthquake } from "@/app/color/use-hover-earthquake";
import { useHoverTone, type ToneSpec } from "@/app/color/use-hover-tone";
import { CountdownDisplay } from "@/app/color/countdown-display";
import { AnimatedScore } from "@/components/animated-score";
import { PrepSequenceDisplay } from "@/components/prep-sequence-display";
import { Button } from "@/components/ui/button";
import { useDict, useLocale } from "@/lib/i18n/use-t";
import { readStoredClientId } from "@/lib/player";
import { cn } from "@/lib/utils";

import { AngleDial } from "./angle-dial";
import { FinalGlobal } from "./final-global";
import { FinalSolo } from "./final-solo";
import { FinalTeam } from "./final-team";
import { angularDiff, type Angle, type GameMode } from "./game-state";
import { NameEntry } from "./name-entry";
import { getRandomQuip } from "./quips";
import { AURORA_GRADIENT, CUBE_ACTION_BASE } from "./shared-styles";
import { useAngleGame } from "./use-angle-game";

const SINGLEPLAYER_TONE: readonly ToneSpec[] = [
  { startFreq: 220, endFreq: 880, rampSeconds: 4 },
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
        className={cn(
          CUBE_ACTION_BASE,
          "group relative ml-auto size-14 sm:size-16",
        )}
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

export type AngleGameProps = {
  mode?: GameMode;
  gameId?: string;
  initialTargets?: Angle[];
};

export default function AngleGame({
  mode: initialMode,
  gameId,
  initialTargets,
}: AngleGameProps = {}) {
  const dict = useDict();
  const { locale } = useLocale();
  const {
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
  } = useAngleGame({ mode: initialMode, gameId, initialTargets });

  const isIdle = state.phase === "idle";
  const isNameEntry = state.phase === "name-entry";
  const isShow = state.phase === "show";
  const isPick = state.phase === "pick";
  const isReveal = state.phase === "reveal";
  const isFinal = state.phase === "final";

  const roundPoints = state.scores[state.scores.length - 1] ?? 0;
  const revealTarget = isReveal ? state.targets[state.round] : null;
  const revealGuess = isReveal ? state.guesses[state.round] : null;
  const revealDiff =
    revealTarget && revealGuess
      ? angularDiff(revealTarget.deg, revealGuess.deg)
      : 0;

  const currentQuip = useMemo(() => {
    if (!isReveal) return "";
    return getRandomQuip(roundPoints, dict, locale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReveal, state.scores.length]);

  const isParticipant = initialMode === "team-participant";
  const onHome = () => {
    if (
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/angle/t/")
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
    ? dict.game.angle.idleInvitedTitle
    : dict.game.angle.idleTitle;
  const idleDescription = isParticipant ? (
    <>
      <br />
      {dict.game.angle.teamIntro1}
      <br />
      {dict.game.angle.teamIntro2}
    </>
  ) : (
    <>
      <br />
      {dict.game.angle.soloIntro1}
      <br />
      {dict.game.angle.soloIntro2}
      <br />
      <br />
      {dict.game.angle.soloIntro3}
      <br />
      {dict.game.angle.soloIntro4}
    </>
  );

  const [localClientId, setLocalClientId] = useState<string | null>(null);
  useEffect(() => {
    setLocalClientId(readStoredClientId());
  }, []);

  const showTarget = (isShow && targetVisible) || isReveal;
  const showPlayer = isPick || isReveal;
  const dialTargetDeg = revealTarget?.deg ?? (isShow ? state.targets[state.round]?.deg ?? null : null);

  return (
    <div
      className={cn(
        "game-shell-angle shadow-xl relative overflow-hidden rounded-xl bg-black flex flex-col flex-nowrap aspect-[1/1.7] motion-safe:has-[[data-globe-rumble]:hover]:animate-earthquake",
        !isShow && !isPick && !isReveal && "py-4 sm:py-6",
      )}
    >
      {((isShow && prepStep === null) || isPick || isReveal) && (
        <div className="pointer-events-auto absolute inset-0 z-1 flex items-center justify-center px-6 pb-20 pt-14 sm:px-8 sm:pb-24 sm:pt-16">
          <div className="aspect-square w-full max-w-[min(100%,420px)]">
            <AngleDial
              ariaLabel={dict.game.angle.dialAria}
              targetDeg={dialTargetDeg ?? null}
              playerDeg={playerDeg}
              onChange={isPick ? setPlayerDeg : undefined}
              interactive={isPick}
              showTarget={showTarget}
              showPlayer={showPlayer}
              minimal={isShow}
            />
          </div>
        </div>
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

      {isReveal && revealTarget && revealGuess && (
        <div className="pointer-events-none absolute inset-x-0 bottom-16 z-2 flex flex-col items-center gap-1 px-5 sm:bottom-20 sm:px-6">
          <p className="m-0 text-center text-4xl font-bold tabular-nums tracking-tight text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.35)] sm:text-5xl">
            <AnimatedScore
              key={state.scores.length}
              value={roundPoints}
              decimals={3}
              prefix="+"
              maxValue={10}
            />
          </p>
          <p className="m-0 max-w-104 text-balance text-center text-sm font-medium leading-snug text-white/95 [text-shadow:0_1px_3px_rgba(0,0,0,0.4)] sm:text-[0.9375rem]">
            {currentQuip}
          </p>
          <span className="mt-1 text-xs tabular-nums text-white/75">
            {Math.round(revealDiff)}
            {dict.game.angle.degreesUnit} {dict.game.angle.offByLabel}
          </span>
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

      {isShow && prepStep === null && endTimeMs !== null && (
        <span
          key={`numeric-${endTimeMs}`}
          className="pointer-events-none absolute right-3 top-2 z-2 select-none text-[3rem] font-bold tracking-tight text-white/95 sm:right-4 sm:top-3 sm:text-[3.75rem]"
        >
          <CountdownDisplay endTimeMs={endTimeMs} />
        </span>
      )}
      {isShow && <PrepSequenceDisplay step={prepStep} text={prepText} />}

      {(isPick || isReveal) && (
        <span className="pointer-events-none absolute right-3 top-3 z-2 select-none text-sm font-semibold tabular-nums text-white/95 [text-shadow:0_1px_2px_rgba(0,0,0,0.35)] sm:right-4.5 sm:top-3.5 sm:text-base">
          {displayedRound}/5
        </span>
      )}

      {isPick && (
        <span className="pointer-events-none absolute left-1/2 top-3.5 z-2 -translate-x-1/2 select-none rounded-full bg-white/8 px-2 py-0.5 text-xs font-semibold tabular-nums text-white/85 [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]">
          {Math.round(playerDeg)}
          {dict.game.angle.degreesUnit}
        </span>
      )}

      {isShow && targetVisible && (
        <span className="pointer-events-none absolute left-4 top-3.5 z-2 select-none text-sm font-medium text-white/70">
          {dict.game.angle.memorizeLabel}
        </span>
      )}

      {isPick && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            CUBE_ACTION_BASE,
            "absolute bottom-3 right-3 z-2 size-12 sm:size-13",
          )}
          type="button"
          aria-label={dict.game.angle.submitLabel}
          onClick={submitGuess}
        >
          <Check
            aria-hidden="true"
            strokeWidth={2.5}
            style={{ width: 22, height: 22 }}
          />
        </Button>
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
