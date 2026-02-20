import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, Building2 } from "lucide-react";

const tabs = ["Projects", "Blueprints", "Products", "Billing"];

const projects = [
  { name: "Support Chatbot v2", phase: "Build", status: "active" as const, tools: 4, updated: "2 days ago" },
  { name: "Order Tracking Bot", phase: "Deploy", status: "active" as const, tools: 3, updated: "1 day ago" },
  { name: "Returns Assistant", phase: "Handoff", status: "completed" as const, tools: 2, updated: "1 week ago" },
  { name: "FAQ ChatBot", phase: "Discovery", status: "pending" as const, tools: 1, updated: "3 days ago" },
];

export default function CompanyDetailPage() {
  return (
    <div className="flex flex-col gap-6 p-8 px-10 h-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-text-secondary">Companies</span>
        <span className="text-text-muted">/</span>
        <span className="text-text-primary">Acme Corp</span>
      </div>

      {/* Company header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-bg-card border border-border flex items-center justify-center text-lg font-medium text-text-secondary">
            AC
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold font-[family-name:var(--font-heading)] text-text-primary">Acme Corp</h1>
              <Badge status="active" />
            </div>
            <p className="text-sm text-text-secondary">E-commerce / Retail &middot; Created Jan 15, 2026</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" icon={<Pencil size={14} />}>Edit</Button>
          <Button variant="primary" icon={<Plus size={14} />}>New Project</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            className={`px-5 py-2.5 text-sm transition-colors ${
              i === 0
                ? "text-text-primary border-b-2 border-accent -mb-px"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex gap-5 flex-1">
        {/* Project table */}
        <div className="flex flex-col border border-border rounded-lg overflow-hidden flex-1">
          <div className="flex items-center bg-bg-card px-5 py-3 border-b border-border text-xs font-medium text-text-secondary">
            <div className="flex-1">Project Name</div>
            <div className="w-28">Phase</div>
            <div className="w-24 text-center">Status</div>
            <div className="w-28">Updated</div>
          </div>
          {projects.map((p) => (
            <div key={p.name} className="flex items-center px-5 py-3.5 border-b border-border hover:bg-bg-card/50 transition-colors cursor-pointer">
              <div className="flex-1 text-sm font-medium text-text-primary">{p.name}</div>
              <div className="w-28">
                <Badge status={p.status}>{p.phase}</Badge>
              </div>
              <div className="w-24 flex justify-center">
                <Badge status={p.status} />
              </div>
              <div className="w-28 text-sm text-text-muted">{p.updated}</div>
            </div>
          ))}
        </div>

        {/* Side info */}
        <div className="flex flex-col gap-5 w-[280px] shrink-0">
          <div className="flex flex-col gap-3 bg-bg-card border border-border rounded-lg p-5">
            <h3 className="text-sm font-medium text-text-primary">Company Info</h3>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Industry</span>
                <span className="text-text-primary">E-commerce / Retail</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Contact</span>
                <span className="text-text-primary">jane@acme.com</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Projects</span>
                <span className="text-text-primary">4</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 bg-bg-card border border-border rounded-lg p-5">
            <h3 className="text-sm font-medium text-text-primary">Products & Services</h3>
            <div className="flex flex-col gap-2">
              {["Customer Support Portal", "Order Management System", "Mobile Shopping App", "Product Recommendations"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-text-secondary">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
