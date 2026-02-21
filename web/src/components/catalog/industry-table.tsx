"use client";

import { useState } from "react";
import { ChevronRight, Trash2 } from "lucide-react";
import { AddIndustryButton } from "@/components/forms/add-industry-button";
import { AddNicheButton } from "@/components/forms/add-niche-button";
import { deleteCatalogItem } from "@/lib/actions";

interface Industry {
  id: string;
  name: string;
  description: string | null;
  nicheCount: number;
}

interface Niche {
  id: string;
  name: string;
  description: string | null;
  industryId: string;
  industryName: string;
}

interface IndustryTableProps {
  industries: Industry[];
  niches: Niche[];
}

export function IndustryTable({ industries, niches }: IndustryTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<string | null>(null);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleDelete(type: "industry" | "niche", id: string) {
    setDeleting(id);
    const fd = new FormData();
    fd.set("type", type);
    fd.set("id", id);
    await deleteCatalogItem(fd);
    setDeleting(null);
  }

  const industryOptions = industries.map((i) => ({ value: i.id, label: i.name }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <AddIndustryButton />
      </div>
      <div className="flex flex-col border border-border rounded-lg overflow-hidden">
        <div className="flex items-center bg-bg-card px-5 py-3 border-b border-border text-xs font-medium text-text-secondary">
          <div className="w-8" />
          <div className="flex-1">Name</div>
          <div className="w-48">Description</div>
          <div className="w-20 text-center">Niches</div>
          <div className="w-16 text-center">Actions</div>
        </div>
        {industries.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-text-muted">No industries yet</div>
        ) : (
          industries.map((ind) => {
            const isExpanded = expanded.has(ind.id);
            const childNiches = niches.filter((n) => n.industryId === ind.id);
            return (
              <div key={ind.id}>
                <div className="flex items-center px-5 py-3.5 border-b border-border hover:bg-bg-card/50 transition-colors">
                  <button
                    onClick={() => toggleExpand(ind.id)}
                    className="w-8 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  >
                    <ChevronRight
                      size={16}
                      className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
                    />
                  </button>
                  <div className="flex-1 text-sm font-medium text-text-primary">{ind.name}</div>
                  <div className="w-48 text-sm text-text-secondary truncate">{ind.description || "\u2014"}</div>
                  <div className="w-20 text-sm text-text-secondary text-center">{ind.nicheCount}</div>
                  <div className="w-16 flex justify-center">
                    <button
                      onClick={() => handleDelete("industry", ind.id)}
                      disabled={deleting === ind.id}
                      className="text-text-muted hover:text-error transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="bg-bg-card/30 border-b border-border">
                    {childNiches.length === 0 ? (
                      <div className="px-12 py-3 text-xs text-text-muted">No niches in this industry</div>
                    ) : (
                      childNiches.map((niche) => (
                        <div key={niche.id} className="flex items-center px-12 py-2.5 border-b border-border/50">
                          <div className="flex-1 text-sm text-text-secondary">{niche.name}</div>
                          <div className="w-48 text-sm text-text-muted truncate">{niche.description || "\u2014"}</div>
                          <div className="w-20" />
                          <div className="w-16 flex justify-center">
                            <button
                              onClick={() => handleDelete("niche", niche.id)}
                              disabled={deleting === niche.id}
                              className="text-text-muted hover:text-error transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                    <div className="px-12 py-3">
                      <AddNicheButton industries={industryOptions} preselectedIndustryId={ind.id} />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
