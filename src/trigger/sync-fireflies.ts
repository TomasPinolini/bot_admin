import { logger, schedules } from "@trigger.dev/sdk/v3";
import { getRecentTranscripts } from "./lib/fireflies-client.js";
import { db } from "../db/index.js";
import * as schema from "../db/schema.js";
import { generateId } from "../utils/id.js";
import { sql } from "drizzle-orm";
import { extractMeetingTask } from "./extract-meeting.js";

export const syncFirefliesTask = schedules.task({
  id: "sync-fireflies",
  cron: "*/15 * * * *",
  maxDuration: 120,
  run: async () => {
    // 1. Get watermark: MAX(meeting_date) FROM meetings, default 30 days ago
    const [{ maxDate }] = await db
      .select({
        maxDate: sql<Date | null>`max(${schema.meetings.meetingDate})`,
      })
      .from(schema.meetings);

    const sinceDate =
      maxDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    logger.info("Fetching transcripts since", {
      sinceDate: sinceDate.toISOString(),
    });

    // 2. Fetch from Fireflies
    const transcripts = await getRecentTranscripts(sinceDate);
    logger.info(`Found ${transcripts.length} transcripts`);

    if (transcripts.length === 0) {
      return { synced: 0 };
    }

    // 3. Upsert meetings
    let newCount = 0;
    for (const t of transcripts) {
      const meetingId = generateId("meeting");
      const result = await db
        .insert(schema.meetings)
        .values({
          id: meetingId,
          firefliesTranscriptId: t.id,
          title: t.title,
          meetingDate: t.date ? new Date(t.date) : null,
          duration: t.duration ?? null,
          participants: t.participants ?? [],
          aiSummary: t.summary?.overview ?? null,
          status: "pending_extraction",
        })
        .onConflictDoNothing({ target: schema.meetings.firefliesTranscriptId })
        .returning({ id: schema.meetings.id });

      // 4. Trigger extraction for new meetings only
      if (result.length > 0) {
        newCount++;
        await extractMeetingTask.trigger({ meetingId: result[0].id });
        logger.info(`Triggered extraction for meeting: ${t.title}`);
      }
    }

    logger.info(`Synced ${newCount} new meetings`);
    return { synced: newCount, total: transcripts.length };
  },
});
