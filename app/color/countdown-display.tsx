"use client";

import {
  type CSSProperties,
  type RefObject,
  useLayoutEffect,
  useRef,
} from "react";

import {
  armAudioOnFirstGesture,
  getAudioContext,
  scheduleTickRoll,
  type ScheduledTick,
} from "@/lib/audio";

import { SHOW_MS } from "./game-state";

const DIGIT_CYCLE = ["0", "9", "8", "7", "6", "5", "4", "3", "2", "1"];
const DIGIT_STACK = [...DIGIT_CYCLE, ...DIGIT_CYCLE];

const SLOT_PAD_EM = 0.2;
const SLOT_FADE_MASK = `linear-gradient(to bottom, transparent, black ${SLOT_PAD_EM}em, black calc(100% - ${SLOT_PAD_EM}em), transparent)`;

const SLOT_STYLE: CSSProperties = {
  height: `${1 + 2 * SLOT_PAD_EM}em`,
  width: "0.62em",
  lineHeight: 1,
  marginBottom: `-${SLOT_PAD_EM}em`,
  WebkitMaskImage: SLOT_FADE_MASK,
  maskImage: SLOT_FADE_MASK,
};

const COLUMN_STYLE: CSSProperties = {
  willChange: "transform",
  lineHeight: 1,
};

const DIGIT_STYLE: CSSProperties = {
  height: "1em",
  lineHeight: 1,
};

const DOT_STYLE: CSSProperties = {
  width: "0.32em",
  textAlign: "center",
  lineHeight: 1,
};

function DigitSlot({ columnRef }: { columnRef: RefObject<HTMLSpanElement | null> }) {
  return (
    <span
      className="relative inline-block overflow-hidden align-bottom"
      style={SLOT_STYLE}
    >
      <span
        ref={columnRef}
        className="absolute inset-x-0 top-0 block"
        style={COLUMN_STYLE}
      >
        {DIGIT_STACK.map((d, i) => (
          <span key={i} className="block text-center" style={DIGIT_STYLE}>
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

export function CountdownDisplay({ endTimeMs }: { endTimeMs: number }) {
  const secondsRef = useRef<HTMLSpanElement | null>(null);
  const tenthsRef = useRef<HTMLSpanElement | null>(null);
  const hundredthsRef = useRef<HTMLSpanElement | null>(null);
  const thousandthsRef = useRef<HTMLSpanElement | null>(null);

  useLayoutEffect(() => {
    armAudioOnFirstGesture();
    const startTime = endTimeMs - SHOW_MS;

    const setPos = (el: HTMLSpanElement | null, pos: number) => {
      if (el !== null)
        el.style.transform = `translateY(${SLOT_PAD_EM - pos}em)`;
    };

    let raf = 0;
    const update = () => {
      const now = performance.now();
      const elapsedMs = Math.max(0, Math.min(SHOW_MS, now - startTime));

      setPos(secondsRef.current, (5 + elapsedMs / 1000) % 10);
      setPos(tenthsRef.current, (elapsedMs / 100) % 10);
      setPos(hundredthsRef.current, (elapsedMs / 10) % 10);
      setPos(thousandthsRef.current, elapsedMs % 10);

      if (now < endTimeMs) {
        raf = requestAnimationFrame(update);
      }
    };
    update();

    let roll: ScheduledTick | null = null;
    const ctx = getAudioContext();
    if (ctx.state === "running") {
      const elapsedSec = Math.max(0, (performance.now() - startTime) / 1000);
      const remainingSec = SHOW_MS / 1000 - elapsedSec;
      if (remainingSec > 0.02) {
        roll = scheduleTickRoll(remainingSec, {
          startFreqHz: 3,
          endFreqHz: 22,
          tickWidthSec: 0.01,
          decay: 5,
          peakGain: 0.32,
          filterType: "bandpass",
          filterHz: 2400,
          filterQ: 1.1,
        });
      }
    }

    return () => {
      cancelAnimationFrame(raf);
      if (roll) roll.stop();
    };
  }, [endTimeMs]);

  return (
    <span className="inline-flex items-end tabular-nums leading-none">
      <DigitSlot columnRef={secondsRef} />
      <span className="inline-block" style={DOT_STYLE}>
        .
      </span>
      <DigitSlot columnRef={tenthsRef} />
      <DigitSlot columnRef={hundredthsRef} />
      <DigitSlot columnRef={thousandthsRef} />
    </span>
  );
}
