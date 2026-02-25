import Link from "next/link";
import { notFound } from "next/navigation";
import { getMeetingForReview } from "@/lib/queries";
import { MeetingStatusBadge } from "@/components/meetings/meeting-status-badge";
import { ExtractionReview } from "@/components/meetings/extraction-review";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MeetingReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getMeetingForReview(id);
  if (!data) notFound();

  const { meeting, extraction, catalog } = data;
  const participants = Array.isArray(meeting.participants)
    ? (meeting.participants as string[])
    : [];

  return (
    <div className="flex flex-col gap-6 p-8 px-10 h-full overflow-y-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/meetings"
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          Meetings
        </Link>
        <span className="text-text-muted">/</span>
        <span className="text-text-primary truncate max-w-sm">
          {meeting.title}
        </span>
      </div>

      {/* Meeting header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold font-[family-name:var(--font-heading)] text-text-primary">
              {meeting.title}
            </h1>
            <MeetingStatusBadge status={meeting.status} />
          </div>
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            {meeting.meetingDate && (
              <span>{formatDate(meeting.meetingDate)}</span>
            )}
            {meeting.duration && (
              <span>
                {Math.floor(meeting.duration / 60)}m duration
              </span>
            )}
            {participants.length > 0 && (
              <span>{participants.join(", ")}</span>
            )}
          </div>
        </div>
      </div>

      {/* AI Summary */}
      {meeting.aiSummary && (
        <div className="bg-bg-card border border-border rounded-lg p-5">
          <h3 className="text-sm font-medium text-text-primary mb-2">
            AI Summary
          </h3>
          <p className="text-sm text-text-secondary whitespace-pre-wrap">
            {meeting.aiSummary}
          </p>
        </div>
      )}

      {/* Extraction review */}
      {extraction && extraction.rawExtraction ? (
        <ExtractionReview
          meetingId={meeting.id}
          meetingStatus={meeting.status}
          extraction={extraction}
          catalog={catalog}
        />
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 border border-border rounded-lg text-text-muted gap-2 p-8">
          <p className="text-sm">
            {meeting.status === "pending_extraction"
              ? "Extraction is pending..."
              : meeting.status === "extraction_failed"
                ? "Extraction failed. Use the retry button on the meetings list."
                : "No extraction data available."}
          </p>
        </div>
      )}
    </div>
  );
}
