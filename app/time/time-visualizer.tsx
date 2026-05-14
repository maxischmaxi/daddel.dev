"use client";

import { useMemo, type CSSProperties } from "react";

import { cn } from "@/lib/utils";

import { type TimeTarget } from "./game-state";

type SpiralKind = "archimedean" | "logarithmic" | "fermat" | "rose";

type Spiral = {
  id: string;
  d: string;
  strokeWidth: number;
  opacity: number;
  hueMix: number;
  dashOn: number;
  dashOff: number;
  flowDuration: number;
  flowReverse: boolean;
};

type RotatingLayer = {
  spinDuration: number;
  spinReverse: boolean;
  spirals: Spiral[];
};

type OrbitTrail = {
  id: string;
  radius: number;
  size: number;
  opacity: number;
  hueMix: number;
  rotateDuration: number;
  reverse: boolean;
  startAngle: number;
  trailLength: number;
  trailGap: number;
};

type Scene = {
  mainLayer: RotatingLayer;
  accentLayer: RotatingLayer;
  tendrils: Spiral[];
  orbits: OrbitTrail[];
};

const mulberry32 = (seed: number) => {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
};

const range = (rand: () => number, min: number, max: number) =>
  min + rand() * (max - min);

const randInt = (rand: () => number, min: number, max: number) =>
  Math.floor(rand() * (max - min + 1)) + min;

const pick = <T,>(rand: () => number, arr: readonly T[]): T =>
  arr[Math.floor(rand() * arr.length)] as T;

function buildPath(
  kind: SpiralKind,
  options: {
    cx: number;
    cy: number;
    maxR: number;
    turns: number;
    thetaOffset: number;
    direction: 1 | -1;
    petals?: number;
    samples?: number;
  },
): string {
  const {
    cx,
    cy,
    maxR,
    turns,
    thetaOffset,
    direction,
    petals = 3,
    samples = 240,
  } = options;

  let d = "";
  let started = false;

  if (kind === "rose") {
    const points = Math.max(samples, 320);
    for (let i = 0; i <= points; i++) {
      const t = (i / points) * Math.PI * 2;
      const r = Math.abs(Math.cos(petals * t)) * maxR;
      const theta = thetaOffset + t * direction;
      const x = cx + r * Math.cos(theta);
      const y = cy + r * Math.sin(theta);
      d += started
        ? `L${x.toFixed(2)},${y.toFixed(2)}`
        : `M${x.toFixed(2)},${y.toFixed(2)}`;
      started = true;
    }
    return d;
  }

  const tMax = turns * Math.PI * 2;
  let computeR: (t: number) => number;
  if (kind === "archimedean") {
    computeR = (t) => (maxR / tMax) * t;
  } else if (kind === "logarithmic") {
    const a = 0.4;
    const b = Math.log(maxR / a) / tMax;
    computeR = (t) => a * Math.exp(b * t);
  } else {
    computeR = (t) => maxR * Math.sqrt(t / tMax);
  }

  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * tMax;
    const r = computeR(t);
    const theta = thetaOffset + t * direction;
    const x = cx + r * Math.cos(theta);
    const y = cy + r * Math.sin(theta);
    d += started
      ? `L${x.toFixed(2)},${y.toFixed(2)}`
      : `M${x.toFixed(2)},${y.toFixed(2)}`;
    started = true;
  }
  return d;
}

function buildSpiral(
  rand: () => number,
  speed: number,
  variant: "main" | "tendril" | "accent",
  id: string,
): Spiral {
  const kinds: readonly SpiralKind[] =
    variant === "tendril"
      ? ["logarithmic", "fermat", "rose", "archimedean"]
      : ["archimedean", "logarithmic", "fermat"];
  const kind = pick(rand, kinds);

  let cx = 50;
  let cy = 50;
  let maxR: number;
  let turns: number;
  let petals = 3;

  if (variant === "main") {
    maxR = range(rand, 40, 72);
    turns = range(rand, 3.5, 7.5);
  } else if (variant === "accent") {
    maxR = range(rand, 22, 44);
    turns = range(rand, 2.5, 5);
  } else {
    cx = range(rand, 18, 82);
    cy = range(rand, 18, 82);
    maxR = range(rand, 12, 30);
    turns = range(rand, 1.5, 3.5);
    petals = randInt(rand, 3, 6);
  }

  const thetaOffset = range(rand, 0, Math.PI * 2);
  const direction: 1 | -1 = rand() < 0.5 ? 1 : -1;
  const d = buildPath(kind, {
    cx,
    cy,
    maxR,
    turns,
    thetaOffset,
    direction,
    petals,
  });

  const dashOn = range(rand, 4, 14);
  const dashOff = range(rand, 6, 22);

  const variantSpeedScale =
    variant === "main" ? 1 : variant === "accent" ? 0.7 : 1.5;
  const flowDuration = (range(rand, 5, 13) * variantSpeedScale) / speed;

  const strokeMin = variant === "main" ? 0.55 : 0.35;
  const strokeMax = variant === "main" ? 1.35 : 1.0;
  const opacityMin = variant === "tendril" ? 0.18 : 0.32;
  const opacityMax = variant === "tendril" ? 0.5 : 0.82;

  return {
    id,
    d,
    strokeWidth: range(rand, strokeMin, strokeMax),
    opacity: range(rand, opacityMin, opacityMax),
    hueMix: rand(),
    dashOn,
    dashOff,
    flowDuration,
    flowReverse: rand() < 0.5,
  };
}

