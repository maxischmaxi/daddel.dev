"use client";

import { useCallback, useEffect, type MouseEventHandler } from "react";

import {
  armAudioOnFirstGesture,
  getAudioContext,
  getMasterGain,
} from "@/lib/audio";

export type ClickToneSpec = {
  startFreq: number;
  endFreq?: number;
  durationSeconds?: number;
  delaySeconds?: number;
  peakGain?: number;
  type?: OscillatorType;
};

export const BING_CLICK_TONE: readonly ClickToneSpec[] = [
  {
    startFreq: 880,
    endFreq: 1318.51,
    durationSeconds: 0.18,
    peakGain: 0.055,
    type: "sine",
  },
  {
    startFreq: 1760,
    endFreq: 2093,
    delaySeconds: 0.015,
    durationSeconds: 0.16,
    peakGain: 0.028,
    type: "triangle",
  },
];

export const PREP_SEQUENCE_TONES: readonly (readonly ClickToneSpec[])[] = [
  [
    {
      startFreq: 523.25,
      endFreq: 659.25,
      durationSeconds: 0.13,
      peakGain: 0.04,
      type: "triangle",
    },
  ],
  [
    {
      startFreq: 659.25,
      endFreq: 783.99,
      durationSeconds: 0.13,
      peakGain: 0.045,
      type: "triangle",
    },
  ],
  [
    {
      startFreq: 783.99,
      endFreq: 1174.66,
      durationSeconds: 0.22,
      peakGain: 0.055,
      type: "sine",
    },
    {
      startFreq: 1567.98,
      endFreq: 2349.32,
      delaySeconds: 0.035,
      durationSeconds: 0.18,
      peakGain: 0.025,
      type: "triangle",
    },
  ],
];

const ATTACK_SECONDS = 0.008;
const RELEASE_FLOOR_GAIN = 0.0001;
const CLEANUP_BUFFER_SECONDS = 0.08;

export function playTone(
  specs: readonly ClickToneSpec[] = BING_CLICK_TONE,
): void {
  if (typeof window === "undefined") return;

  try {
    const ctx = getAudioContext();
    const master = getMasterGain();

    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    const now = ctx.currentTime;

    for (const spec of specs) {
      const delay = Math.max(0, spec.delaySeconds ?? 0);
      const duration = Math.max(0.04, spec.durationSeconds ?? 0.18);
      const attack = Math.min(ATTACK_SECONDS, duration / 4);
      const startAt = now + delay;
      const endAt = startAt + duration;
      const startFreq = Math.max(1, spec.startFreq);
      const endFreq = Math.max(1, spec.endFreq ?? spec.startFreq);
      const peakGain = Math.max(0, spec.peakGain ?? 0.04);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = spec.type ?? "sine";
      osc.frequency.setValueAtTime(startFreq, startAt);
      if (endFreq !== startFreq) {
        osc.frequency.exponentialRampToValueAtTime(endFreq, endAt);
      }

      gain.gain.setValueAtTime(0, startAt);
      gain.gain.linearRampToValueAtTime(peakGain, startAt + attack);
      gain.gain.exponentialRampToValueAtTime(RELEASE_FLOOR_GAIN, endAt);

      osc.connect(gain).connect(master);
      osc.start(startAt);
      osc.stop(endAt + CLEANUP_BUFFER_SECONDS);

      window.setTimeout(
        () => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch {
            // ignore — nodes may already be disconnected by the browser
          }
        },
        (delay + duration + CLEANUP_BUFFER_SECONDS + 0.02) * 1000,
      );
    }
  } catch {
    // Ignore missing/blocked Web Audio support.
  }
}

export function useClickTone(
  specs: readonly ClickToneSpec[] = BING_CLICK_TONE,
): () => void {
  const play = useCallback(() => playTone(specs), [specs]);

  useEffect(() => {
    armAudioOnFirstGesture();
  }, []);

  return play;
}

export function usePrepSequenceTone(): (step: number) => void {
  const play = useCallback((step: number) => {
    const specs = PREP_SEQUENCE_TONES[step];
    if (!specs) return;
    playTone(specs);
  }, []);

  useEffect(() => {
    armAudioOnFirstGesture();
  }, []);

  return play;
}

export function useBingClick<T extends HTMLElement = HTMLElement>(
  onClick?: MouseEventHandler<T>,
): MouseEventHandler<T> {
  const playClickTone = useClickTone();

  return useCallback(
    (event) => {
      playClickTone();
      onClick?.(event);
    },
    [onClick, playClickTone],
  );
}
