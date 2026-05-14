"use client";

import { Home, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDict } from "@/lib/i18n/use-t";
import { cn } from "@/lib/utils";

import { useBingClick } from "@/app/color/use-click-tone";
import { useHoverTone, type ToneSpec } from "@/app/color/use-hover-tone";

import BreakdownItem from "./breakdown-item";
import { type Sound } from "./game-state";

const CUBE_ACTION_BASE =
  "touch-manipulation rounded-full bg-white text-cube-dark border border-[hsl(220_13%_78%)] shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:bg-[hsl(210_40%_96.1%)] hover:text-cube-dark active:scale-96 focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--background),0_0_0_4px_var(--ring)] transition-all duration-150";

const AURORA_GRADIENT =
  "conic-gradient(from var(--aurora-angle), hsl(0,100%,60%), hsl(60,100%,60%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,65%), hsl(300,100%,60%), hsl(360,100%,60%))";

const HOME_TONE: readonly ToneSpec[] = [
  { startFreq: 1500, endFreq: 180, rampSeconds: 1.2, type: "triangle" },
];

const REPLAY_TONE: readonly ToneSpec[] = [
  { startFreq: 196.0, endFreq: 1567.98, rampSeconds: 0.7, type: "sawtooth" },
  { startFreq: 246.94, endFreq: 1975.53, rampSeconds: 0.7, type: "sawtooth" },
  { startFreq: 293.66, endFreq: 2349.32, rampSeconds: 0.7, type: "sawtooth" },
];

function getFinalLabel(
  score: number,
  tiers: readonly [string, string, string, string, string, string],
): string {
  if (score >= 42) return tiers[0];
  if (score >= 34) return tiers[1];
  if (score >= 25) return tiers[2];
  if (score >= 17) return tiers[3];
  if (score >= 8) return tiers[4];
  return tiers[5];
}

type Props = {
  totalScore: number;
  targets: Sound[];
  guesses: Sound[];
  scores: number[];
  onHome: () => void;
  onReplay: () => void;
};

export function FinalSolo({
  totalScore,
  targets,
  guesses,
  scores,
  onHome,
  onReplay,
}: Props) {
  const dict = useDict();
  const homeHoverTone = useHoverTone(HOME_TONE);
  const replayHoverTone = useHoverTone(REPLAY_TONE);
  const handleHomeClick = useBingClick<HTMLButtonElement>(onHome);
  const handleReplayClick = useBingClick<HTMLButtonElement>(onReplay);

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-2 px-4 sm:gap-3 sm:px-5">
      <div className="flex flex-col items-center gap-0.5">
        <h2 className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
          {dict.final.solo.label}
        </h2>
        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl font-bold leading-none tracking-tight tabular-nums text-white sm:text-[3.25rem]">
            {totalScore.toFixed(3)}
          </span>
          <span className="text-base font-medium tabular-nums text-white/60">
            / 50
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-white">
            {Math.round((totalScore / 50) * 100)}%
          </span>
          <span className="font-medium text-white/70">
            {getFinalLabel(totalScore, dict.final.solo.tiersSound)}
          </span>
        </div>
      </div>

      <ol className="m-0 flex min-h-0 w-full flex-1 list-none flex-col overflow-auto border-t border-white/10 p-0 pt-1">
        {targets.map((target, i) =>
          guesses[i] !== undefined && scores[i] !== undefined ? (
            <BreakdownItem
              key={i}
              index={i}
              target={target}
              guess={guesses[i]}
              points={scores[i]}
            />
          ) : null,
        )}
      </ol>

      <div className="mt-auto flex items-center justify-center gap-5 pt-1 sm:gap-6">
        <Button
          variant="ghost"
          size="icon"
          className={cn(CUBE_ACTION_BASE, "group relative size-14 sm:size-16")}
          type="button"
          aria-label={dict.common.home}
          onClick={handleHomeClick}
          {...homeHoverTone}
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
            className="pointer-events-none absolute inset-0 rounded-full border-2 border-sky-300 opacity-0 motion-safe:group-hover:animate-pulse-ring"
          />
          <Home
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
          aria-label={dict.common.replay}
          onClick={handleReplayClick}
          {...replayHoverTone}
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
            className="pointer-events-none absolute inset-0 rounded-full border-2 border-emerald-300 opacity-0 motion-safe:group-hover:animate-pulse-ring"
          />
          <span
            aria-hidden="true"
            style={{ animationDelay: "0.5s" }}
            className="pointer-events-none absolute inset-0 rounded-full border-2 border-amber-300 opacity-0 motion-safe:group-hover:animate-pulse-ring"
          />
          <RotateCcw
            aria-hidden="true"
            strokeWidth={2.25}
            style={{ width: 26, height: 26 }}
            className="relative z-10 transition-transform duration-300 group-hover:scale-110"
          />
        </Button>
      </div>
    </div>
  );
}
