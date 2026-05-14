"use client";

import { Check, Home, Share2 } from "lucide-react";
import { useState } from "react";

import { AuroraActionButton } from "@/app/color/aurora-action-button";
import { HOME_TONE, SHARE_TONE } from "@/app/color/final-tones";
import { useBingClick } from "@/app/color/use-click-tone";
import { trackEvent } from "@/lib/analytics-client";
import type { AngleTeamLobby } from "@/lib/api-client";
import { useDict, useLocale } from "@/lib/i18n/use-t";

import { FinalCard } from "./final-card";
import { type Angle } from "./game-state";
import { PlayerBreakdownRow } from "./player-row";
import { buildShareText } from "./share-quips";
import { buildShareUrl } from "./shared-styles";

export type FinalTeamRole = "creator" | "participant";

type Props = {
  role: FinalTeamRole;
  totalScore: number;
  shareId: string | null;
  targets: Angle[];
  guesses: Angle[];
  scores: number[];
  lobby: AngleTeamLobby | null;
  yourClientId: string | null;
  state: "idle" | "sending" | "done" | "error";
  errorMessage: string | null;
  onHome: () => void;
  onRetry: () => void;
};

export function FinalTeam({
  role,
  totalScore,
  shareId,
  targets,
  guesses,
  scores,
  lobby,
  yourClientId,
  state,
  errorMessage,
  onHome,
  onRetry,
}: Props) {
  const dict = useDict();
  const { locale } = useLocale();
  const [copied, setCopied] = useState(false);
  const handleRetryClick = useBingClick<HTMLButtonElement>(onRetry);
  const shareUrl = shareId ? buildShareUrl(shareId) : null;
  const copy =
    role === "creator"
      ? {
          sending: dict.final.team.lobbyCreating,
          errorPrefix: dict.final.team.createFailed,
        }
      : {
          sending: dict.final.team.scoreSending,
          errorPrefix: dict.final.team.sendFailed,
        };

  async function handleCopy() {
    if (!shareUrl) return;
    const text = buildShareText(totalScore, shareUrl, dict);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
      trackEvent("share_clicked", {
        game: "angle",
        mode: role === "creator" ? "team-creator" : "team-participant",
        totalScore,
        locale,
      });
    } catch {
      /* ignore */
    }
  }

  const lobbyTargets = lobby?.targets ?? targets.map((t) => t.deg);
  const localTargetsDeg = targets.map((t) => t.deg);
  const localGuessesDeg = guesses.map((g) => g.deg);

  const statusBlock = (
    <>
      {state === "sending" && (
        <p className="px-2 py-2 text-center text-xs text-white/60">
          {copy.sending}
        </p>
      )}
      {state === "error" && (
        <div className="flex flex-col items-center gap-2 px-2 py-3">
          <p className="text-center text-xs text-red-400">
            {copy.errorPrefix}: {errorMessage ?? dict.common.unknownError}
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
      label={dict.final.team.label}
      totalScore={totalScore}
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
          ariaLabel={copied ? dict.common.copied : dict.common.share}
          tone={SHARE_TONE}
          onClick={handleCopy}
          disabled={!shareUrl}
          rings={
            <>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full border-2 border-cyan-300 opacity-0 motion-safe:group-hover:animate-pulse-ring"
              />
              <span
                aria-hidden="true"
                style={{ animationDelay: "0.6s" }}
                className="pointer-events-none absolute inset-0 rounded-full border-2 border-fuchsia-300 opacity-0 motion-safe:group-hover:animate-pulse-ring"
              />
            </>
          }
        >
          {copied ? (
            <Check
              aria-hidden="true"
              strokeWidth={2.25}
              style={{ width: 26, height: 26 }}
            />
          ) : (
            <Share2
              aria-hidden="true"
              strokeWidth={2.25}
              style={{ width: 26, height: 26 }}
            />
          )}
        </AuroraActionButton>
      }
    >
      {lobby && lobby.scores.length > 0 ? (
        <ol className="m-0 flex flex-1 min-h-0 list-none flex-col gap-0.5 overflow-auto p-0">
          {lobby.scores.map((entry) => (
            <PlayerBreakdownRow
              key={entry.clientId}
              rank={entry.rank}
              name={entry.name}
              totalScore={entry.totalScore}
              scores={entry.scores}
              guesses={entry.guesses}
              targets={lobbyTargets}
              highlight={entry.clientId === yourClientId}
            />
          ))}
        </ol>
      ) : (
        state === "done" &&
        targets.length > 0 && (
          <ol className="m-0 flex flex-1 min-h-0 list-none flex-col gap-0.5 overflow-auto p-0">
            <PlayerBreakdownRow
              rank={1}
              name={dict.common.you}
              totalScore={totalScore}
              scores={scores}
              guesses={localGuessesDeg}
              targets={localTargetsDeg}
              highlight
            />
          </ol>
        )
      )}
    </FinalCard>
  );
}
