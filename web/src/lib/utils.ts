export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return formatDate(date);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function statusToBadge(
  status: string
): "active" | "pending" | "completed" | "blocked" {
  switch (status) {
    case "in_progress":
      return "active";
    case "completed":
      return "completed";
    case "planning":
    case "review":
    default:
      return "pending";
  }
}

export function statusLabel(status: string): string {
  switch (status) {
    case "planning":
      return "Planning";
    case "in_progress":
      return "In Progress";
    case "review":
      return "Review";
    case "completed":
      return "Completed";
    default:
      return status;
  }
}
