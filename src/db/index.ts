import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";
import * as schema from "./schema.js";
import { getConfig } from "../utils/config.js";

let _db: PostgresJsDatabase<typeof schema> | null = null;
let _client: Sql | null = null;

export function getDb(): PostgresJsDatabase<typeof schema> {
  if (!_db) {
    const config = getConfig();
    _client = postgres(config.databaseUrl, { max: 1 });
    _db = drizzle(_client, { schema });
  }
  return _db;
}

export async function closeDb(): Promise<void> {
  if (_client) {
    await _client.end();
    _client = null;
    _db = null;
  }
}

/** Convenience alias — lazily initializes the DB connection. */
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});

export { schema };
