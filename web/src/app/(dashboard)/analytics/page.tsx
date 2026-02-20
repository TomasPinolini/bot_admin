import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const industries = [
  { label: "E-commerce", value: 32, color: "bg-accent" },
  { label: "SaaS", value: 28, color: "bg-info" },
  { label: "Finance", value: 24, color: "bg-success" },
  { label: "Healthcare", value: 18, color: "bg-warning" },
  { label: "Retail/Other", value: 14, color: "bg-error" },
];

const completionRates = [
  { label: "E-commerce", pct: 67, color: "bg-success" },
  { label: "SaaS", pct: 72, color: "bg-info" },
  { label: "Finance", pct: 58, color: "bg-warning" },
  { label: "Healthcare", pct: 84, color: "bg-success" },
];

const tools = [
  { name: "DialogFlow CX", usage: 42, color: "bg-info" },
  { name: "Twilio", usage: 38, color: "bg-accent" },
  { name: "Pinecone", usage: 31, color: "bg-success" },
  { name: "Rasa", usage: 27, color: "bg-warning" },
  { name: "Voiceflow", usage: 22, color: "bg-error" },
];

const phases = [
  { name: "Discovery", days: 5.2 },
  { name: "Design", days: 7.8 },
  { name: "Build", days: 12.4 },
  { name: "Test", days: 4.6 },
  { name: "Deploy", days: 3.4 },
  { name: "Handoff", days: 2.1 },
];

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6 p-8 px-10 h-full">
      <Header
        title="Analytics"
        subtitle="Insights across all projects and companies"
        actions={
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm rounded bg-accent text-white">This Month</button>
            <button className="px-4 py-2 text-sm rounded text-text-secondary hover:text-text-primary transition-colors">Last Month</button>
            <button className="px-4 py-2 text-sm rounded text-text-secondary hover:text-text-primary transition-colors">Quarter</button>
          </div>
        }
      />

      {/* Top row */}
      <div className="flex gap-5">
        {/* Projects by Industry */}
        <div className="flex flex-col gap-5 bg-bg-card border border-border rounded-lg p-6 flex-1">
          <h2 className="text-base font-medium font-[family-name:var(--font-heading)] text-text-primary">
            Projects by Industry
          </h2>
          <div className="flex flex-col gap-4">
            {industries.map((ind) => (
              <div key={ind.label} className="flex items-center gap-4">
                <span className="text-sm text-text-secondary w-24 shrink-0">{ind.label}</span>
                <div className="flex-1 h-6 bg-bg-main rounded overflow-hidden">
                  <div className={`h-full ${ind.color} rounded`} style={{ width: `${(ind.value / 35) * 100}%` }} />
                </div>
                <span className="text-sm text-text-primary w-8 text-right">{ind.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Completion Rates */}
        <div className="flex flex-col gap-5 bg-bg-card border border-border rounded-lg p-6 w-[360px] shrink-0">
          <h2 className="text-base font-medium font-[family-name:var(--font-heading)] text-text-primary">
            Completion Rates
          </h2>
          <div className="flex flex-col gap-4">
            {completionRates.map((rate) => (
              <div key={rate.label} className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">{rate.label}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-bg-main rounded overflow-hidden">
                    <div className={`h-full ${rate.color} rounded`} style={{ width: `${rate.pct}%` }} />
                  </div>
                  <span className="text-sm text-text-primary w-10 text-right">{rate.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex gap-5 flex-1">
        {/* Most Used Tools */}
        <div className="flex flex-col gap-4 bg-bg-card border border-border rounded-lg p-6 flex-1">
          <h2 className="text-base font-medium font-[family-name:var(--font-heading)] text-text-primary">
            Most Used Tools
          </h2>
          <div className="flex flex-col gap-3">
            {tools.map((tool) => (
              <div key={tool.name} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${tool.color}`} />
                <span className="text-sm text-text-primary flex-1">{tool.name}</span>
                <span className="text-sm text-text-muted">{tool.usage} projects</span>
              </div>
            ))}
          </div>
        </div>

        {/* Avg Phase Duration */}
        <div className="flex flex-col gap-4 bg-bg-card border border-border rounded-lg p-6 flex-1">
          <h2 className="text-base font-medium font-[family-name:var(--font-heading)] text-text-primary">
            Avg. Phase Duration
          </h2>
          <div className="flex flex-col gap-3">
            {phases.map((phase) => (
              <div key={phase.name} className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">{phase.name}</span>
                <span className="text-sm text-text-primary">{phase.days} days</span>
              </div>
            ))}
            <div className="border-t border-border pt-3 mt-1 flex items-center justify-between">
              <span className="text-sm font-medium text-text-primary">Total Average</span>
              <span className="text-sm font-medium text-text-primary">35.5 days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
