"use client";

import { Home, RotateCcw } from "lucide-react";

import { AuroraActionButton } from "./aurora-action-button";
import { FinalCard } from "./final-card";
import { HOME_TONE, REPLAY_TONE } from "./final-tones";
import { type Color } from "./game-state";
import { PlayerBreakdownRow } from "./player-row";

function getFinalLabel(score: number): string {
  if (score >= 42) return "Farb-Maestro";
  if (score >= 34) return "Beeindruckend";
  if (score >= 25) return "Stark unterwegs";
  if (score >= 17) return "Solide";
  if (score >= 8) return "Da geht noch was";
  return "Erstmal warmlaufen";
}

type Props = {
  totalScore: number;
  targets: Color[];
  guesses: Color[];
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
  return (
    <FinalCard
      label="Geschafft"
      totalScore={totalScore}
      subInfo={
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-white/90">
            {Math.round((totalScore / 50) * 100)}%
          </span>
          <span className="font-medium text-white/60">
            {getFinalLabel(totalScore)}
          </span>
        </div>
      }
      leftAction={
        <AuroraActionButton
          ariaLabel="Zur Startseite"
          tone={HOME_TONE}
          onClick={onHome}
          rings={
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full border-2 border-sky-300 opacity-0 motion-safe:group-hover:animate-pulse-ring"
            />
          }
        >
          <Home
            aria-hidden="true"
            strokeWidth={2.25}
            style={{ width: 26, height: 26 }}
          />
        </AuroraActionButton>
      }
      rightAction={
        <AuroraActionButton
          ariaLabel="Nochmal spielen"
          tone={REPLAY_TONE}
          onClick={onReplay}
          rings={
            <>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full border-2 border-emerald-300 opacity-0 motion-safe:group-hover:animate-pulse-ring"
              />
              <span
                aria-hidden="true"
                style={{ animationDelay: "0.5s" }}
                className="pointer-events-none absolute inset-0 rounded-full border-2 border-amber-300 opacity-0 motion-safe:group-hover:animate-pulse-ring"
              />
            </>
          }
        >
          <RotateCcw
            aria-hidden="true"
            strokeWidth={2.25}
            style={{ width: 26, height: 26 }}
          />
        </AuroraActionButton>
      }
    >
      {targets.length > 0 && (
        <ol className="m-0 flex flex-1 min-h-0 list-none flex-col gap-0.5 overflow-auto p-0">
          <PlayerBreakdownRow
            rank={1}
            name="Du"
            totalScore={totalScore}
            scores={scores}
            guesses={guesses}
            targets={targets}
            highlight
          />
        </ol>
      )}
    </FinalCard>
  );
}
