"use client";

import { useCallback, useEffect, useRef } from "react";

import {
  armAudioOnFirstGesture,
  getAudioContext,
  getMasterGain,
} from "@/lib/audio";

export type ToneSpec = {
  startFreq: number;
  endFreq: number;
  rampSeconds: number;
  type?: OscillatorType;
};

type Voice = {
  oscillators: OscillatorNode[];
  hoverGain: GainNode;
};

const ATTACK_SECONDS = 0.05;
const RELEASE_SECONDS = 0.14;
const FREQ_RESET_SECONDS = 0.04;
const TOTAL_PEAK_GAIN = 0.12;

export function useHoverTone(specs: readonly ToneSpec[]) {
  const voiceRef = useRef<Voice | null>(null);

  const ensureVoice = useCallback((): Voice | null => {
    if (voiceRef.current !== null) return voiceRef.current;
    const ctx = getAudioContext();
    if (ctx.state !== "running") return null;

    const master = getMasterGain();
    const hoverGain = ctx.createGain();
    hoverGain.gain.value = 0;
    hoverGain.connect(master);

    const perVoiceGain = TOTAL_PEAK_GAIN / Math.max(1, specs.length);
    const oscillators: OscillatorNode[] = [];

    for (const spec of specs) {
      const osc = ctx.createOscillator();
      const vg = ctx.createGain();
      osc.type = spec.type ?? "sine";
      osc.frequency.value = spec.startFreq;
      vg.gain.value = perVoiceGain;
      osc.connect(vg).connect(hoverGain);
      osc.start();
      oscillators.push(osc);
    }

    voiceRef.current = { oscillators, hoverGain };
    return voiceRef.current;
  }, [specs]);

  const start = useCallback(() => {
    const v = ensureVoice();
    if (v === null) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    v.hoverGain.gain.cancelScheduledValues(now);
    v.hoverGain.gain.setValueAtTime(v.hoverGain.gain.value, now);
    v.hoverGain.gain.linearRampToValueAtTime(1, now + ATTACK_SECONDS);

    v.oscillators.forEach((osc, i) => {
      const spec = specs[i];
      osc.frequency.cancelScheduledValues(now);
      osc.frequency.setValueAtTime(osc.frequency.value, now);
      osc.frequency.linearRampToValueAtTime(
        spec.startFreq,
        now + FREQ_RESET_SECONDS,
      );
      osc.frequency.exponentialRampToValueAtTime(
        spec.endFreq,
        now + FREQ_RESET_SECONDS + spec.rampSeconds,
      );
    });
  }, [ensureVoice, specs]);

  const stop = useCallback(() => {
    const v = voiceRef.current;
    if (v === null) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    v.hoverGain.gain.cancelScheduledValues(now);
    v.hoverGain.gain.setValueAtTime(v.hoverGain.gain.value, now);
    v.hoverGain.gain.linearRampToValueAtTime(0, now + RELEASE_SECONDS);
  }, []);

  const dispose = useCallback(() => {
    const v = voiceRef.current;
    if (v === null) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    v.hoverGain.gain.cancelScheduledValues(now);
    v.hoverGain.gain.setValueAtTime(v.hoverGain.gain.value, now);
    v.hoverGain.gain.linearRampToValueAtTime(0, now + RELEASE_SECONDS);
    const stopAt = now + RELEASE_SECONDS + 0.02;
    for (const osc of v.oscillators) {
      try {
        osc.stop(stopAt);
      } catch {
        // already stopped — ignore
      }
    }
    const oscillators = v.oscillators;
    const hoverGain = v.hoverGain;
    window.setTimeout(
      () => {
        for (const osc of oscillators) {
          try {
            osc.disconnect();
          } catch {
            // ignore
          }
        }
        try {
          hoverGain.disconnect();
        } catch {
          // ignore
        }
      },
      (RELEASE_SECONDS + 0.05) * 1000,
    );
    voiceRef.current = null;
  }, []);

  useEffect(() => {
    armAudioOnFirstGesture();
    return dispose;
  }, [dispose]);

  return { onMouseEnter: start, onMouseLeave: stop };
}
