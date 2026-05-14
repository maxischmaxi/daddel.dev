import type {
  AnalyticsEvent,
  AnalyticsGame,
  AnalyticsLocale,
  AnalyticsMode,
} from "@/lib/analytics";

type TrackPayload = {
  game: AnalyticsGame;
  mode: AnalyticsMode;
  totalScore?: number;
  durationMs?: number;
  reason?: string;
  locale?: AnalyticsLocale;
};

const SESSION_KEY = "browser-games:analytics-session";
const ENDPOINT = "/api/analytics/event";

export function getAnalyticsSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing && existing.length > 0) return existing;
    const fresh =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    window.sessionStorage.setItem(SESSION_KEY, fresh);
    return fresh;
  } catch {
    return "";
  }
}

export function trackEvent(event: AnalyticsEvent, data: TrackPayload): void {
  if (typeof window === "undefined") return;
  const sessionId = getAnalyticsSessionId();
  const body = JSON.stringify({
    event,
    data: { ...data, sessionId: sessionId || undefined },
  });

  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(ENDPOINT, blob)) return;
    }
  } catch {
    // fall through to fetch
  }

  try {
    void fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // best-effort: never block the game on analytics
  }
}
