"use client";

import { Home, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { SoundGlobalRanking } from "@/lib/api-client";
import { cn } from "@/lib/utils";

import { useBingClick } from "@/app/color/use-click-tone";

import { PlayerBreakdownRow } from "./player-row";

const CUBE_ACTION_BASE =
  "touch-manipulation rounded-full bg-white text-cube-dark border border-[hsl(220_13%_78%)] shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:bg-[hsl(210_40%_96.1%)] hover:text-cube-dark active:scale-96 focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--background),0_0_0_4px_var(--ring)] transition-all duration-150";

type Props = {
  totalScore: number;
  ranking: SoundGlobalRanking | null;
  state: "idle" | "sending" | "done" | "error";
  errorMessage: string | null;
  yourClientId: string | null;
  onHome: () => void;
  onReplay: () => void;
  onRetry: () => void;
};

export function FinalGlobal({
  totalScore,
  ranking,
  state,
  errorMessage,
  yourClientId,
  onHome,
  onReplay,
  onRetry,
}: Props) {
  const handleHomeClick = useBingClick<HTMLButtonElement>(onHome);
  const handleReplayClick = useBingClick<HTMLButtonElement>(onReplay);
  const handleRetryClick = useBingClick<HTMLButtonElement>(onRetry);
  const youInTop = ranking?.you
    ? ranking.top.some((r) => r.clientId === yourClientId)
    : false;

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-2 px-4 sm:gap-3 sm:px-5">
      <div className="flex flex-col items-center gap-0.5">
        <h2 className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
          Global
        </h2>
        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl font-bold leading-none tracking-tight tabular-nums text-white sm:text-5xl">
            {totalScore.toFixed(3)}
          </span>
          <span className="text-base font-medium tabular-nums text-white/60">
            / 50
          </span>
        </div>
        {ranking?.you && (
          <p className="m-0 text-xs font-medium text-white/60">
            Platz {ranking.you.rank} von {ranking.total}
          </p>
        )}
      </div>

      {state === "sending" && (
        <p className="px-2 py-2 text-center text-xs text-white/60">
          Score wird übertragen …
        </p>
      )}

      {state === "error" && (
        <div className="flex flex-col items-center gap-2 px-2 py-3">
          <p className="text-center text-xs text-red-400">
            Übertragung fehlgeschlagen: {errorMessage ?? "Unbekannter Fehler"}
          </p>
          <button
            type="button"
            onClick={handleRetryClick}
            className="rounded-md border border-white/30 bg-transparent px-2 py-1 text-xs font-medium text-white hover:bg-white/10"
          >
            Erneut versuchen
          </button>
        </div>
      )}

      {state === "done" && ranking && (
        <ol className="m-0 flex flex-1 min-h-0 list-none flex-col gap-0.5 overflow-auto p-0">
          {ranking.top.map((entry) => (
            <PlayerBreakdownRow
              key={`${entry.clientId}-${entry.rank}`}
              rank={entry.rank}
              name={entry.name}
              totalScore={entry.totalScore}
              scores={entry.scores}
              guesses={entry.guesses}
              targets={entry.targets}
              highlight={entry.clientId === yourClientId}
            />
          ))}
          {!youInTop && ranking.you && (
            <>
              <li
                aria-hidden
                className="my-1 border-t border-dashed border-white/20"
              />
              {ranking.neighbors.above && (
                <PlayerBreakdownRow
                  rank={ranking.neighbors.above.rank}
                  name={ranking.neighbors.above.name}
                  totalScore={ranking.neighbors.above.totalScore}
                  scores={ranking.neighbors.above.scores}
                  guesses={ranking.neighbors.above.guesses}
                  targets={ranking.neighbors.above.targets}
                />
              )}
              <PlayerBreakdownRow
                rank={ranking.you.rank}
                name={ranking.you.name}
                totalScore={ranking.you.totalScore}
                scores={ranking.you.scores}
                guesses={ranking.you.guesses}
                targets={ranking.you.targets}
                highlight
              />
              {ranking.neighbors.below && (
                <PlayerBreakdownRow
                  rank={ranking.neighbors.below.rank}
                  name={ranking.neighbors.below.name}
                  totalScore={ranking.neighbors.below.totalScore}
                  scores={ranking.neighbors.below.scores}
                  guesses={ranking.neighbors.below.guesses}
                  targets={ranking.neighbors.below.targets}
                />
              )}
            </>
          )}
        </ol>
      )}

      <div className="mt-auto flex items-center justify-between pt-1">
        <Button
          variant="ghost"
          size="icon"
          className={cn(CUBE_ACTION_BASE, "size-14 sm:size-16")}
          type="button"
          aria-label="Zur Startseite"
          onClick={handleHomeClick}
        >
          <Home
            aria-hidden="true"
            strokeWidth={2.25}
            style={{ width: 26, height: 26 }}
          />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(CUBE_ACTION_BASE, "size-14 sm:size-16")}
          type="button"
          aria-label="Nochmal spielen"
          onClick={handleReplayClick}
        >
          <RotateCcw
            aria-hidden="true"
            strokeWidth={2.25}
            style={{ width: 26, height: 26 }}
          />
        </Button>
      </div>
    </div>
  );
}
