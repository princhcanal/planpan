import { type PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import { env } from "../../env/server.mjs";
import postgres from "postgres";

declare global {
  // eslint-disable-next-line no-var
  var db: PostgresJsDatabase | undefined;
}

// for query purposes
const queryClient = postgres(env.DATABASE_URL, { max: 1 });
export const db: PostgresJsDatabase =
  global.db || drizzle(queryClient, { logger: env.NODE_ENV === "development" });

if (env.NODE_ENV === "production") {
  global.db = db;
}
