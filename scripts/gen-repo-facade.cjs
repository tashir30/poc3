const fs = require("fs");
const src = fs.readFileSync("src/lib/db/sqlite-repo.ts", "utf8");
const fnNames = [...src.matchAll(/^export (async )?function (\w+)/gm)].map(
  (m) => m[2],
);

const header = `import "server-only";

import { isSupabaseBackend } from "@/lib/config/backend";

`;

const body = fnNames
  .map(
    (name) => `export async function ${name}(
  ...args: Parameters<(typeof import("./sqlite-repo"))["${name}"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.${name}(...(args as Parameters<(typeof postgres)["${name}"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.${name}(...(args as Parameters<(typeof sqlite)["${name}"]>));
}`,
  )
  .join("\n\n");

fs.writeFileSync("src/lib/db/repo.ts", header + body + "\n");
console.log("Generated", fnNames.length, "exports with dynamic imports");
