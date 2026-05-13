import { type ToneSpec } from "./use-hover-tone";

export const HOME_TONE: readonly ToneSpec[] = [
  { startFreq: 1500, endFreq: 180, rampSeconds: 1.2, type: "triangle" },
];

export const REPLAY_TONE: readonly ToneSpec[] = [
  { startFreq: 196.0, endFreq: 1567.98, rampSeconds: 0.7, type: "sawtooth" },
  { startFreq: 246.94, endFreq: 1975.53, rampSeconds: 0.7, type: "sawtooth" },
  { startFreq: 293.66, endFreq: 2349.32, rampSeconds: 0.7, type: "sawtooth" },
];

export const SHARE_TONE: readonly ToneSpec[] = [
  { startFreq: 261.63, endFreq: 783.99, rampSeconds: 0.6, type: "sine" },
  { startFreq: 392.0, endFreq: 1174.66, rampSeconds: 0.6, type: "sine" },
];
