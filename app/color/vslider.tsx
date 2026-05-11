"use client";

import { useRef, type KeyboardEvent, type PointerEvent } from "react";

import { cn } from "@/lib/utils";

type Props = {
  id: string;
  ariaLabel: string;
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  trackBg?: string;
  className?: string;
};

export default function VSlider({
  id,
  ariaLabel,
  min,
  max,
  value,
  onChange,
  trackBg,
  className,
}: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const activePointerId = useRef<number | null>(null);

  const commit = (v: number) => {
    const clamped = Math.max(min, Math.min(max, Math.round(v)));
    if (clamped === value) return;
    onChange(clamped);
  };

  const setValueFromClientY = (clientY: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    if (rect.height === 0) return;
    const offsetFromTop = clientY - rect.top;
    const ratio = 1 - Math.max(0, Math.min(1, offsetFromTop / rect.height));
    commit(min + ratio * (max - min));
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    elRef.current?.focus();
    activePointerId.current = e.pointerId;
    elRef.current?.setPointerCapture(e.pointerId);
    setValueFromClientY(e.clientY);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== e.pointerId) return;
    setValueFromClientY(e.clientY);
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== e.pointerId) return;
    activePointerId.current = null;
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const big = Math.max(1, Math.round((max - min) / 10));
    let delta = 0;
    switch (e.key) {
      case "ArrowUp":
      case "ArrowRight":
        delta = 1;
        break;
      case "ArrowDown":
      case "ArrowLeft":
        delta = -1;
        break;
      case "PageUp":
        delta = big;
        break;
      case "PageDown":
        delta = -big;
        break;
      case "Home":
        e.preventDefault();
        commit(min);
        return;
      case "End":
        e.preventDefault();
        commit(max);
        return;
      default:
        return;
    }
    e.preventDefault();
    commit(value + delta);
  };

  const ratio = (value - min) / (max - min);

  return (
    <div
      ref={elRef}
      id={id}
      className={cn(
        "relative h-full w-8 cursor-pointer touch-none select-none outline-none focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white/85",
        className,
      )}
      role="slider"
      tabIndex={0}
      aria-orientation="vertical"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={ariaLabel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={trackRef}
        className="pointer-events-none absolute inset-0"
        style={{ background: trackBg ?? "var(--muted)" }}
      />
      <div
        className="pointer-events-none absolute left-1/2 h-3.5 w-3.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-white"
        style={{ bottom: `${ratio * 100}%` }}
      />
    </div>
  );
}
