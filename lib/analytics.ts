export type AnalyticsEvent =
  | "game_started"
  | "game_finished"
  | "score_submission_failed";

export type AnalyticsGame = "color" | "sound" | "time";

export type AnalyticsMode =
  | "solo"
  | "team-creator"
  | "team-participant"
  | "global";

export type AnalyticsPayload = {
  game: AnalyticsGame;
  mode: AnalyticsMode;
  totalScore?: number;
  reason?: string;
};

export function writeEvent(
  analytics: AnalyticsEngineDataset,
  event: AnalyticsEvent,
  payload: AnalyticsPayload,
): void {
  analytics.writeDataPoint({
    indexes: [event],
    blobs: [event, payload.game, payload.mode, payload.reason ?? ""],
    doubles: [payload.totalScore ?? 0],
  });
}
