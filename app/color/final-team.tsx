"use client";

import { Check, Home, Share2 } from "lucide-react";
import { useState } from "react";

import type { TeamLobby } from "@/lib/api-client";

import { AuroraActionButton } from "./aurora-action-button";
import { FinalCard } from "./final-card";
import { HOME_TONE, SHARE_TONE } from "./final-tones";
import { type Color } from "./game-state";
import { PlayerBreakdownRow } from "./player-row";
import { buildShareText } from "./share-quips";
import { buildShareUrl } from "./shared-styles";

export type FinalTeamRole = "creator" | "participant";

type Props = {
  role: FinalTeamRole;
  totalScore: number;
  shareId: string | null;
  targets: Color[];
  guesses: Color[];
  scores: number[];
  lobby: TeamLobby | null;
  yourClientId: string | null;
  state: "idle" | "sending" | "done" | "error";
  errorMessage: string | null;
  onHome: () => void;
  onRetry: () => void;
};

const COPY: Record<
  FinalTeamRole,
  { sending: string; errorPrefix: string }
> = {
  creator: {
    sending: "Lobby wird erstellt …",
    errorPrefix: "Erstellung fehlgeschlagen",
  },
  participant: {
    sending: "Score wird übertragen …",
    errorPrefix: "Übertragung fehlgeschlagen",
  },
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
  const [copied, setCopied] = useState(false);
  const shareUrl = shareId ? buildShareUrl(shareId) : null;
  const copy = COPY[role];

  async function handleCopy() {
    if (!shareUrl) return;
    const text = buildShareText(totalScore, shareUrl);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  const lobbyTargets = lobby?.targets ?? targets;

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
            {copy.errorPrefix}: {errorMessage ?? "Unbekannter Fehler"}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-md border border-white/30 bg-transparent px-2 py-1 text-xs font-medium text-white hover:bg-white/10"
          >
            Erneut versuchen
          </button>
        </div>
      )}
    </>
  );

  return (
    <FinalCard
      label="Lobby"
      totalScore={totalScore}
      statusBlock={statusBlock}
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
          ariaLabel={copied ? "Link kopiert" : "Link teilen"}
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
              name="Du"
              totalScore={totalScore}
              scores={scores}
              guesses={guesses}
              targets={targets}
              highlight
            />
          </ol>
        )
      )}
    </FinalCard>
  );
}
