import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

const companies = [
  { name: "Acme Corp", industry: "E-commerce", projects: 5, status: "active" as const, created: "Jan 15, 2026" },
  { name: "TechFlow Inc", industry: "SaaS", projects: 3, status: "active" as const, created: "Feb 3, 2026" },
  { name: "GlobalBank Ltd", industry: "Finance", projects: 4, status: "active" as const, created: "Jan 1, 2025" },
  { name: "MediHealth Plus", industry: "Healthcare", projects: 2, status: "pending" as const, created: "Nov 12, 2025" },
  { name: "NextGen AI", industry: "Technology", projects: 4, status: "active" as const, created: "Sep 15, 2025" },
  { name: "FreshMart", industry: "Retail", projects: 3, status: "pending" as const, created: "Nov 15, 2025" },
];

export default function CompaniesPage() {
  return (
    <div className="flex flex-col gap-6 p-8 px-10 h-full">
      <Header
        title="Companies"
        subtitle="Manage your client companies and their projects"
        actions={
          <>
            <Button variant="secondary" icon={<Download size={14} />}>Export</Button>
            <Button variant="primary" icon={<Plus size={14} />}>Add Company</Button>
          </>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 bg-bg-card border border-border rounded px-3.5 py-2.5">
          <Search size={16} className="text-text-muted" />
          <input
            placeholder="Search companies..."
            className="bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none flex-1"
          />
        </div>
        <button className="flex items-center gap-1.5 px-3.5 py-2.5 border border-border rounded text-sm text-text-secondary hover:text-text-primary transition-colors">
          <SlidersHorizontal size={14} />
          Industry
        </button>
        <button className="flex items-center gap-1.5 px-3.5 py-2.5 border border-border rounded text-sm text-text-secondary hover:text-text-primary transition-colors">
          <SlidersHorizontal size={14} />
          Status: All
        </button>
      </div>

      {/* Table */}
      <div className="flex flex-col border border-border rounded-lg overflow-hidden flex-1">
        {/* Header */}
        <div className="flex items-center bg-bg-card px-5 py-3 border-b border-border text-xs font-medium text-text-secondary">
          <div className="flex-1 min-w-[200px]">Company</div>
          <div className="w-32">Industry</div>
          <div className="w-24 text-center">Projects</div>
          <div className="w-24 text-center">Status</div>
          <div className="w-36">Created</div>
        </div>

        {/* Rows */}
        {companies.map((c) => (
          <div
            key={c.name}
            className="flex items-center px-5 py-3.5 border-b border-border hover:bg-bg-card/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 flex-1 min-w-[200px]">
              <div className="w-8 h-8 rounded-lg bg-bg-card border border-border flex items-center justify-center text-xs font-medium text-text-secondary">
                {c.name.substring(0, 2).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-text-primary">{c.name}</span>
            </div>
            <div className="w-32 text-sm text-text-secondary">{c.industry}</div>
            <div className="w-24 text-sm text-text-primary text-center">{c.projects}</div>
            <div className="w-24 flex justify-center">
              <Badge status={c.status} />
            </div>
            <div className="w-36 text-sm text-text-muted">{c.created}</div>
          </div>
        ))}

        {/* Footer */}
        <div className="flex items-center justify-between bg-bg-card px-5 py-3 text-xs text-text-muted">
          <span>Showing 1-6 of 47 companies</span>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded hover:bg-bg-active transition-colors">
              <ChevronLeft size={14} />
            </button>
            <button className="w-7 h-7 rounded flex items-center justify-center bg-accent text-white text-xs">1</button>
            <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-bg-active text-text-secondary text-xs">2</button>
            <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-bg-active text-text-secondary text-xs">3</button>
            <button className="p-1.5 rounded hover:bg-bg-active transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
