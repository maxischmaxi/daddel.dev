"use client";

import { useCallback, useEffect, useRef, type PointerEvent } from "react";

import {
  armAudioOnFirstGesture,
  getAudioContext,
  getMasterGain,
} from "@/lib/audio";

type Voice = {
  noiseLow: AudioBufferSourceNode;
  noiseMid: AudioBufferSourceNode;
  sub: OscillatorNode;
  env: GainNode;
  timers: number[];
};

const ATTACK_SECONDS = 0.12;
const RELEASE_SECONDS = 0.45;
const PEAK_GAIN = 0.45;

function createNoiseBuffer(
  ctx: AudioContext,
  durationSeconds: number,
): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * durationSeconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function makeDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
  const n = 4096;
  const curve = new Float32Array(new ArrayBuffer(n * 4));
  const deg = Math.PI / 180;
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

export function useHoverEarthquake() {
  const voiceRef = useRef<Voice | null>(null);

  const ensureVoice = useCallback((): Voice | null => {
    if (voiceRef.current !== null) return voiceRef.current;
    const ctx = getAudioContext();
    if (ctx.state !== "running") return null;
    const master = getMasterGain();

    // Layer A: deep rumble (lowpass + distortion)
    const noiseLow = ctx.createBufferSource();
    noiseLow.buffer = createNoiseBuffer(ctx, 2);
    noiseLow.loop = true;
    const filterLow = ctx.createBiquadFilter();
    filterLow.type = "lowpass";
    filterLow.frequency.value = 100 + Math.random() * 120;
    filterLow.Q.value = 3;
    const shaper = ctx.createWaveShaper();
    shaper.curve = makeDistortionCurve(40);
    shaper.oversample = "2x";
    const noiseLowGain = ctx.createGain();
    noiseLowGain.gain.value = 0.6;

    // Layer B: mid cracks (bandpass)
    const noiseMid = ctx.createBufferSource();
    noiseMid.buffer = createNoiseBuffer(ctx, 2);
    noiseMid.loop = true;
    const filterMid = ctx.createBiquadFilter();
    filterMid.type = "bandpass";
    filterMid.frequency.value = 220 + Math.random() * 200;
    filterMid.Q.value = 6;
    const noiseMidGain = ctx.createGain();
    noiseMidGain.gain.value = 0.08;

    // Sub bass
    const sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.value = 35 + Math.random() * 40;
    const subGain = ctx.createGain();
    subGain.gain.value = 0.5;

    // Envelope — controls overall audibility based on hover state
    const env = ctx.createGain();
    env.gain.value = 0;

    noiseLow
      .connect(filterLow)
      .connect(shaper)
      .connect(noiseLowGain)
      .connect(env);
    noiseMid.connect(filterMid).connect(noiseMidGain).connect(env);
    sub.connect(subGain).connect(env);
    env.connect(master);

    noiseLow.start();
    noiseMid.start();
    sub.start();

    const timers: number[] = [];

    const modFilterLow = () => {
      const t = ctx.currentTime;
      const freq = 70 + Math.random() * 240;
      filterLow.frequency.cancelScheduledValues(t);
      filterLow.frequency.setValueAtTime(filterLow.frequency.value, t);
      filterLow.frequency.linearRampToValueAtTime(
        freq,
        t + 0.06 + Math.random() * 0.2,
      );
      timers.push(window.setTimeout(modFilterLow, 60 + Math.random() * 200));
    };
    modFilterLow();

    const modFilterMid = () => {
      const t = ctx.currentTime;
      const freq = 180 + Math.random() * 400;
      filterMid.frequency.cancelScheduledValues(t);
      filterMid.frequency.setValueAtTime(filterMid.frequency.value, t);
      filterMid.frequency.linearRampToValueAtTime(freq, t + 0.1);
      timers.push(window.setTimeout(modFilterMid, 90 + Math.random() * 280));
    };
    modFilterMid();

    const modSub = () => {
      const t = ctx.currentTime;
      const freq = 28 + Math.random() * 55;
      sub.frequency.cancelScheduledValues(t);
      sub.frequency.setValueAtTime(sub.frequency.value, t);
      sub.frequency.linearRampToValueAtTime(freq, t + 0.08);
      timers.push(window.setTimeout(modSub, 110 + Math.random() * 320));
    };
    modSub();

    const crash = () => {
      const t = ctx.currentTime;
      const g = noiseMidGain.gain;
      g.cancelScheduledValues(t);
      g.setValueAtTime(g.value, t);
      const peak = 0.4 + Math.random() * 0.5;
      g.linearRampToValueAtTime(peak, t + 0.015);
      g.linearRampToValueAtTime(0.05, t + 0.18 + Math.random() * 0.2);
      timers.push(window.setTimeout(crash, 160 + Math.random() * 750));
    };
    crash();

    const punch = () => {
      const t = ctx.currentTime;
      const g = noiseLowGain.gain;
      g.cancelScheduledValues(t);
      g.setValueAtTime(g.value, t);
      const peak = 0.55 + Math.random() * 0.55;
      g.linearRampToValueAtTime(peak, t + 0.025);
      g.linearRampToValueAtTime(0.5, t + 0.16);
      timers.push(window.setTimeout(punch, 100 + Math.random() * 300));
    };
    punch();

    voiceRef.current = { noiseLow, noiseMid, sub, env, timers };
    return voiceRef.current;
  }, []);

  const start = useCallback(() => {
    const v = ensureVoice();
    if (v === null) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    v.env.gain.cancelScheduledValues(now);
    v.env.gain.setValueAtTime(v.env.gain.value, now);
    v.env.gain.linearRampToValueAtTime(PEAK_GAIN, now + ATTACK_SECONDS);
  }, [ensureVoice]);

  const stop = useCallback(() => {
    const v = voiceRef.current;
    if (v === null) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    v.env.gain.cancelScheduledValues(now);
    v.env.gain.setValueAtTime(v.env.gain.value, now);
    v.env.gain.linearRampToValueAtTime(0, now + RELEASE_SECONDS);
  }, []);

  const dispose = useCallback(() => {
    const v = voiceRef.current;
    if (v === null) return;
    for (const id of v.timers) clearTimeout(id);
    v.timers.length = 0;
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    v.env.gain.cancelScheduledValues(now);
    v.env.gain.setValueAtTime(v.env.gain.value, now);
    v.env.gain.linearRampToValueAtTime(0, now + RELEASE_SECONDS);
    const stopAt = now + RELEASE_SECONDS + 0.02;
    try {
      v.noiseLow.stop(stopAt);
    } catch {
      // ignore
    }
    try {
      v.noiseMid.stop(stopAt);
    } catch {
      // ignore
    }
    try {
      v.sub.stop(stopAt);
    } catch {
      // ignore
    }
    const noiseLow = v.noiseLow;
    const noiseMid = v.noiseMid;
    const sub = v.sub;
    const env = v.env;
    window.setTimeout(
      () => {
        try {
          noiseLow.disconnect();
        } catch {
          // ignore
        }
        try {
          noiseMid.disconnect();
        } catch {
          // ignore
        }
        try {
          sub.disconnect();
        } catch {
          // ignore
        }
        try {
          env.disconnect();
        } catch {
          // ignore
        }
      },
      (RELEASE_SECONDS + 0.05) * 1000,
    );
    voiceRef.current = null;
  }, []);

  const handlePointerEnter = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (e.pointerType !== "mouse") return;
      start();
    },
    [start],
  );

  const handlePointerLeave = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (e.pointerType !== "mouse") return;
      stop();
    },
    [stop],
  );

  useEffect(() => {
    armAudioOnFirstGesture();
    return dispose;
  }, [dispose]);

  return {
    onPointerEnter: handlePointerEnter,
    onPointerLeave: handlePointerLeave,
    onPointerCancel: stop,
    onBlur: stop,
  };
}
