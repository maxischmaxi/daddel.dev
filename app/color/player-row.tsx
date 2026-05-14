"use client";

import { interpolate } from "@/lib/i18n/interpolate";
import { useDict } from "@/lib/i18n/use-t";
import { cn } from "@/lib/utils";

import { type Color, hslCss } from "./game-state";

type Props = {
  rank: number;
  name: string;
  totalScore: number;
  scores?: number[];
  guesses?: Color[];
  targets?: Color[];
  highlight?: boolean;
};

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
            const guess = guesses![i];
            const pts = scores![i];
            if (guess === undefined || pts === undefined) return null;
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
                <span
                  aria-hidden="true"
                  className="size-5 rounded-full sm:size-7"
                  style={{
                    background: `linear-gradient(135deg, ${hslCss(guess.h, guess.s, guess.l)} 50%, ${hslCss(target.h, target.s, target.l)} 50%)`,
                  }}
                />
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
