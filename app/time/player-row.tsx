"use client";

import { interpolate } from "@/lib/i18n/interpolate";
import { useDict } from "@/lib/i18n/use-t";
import { cn } from "@/lib/utils";

import { MAX_DURATION_MS, type TimeTarget } from "./game-state";

type Props = {
  rank: number;
  name: string;
  totalScore: number;
  scores?: number[];
  guesses?: number[];
  targets?: TimeTarget[];
  highlight?: boolean;
};

const TRACK_BG =
  "linear-gradient(to top, hsl(220,90%,30%), hsl(190,90%,45%), hsl(50,90%,60%), hsl(0,85%,55%))";

export function PlayerBreakdownRow({
  rank,
  name,
  totalScore,
  scores,
  guesses,
  targets,
  highlight,
}: Props) {
  const dict = useDict();
  const hasBreakdown =
    !!targets && !!guesses && !!scores && targets.length > 0;

  return (
    <li
      className={cn(
        "flex items-center gap-1.5 rounded-md px-1.5 py-1 text-white/70 sm:gap-2 sm:px-2 sm:py-1.5",
        highlight && "bg-white/10 text-white",
      )}
    >
      <span className="w-4 shrink-0 text-right text-xs tabular-nums text-white/50 sm:w-5 sm:text-sm">
        {rank}.
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-xs sm:text-sm",
          highlight && "font-semibold",
        )}
      >
        {name}
      </span>
      {hasBreakdown && (
        <div className="flex shrink-0 items-end gap-0.5 sm:gap-1">
          {targets!.map((target, i) => {
            const guessMs = guesses![i];
            const pts = scores![i];
            if (guessMs === undefined || pts === undefined) return null;
            const targetRatio = Math.min(
              1,
              Math.max(0, target.durationMs / MAX_DURATION_MS),
            );
            const guessRatio = Math.min(
              1,
              Math.max(0, guessMs / MAX_DURATION_MS),
            );
            return (
              <div
                key={i}
                className="flex flex-col items-center gap-0.5"
                aria-label={interpolate(dict.playerRow.roundAriaTemplate, {
                  round: i + 1,
                  points: pts.toFixed(3),
                })}
              >
                <span className="text-[0.5rem] font-semibold leading-none tabular-nums sm:text-[0.55rem]">
                  {pts.toFixed(2)}
                </span>
                <div
                  aria-hidden="true"
                  className="relative h-6 w-1.5 overflow-hidden rounded-full sm:h-7"
                  style={{ background: TRACK_BG }}
                >
                  <span
                    className="absolute left-1/2 size-1.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-white"
                    style={{ bottom: `${targetRatio * 100}%` }}
                  />
                  <span
                    className="absolute left-1/2 size-1.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-amber-300"
                    style={{ bottom: `${guessRatio * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
      <span
        className={cn(
          "w-10 shrink-0 text-right text-xs tabular-nums sm:w-12 sm:text-sm",
          highlight && "font-semibold",
        )}
      >
        {totalScore.toFixed(3)}
      </span>
    </li>
  );
}
