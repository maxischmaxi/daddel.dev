"use client";

import { Home, RotateCcw } from "lucide-react";

import type { GlobalRanking, RankingEntry } from "@/lib/api-client";
import { interpolate } from "@/lib/i18n/interpolate";
import { useDict } from "@/lib/i18n/use-t";

import { AuroraActionButton } from "./aurora-action-button";
import { FinalCard } from "./final-card";
import { useBingClick } from "./use-click-tone";
import { HOME_TONE, REPLAY_TONE } from "./final-tones";
import { PlayerBreakdownRow } from "./player-row";

type Props = {
  totalScore: number;
  ranking: GlobalRanking | null;
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
  const dict = useDict();
  const handleRetryClick = useBingClick<HTMLButtonElement>(onRetry);
  const youInTop = ranking?.you
    ? ranking.top.some((r) => r.clientId === yourClientId)
    : false;

  const subInfo = ranking?.you ? (
    <p className="m-0 text-xs font-medium text-white/60">
      {interpolate(dict.final.global.rankTemplate, {
        rank: ranking.you.rank,
        total: ranking.total,
      })}
    </p>
  ) : undefined;

  const statusBlock = (
    <>
      {state === "sending" && (
        <p className="px-2 py-2 text-center text-xs text-white/60">
          {dict.final.global.scoreSending}
        </p>
      )}
      {state === "error" && (
        <div className="flex flex-col items-center gap-2 px-2 py-3">
          <p className="text-center text-xs text-red-400">
            {dict.final.global.sendFailed}: {errorMessage ?? dict.common.unknownError}
          </p>
          <button
            type="button"
            onClick={handleRetryClick}
            className="rounded-md border border-white/30 bg-transparent px-2 py-1 text-xs font-medium text-white hover:bg-white/10"
          >
            {dict.common.retry}
          </button>
        </div>
      )}
    </>
  );

  return (
    <FinalCard
      label={dict.final.global.label}
      totalScore={totalScore}
      subInfo={subInfo}
      statusBlock={statusBlock}
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
    </FinalCard>
  );
}

export type { RankingEntry };
