interface MeetingStatusBadgeProps {
  status: string;
}

const config: Record<string, { bg: string; text: string; label: string }> = {
  reviewed: { bg: "bg-success-bg", text: "text-success", label: "Reviewed" },
  ready_for_review: { bg: "bg-info-bg", text: "text-info", label: "Ready for Review" },
  pending_extraction: { bg: "bg-warning-bg", text: "text-warning", label: "Pending" },
  extracted: { bg: "bg-warning-bg", text: "text-warning", label: "Extracted" },
  extraction_failed: { bg: "bg-error-bg", text: "text-error", label: "Failed" },
  rejected: { bg: "bg-error-bg", text: "text-error", label: "Rejected" },
};

export function MeetingStatusBadge({ status }: MeetingStatusBadgeProps) {
  const c = config[status] ?? { bg: "bg-warning-bg", text: "text-warning", label: status };
  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-medium rounded ${c.bg} ${c.text}`}
    >
      {c.label}
    </span>
  );
}
