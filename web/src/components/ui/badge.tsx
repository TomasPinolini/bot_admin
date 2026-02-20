interface BadgeProps {
  status: "active" | "pending" | "completed" | "blocked";
  children?: React.ReactNode;
}

const config = {
  active: { bg: "bg-success-bg", text: "text-success", label: "Active" },
  pending: { bg: "bg-warning-bg", text: "text-warning", label: "Pending" },
  completed: { bg: "bg-info-bg", text: "text-info", label: "Completed" },
  blocked: { bg: "bg-error-bg", text: "text-error", label: "Blocked" },
};

export function Badge({ status, children }: BadgeProps) {
  const c = config[status];
  return (
    <span className={`inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-medium rounded ${c.bg} ${c.text}`}>
      {children ?? c.label}
    </span>
  );
}
