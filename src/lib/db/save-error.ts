import "server-only";

export function mapSaveError(err: unknown): string {
  if (!(err instanceof Error)) {
    return "Could not save changes. Try again in a moment.";
  }

  const msg = err.message;

  if (msg.includes("instagram_url") || msg.includes("42703")) {
    return "Database schema is out of date. Run Supabase migration 004_business_instagram.sql, then try again.";
  }

  if (
    msg.includes("SQLITE_BUSY") ||
    msg.includes("database is locked") ||
    msg.includes("SQLITE_IOERR")
  ) {
    return "Database is locked (OneDrive sync can cause this). Pause sync, wait a few seconds, and try again.";
  }

  if (msg.includes("READONLY") || msg.includes("SQLITE_READONLY")) {
    return "Database is read-only. On Vercel, set ELEVO_BACKEND=supabase with a writable DATABASE_URL.";
  }

  if (msg.includes("DATABASE_URL is required") || msg.includes("SUPABASE")) {
    return "Database is not configured. Check ELEVO_BACKEND and DATABASE_URL in your environment.";
  }

  if (process.env.NODE_ENV === "development") {
    return `Save failed: ${msg}`;
  }

  return "Could not save changes. Try again in a moment.";
}
