"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useSyncExternalStore } from "react";

import {
  isAudioMuted,
  setAudioMuted,
  subscribeAudioMuted,
} from "@/lib/audio";
import { useDict } from "@/lib/i18n/use-t";

const getServerSnapshot = () => false;

export default function AudioToggle() {
  const dict = useDict();
  const muted = useSyncExternalStore(
    subscribeAudioMuted,
    isAudioMuted,
    getServerSnapshot,
  );

  const label = muted ? dict.common.audioUnmute : dict.common.audioMute;

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={muted}
      onClick={() => setAudioMuted(!muted)}
      className="relative inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {muted ? (
        <VolumeX className="size-4" />
      ) : (
        <Volume2 className="size-4" />
      )}
      <span className="sr-only">{label}</span>
    </button>
  );
}
