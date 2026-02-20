import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Layers } from "lucide-react";

const blueprints = [
  { name: "E-commerce Support", desc: "Full customer support chatbot with order tracking", tools: 4, uses: 12, status: "active" as const },
  { name: "SaaS Onboarding", desc: "User onboarding and FAQ bot for SaaS platforms", tools: 3, uses: 8, status: "active" as const },
  { name: "Healthcare Triage", desc: "Patient triage and appointment scheduling bot", tools: 5, uses: 6, status: "active" as const },
  { name: "Financial Advisor", desc: "Investment advice and portfolio management bot", tools: 4, uses: 4, status: "pending" as const },
  { name: "Real Estate Agent", desc: "Property search and virtual tour scheduling", tools: 3, uses: 3, status: "active" as const },
  { name: "Restaurant Ordering", desc: "Menu browsing and order placement chatbot", tools: 2, uses: 1, status: "pending" as const },
];

export default function BlueprintsPage() {
  return (
    <div className="flex flex-col gap-6 p-8 px-10 h-full">
      <Header
        title="Blueprints"
        subtitle="Reusable chatbot templates and configurations"
        actions={
          <Button variant="primary" icon={<Plus size={14} />}>New Blueprint</Button>
        }
      />

      <div className="grid grid-cols-3 gap-5">
        {blueprints.map((bp) => (
          <div
            key={bp.name}
            className="flex flex-col gap-4 bg-bg-card border border-border rounded-lg p-6 hover:border-text-muted transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg bg-bg-main border border-border flex items-center justify-center">
                <Layers size={18} className="text-text-secondary" />
              </div>
              <Badge status={bp.status} />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-sm font-medium text-text-primary">{bp.name}</h3>
              <p className="text-xs text-text-muted leading-relaxed">{bp.desc}</p>
            </div>
            <div className="flex items-center gap-4 pt-1 text-xs text-text-muted">
              <span>{bp.tools} tools</span>
              <span>{bp.uses} uses</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
