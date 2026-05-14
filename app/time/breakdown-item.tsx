"use client";

import { useDict } from "@/lib/i18n/use-t";

import { formatDuration, type TimeGuess, type TimeTarget } from "./game-state";

type Props = {
  index: number;
  target: TimeTarget;
  guess: TimeGuess;
  points: number;
};

export default function BreakdownItem({ index, target, guess, points }: Props) {
  const dict = useDict();
  const errorMs = guess.durationMs - target.durationMs;
  const absErrorMs = Math.abs(errorMs);

  return (
    <li className="grid grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-white/10 py-1.5 text-white/70 last:border-b-0 sm:gap-3 sm:py-2">
      <span className="w-5 text-right text-xs tabular-nums text-white/45 sm:text-sm">
        {index + 1}.
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="font-semibold tabular-nums text-white">
            {formatDuration(guess.durationMs)}
          </span>
          <span className="text-white/35">/</span>
          <span className="tabular-nums text-white/65">
            {formatDuration(target.durationMs)}
          </span>
        </div>
        <div className="text-[0.7rem] tabular-nums text-white/45 sm:text-xs">
          {errorMs >= 0 ? "+" : "-"}
          {formatDuration(absErrorMs)} {dict.game.time.offByLabel}
        </div>
      </div>
      <span className="text-right text-sm font-semibold tabular-nums text-white sm:text-base">
        {points.toFixed(2)}
      </span>
    </li>
  );
}
