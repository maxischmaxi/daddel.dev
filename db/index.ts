import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";

import * as schema from "./schema";

export type DB = DrizzleD1Database<typeof schema>;

export async function getDb(): Promise<DB> {
  const { env } = await getCloudflareContext({ async: true });
  return drizzle(env.DB, { schema });
}
