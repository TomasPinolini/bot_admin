import { logger, task } from "@trigger.dev/sdk/v3";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "../db/index.js";
import * as schema from "../db/schema.js";
import { generateId } from "../utils/id.js";
import { eq } from "drizzle-orm";
import {
  extractionSchema,
  extractionToolSchema,
  SYSTEM_PROMPT,
  type ExtractionResult,
} from "./lib/extraction-prompt.js";
import { matchEntities } from "./lib/entity-matcher.js";

export const extractMeetingTask = task({
  id: "extract-meeting",
  maxDuration: 120,
  run: async (payload: { meetingId: string }) => {
    const { meetingId } = payload;

    // 1. Load meeting
    const [meeting] = await db
      .select()
      .from(schema.meetings)
      .where(eq(schema.meetings.id, meetingId))
      .limit(1);

    if (!meeting) {
      throw new Error(`Meeting not found: ${meetingId}`);
    }

    if (!meeting.aiSummary) {
      logger.warn("Meeting has no AI summary, skipping extraction", {
        meetingId,
      });
      await db
        .update(schema.meetings)
        .set({ status: "extraction_failed", updatedAt: new Date() })
        .where(eq(schema.meetings.id, meetingId));
      return { status: "skipped", reason: "no_summary" };
    }

    logger.info(`Extracting data from meeting: ${meeting.title}`);

    // 2. Call Claude with tool_use
    const anthropic = new Anthropic();

    let extraction: ExtractionResult;
    try {
      extraction = await callClaude(anthropic, meeting.aiSummary);
    } catch (firstError) {
      logger.warn("First extraction attempt failed, retrying with error context", {
        error: String(firstError),
      });

      try {
        extraction = await callClaude(
          anthropic,
          meeting.aiSummary,
          `Previous extraction failed with: ${String(firstError)}. Please try again, ensuring all required fields are present and properly formatted.`
        );
      } catch (secondError) {
        logger.error("Extraction failed after retry", {
          error: String(secondError),
        });
        await db
          .update(schema.meetings)
          .set({ status: "extraction_failed", updatedAt: new Date() })
          .where(eq(schema.meetings.id, meetingId));
        return { status: "extraction_failed", error: String(secondError) };
      }
    }

    // 3. Create extraction record
    const extractionId = generateId("meetingExtraction");
    await db.insert(schema.meetingExtractions).values({
      id: extractionId,
      meetingId,
      rawExtraction: extraction,
      status: "extracted",
    });

    // 4. Update meeting status
    await db
      .update(schema.meetings)
      .set({ status: "extracted", updatedAt: new Date() })
      .where(eq(schema.meetings.id, meetingId));

    // 5. Run entity matching
    logger.info("Running entity matching...");
    const matchSuggestions = await matchEntities(extraction);

    // 6. Update extraction with match suggestions
    await db
      .update(schema.meetingExtractions)
      .set({
        matchSuggestions,
        status: "ready_for_review",
        updatedAt: new Date(),
      })
      .where(eq(schema.meetingExtractions.id, extractionId));

    // 7. Update meeting status
    await db
      .update(schema.meetings)
      .set({ status: "ready_for_review", updatedAt: new Date() })
      .where(eq(schema.meetings.id, meetingId));

    logger.info("Extraction and matching complete", { meetingId, extractionId });
    return { status: "ready_for_review", extractionId };
  },
});

async function callClaude(
  anthropic: Anthropic,
  summary: string,
  retryContext?: string
): Promise<ExtractionResult> {
  const userContent = retryContext
    ? `${retryContext}\n\nMeeting transcript summary:\n${summary}`
    : `Meeting transcript summary:\n${summary}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    tools: [extractionToolSchema],
    tool_choice: { type: "tool", name: "extract_meeting_data" },
    messages: [{ role: "user", content: userContent }],
  });

  // Find the tool_use block
  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("No tool_use block in Claude response");
  }

  // Validate with Zod
  const parsed = extractionSchema.safeParse(toolUse.input);
  if (!parsed.success) {
    throw new Error(
      `Zod validation failed: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ")}`
    );
  }

  return parsed.data;
}
