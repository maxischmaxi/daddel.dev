"use client";

import { Check, Home, Share2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { SoundTeamLobby } from "@/lib/api-client";
import { cn } from "@/lib/utils";

import { type Sound } from "./game-state";
import { PlayerBreakdownRow } from "./player-row";
import { buildShareText } from "./share-quips";

const CUBE_ACTION_BASE =
  "rounded-full bg-white text-cube-dark border border-[hsl(220_13%_78%)] shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:bg-[hsl(210_40%_96.1%)] hover:text-cube-dark active:scale-96 focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--background),0_0_0_4px_var(--ring)] transition-all duration-150";

type Props = {
  totalScore: number;
  shareId: string | null;
  targets: Sound[];
  guesses: Sound[];
  scores: number[];
  lobby: SoundTeamLobby | null;
  yourClientId: string | null;
  state: "idle" | "sending" | "done" | "error";
  errorMessage: string | null;
  onHome: () => void;
  onRetry: () => void;
};

function buildShareUrl(id: string): string {
  if (typeof window === "undefined") return `/sound/t/${id}`;
  return `${window.location.origin}/sound/t/${id}`;
}

export function FinalTeamCreator({
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

  const lobbyTargets = lobby?.targets ?? targets.map((t) => t.freq);
  const localTargetsHz = targets.map((t) => t.freq);
  const localGuessesHz = guesses.map((g) => g.freq);

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-3 px-5">
      <div className="flex flex-col items-center gap-0.5">
        <h2 className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
          Lobby
        </h2>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[3rem] font-bold leading-none tracking-tight tabular-nums text-white">
            {totalScore.toFixed(3)}
          </span>
          <span className="text-base font-medium tabular-nums text-white/60">
            / 50
          </span>
        </div>
      </div>

      {state === "sending" && (
        <p className="px-2 py-2 text-center text-xs text-white/60">
          Lobby wird erstellt …
        </p>
      )}

      {state === "error" && (
        <div className="flex flex-col items-center gap-2 px-2 py-3">
          <p className="text-center text-xs text-red-400">
            Erstellung fehlgeschlagen: {errorMessage ?? "Unbekannter Fehler"}
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
              guesses={localGuessesHz}
              targets={localTargetsHz}
              highlight
            />
          </ol>
        )
      )}

      <div className="mt-auto flex items-center justify-between pt-1">
        <Button
          variant="ghost"
          size="icon"
          className={cn(CUBE_ACTION_BASE, "size-16")}
          type="button"
          aria-label="Zur Startseite"
          onClick={onHome}
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
          className={cn(
            CUBE_ACTION_BASE,
            "size-16 disabled:opacity-40 disabled:cursor-not-allowed",
          )}
          type="button"
          aria-label={copied ? "Link kopiert" : "Link teilen"}
          onClick={handleCopy}
          disabled={!shareUrl}
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
        </Button>
      </div>
    </div>
  );
}
