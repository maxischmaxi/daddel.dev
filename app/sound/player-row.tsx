import { cn } from "@/lib/utils";

import { freqToSlider, SLIDER_MAX } from "./frequency";

type Props = {
  rank: number;
  name: string;
  totalScore: number;
  scores?: number[];
  guesses?: number[];
  targets?: number[];
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
          {targets!.map((targetHz, i) => {
            const guessHz = guesses![i];
            const pts = scores![i];
            if (guessHz === undefined || pts === undefined) return null;
            const targetRatio = freqToSlider(targetHz) / SLIDER_MAX;
            const guessRatio = freqToSlider(guessHz) / SLIDER_MAX;
            return (
              <div
                key={i}
                className="flex flex-col items-center gap-0.5"
                aria-label={`Runde ${i + 1}: ${pts.toFixed(3)} Punkte`}
              >
                <span className="text-[0.55rem] font-semibold leading-none tabular-nums">
                  {pts.toFixed(2)}
                </span>
                <div
                  aria-hidden="true"
                  className="relative h-7 w-1.5 overflow-hidden rounded-full"
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
          "w-12 shrink-0 text-right text-sm tabular-nums",
          highlight && "font-semibold",
        )}
      >
        {totalScore.toFixed(3)}
      </span>
    </li>
  );
}
