import type {
  AnalyticsEvent,
  AnalyticsGame,
  AnalyticsMode,
} from "@/lib/analytics";

type TrackPayload = {
  game: AnalyticsGame;
  mode: AnalyticsMode;
  totalScore?: number;
  reason?: string;
};

export function trackEvent(event: AnalyticsEvent, data: TrackPayload): void {
  if (typeof window === "undefined") return;
  try {
    void fetch("/api/analytics/event", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event, data }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // best-effort: never block the game on analytics
  }
}
