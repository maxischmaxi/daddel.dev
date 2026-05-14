"use client";

import { Home, RotateCcw } from "lucide-react";

import { AuroraActionButton } from "@/app/color/aurora-action-button";
import { FinalCard } from "@/app/color/final-card";
import { HOME_TONE, REPLAY_TONE } from "@/app/color/final-tones";
import { useDict } from "@/lib/i18n/use-t";

import BreakdownItem from "./breakdown-item";
import { type TimeGuess, type TimeTarget } from "./game-state";

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
  targets: TimeTarget[];
  guesses: TimeGuess[];
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
  return (
    <FinalCard
      label={dict.final.solo.label}
      totalScore={totalScore}
      subInfo={
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-white/90">
            {Math.round((totalScore / 50) * 100)}%
          </span>
          <span className="font-medium text-white/60">
            {getFinalLabel(totalScore, dict.final.solo.tiersTime)}
          </span>
        </div>
      }
      leftAction={
        <AuroraActionButton
          ariaLabel={dict.common.home}
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
          ariaLabel={dict.common.replay}
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
      <ol className="m-0 flex flex-1 min-h-0 list-none flex-col overflow-auto border-t border-white/10 p-0 pt-1">
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
    </FinalCard>
  );
}
