import type { Color } from "@/app/color/game-state";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

const NAME_MAX = 32;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseName(v: unknown): string {
  if (typeof v !== "string") throw new ValidationError("name must be a string");
  const trimmed = v.trim();
  if (trimmed.length === 0) throw new ValidationError("name is required");
  if (trimmed.length > NAME_MAX)
    throw new ValidationError(`name exceeds ${NAME_MAX} chars`);
  return trimmed;
}

export function parseClientId(v: unknown): string {
  if (typeof v !== "string" || !UUID_RE.test(v))
    throw new ValidationError("clientId must be a uuid");
  return v;
}

export function parseColor(v: unknown): Color {
  if (typeof v !== "object" || v === null)
    throw new ValidationError("color must be an object");
  const o = v as Record<string, unknown>;
  const { h, s, l } = o;
  if (
    typeof h !== "number" ||
    typeof s !== "number" ||
    typeof l !== "number" ||
    !Number.isFinite(h) ||
    !Number.isFinite(s) ||
    !Number.isFinite(l) ||
    h < 0 ||
    h > 360 ||
    s < 0 ||
    s > 100 ||
    l < 0 ||
    l > 100
  ) {
    throw new ValidationError("invalid color");
  }
  return { h, s, l };
}

export function parseColorArray(v: unknown, length: number): Color[] {
  if (!Array.isArray(v) || v.length !== length)
    throw new ValidationError(`expected array of length ${length}`);
  return v.map((c) => parseColor(c));
}

export function parseTotal(v: unknown): number {
  if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 50)
    throw new ValidationError("total out of range");
  return v;
}

export function parseScoresArray(v: unknown, length: number): number[] {
  if (!Array.isArray(v) || v.length !== length)
    throw new ValidationError(`expected score array of length ${length}`);
  return v.map((n) => {
    if (typeof n !== "number" || !Number.isFinite(n) || n < 0 || n > 10)
      throw new ValidationError("invalid score value");
    return n;
  });
}

const HZ_MIN = 20;
const HZ_MAX = 20000;

export function parseFrequency(v: unknown): number {
  if (
    typeof v !== "number" ||
    !Number.isFinite(v) ||
    v < HZ_MIN ||
    v > HZ_MAX
  )
    throw new ValidationError("invalid frequency");
  return v;
}

export function parseFrequencyArray(v: unknown, length: number): number[] {
  if (!Array.isArray(v) || v.length !== length)
    throw new ValidationError(`expected frequency array of length ${length}`);
  return v.map(parseFrequency);
}
