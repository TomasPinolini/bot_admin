import { eq, desc } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { generateId } from "../utils/id.js";
import type { CreateProgressLogInput } from "../types/progress.types.js";

const { progressLogs } = schema;

export async function createProgressLog(input: CreateProgressLogInput) {
  const id = generateId("progress");
  const [log] = await db
    .insert(progressLogs)
    .values({
      id,
      projectId: input.projectId,
      phase: input.phase,
      status: input.status ?? "in_progress",
      note: input.note || null,
      loggedBy: input.loggedBy || null,
    })
    .returning();
  return log;
}

export async function getTimeline(projectId: string) {
  return db
    .select()
    .from(progressLogs)
    .where(eq(progressLogs.projectId, projectId))
    .orderBy(desc(progressLogs.loggedAt));
}
