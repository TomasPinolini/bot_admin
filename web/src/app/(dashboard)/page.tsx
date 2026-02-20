import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, ChevronRight } from "lucide-react";

const metrics = [
  { label: "Total Companies", value: "47", delta: "+5 this month" },
  { label: "Active Projects", value: "128", delta: "+12 this month" },
  { label: "Tools Deployed", value: "89", delta: "+8 this month" },
  { label: "Blueprints", value: "34", delta: "+3 this month" },
];

const chartData = [
  { label: "Planning", value: 65, color: "bg-accent" },
  { label: "In Progress", value: 85, color: "bg-info" },
  { label: "Review", value: 45, color: "bg-success" },
  { label: "Completed", value: 95, color: "bg-warning" },
];

const activities = [
  { icon: "text-info", text: "Acme Corp project on Activated", time: "2 hours ago", badge: "active" as const },
  { icon: "text-success", text: "New company TechFlow Inc", time: "4 hours ago", badge: "completed" as const },
  { icon: "text-warning", text: "Blueprint applied: E-commerce Bot", time: "6 hours ago", badge: "pending" as const },
  { icon: "text-accent", text: "Tool deployed: DialogFlow CX", time: "8 hours ago", badge: "active" as const },
  { icon: "text-text-secondary", text: "OrderBot phase: Deploy", time: "12 hours ago", badge: "completed" as const },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 p-8 px-10">
      <Header
        title="Dashboard"
        subtitle="Overview of your chatbot implementations"
        actions={
          <>
            <Button variant="secondary" icon={<Download size={14} />}>Export</Button>
            <Button variant="primary" icon={<Plus size={14} />}>New Project</Button>
          </>
        }
      />

      {/* Metrics */}
      <div className="flex gap-5">
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      {/* Bottom row */}
      <div className="flex gap-5 flex-1">
        {/* Chart Panel */}
        <div className="flex flex-col gap-5 bg-bg-card border border-border rounded-lg p-6 flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium font-[family-name:var(--font-heading)] text-text-primary">
              Project Status
            </h2>
            <button className="text-xs text-text-muted hover:text-text-secondary transition-colors">
              This Month
            </button>
          </div>
          <div className="flex items-end gap-6 flex-1 pt-4">
            {chartData.map((bar) => (
              <div key={bar.label} className="flex flex-col items-center gap-3 flex-1">
                <div className="w-full flex items-end justify-center" style={{ height: 200 }}>
                  <div
                    className={`w-full max-w-16 ${bar.color} rounded-t`}
                    style={{ height: `${bar.value}%` }}
                  />
                </div>
                <span className="text-xs text-text-muted">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Panel */}
        <div className="flex flex-col gap-4 bg-bg-card border border-border rounded-lg p-6 w-[380px] shrink-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium font-[family-name:var(--font-heading)] text-text-primary">
              Recent Activity
            </h2>
            <button className="text-xs text-text-muted hover:text-text-secondary transition-colors flex items-center gap-1">
              View All <ChevronRight size={12} />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {activities.map((a, i) => (
              <div key={i} className="flex items-start gap-3 py-2">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.icon.replace("text-", "bg-")}`} />
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-sm text-text-primary truncate">{a.text}</span>
                  <span className="text-xs text-text-muted">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
