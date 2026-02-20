import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  delta: string;
  trend?: "up" | "down";
}

export function MetricCard({ label, value, delta, trend = "up" }: MetricCardProps) {
  return (
    <div className="flex flex-col gap-3 bg-bg-card border border-border rounded-lg p-6 flex-1 min-w-0">
      <span className="text-[13px] text-text-secondary">{label}</span>
      <span className="text-[32px] font-semibold font-[family-name:var(--font-heading)] tracking-tight text-text-primary leading-none">
        {value}
      </span>
      <div className="flex items-center gap-1.5">
        {trend === "up" ? (
          <TrendingUp size={14} className="text-success" />
        ) : (
          <TrendingDown size={14} className="text-error" />
        )}
        <span className="text-xs text-text-secondary">{delta}</span>
      </div>
    </div>
  );
}
