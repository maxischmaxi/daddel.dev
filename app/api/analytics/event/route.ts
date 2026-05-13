import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  writeEvent,
  type AnalyticsEvent,
  type AnalyticsGame,
  type AnalyticsMode,
  type AnalyticsPayload,
} from "@/lib/analytics";
import { jsonError, ValidationError } from "@/lib/api-validation";

export const dynamic = "force-dynamic";

const EVENTS: readonly AnalyticsEvent[] = [
  "game_started",
  "game_finished",
  "score_submission_failed",
] as const;

const GAMES: readonly AnalyticsGame[] = ["color", "sound"] as const;

const MODES: readonly AnalyticsMode[] = [
  "solo",
  "team-creator",
  "team-participant",
  "global",
] as const;

const REASON_MAX = 120;

function parseEvent(v: unknown): AnalyticsEvent {
  if (typeof v !== "string" || !EVENTS.includes(v as AnalyticsEvent))
    throw new ValidationError("invalid event");
  return v as AnalyticsEvent;
}

function parseGame(v: unknown): AnalyticsGame {
  if (typeof v !== "string" || !GAMES.includes(v as AnalyticsGame))
    throw new ValidationError("invalid game");
  return v as AnalyticsGame;
}

function parseMode(v: unknown): AnalyticsMode {
  if (typeof v !== "string" || !MODES.includes(v as AnalyticsMode))
    throw new ValidationError("invalid mode");
  return v as AnalyticsMode;
}

function parseTotalScore(v: unknown): number | undefined {
  if (v === undefined || v === null) return undefined;
  if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 50)
    throw new ValidationError("invalid totalScore");
  return v;
}

function parseReason(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined;
  if (typeof v !== "string") throw new ValidationError("invalid reason");
  return v.slice(0, REASON_MAX);
}

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("invalid json", 400);
  }

  let event: AnalyticsEvent;
  let payload: AnalyticsPayload;
  try {
    const o = body as Record<string, unknown>;
    event = parseEvent(o.event);
    const data = (o.data ?? {}) as Record<string, unknown>;
    payload = {
      game: parseGame(data.game),
      mode: parseMode(data.mode),
      totalScore: parseTotalScore(data.totalScore),
      reason: parseReason(data.reason),
    };
  } catch (e) {
    if (e instanceof ValidationError) return jsonError(e.message, 400);
    return jsonError("invalid body", 400);
  }

  try {
    const { env } = await getCloudflareContext({ async: true });
    writeEvent(env.ANALYTICS, event, payload);
    return Response.json({ ok: true });
  } catch (e) {
    console.error("POST /api/analytics/event failed", e);
    return jsonError("internal", 500);
  }
}
