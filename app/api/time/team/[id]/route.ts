import { asc, desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { timeTeamGames, timeTeamScores } from "@/db/schema";
import {
  jsonError,
  parseClientId,
  parseDurationArray,
  parseName,
  parseScoresArray,
  parseTotal,
  ValidationError,
} from "@/lib/api-validation";

import type {
  TimeTeamLobby,
  TimeTeamLobbyEntry,
} from "@/lib/api-client";
import type { TimeTarget } from "@/app/time/game-state";

export const dynamic = "force-dynamic";

async function buildLobby(
  id: string,
  clientId: string | null,
): Promise<TimeTeamLobby | null> {
  const db = await getDb();
  const games = await db
    .select()
    .from(timeTeamGames)
    .where(eq(timeTeamGames.id, id))
    .limit(1);
  if (games.length === 0) return null;
  const game = games[0];

  const scoresRows = await db
    .select({
      name: timeTeamScores.name,
      totalScore: timeTeamScores.totalScore,
      clientId: timeTeamScores.clientId,
      scoresJson: timeTeamScores.scoresJson,
      guessesJson: timeTeamScores.guessesJson,
      createdAt: timeTeamScores.createdAt,
    })
    .from(timeTeamScores)
    .where(eq(timeTeamScores.gameId, id))
    .orderBy(desc(timeTeamScores.totalScore), asc(timeTeamScores.createdAt));

  const entries: TimeTeamLobbyEntry[] = scoresRows.map((row, i) => ({
    name: row.name,
    totalScore: row.totalScore,
    clientId: row.clientId,
    rank: i + 1,
    scores: JSON.parse(row.scoresJson) as number[],
    guesses: JSON.parse(row.guessesJson) as number[],
  }));

  let yourRank: number | null = null;
  let your: TimeTeamLobby["your"] = null;
  if (clientId) {
    const idx = scoresRows.findIndex((r) => r.clientId === clientId);
    if (idx >= 0) {
      const row = scoresRows[idx];
      yourRank = idx + 1;
      your = {
        totalScore: row.totalScore,
        scores: JSON.parse(row.scoresJson) as number[],
        guesses: JSON.parse(row.guessesJson) as number[],
      };
    }
  }

  const targets = JSON.parse(game.targetsJson) as TimeTarget[];

  return {
    id: game.id,
    createdAt: game.createdAt,
    creatorName: game.creatorName,
    targets,
    scores: entries,
    yourRank,
    your,
  };
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;
  const url = new URL(req.url);
  const clientId = url.searchParams.get("clientId");
  try {
    const lobby = await buildLobby(
      id,
      clientId && clientId.length > 0 ? clientId : null,
    );
    if (!lobby) return jsonError("not_found", 404);
    return Response.json(lobby);
  } catch (e) {
    console.error("GET /api/time/team/[id] failed", e);
    return jsonError("internal", 500);
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("invalid json", 400);
  }

  let name: string;
  let clientId: string;
  let total: number;
  let scores: number[];
  let guesses: number[];
  try {
    const o = body as Record<string, unknown>;
    name = parseName(o.name);
    clientId = parseClientId(o.clientId);
    total = parseTotal(o.total);
    scores = parseScoresArray(o.scores, 5);
    guesses = parseDurationArray(o.guesses, 5);
  } catch (e) {
    if (e instanceof ValidationError) return jsonError(e.message, 400);
    return jsonError("invalid body", 400);
  }

  try {
    const db = await getDb();
    const games = await db
      .select({ id: timeTeamGames.id })
      .from(timeTeamGames)
      .where(eq(timeTeamGames.id, id))
      .limit(1);
    if (games.length === 0) return jsonError("not_found", 404);

    try {
      await db.insert(timeTeamScores).values({
        gameId: id,
        clientId,
        name,
        totalScore: total,
        scoresJson: JSON.stringify(scores),
        guessesJson: JSON.stringify(guesses),
        createdAt: Date.now(),
      });
    } catch (insertErr) {
      const msg = String(insertErr instanceof Error ? insertErr.message : "");
      if (msg.includes("UNIQUE") || msg.includes("constraint")) {
        return jsonError("already_played", 409);
      }
      throw insertErr;
    }

    const lobby = await buildLobby(id, clientId);
    if (!lobby) return jsonError("not_found", 404);
    return Response.json(lobby);
  } catch (e) {
    console.error("POST /api/time/team/[id] failed", e);
    return jsonError("internal", 500);
  }
}
