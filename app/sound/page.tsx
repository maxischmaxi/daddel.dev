import type { Metadata } from "next";

import SoundGame from "./sound-game";

export const metadata: Metadata = {
  title: "Sound",
};

export default function SoundPage() {
  return <SoundGame />;
}
