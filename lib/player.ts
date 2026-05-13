const NAME_KEY = "browser-games:player-name";
export const CLIENT_ID_KEY = "browser-games:client-id";

const MAX_NAME_LENGTH = 32;

export function sanitizeName(raw: string): string {
  return raw.trim().slice(0, MAX_NAME_LENGTH);
}

export function getStoredName(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(NAME_KEY);
    if (!v) return null;
    const trimmed = v.trim();
    return trimmed.length > 0 ? trimmed : null;
  } catch {
    return null;
  }
}

export function setStoredName(name: string): void {
  if (typeof window === "undefined") return;
  const clean = sanitizeName(name);
  if (clean.length === 0) return;
  try {
    window.localStorage.setItem(NAME_KEY, clean);
  } catch {
    /* ignore quota / privacy mode */
  }
}

export function getClientId(): string {
  if (typeof window === "undefined") {
    throw new Error("getClientId must be called client-side");
  }
  try {
    const existing = window.localStorage.getItem(CLIENT_ID_KEY);
    if (existing && existing.length > 0) return existing;
  } catch {
    /* fall through */
  }
  const fresh = crypto.randomUUID();
  try {
    window.localStorage.setItem(CLIENT_ID_KEY, fresh);
  } catch {
    /* still return — caller gets a usable id even if persistence failed */
  }
  return fresh;
}

export function readStoredClientId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(CLIENT_ID_KEY);
    return v && v.length > 0 ? v : null;
  } catch {
    return null;
  }
}