function buildScene(target: TimeTarget): Scene {
  const rand = mulberry32(target.pattern.seed);
  const speed = target.pattern.speed;

  const mainSpirals = Array.from({ length: 3 }, (_, i) =>
    buildSpiral(rand, speed, "main", `m${i}`),
  );
  const accentSpirals = Array.from({ length: 2 }, (_, i) =>
    buildSpiral(rand, speed, "accent", `a${i}`),
  );
  const tendrils = Array.from({ length: randInt(rand, 2, 4) }, (_, i) =>
    buildSpiral(rand, speed, "tendril", `t${i}`),
  );

  const orbits: OrbitTrail[] = Array.from(
    { length: randInt(rand, 4, 7) },
    (_, i) => ({
      id: `o${i}`,
      radius: range(rand, 14, 64),
      size: range(rand, 0.7, 1.9),
      opacity: range(rand, 0.65, 1),
      hueMix: rand(),
      rotateDuration: range(rand, 6, 18) / speed,
      reverse: rand() < 0.5,
      startAngle: range(rand, 0, 360),
      trailLength: randInt(rand, 4, 7),
      trailGap: range(rand, 0.025, 0.06),
    }),
  );

  return {
    mainLayer: {
      spinDuration: range(rand, 28, 44) / speed,
      spinReverse: rand() < 0.5,
      spirals: mainSpirals,
    },
    accentLayer: {
      spinDuration: range(rand, 14, 22) / speed,
      spinReverse: rand() < 0.5,
      spirals: accentSpirals,
    },
    tendrils,
    orbits,
  };
}

function layerSpin(layer: RotatingLayer, active: boolean): CSSProperties {
  return {
    transformBox: "view-box",
    transformOrigin: "center",
    animation: active
      ? `time-spiral-spin ${layer.spinDuration}s linear infinite`
      : undefined,
    animationDirection: layer.spinReverse ? "reverse" : "normal",
  };
}

function SpiralPath({
  spiral,
  color,
  active,
}: {
  spiral: Spiral;
  color: string;
  active: boolean;
}) {
  const dashTotal = spiral.dashOn + spiral.dashOff;
  const flowEnd = -Math.round(dashTotal * 6);
  const animationStyle = active
    ? ({
        animation: `time-spiral-flow ${spiral.flowDuration}s linear infinite`,
        animationDirection: spiral.flowReverse ? "reverse" : "normal",
        "--time-flow-end": `${flowEnd}`,
      } as CSSProperties & Record<"--time-flow-end", string>)
    : undefined;

  return (
    <path
      d={spiral.d}
      fill="none"
      stroke={color}
      strokeWidth={spiral.strokeWidth}
      strokeLinecap="round"
      strokeOpacity={spiral.opacity}
      strokeDasharray={`${spiral.dashOn.toFixed(2)} ${spiral.dashOff.toFixed(2)}`}
      data-time-motion
      style={animationStyle}
    />
  );
}

type Props = {
  target: TimeTarget;
  active: boolean;
  pressed?: boolean;
  className?: string;
};

