import "dotenv/config";

export interface AppConfig {
  databaseUrl: string;
}

export function getConfig(): AppConfig {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error(
      "Missing DATABASE_URL environment variable.\n" +
        "Copy .env.example to .env and fill in your Supabase connection string."
    );
    process.exit(1);
  }

  return { databaseUrl };
}
