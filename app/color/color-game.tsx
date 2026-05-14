"use client";

import { Check, ChevronRight, Globe, User, Users } from "lucide-react";
import { type CSSProperties, useEffect, useState } from "react";

import { AnimatedScore } from "@/components/animated-score";
import { PrepSequenceDisplay } from "@/components/prep-sequence-display";
import { Button } from "@/components/ui/button";
import { readStoredClientId } from "@/lib/player";
import { cn } from "@/lib/utils";

import { CountdownDisplay } from "./countdown-display";
import { FinalGlobal } from "./final-global";
import { FinalSolo } from "./final-solo";
import { FinalTeam } from "./final-team";
import { type Color, type GameMode, hslCss } from "./game-state";
import { NameEntry } from "./name-entry";
import { AURORA_GRADIENT, CUBE_ACTION_BASE } from "./shared-styles";
import { useColorGame } from "./use-color-game";
import { useBingClick } from "./use-click-tone";
import { useHoverEarthquake } from "./use-hover-earthquake";
import { useHoverTone, type ToneSpec } from "./use-hover-tone";
import VSlider from "./vslider";

const SINGLEPLAYER_TONE: readonly ToneSpec[] = [
  { startFreq: 220, endFreq: 880, rampSeconds: 4 },
];

const MULTIPLAYER_TONE: readonly ToneSpec[] = [
  { startFreq: 261.63, endFreq: 1046.5, rampSeconds: 4 },
  { startFreq: 329.63, endFreq: 1318.51, rampSeconds: 4 },
  { startFreq: 392.0, endFreq: 1567.98, rampSeconds: 4 },
];

const HUE_TRACK_BG =
  "linear-gradient(to top, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))";

