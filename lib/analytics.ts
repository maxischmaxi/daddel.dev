export type AnalyticsEvent =
  | "game_started"
  | "game_finished"
  | "game_abandoned"
  | "score_submission_failed"
  | "share_clicked";

export type AnalyticsGame = "color" | "sound" | "time" | "angle";

export type AnalyticsMode =
  | "solo"
  | "team-creator"
  | "team-participant"
  | "global";

export type AnalyticsLocale = "de" | "en" | "uk";

export type AnalyticsPayload = {
  game: AnalyticsGame;
  mode: AnalyticsMode;
  totalScore?: number;
  durationMs?: number;
  reason?: string;
  locale?: AnalyticsLocale;
  country?: string;
  sessionId?: string;
};

export function writeEvent(
  analytics: AnalyticsEngineDataset,
  event: AnalyticsEvent,
  payload: AnalyticsPayload,
): void {
  analytics.writeDataPoint({
    indexes: [event],
    blobs: [
      event,
      payload.game,
      payload.mode,
      payload.reason ?? "",
      payload.locale ?? "",
      payload.country ?? "",
      payload.sessionId ?? "",
    ],
    doubles: [payload.totalScore ?? 0, payload.durationMs ?? 0],
  });
}
