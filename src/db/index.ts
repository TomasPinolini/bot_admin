import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";
import { getConfig } from "../utils/config.js";

let _db: PostgresJsDatabase<typeof schema> | null = null;

export function getDb(): PostgresJsDatabase<typeof schema> {
  if (!_db) {
    const config = getConfig();
    const client = postgres(config.databaseUrl, { max: 1 });
    _db = drizzle(client, { schema });
  }
  return _db;
}

/** Convenience alias — lazily initializes the DB connection. */
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});

export { schema };
