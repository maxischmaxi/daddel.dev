import { nanoid } from "nanoid";

import { getDb } from "@/db";
import { timeTeamGames, timeTeamScores } from "@/db/schema";
import {
  jsonError,
  parseClientId,
  parseDurationArray,
  parseName,
  parseScoresArray,
  parseTimeTargetArray,
  parseTotal,
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
    const targets = parseTimeTargetArray(o.targets, 5);
    const creator = o.creatorScore as Record<string, unknown> | undefined;
    if (!creator || typeof creator !== "object")
      throw new ValidationError("creatorScore required");
    const total = parseTotal(creator.total);
    const scores = parseScoresArray(creator.scores, 5);
    const guesses = parseDurationArray(creator.guesses, 5);

    const db = await getDb();
    const now = Date.now();
    const id = nanoid(10);

    await db.batch([
      db.insert(timeTeamGames).values({
        id,
        createdAt: now,
        creatorName: name,
        creatorClientId: clientId,
        targetsJson: JSON.stringify(targets),
      }),
      db.insert(timeTeamScores).values({
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
    console.error("POST /api/time/team failed", e);
    return jsonError("internal", 500);
  }
}
