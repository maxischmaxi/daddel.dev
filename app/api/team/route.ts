import { nanoid } from "nanoid";

import { scoreRound } from "@/app/color/game-state";
import { getDb } from "@/db";
import { teamGames, teamScores } from "@/db/schema";
import {
  jsonError,
  parseClientId,
  parseColorArray,
  parseName,
  ValidationError,
} from "@/lib/api-validation";

export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("invalid json", 400);
  }

  try {
    const o = body as Record<string, unknown>;
    const name = parseName(o.name);
    const clientId = parseClientId(o.clientId);
    const targets = parseColorArray(o.targets, 5);
    const guesses = parseColorArray(o.guesses, 5);
    const scores = targets.map((t, i) => scoreRound(t, guesses[i]));
    const total = scores.reduce((a, b) => a + b, 0);

    const db = await getDb();
    const now = Date.now();
    const id = nanoid(10);

    await db.batch([
      db.insert(teamGames).values({
        id,
        createdAt: now,
        creatorName: name,
        creatorClientId: clientId,
        targetsJson: JSON.stringify(targets),
      }),
      db.insert(teamScores).values({
        gameId: id,
        clientId,
        name,
        totalScore: total,
        scoresJson: JSON.stringify(scores),
        guessesJson: JSON.stringify(guesses),
        createdAt: now,
      }),
    ]);

    return Response.json({ id });
  } catch (e) {
    if (e instanceof ValidationError) return jsonError(e.message, 400);
    console.error("POST /api/team failed", e);
    return jsonError("internal", 500);
  }
}
