import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Search, Building2 } from "lucide-react";
import { getCompanies } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export default async function CompaniesPage() {
  const companies = await getCompanies();

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

      {companies.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-text-muted">
          <Building2 size={40} className="opacity-30" />
          <p className="text-sm">No companies added yet</p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1 bg-bg-card border border-border rounded px-3.5 py-2.5">
              <Search size={16} className="text-text-muted" />
              <input
                placeholder="Search companies..."
                className="bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none flex-1"
              />
            </div>
          </div>

          {/* Table */}
          <div className="flex flex-col border border-border rounded-lg overflow-hidden flex-1">
            <div className="flex items-center bg-bg-card px-5 py-3 border-b border-border text-xs font-medium text-text-secondary">
              <div className="flex-1 min-w-[200px]">Company</div>
              <div className="w-32">Industry</div>
              <div className="w-24 text-center">Projects</div>
              <div className="w-24 text-center">Status</div>
              <div className="w-36">Created</div>
            </div>

            {companies.map((c) => (
              <Link
                key={c.id}
                href={`/companies/${c.id}`}
                className="flex items-center px-5 py-3.5 border-b border-border hover:bg-bg-card/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                  <div className="w-8 h-8 rounded-lg bg-bg-card border border-border flex items-center justify-center text-xs font-medium text-text-secondary">
                    {c.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-text-primary">{c.name}</span>
                </div>
                <div className="w-32 text-sm text-text-secondary">{c.industry ?? "—"}</div>
                <div className="w-24 text-sm text-text-primary text-center">{c.projectCount}</div>
                <div className="w-24 flex justify-center">
                  <Badge status={c.status === "active" ? "active" : "pending"} />
                </div>
                <div className="w-36 text-sm text-text-muted">{formatDate(c.createdAt)}</div>
              </Link>
            ))}

            <div className="flex items-center justify-between bg-bg-card px-5 py-3 text-xs text-text-muted">
              <span>Showing {companies.length} companies</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
