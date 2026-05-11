import type { Metadata } from "next";

import ColorGame from "./color/color-game";

export const metadata: Metadata = {
  title: "Color",
};

export default function HomePage() {
  return <ColorGame />;
}
