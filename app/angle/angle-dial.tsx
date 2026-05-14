"use client";

import { useCallback, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

import { normalizeDeg } from "./game-state";

const VIEW = 200;
const CENTER = VIEW / 2;
const OUTER_RADIUS = 92;
const INNER_RADIUS = 14;
const POINTER_LENGTH = 78;
const HANDLE_RADIUS = 7;

type DialProps = {
  ariaLabel: string;
  targetDeg: number | null;
  playerDeg: number;
  onChange?: (deg: number) => void;
  interactive: boolean;
  showTarget: boolean;
  showPlayer: boolean;
  minimal?: boolean;
  className?: string;
};

function polarToCartesian(deg: number, radius: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

function pointToDeg(
  clientX: number,
  clientY: number,
  svgEl: SVGSVGElement,
): number {
  const rect = svgEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = clientX - cx;
  const dy = clientY - cy;
  const rad = Math.atan2(dy, dx);
  return normalizeDeg((rad * 180) / Math.PI + 90);
}

export function AngleDial({
  ariaLabel,
  targetDeg,
  playerDeg,
  onChange,
  interactive,
  showTarget,
  showPlayer,
  minimal = false,
  className,
}: DialProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const draggingRef = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!draggingRef.current) return;
    const svg = svgRef.current;
    if (!svg) return;
    e.preventDefault();
    onChangeRef.current?.(pointToDeg(e.clientX, e.clientY, svg));
  }, []);

  const stopDrag = useCallback(
    (e: PointerEvent) => {
      draggingRef.current = false;
      const svg = svgRef.current;
      if (svg?.hasPointerCapture(e.pointerId)) {
        svg.releasePointerCapture(e.pointerId);
      }
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDrag);
      window.removeEventListener("pointercancel", stopDrag);
    },
    [handlePointerMove],
  );

  useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDrag);
      window.removeEventListener("pointercancel", stopDrag);
    };
  }, [handlePointerMove, stopDrag]);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!interactive) return;
    const svg = svgRef.current;
    if (!svg) return;
    e.preventDefault();
    draggingRef.current = true;
    try {
      svg.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    onChangeRef.current?.(pointToDeg(e.clientX, e.clientY, svg));
    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", stopDrag);
    window.addEventListener("pointercancel", stopDrag);
  };

  const ticks = Array.from({ length: 36 }, (_, i) => i * 10);
  const playerPos = polarToCartesian(playerDeg, POINTER_LENGTH);
  const targetPos =
    targetDeg !== null ? polarToCartesian(targetDeg, POINTER_LENGTH) : null;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      role={interactive ? "slider" : "img"}
      aria-label={ariaLabel}
      aria-valuemin={interactive ? 0 : undefined}
      aria-valuemax={interactive ? 360 : undefined}
      aria-valuenow={interactive ? Math.round(playerDeg) : undefined}
      onPointerDown={handlePointerDown}
      className={cn(
        "block h-full w-full",
        interactive && "cursor-grab touch-none active:cursor-grabbing",
        className,
      )}
    >
      <defs>
        <radialGradient id="angle-dial-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.10)" />
          <stop offset="70%" stopColor="rgba(255,255,255,0.04)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      {!minimal && (
        <>
          <circle
            cx={CENTER}
            cy={CENTER}
            r={OUTER_RADIUS}
            fill="url(#angle-dial-bg)"
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={OUTER_RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth={1.5}
          />

          {ticks.map((deg) => {
            const major = deg % 90 === 0;
            const mid = !major && deg % 30 === 0;
            const inner = polarToCartesian(
              deg,
              OUTER_RADIUS - (major ? 11 : mid ? 7 : 4),
            );
            const outer = polarToCartesian(deg, OUTER_RADIUS);
            return (
              <line
                key={deg}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke={
                  major ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.3)"
                }
                strokeWidth={major ? 2 : 1}
                strokeLinecap="round"
              />
            );
          })}
        </>
      )}

      {targetPos && showTarget && (
        <g>
          <line
            x1={CENTER}
            y1={CENTER}
            x2={targetPos.x}
            y2={targetPos.y}
            stroke="white"
            strokeWidth={4}
            strokeLinecap="round"
          />
          {!minimal && (
            <circle
              cx={targetPos.x}
              cy={targetPos.y}
              r={HANDLE_RADIUS - 2}
              fill="white"
            />
          )}
        </g>
      )}

      {showPlayer && (
        <g>
          <line
            x1={CENTER}
            y1={CENTER}
            x2={playerPos.x}
            y2={playerPos.y}
            stroke="rgba(125,211,252,0.95)"
            strokeWidth={4}
            strokeLinecap="round"
          />
          <circle
            cx={playerPos.x}
            cy={playerPos.y}
            r={HANDLE_RADIUS}
            fill="rgba(125,211,252,1)"
            stroke="white"
            strokeWidth={2}
          />
        </g>
      )}

      {!minimal && (
        <circle cx={CENTER} cy={CENTER} r={INNER_RADIUS / 2} fill="white" />
      )}
    </svg>
  );
}