export function TimeVisualizer({
  target,
  active,
  pressed,
  className,
}: Props) {
  const scene = useMemo(() => buildScene(target), [target]);

  const baseId = `time-${target.pattern.seed}`;
  const primaryColor = `hsl(${target.pattern.hue} 100% 72%)`;
  const accentColor = `hsl(${target.pattern.accentHue} 100% 70%)`;
  const deepHue = (target.pattern.hue + 300) % 360;
  const deepColor = `hsl(${deepHue} 80% 32%)`;

  const mixColor = (mix: number): string =>
    mix < 0.5 ? primaryColor : accentColor;

  const pulsePeriod = 1 / target.pulseHz;
  const corePulseSec = pulsePeriod * 1.8;
  const ringBreathSec = pulsePeriod * 2.6;
  const irisPulseSec = pulsePeriod * 1.2;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        pressed && "opacity-95",
        className,
      )}
      aria-hidden="true"
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id={`${baseId}-bg`} cx="50%" cy="50%" r="72%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.42" />
            <stop offset="32%" stopColor={accentColor} stopOpacity="0.22" />
            <stop offset="68%" stopColor={deepColor} stopOpacity="0.14" />
            <stop offset="100%" stopColor="black" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${baseId}-bg2`} cx="32%" cy="28%" r="55%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.22" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${baseId}-bg3`} cx="72%" cy="78%" r="48%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.18" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${baseId}-core`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.92" />
            <stop offset="28%" stopColor={primaryColor} stopOpacity="0.62" />
            <stop offset="62%" stopColor={accentColor} stopOpacity="0.24" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="100" height="100" fill={`url(#${baseId}-bg)`} />
        <rect
          width="100"
          height="100"
          fill={`url(#${baseId}-bg2)`}
          style={{ mixBlendMode: "screen" }}
        />
        <rect
          width="100"
          height="100"
          fill={`url(#${baseId}-bg3)`}
          style={{ mixBlendMode: "screen" }}
        />

        <g>
          {scene.tendrils.map((s) => (
            <SpiralPath
              key={s.id}
              spiral={s}
              color={mixColor(s.hueMix)}
              active={active}
            />
          ))}
        </g>

        <g data-time-motion style={layerSpin(scene.mainLayer, active)}>
          {scene.mainLayer.spirals.map((s) => (
            <SpiralPath
              key={s.id}
              spiral={s}
              color={mixColor(s.hueMix)}
              active={active}
            />
          ))}
        </g>

        <g data-time-motion style={layerSpin(scene.accentLayer, active)}>
          {scene.accentLayer.spirals.map((s) => (
            <SpiralPath
              key={s.id}
              spiral={s}
              color={mixColor(s.hueMix)}
              active={active}
            />
          ))}
        </g>

        {scene.orbits.map((o) => {
          const baseDelay = -(o.startAngle / 360) * o.rotateDuration;
          const trailColor = mixColor(o.hueMix);
          return Array.from({ length: o.trailLength }, (_, i) => {
            const trailDelta =
              i * o.trailGap * o.rotateDuration * (o.reverse ? -1 : 1);
            const delay = baseDelay + trailDelta;
            const sizeFactor = Math.max(0.15, 1 - i * (0.82 / o.trailLength));
            const opFactor = Math.max(0, 1 - i * (0.95 / o.trailLength));
            return (
              <g
                key={`${o.id}-${i}`}
                data-time-motion
                style={{
                  transformBox: "view-box",
                  transformOrigin: "center",
                  animation: active
                    ? `time-spiral-spin ${o.rotateDuration}s linear ${delay.toFixed(3)}s infinite`
                    : undefined,
                  animationDirection: o.reverse ? "reverse" : "normal",
                }}
              >
                <circle
                  cx={50 + o.radius}
                  cy={50}
                  r={(o.size * sizeFactor).toFixed(2)}
                  fill={trailColor}
                  opacity={(o.opacity * opFactor).toFixed(2)}
                />
              </g>
            );
          });
        })}

        <g
          data-time-motion
          style={{
            transformBox: "view-box",
            transformOrigin: "center",
            animation: active
              ? `time-spiral-core ${corePulseSec}s ease-in-out infinite`
              : undefined,
          }}
        >
          <circle cx="50" cy="50" r="17" fill={`url(#${baseId}-core)`} />
        </g>

        <g
          data-time-motion
          style={{
            transformBox: "view-box",
            transformOrigin: "center",
            animation: active
              ? `time-spiral-ring ${ringBreathSec}s ease-in-out infinite`
              : undefined,
          }}
        >
          <circle
            cx="50"
            cy="50"
            r="8.5"
            fill="none"
            stroke="white"
            strokeOpacity="0.55"
            strokeWidth="0.6"
            strokeDasharray="0.9 2.8"
          />
        </g>

        <g
          data-time-motion
          style={{
            transformBox: "view-box",
            transformOrigin: "center",
            animation: active
              ? `time-spiral-ring ${ringBreathSec * 1.35}s ease-in-out -1.4s infinite`
              : undefined,
          }}
        >
          <circle
            cx="50"
            cy="50"
            r="14"
            fill="none"
            stroke="white"
            strokeOpacity="0.3"
            strokeWidth="0.45"
            strokeDasharray="1.3 4.6"
          />
        </g>

        <circle
          cx="50"
          cy="50"
          r="2.6"
          fill={primaryColor}
          opacity={pressed ? "0.98" : "0.78"}
          data-time-motion
          style={{
            transformBox: "view-box",
            transformOrigin: "center",
            animation: active
              ? `time-spiral-core ${irisPulseSec}s ease-in-out infinite`
              : undefined,
          }}
        />
      </svg>
    </div>
  );
}
