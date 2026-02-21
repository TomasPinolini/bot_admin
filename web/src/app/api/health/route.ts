import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return Response.json(
      { status: "healthy", timestamp: new Date().toISOString() },
      { status: 200 },
    );
  } catch (error) {
    return Response.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    );
  }
}
