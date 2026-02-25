"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, RotateCcw } from "lucide-react";
import { MeetingStatusBadge } from "./meeting-status-badge";
import { formatDate } from "@/lib/utils";
import { retryExtraction } from "@/lib/actions";

interface Meeting {
  id: string;
  title: string;
  meetingDate: Date | null;
  duration: number | null;
  status: string;
  companyName: string | null;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "\u2014";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

export function MeetingTable({ meetings }: { meetings: Meeting[] }) {
  const [search, setSearch] = useState("");
  const [retrying, setRetrying] = useState<string | null>(null);

  const filtered = meetings.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  async function handleRetry(e: React.MouseEvent, meetingId: string) {
    e.preventDefault();
    e.stopPropagation();
    setRetrying(meetingId);
    await retryExtraction(meetingId);
    setRetrying(null);
  }

  return (
    <>
      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 bg-bg-card border border-border rounded px-3.5 py-2.5">
          <Search size={16} className="text-text-muted" />
          <input
            placeholder="Search meetings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none flex-1"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex flex-col border border-border rounded-lg overflow-hidden flex-1">
        <div className="flex items-center bg-bg-card px-5 py-3 border-b border-border text-xs font-medium text-text-secondary">
          <div className="flex-1 min-w-[200px]">Title</div>
          <div className="w-32">Date</div>
          <div className="w-20 text-center">Duration</div>
          <div className="w-36">Company</div>
          <div className="w-36 text-center">Status</div>
          <div className="w-16 text-center">Actions</div>
        </div>

        {filtered.map((m) => (
          <Link
            key={m.id}
            href={`/meetings/${m.id}/review`}
            className="flex items-center px-5 py-3.5 border-b border-border hover:bg-bg-card/50 transition-colors cursor-pointer"
          >
            <div className="flex-1 min-w-[200px] text-sm font-medium text-text-primary truncate">
              {m.title}
            </div>
            <div className="w-32 text-sm text-text-muted">
              {m.meetingDate ? formatDate(m.meetingDate) : "\u2014"}
            </div>
            <div className="w-20 text-sm text-text-secondary text-center">
              {formatDuration(m.duration)}
            </div>
            <div className="w-36 text-sm text-text-secondary truncate">
              {m.companyName ?? "\u2014"}
            </div>
            <div className="w-36 flex justify-center">
              <MeetingStatusBadge status={m.status} />
            </div>
            <div className="w-16 flex justify-center">
              {m.status === "extraction_failed" && (
                <button
                  onClick={(e) => handleRetry(e, m.id)}
                  disabled={retrying === m.id}
                  className="text-text-muted hover:text-accent transition-colors cursor-pointer disabled:opacity-50"
                  title="Retry extraction"
                >
                  <RotateCcw
                    size={14}
                    className={retrying === m.id ? "animate-spin" : ""}
                  />
                </button>
              )}
            </div>
          </Link>
        ))}

        <div className="flex items-center justify-between bg-bg-card px-5 py-3 text-xs text-text-muted">
          <span>
            Showing {filtered.length}
            {filtered.length !== meetings.length
              ? ` of ${meetings.length}`
              : ""}{" "}
            meetings
          </span>
        </div>
      </div>
    </>
  );
}
