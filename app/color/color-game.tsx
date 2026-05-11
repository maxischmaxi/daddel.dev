"use client";

import { Check, ChevronRight, Globe, User, Users } from "lucide-react";
import { type CSSProperties } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import BreakdownItem from "./breakdown-item";
import { hslCss } from "./game-state";
import { useColorGame } from "./use-color-game";
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

const CUBE_ACTION_BASE =
  "rounded-full bg-white text-cube-dark border border-[hsl(220_13%_78%)] shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:bg-[hsl(210_40%_96.1%)] hover:text-cube-dark active:scale-[0.96] focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--background),0_0_0_4px_var(--ring)] transition-all duration-150";

const AURORA_GRADIENT =
  "conic-gradient(from var(--aurora-angle), hsl(0,100%,60%), hsl(60,100%,60%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,65%), hsl(300,100%,60%), hsl(360,100%,60%))";

const HUE_TRACK_BG =
  "linear-gradient(to top, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))";

function IdleActions({ startGame }: { startGame: () => void }) {
  const singleplayerHoverTone = useHoverTone(SINGLEPLAYER_TONE);
  const multiplayerHoverTone = useHoverTone(MULTIPLAYER_TONE);
  const globeHoverEarthquake = useHoverEarthquake();

  return (
    <div className="flex gap-2 px-6">
      <Button
        variant="ghost"
        size="icon"
        className={cn(CUBE_ACTION_BASE, "group relative size-16")}
        type="button"
        aria-label="Einzelspieler"
        onClick={startGame}
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
        className={cn(CUBE_ACTION_BASE, "group relative size-16")}
        type="button"
        aria-label="Mehrspieler"
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
        className={cn(CUBE_ACTION_BASE, "group relative ml-auto size-16")}
        type="button"
        aria-label="Weltweit"
        data-globe-rumble
        {...globeHoverEarthquake}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-3 rounded-full opacity-0 blur-[16px] transition-opacity duration-200 group-hover:opacity-60 motion-safe:group-hover:animate-aurora-spin"
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

export default function ColorGame() {
  const {
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
  } = useColorGame();

  const isIdle = state.phase === "idle";
  const isShow = state.phase === "show";
  const isPick = state.phase === "pick";
  const isReveal = state.phase === "reveal";
  const isFinal = state.phase === "final";
  const isDarkSwatch = isIdle || (isShow && !targetVisible);

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

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-muted flex flex-col flex-nowrap aspect-[1/0.8] w-full max-w-125 transition-colors duration-[280ms] ease-out py-6 motion-safe:has-[[data-globe-rumble]:hover]:animate-earthquake",
        isDarkSwatch && "bg-cube-dark",
        isPick && "transition-none",
        isFinal &&
          "bg-card shadow-[0_10px_25px_-5px_rgba(0,0,0,0.08),0_4px_6px_-2px_rgba(0,0,0,0.04)]",
      )}
      style={cubeStyle}
    >
      {isPick && (
        <div className="absolute inset-y-0 left-0 z-[2] flex overflow-hidden rounded-l-xl">
          <VSlider
            id="slider-h"
            ariaLabel="Hue"
            min={0}
            max={360}
            value={hsl.h}
            onChange={(h) => setHsl({ ...hsl, h })}
            trackBg={HUE_TRACK_BG}
          />
          <VSlider
            id="slider-s"
            ariaLabel="Saturation"
            min={0}
            max={100}
            value={hsl.s}
            onChange={(s) => setHsl({ ...hsl, s })}
            trackBg={satTrackBg}
          />
          <VSlider
            id="slider-l"
            ariaLabel="Lightness"
            min={0}
            max={100}
            value={hsl.l}
            onChange={(l) => setHsl({ ...hsl, l })}
            trackBg={lightTrackBg}
          />
        </div>
      )}

      {isIdle && (
        <>
          <div className="flex-1 min-h-0 flex flex-col items-start justify-center gap-4 px-6">
            <h1 className="m-0 text-center text-[4rem] font-bold tracking-tight text-white">
              color
            </h1>
            <p className="tracking-tight text-white">
              <br />
              Du siehst 5 Sekunden lang eine Farbe.
              <br />
              Danach baust du sie mit drei Reglern nach.
              <br />
              <br />
              Eine GPU rekonstruiert das fehlerfrei in Mikrosekunden.
              <br />
              Du wirst grandios daneben liegen — genau dafür gibt es Punkte.
            </p>
          </div>
          <IdleActions startGame={startGame} />
        </>
      )}

      {isReveal && (
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3 px-8 pb-16">
          <p className="m-0 text-center text-5xl font-bold tabular-nums tracking-tight text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.35)]">
            +<span>{roundPoints.toFixed(2)}</span>
          </p>
          <p className="m-0 max-w-[26rem] text-balance text-center text-[0.9375rem] font-medium leading-snug text-white/95 [text-shadow:0_1px_3px_rgba(0,0,0,0.4)]">
            {currentQuip}
          </p>
        </div>
      )}

      {isFinal && (
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-2 p-5">
          <h2 className="m-0 text-center text-base font-medium text-muted-foreground">
            Geschafft!
          </h2>
          <p className="m-0 text-center text-sm tabular-nums text-muted-foreground">
            <span className="mr-1.5 text-[2.25rem] font-bold tracking-tight text-foreground">
              {totalScore.toFixed(2)}
            </span>{" "}
            / 50.00
          </p>
          <ol className="m-0 flex w-full list-none flex-col border-t border-border p-0 text-[0.8125rem]">
            {state.targets.map((target, i) =>
              state.guesses[i] !== undefined &&
              state.scores[i] !== undefined ? (
                <BreakdownItem
                  key={i}
                  index={i}
                  target={target}
                  guess={state.guesses[i]}
                  points={state.scores[i]}
                />
              ) : null,
            )}
          </ol>
          <Button
            variant="outline"
            className="px-6"
            type="button"
            onClick={startGame}
          >
            Nochmal
          </Button>
        </div>
      )}

      {/* Countdown: small numeric (top-right) vs big animated prep (centered) */}
      {isShow && prepStep === null && (
        <span
          key="numeric"
          className="pointer-events-none absolute right-[1.125rem] top-[0.875rem] z-[2] select-none text-3xl font-bold tabular-nums tracking-tight text-white/95 [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]"
        >
          {countdownText}
        </span>
      )}
      {isShow && prepStep !== null && (
        <span
          key={`prep-${prepStep}`}
          className="pointer-events-none absolute inset-0 z-[2] flex select-none items-center justify-center text-[4rem] font-bold tracking-tight text-white animate-prep-slide-up"
        >
          {countdownText}
        </span>
      )}

      {/* Round indicator (top-right) — visible during pick + reveal */}
      {(isPick || isReveal) && (
        <span className="pointer-events-none absolute right-[1.125rem] top-[0.875rem] z-[2] select-none text-base font-semibold tabular-nums text-white/95 [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]">
          {displayedRound}/5
        </span>
      )}

      {isPick && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            CUBE_ACTION_BASE,
            "absolute bottom-3 right-3 z-[2] size-13",
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
              "absolute bottom-3 right-3 z-[2] size-13",
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
          <span className="pointer-events-none absolute left-3 top-3 z-[2] inline-flex items-center rounded-full border border-border bg-white/[0.92] px-2.5 py-0.5 text-xs font-semibold leading-4 text-cube-dark backdrop-blur-[4px]">
            Du
          </span>
        </>
      )}
    </div>
  );
}