function IdleActions({
  onSolo,
  onTeam,
  onGlobal,
}: {
  onSolo: () => void;
  onTeam: () => void;
  onGlobal: () => void;
}) {
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
        aria-label="Einzelspieler"
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
        aria-label="Mehrspieler"
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
        aria-label="Weltweit"
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

export type ColorGameProps = {
  mode?: GameMode;
  gameId?: string;
  initialTargets?: Color[];
};

export default function ColorGame({
  mode: initialMode,
  gameId,
  initialTargets,
}: ColorGameProps = {}) {
  const {
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
  } = useColorGame({ mode: initialMode, gameId, initialTargets });

  const isIdle = state.phase === "idle";
  const isNameEntry = state.phase === "name-entry";
  const isShow = state.phase === "show";
  const isPick = state.phase === "pick";
  const isReveal = state.phase === "reveal";
  const isFinal = state.phase === "final";
  const isDarkSwatch = isIdle || isNameEntry || (isShow && !targetVisible);

  const cubeStyle: CSSProperties = {};
  if (isShow && targetVisible) {
    const target = state.targets[state.round];
    cubeStyle.background = hslCss(target.h, target.s, target.l);
  } else if (isPick) {
    cubeStyle.background = hslCss(hsl.h, hsl.s, hsl.l);
  } else if (isReveal) {
    const target = state.targets[state.round];
    const guess = state.guesses[state.round];
    cubeStyle.background = `linear-gradient(135deg, ${hslCss(guess.h, guess.s, guess.l)} 50%, ${hslCss(target.h, target.s, target.l)} 50%)`;
  }

  const roundPoints = state.scores[state.scores.length - 1] ?? 0;

  const satTrackBg = `linear-gradient(to top, hsl(${hsl.h}, 0%, ${hsl.l}%), hsl(${hsl.h}, 100%, ${hsl.l}%))`;
  const lightTrackBg = `linear-gradient(to top, hsl(${hsl.h}, ${hsl.s}%, 0%), hsl(${hsl.h}, ${hsl.s}%, 50%), hsl(${hsl.h}, ${hsl.s}%, 100%))`;

  const isParticipant = initialMode === "team-participant";
  const onHome = () => {
    if (
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/color/t/")
    ) {
      window.location.href = "/";
      return;
    }
    resetToIdle();
  };

  const handleParticipantStart = useBingClick<HTMLButtonElement>(() =>
    startGame("team-participant"),
  );

  const idleTitle = isParticipant ? "Du wurdest eingeladen" : "color";
  const idleDescription = isParticipant ? (
    <>
      <br />
      Errate dieselben fünf Farben wie der Ersteller.
      <br />
      Am Ende siehst du deinen Platz in der Lobby.
    </>
  ) : (
    <>
      <br />
      Du siehst 5 Sekunden lang eine Farbe.
      <br />
      Danach baust du sie mit drei Reglern nach.
      <br />
      <br />
      Eine GPU rekonstruiert das fehlerfrei in Mikrosekunden.
      <br />
      Du wirst grandios daneben liegen — genau dafür gibt es Punkte.
    </>
  );

  const [localClientId, setLocalClientId] = useState<string | null>(null);
  useEffect(() => {
    setLocalClientId(readStoredClientId());
  }, []);

  return (
    <div
      className={cn(
        "game-shell-color shadow-xl relative overflow-hidden rounded-xl bg-muted flex flex-col flex-nowrap aspect-[1/1.05] sm:aspect-[1/0.8] transition-colors duration-280ms ease-out py-4 sm:py-6 motion-safe:has-[[data-globe-rumble]:hover]:animate-earthquake",
        isDarkSwatch && "bg-cube-dark",
        isPick && "transition-none",
        isFinal && "bg-cube-dark",
      )}
      style={cubeStyle}
    >
      {isPick && (
        <div className="absolute inset-y-0 left-0 z-2 flex overflow-hidden rounded-l-xl">
          <VSlider
            id="slider-h"
            ariaLabel="Hue"
            min={0}
            max={360}
            value={hsl.h}
            onChange={(h) => setHsl({ ...hsl, h })}
            trackBg={HUE_TRACK_BG}
            className="w-10 sm:w-8"
            handleClassName="size-4 sm:size-3.5"
          />
          <VSlider
            id="slider-s"
            ariaLabel="Saturation"
            min={0}
            max={100}
            value={hsl.s}
            onChange={(s) => setHsl({ ...hsl, s })}
            trackBg={satTrackBg}
            className="w-10 sm:w-8"
            handleClassName="size-4 sm:size-3.5"
          />
          <VSlider
            id="slider-l"
            ariaLabel="Lightness"
            min={0}
            max={100}
            value={hsl.l}
            onChange={(l) => setHsl({ ...hsl, l })}
            trackBg={lightTrackBg}
            className="w-10 sm:w-8"
            handleClassName="size-4 sm:size-3.5"
          />
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
                aria-label="Spielen"
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
              ? "Wie heißt du?"
              : mode === "team-creator"
                ? "Du erstellst eine Lobby"
                : "Du trittst der Lobby bei"
          }
          hint={
            mode === "global"
              ? "Der Name erscheint in der globalen Rangliste."
              : "Der Name erscheint in der Lobby."
          }
        />
      )}

      {isReveal && (
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
          <p className="m-0 max-w-104 text-balance text-center text-sm font-medium leading-snug text-white/95 [text-shadow:0_1px_3px_rgba(0,0,0,0.4)] sm:text-[0.9375rem]">
            {currentQuip}
          </p>
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
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            CUBE_ACTION_BASE,
            "absolute bottom-3 right-3 z-2 size-12 sm:size-13",
          )}
          type="button"
          aria-label="Bestätigen"
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
        <>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              CUBE_ACTION_BASE,
              "absolute bottom-3 right-3 z-2 size-12 sm:size-13",
            )}
            type="button"
            aria-label="Weiter"
            onClick={advance}
          >
            <ChevronRight
              aria-hidden="true"
              strokeWidth={2.5}
              style={{ width: 22, height: 22 }}
            />
          </Button>
          <span className="pointer-events-none absolute left-3 top-3 z-2 inline-flex items-center rounded-full border border-border bg-white/92 px-2.5 py-0.5 text-xs font-semibold leading-4 text-cube-dark backdrop-blur-xs">
            Du
          </span>
        </>
      )}
    </div>
  );
}
