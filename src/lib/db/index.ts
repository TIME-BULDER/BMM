import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { serverEnv } from "@/lib/env/server";

import * as schema from "./schema";

/**
 * Une seule connexion est réutilisée entre les invocations en
 * développement pour éviter d'épuiser le pool lors du hot reload.
 */
const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof postgres> | undefined;
};

const client =
  globalForDb.client ?? postgres(serverEnv.DATABASE_URL, { prepare: false });

if (serverEnv.NODE_ENV !== "production") {
  globalForDb.client = client;
}

export const db = drizzle(client, { schema });

export type Database = typeof db;
