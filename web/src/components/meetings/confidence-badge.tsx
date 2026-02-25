interface ConfidenceBadgeProps {
  confidence: number;
}

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const pct = Math.round(confidence * 100);
  let bg: string;
  let text: string;

  if (confidence >= 0.8) {
    bg = "bg-success-bg";
    text = "text-success";
  } else if (confidence >= 0.5) {
    bg = "bg-warning-bg";
    text = "text-warning";
  } else {
    bg = "bg-error-bg";
    text = "text-error";
  }

  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-medium rounded ${bg} ${text}`}
    >
      {pct}%
    </span>
  );
}
