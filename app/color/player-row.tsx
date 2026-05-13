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
  const hasBreakdown =
    !!targets && !!guesses && !!scores && targets.length > 0;

  return (
    <li
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5 text-white/70",
        highlight && "bg-white/10 text-white",
      )}
    >
      <span className="w-5 shrink-0 text-right text-sm tabular-nums text-white/50">
        {rank}.
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-sm",
          highlight && "font-semibold",
        )}
      >
        {name}
      </span>
      {hasBreakdown && (
        <div className="flex shrink-0 items-end gap-1">
          {targets!.map((target, i) => {
            const guess = guesses![i];
            const pts = scores![i];
            if (guess === undefined || pts === undefined) return null;
            return (
              <div
                key={i}
                className="flex flex-col items-center gap-0.5"
                aria-label={`Runde ${i + 1}: ${pts.toFixed(3)} Punkte`}
              >
                <span className="text-[0.55rem] font-semibold leading-none tabular-nums">
                  {pts.toFixed(2)}
                </span>
                <span
                  aria-hidden="true"
                  className="size-7 rounded-full"
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
          "w-12 shrink-0 text-right text-sm tabular-nums",
          highlight && "font-semibold",
        )}
      >
        {totalScore.toFixed(3)}
      </span>
    </li>
  );
}
