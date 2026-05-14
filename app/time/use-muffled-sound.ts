"use client";

import { useCallback, useEffect, useRef } from "react";

import { getAudioContext, getMasterGain } from "@/lib/audio";

import { type TimeTarget } from "./game-state";

const TARGET_GAIN = 0.13;
const ATTACK_SEC = 0.08;
const RELEASE_SEC = 0.16;

type Voice = {
  carrier: OscillatorNode;
  sub: OscillatorNode;
  lfo: OscillatorNode;
  lfoGain: GainNode;
  filter: BiquadFilterNode;
  gain: GainNode;
};

export function useMuffledSound() {
  const voiceRef = useRef<Voice | null>(null);

  const stop = useCallback(() => {
    const voice = voiceRef.current;
    if (!voice) return;
    voiceRef.current = null;

    const ctx = voice.carrier.context;
    const now = ctx.currentTime;

    try {
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setValueAtTime(Math.max(0, voice.gain.gain.value), now);
      voice.gain.gain.linearRampToValueAtTime(0, now + RELEASE_SEC);
    } catch {
      /* ignore */
    }

    for (const osc of [voice.carrier, voice.sub, voice.lfo]) {
      try {
        osc.stop(now + RELEASE_SEC + 0.02);
      } catch {
        /* ignore */
      }
    }

    window.setTimeout(
      () => {
        try {
          voice.carrier.disconnect();
          voice.sub.disconnect();
          voice.lfo.disconnect();
          voice.lfoGain.disconnect();
          voice.filter.disconnect();
          voice.gain.disconnect();
        } catch {
          /* ignore */
        }
      },
      (RELEASE_SEC + 0.1) * 1000,
    );
  }, []);

  const start = useCallback(
    (target: TimeTarget) => {
      try {
        const ctx = getAudioContext();
        const master = getMasterGain();
        if (voiceRef.current) stop();

        const now = ctx.currentTime;
        const carrier = ctx.createOscillator();
        carrier.type = "sine";
        carrier.frequency.setValueAtTime(target.toneHz, now);

        const sub = ctx.createOscillator();
        sub.type = "triangle";
        sub.frequency.setValueAtTime(target.toneHz * 0.5, now);

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(190, now);
        filter.Q.setValueAtTime(0.55, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(TARGET_GAIN, now + ATTACK_SEC);

        const lfo = ctx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.setValueAtTime(target.pulseHz, now);

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.025, now);
        lfo.connect(lfoGain).connect(gain.gain);

        carrier.connect(filter);
        sub.connect(filter);
        filter.connect(gain).connect(master);

        carrier.start(now);
        sub.start(now);
        lfo.start(now);
        voiceRef.current = { carrier, sub, lfo, lfoGain, filter, gain };
      } catch {
        /* no Web Audio support or locked audio context */
      }
    },
    [stop],
  );

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { start, stop };
}
