"use client";

import { interpolate } from "@/lib/i18n/interpolate";
import { useDict } from "@/lib/i18n/use-t";
import { cn } from "@/lib/utils";

import { angularDiff } from "./game-state";

type Props = {
  rank: number;
  name: string;
  totalScore: number;
  scores?: number[];
  guesses?: number[];
  targets?: number[];
  highlight?: boolean;
};

function polarPoint(deg: number, radius: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return {
    x: 12 + radius * Math.cos(rad),
    y: 12 + radius * Math.sin(rad),
  };
}

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
          {targets!.map((targetDeg, i) => {
            const guessDeg = guesses![i];
            const pts = scores![i];
            if (guessDeg === undefined || pts === undefined) return null;
            const tPos = polarPoint(targetDeg, 8);
            const gPos = polarPoint(guessDeg, 8);
            const diff = angularDiff(targetDeg, guessDeg);
            return (
              <div
                key={i}
                className="flex flex-col items-center gap-0.5"
                aria-label={interpolate(dict.playerRow.roundAriaTemplate, {
                  round: i + 1,
                  points: pts.toFixed(3),
                })}
                title={`${Math.round(diff)}°`}
              >
                <span className="text-[0.5rem] font-semibold leading-none tabular-nums sm:text-[0.55rem]">
                  {pts.toFixed(2)}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-6 w-6 sm:h-7 sm:w-7"
                >
                  <circle
                    cx={12}
                    cy={12}
                    r={10}
                    fill="rgba(255,255,255,0.06)"
                    stroke="rgba(255,255,255,0.18)"
                    strokeWidth={1}
                  />
                  <line
                    x1={12}
                    y1={12}
                    x2={tPos.x}
                    y2={tPos.y}
                    stroke="white"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                  />
                  <line
                    x1={12}
                    y1={12}
                    x2={gPos.x}
                    y2={gPos.y}
                    stroke="rgb(125,211,252)"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                  />
                </svg>
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
