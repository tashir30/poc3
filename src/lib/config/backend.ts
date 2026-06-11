import "server-only";

export type ElevoBackend = "sqlite" | "supabase";

export function getElevoBackend(): ElevoBackend {
  const value = process.env.ELEVO_BACKEND?.trim().toLowerCase();
  return value === "supabase" ? "supabase" : "sqlite";
}

export function isSqliteBackend(): boolean {
  return getElevoBackend() === "sqlite";
}

export function isSupabaseBackend(): boolean {
  return getElevoBackend() === "supabase";
}

export function assertSupabaseEnv(): void {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required when ELEVO_BACKEND=supabase");
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required when ELEVO_BACKEND=supabase");
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required when ELEVO_BACKEND=supabase");
  }
}
