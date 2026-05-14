import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  writeEvent,
  type AnalyticsEvent,
  type AnalyticsGame,
  type AnalyticsLocale,
  type AnalyticsMode,
  type AnalyticsPayload,
} from "@/lib/analytics";
import { jsonError, ValidationError } from "@/lib/api-validation";

export const dynamic = "force-dynamic";

const EVENTS: readonly AnalyticsEvent[] = [
  "game_started",
  "game_finished",
  "game_abandoned",
  "score_submission_failed",
  "share_clicked",
] as const;

const GAMES: readonly AnalyticsGame[] = [
  "color",
  "sound",
  "time",
  "angle",
] as const;

const MODES: readonly AnalyticsMode[] = [
  "solo",
  "team-creator",
  "team-participant",
  "global",
] as const;

const LOCALES: readonly AnalyticsLocale[] = ["de", "en", "uk"] as const;

const REASON_MAX = 120;
const SESSION_ID_MAX = 64;
const COUNTRY_MAX = 4;

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

function parseDurationMs(v: unknown): number | undefined {
  if (v === undefined || v === null) return undefined;
  if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 3_600_000)
    throw new ValidationError("invalid durationMs");
  return Math.round(v);
}

function parseReason(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined;
  if (typeof v !== "string") throw new ValidationError("invalid reason");
  return v.slice(0, REASON_MAX);
}

function parseLocale(v: unknown): AnalyticsLocale | undefined {
  if (v === undefined || v === null) return undefined;
  if (typeof v !== "string" || !LOCALES.includes(v as AnalyticsLocale))
    throw new ValidationError("invalid locale");
  return v as AnalyticsLocale;
}

function parseSessionId(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined;
  if (typeof v !== "string") throw new ValidationError("invalid sessionId");
  const trimmed = v.trim().slice(0, SESSION_ID_MAX);
  return trimmed.length > 0 ? trimmed : undefined;
}

function deriveCountry(req: Request): string | undefined {
  const raw = req.headers.get("cf-ipcountry");
  if (!raw) return undefined;
  const cleaned = raw.trim().slice(0, COUNTRY_MAX).toUpperCase();
  if (cleaned.length === 0 || cleaned === "XX" || cleaned === "T1")
    return undefined;
  return cleaned;
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
      durationMs: parseDurationMs(data.durationMs),
      reason: parseReason(data.reason),
      locale: parseLocale(data.locale),
      sessionId: parseSessionId(data.sessionId),
      country: deriveCountry(req),
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
