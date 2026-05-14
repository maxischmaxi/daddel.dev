export const CUBE_ACTION_BASE =
  "touch-manipulation rounded-full bg-white text-cube-dark border border-[hsl(220_13%_78%)] shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:bg-[hsl(210_40%_96.1%)] hover:text-cube-dark active:scale-96 focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--background),0_0_0_4px_var(--ring)] transition-all duration-150";

export const AURORA_GRADIENT =
  "conic-gradient(from var(--aurora-angle), hsl(0,100%,60%), hsl(60,100%,60%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,65%), hsl(300,100%,60%), hsl(360,100%,60%))";

export function buildShareUrl(id: string): string {
  if (typeof window === "undefined") return `/angle/t/${id}`;
  return `${window.location.origin}/angle/t/${id}`;
}
