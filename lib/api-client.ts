import type { Color } from "@/app/color/game-state";

export type RankingEntry = {
  name: string;
  totalScore: number;
  clientId: string;
  rank: number;
  scores?: number[];
  guesses?: Color[];
  targets?: Color[];
};

export type GlobalRanking = {
  top: RankingEntry[];
  you: {
    rank: number;
    name: string;
    totalScore: number;
    scores?: number[];
    guesses?: Color[];
    targets?: Color[];
  } | null;
  neighbors: { above?: RankingEntry; below?: RankingEntry };
  total: number;
};

export type TeamLobbyEntry = {
  name: string;
  totalScore: number;
  clientId: string;
  rank: number;
  scores: number[];
  guesses: Color[];
};

export type TeamLobby = {
  id: string;
  createdAt: number;
  creatorName: string;
  targets: Color[];
  scores: TeamLobbyEntry[];
  yourRank: number | null;
  your: {
    totalScore: number;
    scores: number[];
    guesses: Color[];
  } | null;
};

async function asJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    let detail = text;
    try {
      const parsed = JSON.parse(text);
      detail = parsed.error ?? text;
    } catch {
      /* keep raw */
    }
    const err = new Error(`HTTP ${res.status}: ${detail}`) as Error & {
      status?: number;
    };
    err.status = res.status;
    throw err;
  }
  return JSON.parse(text) as T;
}

export async function postGlobalScore(input: {
  name: string;
  clientId: string;
  targets: Color[];
  guesses: Color[];
}): Promise<GlobalRanking> {
  const res = await fetch("/api/global", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return asJson<GlobalRanking>(res);
}

export async function fetchGlobalRanking(
  clientId?: string,
): Promise<GlobalRanking> {
  const url = clientId
    ? `/api/global?clientId=${encodeURIComponent(clientId)}`
    : "/api/global";
  const res = await fetch(url);
  return asJson<GlobalRanking>(res);
}

export async function createTeamGame(input: {
  name: string;
  clientId: string;
  targets: Color[];
  guesses: Color[];
}): Promise<{ id: string }> {
  const res = await fetch("/api/team", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return asJson<{ id: string }>(res);
}

export async function fetchTeamLobby(
  id: string,
  clientId?: string,
): Promise<TeamLobby> {
  const url = clientId
    ? `/api/team/${encodeURIComponent(id)}?clientId=${encodeURIComponent(clientId)}`
    : `/api/team/${encodeURIComponent(id)}`;
  const res = await fetch(url);
  return asJson<TeamLobby>(res);
}

export async function postTeamScore(
  id: string,
  input: {
    name: string;
    clientId: string;
    guesses: Color[];
  },
): Promise<TeamLobby> {
  const res = await fetch(`/api/team/${encodeURIComponent(id)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return asJson<TeamLobby>(res);
}

// --- Sound game ---

export type SoundRankingEntry = {
  name: string;
  totalScore: number;
  clientId: string;
  rank: number;
  scores?: number[];
  guesses?: number[];
  targets?: number[];
};

export type SoundGlobalRanking = {
  top: SoundRankingEntry[];
  you: {
    rank: number;
    name: string;
    totalScore: number;
    scores?: number[];
    guesses?: number[];
    targets?: number[];
  } | null;
  neighbors: { above?: SoundRankingEntry; below?: SoundRankingEntry };
  total: number;
};

export type SoundTeamLobbyEntry = {
  name: string;
  totalScore: number;
  clientId: string;
  rank: number;
  scores: number[];
  guesses: number[];
};

export type SoundTeamLobby = {
  id: string;
  createdAt: number;
  creatorName: string;
  targets: number[];
  scores: SoundTeamLobbyEntry[];
  yourRank: number | null;
  your: {
    totalScore: number;
    scores: number[];
    guesses: number[];
  } | null;
};

export async function postSoundGlobalScore(input: {
  name: string;
  clientId: string;
  total: number;
  targets: number[];
  scores: number[];
  guesses: number[];
}): Promise<SoundGlobalRanking> {
  const res = await fetch("/api/sound/global", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return asJson<SoundGlobalRanking>(res);
}

export async function fetchSoundGlobalRanking(
  clientId?: string,
): Promise<SoundGlobalRanking> {
  const url = clientId
    ? `/api/sound/global?clientId=${encodeURIComponent(clientId)}`
    : "/api/sound/global";
  const res = await fetch(url);
  return asJson<SoundGlobalRanking>(res);
}

export async function createSoundTeamGame(input: {
  name: string;
  clientId: string;
  targets: number[];
  creatorScore: { total: number; scores: number[]; guesses: number[] };
}): Promise<{ id: string }> {
  const res = await fetch("/api/sound/team", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return asJson<{ id: string }>(res);
}

export async function fetchSoundTeamLobby(
  id: string,
  clientId?: string,
): Promise<SoundTeamLobby> {
  const url = clientId
    ? `/api/sound/team/${encodeURIComponent(id)}?clientId=${encodeURIComponent(clientId)}`
    : `/api/sound/team/${encodeURIComponent(id)}`;
  const res = await fetch(url);
  return asJson<SoundTeamLobby>(res);
}

export async function postSoundTeamScore(
  id: string,
  input: {
    name: string;
    clientId: string;
    total: number;
    scores: number[];
    guesses: number[];
  },
): Promise<SoundTeamLobby> {
  const res = await fetch(`/api/sound/team/${encodeURIComponent(id)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return asJson<SoundTeamLobby>(res);
}
