import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import ColorGame from "@/app/color/color-game";
import { type Color } from "@/app/color/game-state";
import { getDb } from "@/db";
import { teamGames } from "@/db/schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Team Color",
  description: "Eine private Team-Lobby für das Color-Spiel.",
  robots: { index: false, follow: false, nocache: true },
};

export default async function TeamGamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await getDb();
  const rows = await db
    .select({
      id: teamGames.id,
      targetsJson: teamGames.targetsJson,
    })
    .from(teamGames)
    .where(eq(teamGames.id, id))
    .limit(1);

  if (rows.length === 0) notFound();

  const targets = JSON.parse(rows[0].targetsJson) as Color[];

  return (
    <ColorGame mode="team-participant" gameId={id} initialTargets={targets} />
  );
}
