import "server-only";

import postgres from "postgres";
import { assertSupabaseEnv } from "@/lib/config/backend";

let sqlClient: postgres.Sql | null = null;

export function getPostgres(): postgres.Sql {
  assertSupabaseEnv();
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required when ELEVO_BACKEND=supabase");
  }
  if (!sqlClient) {
    sqlClient = postgres(url, {
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
    });
  }
  return sqlClient;
}

export function newId(): string {
  return crypto.randomUUID();
}
