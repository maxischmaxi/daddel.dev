"use client";

import { Check, ChevronRight, Globe, User, Users } from "lucide-react";

import { CountdownDisplay } from "@/app/color/countdown-display";
import { NameEntry } from "@/app/color/name-entry";
import { useHoverEarthquake } from "@/app/color/use-hover-earthquake";
import { useHoverTone, type ToneSpec } from "@/app/color/use-hover-tone";
import VSlider from "@/app/color/vslider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { FinalGlobal } from "./final-global";
import { FinalSolo } from "./final-solo";
import { FinalTeamCreator } from "./final-team-creator";
import { FinalTeamParticipant } from "./final-team-participant";
import { centsBetween, formatHz, sliderToFreq, SLIDER_MAX } from "./frequency";
import { type GameMode, type Sound } from "./game-state";
import { useSoundGame } from "./use-sound-game";
import { WaveformVisualizer } from "./waveform-visualizer";

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

  return (
    <div className="flex gap-2 px-6">
      <Button
        variant="ghost"
        size="icon"
        className={cn(CUBE_ACTION_BASE, "group relative size-16")}
        type="button"
        aria-label="Einzelspieler"
        onClick={onSolo}
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
        onClick={onTeam}
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
        className={cn(CUBE_ACTION_BASE, "group relative ml-auto size-16")}
        type="button"
        aria-label="Weltweit"
        data-globe-rumble
        onClick={onGlobal}
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

export type SoundGameProps = {
  mode?: GameMode;
  gameId?: string;
  initialTargets?: Sound[];
};

export default function SoundGame({
  mode: initialMode,
  gameId,
  initialTargets,
}: SoundGameProps = {}) {
  const {
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
    analyserRef,
  } = useSoundGame({ mode: initialMode, gameId, initialTargets });

  const isIdle = state.phase === "idle";
  const isNameEntry = state.phase === "name-entry";
  const isShow = state.phase === "show";
  const isPick = state.phase === "pick";
  const isReveal = state.phase === "reveal";
  const isFinal = state.phase === "final";

  const roundPoints = state.scores[state.scores.length - 1] ?? 0;
  const revealTarget = isReveal ? state.targets[state.round] : null;
  const revealGuess = isReveal ? state.guesses[state.round] : null;
  const revealCents =
    revealTarget && revealGuess
      ? centsBetween(revealTarget.freq, revealGuess.freq)
      : 0;

  const isParticipant = initialMode === "team-participant";
  const onHome = () => {
    if (
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/sound/t/")
    ) {
      window.location.href = "/";
      return;
    }
    resetToIdle();
  };

  const idleTitle = isParticipant ? "Du wurdest eingeladen" : "sound";
  const idleDescription = isParticipant ? (
    <>
      <br />
      Errate dieselben fünf Töne wie der Ersteller.
      <br />
      Am Ende siehst du deinen Platz in der Lobby.
    </>
  ) : (
    <>
      <br />
      Du hörst 5 Sekunden lang einen Ton.
      <br />
      Danach baust du seine Frequenz mit einem Regler nach.
      <br />
      <br />
      Ein Stimmgerät trifft die Frequenz auf das Cent genau.
      <br />
      Du wirst grandios daneben liegen — genau dafür gibt es Punkte.
    </>
  );

  const localClientId =
    typeof window === "undefined"
      ? null
      : window.localStorage.getItem("browser-games:client-id");

  const currentSliderHz = sliderToFreq(slider);

  return (
    <div
      className={cn(
        "shadow-xl relative overflow-hidden rounded-xl bg-black flex flex-col flex-nowrap aspect-[1/1.7] w-full max-w-120 motion-safe:has-[[data-globe-rumble]:hover]:animate-earthquake",
        !isShow && !isPick && "py-6",
      )}
    >
      {(isShow || isPick) && (
        <div className="pointer-events-none absolute top-0 bottom-0 left-0 right-0 z-1 flex">
          <div className="pointer-events-auto flex w-12 items-stretch">
            {isPick && (
              <VSlider
                id="sound-freq"
                ariaLabel="Frequenz"
                min={0}
                max={SLIDER_MAX}
                value={slider}
                onChange={setSlider}
                trackBg="transparent"
                className="border-r-2 border-gray-400 w-full"
                handleClassName="size-6 shadow-[0_0_10px_rgba(255,255,255,0.6)]"
              />
            )}
          </div>
          <div className="ml-2 mr-3 flex-1 overflow-hidden">
            <WaveformVisualizer analyserRef={analyserRef} />
          </div>
        </div>
      )}

      {isIdle && (
        <>
          <div className="flex-1 min-h-0 flex flex-col items-start justify-center gap-4 px-6">
            <h1 className="m-0 text-center text-[4rem] w-full leading-14 font-bold tracking-tight text-white">
              {idleTitle}
            </h1>
            <p className="tracking-tight text-white text-center w-full">
              {idleDescription}
            </p>
          </div>
          {isParticipant ? (
            <div className="flex justify-center px-6">
              <Button
                variant="ghost"
                size="icon"
                className={cn(CUBE_ACTION_BASE, "size-16")}
                type="button"
                aria-label="Spielen"
                onClick={() => startGame("team-participant")}
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

      {isReveal && revealTarget && revealGuess && (
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-2 px-6 pb-16">
          <p className="m-0 text-center text-5xl font-bold tabular-nums tracking-tight text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.35)]">
            +<span>{roundPoints.toFixed(3)}</span>
          </p>
          <div className="flex flex-col items-center gap-0.5 text-sm text-white/90 [text-shadow:0_1px_3px_rgba(0,0,0,0.4)]">
            <span className="tabular-nums">
              <span className="text-white/60">Ziel</span>{" "}
              <span className="font-semibold">
                {formatHz(revealTarget.freq)}
              </span>
            </span>
            <span className="tabular-nums">
              <span className="text-white/60">Du</span>{" "}
              <span className="font-semibold">
                {formatHz(revealGuess.freq)}
              </span>
            </span>
            <span className="mt-1 text-xs tabular-nums text-white/75">
              {revealCents >= 0 ? "+" : ""}
              {Math.round(revealCents)} Cent
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

      {isFinal && mode === "team-creator" && (
        <FinalTeamCreator
          totalScore={totalScore}
          shareId={teamShareId}
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

      {isFinal && mode === "team-participant" && (
        <FinalTeamParticipant
          totalScore={totalScore}
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
          className="pointer-events-none absolute right-4 top-3 z-2 select-none text-[3.75rem] font-bold tracking-tight text-white/95"
        >
          <CountdownDisplay endTimeMs={endTimeMs} />
        </span>
      )}
      {isShow && prepStep !== null && (
        <span
          key={`prep-${prepStep}`}
          className="pointer-events-none absolute inset-0 z-2 flex select-none items-center justify-center text-[4rem] font-bold tracking-tight text-white animate-prep-slide-up"
        >
          {prepText}
        </span>
      )}

      {(isPick || isReveal) && (
        <span className="pointer-events-none absolute right-4.5 top-3.5 z-2 select-none text-base font-semibold tabular-nums text-white/95 [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]">
          {displayedRound}/5
        </span>
      )}

      {isPick && (
        <span className="pointer-events-none absolute left-1/2 top-3.5 z-2 -translate-x-1/2 select-none rounded-full bg-white/8 px-2 py-0.5 text-xs font-semibold tabular-nums text-white/85 [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]">
          {formatHz(currentSliderHz)}
        </span>
      )}

      {isShow && targetVisible && (
        <span className="pointer-events-none absolute left-4 top-3.5 z-2 select-none text-sm font-medium text-white/70">
          Hör genau hin
        </span>
      )}

      {isPick && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            CUBE_ACTION_BASE,
            "absolute bottom-3 right-3 z-2 size-13",
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
              "absolute bottom-3 right-3 z-2 size-13",
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
        </>
      )}
    </div>
  );
}
