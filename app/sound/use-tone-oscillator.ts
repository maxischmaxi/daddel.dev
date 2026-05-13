"use client";

import { useCallback, useEffect, useRef } from "react";

import { getAudioContext, getMasterGain } from "@/lib/audio";

const TARGET_GAIN = 0.1;
const ATTACK_SEC = 0.16;
const RELEASE_SEC = 0.28;
const FREQ_GLIDE_SEC = 0.06;
const LOWPASS_HZ = 2200;
const LOWPASS_Q = 0.4;

type Voice = {
  osc: OscillatorNode;
  filter: BiquadFilterNode;
  gain: GainNode;
  analyser: AnalyserNode;
};

export function useToneOscillator() {
  const voiceRef = useRef<Voice | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const stop = useCallback(() => {
    const voice = voiceRef.current;
    if (!voice) return;
    voiceRef.current = null;
    const ctx = voice.osc.context;
    const now = ctx.currentTime;
    try {
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setValueAtTime(voice.gain.gain.value, now);
      voice.gain.gain.linearRampToValueAtTime(0, now + RELEASE_SEC);
    } catch {
      /* ignore */
    }
    try {
      voice.osc.stop(now + RELEASE_SEC + 0.02);
    } catch {
      /* ignore */
    }
    window.setTimeout(
      () => {
        try {
          voice.osc.disconnect();
          voice.filter.disconnect();
          voice.gain.disconnect();
          voice.analyser.disconnect();
        } catch {
          /* ignore */
        }
      },
      (RELEASE_SEC + 0.1) * 1000,
    );
  }, []);

  const start = useCallback(
    (freqHz: number) => {
      const ctx = getAudioContext();
      const master = getMasterGain();
      if (voiceRef.current) stop();
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freqHz, ctx.currentTime);
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(LOWPASS_HZ, ctx.currentTime);
      filter.Q.setValueAtTime(LOWPASS_Q, ctx.currentTime);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(
        TARGET_GAIN,
        ctx.currentTime + ATTACK_SEC,
      );
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      osc.connect(filter).connect(gain).connect(analyser).connect(master);
      osc.start();
      voiceRef.current = { osc, filter, gain, analyser };
      analyserRef.current = analyser;
    },
    [stop],
  );

  const setFreq = useCallback((freqHz: number) => {
    const voice = voiceRef.current;
    if (!voice) return;
    const ctx = voice.osc.context;
    voice.osc.frequency.setTargetAtTime(
      freqHz,
      ctx.currentTime,
      FREQ_GLIDE_SEC,
    );
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { start, setFreq, stop, analyserRef };
}
