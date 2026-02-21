"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { AddNicheButton } from "@/components/forms/add-niche-button";
import { deleteCatalogItem } from "@/lib/actions";

interface Niche {
  id: string;
  name: string;
  description: string | null;
  industryId: string;
  industryName: string;
}

interface NicheTableProps {
  niches: Niche[];
  industries: { value: string; label: string }[];
}

export function NicheTable({ niches, industries }: NicheTableProps) {
  const [filter, setFilter] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = filter
    ? niches.filter((n) => n.industryId === filter)
    : niches;

  async function handleDelete(id: string) {
    setDeleting(id);
    const fd = new FormData();
    fd.set("type", "niche");
    fd.set("id", id);
    await deleteCatalogItem(fd);
    setDeleting(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center bg-bg-input border border-border rounded px-4 py-2.5 w-56">
          <select
            className="bg-transparent text-sm text-text-primary outline-none w-full cursor-pointer"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="" className="bg-bg-input">All Industries</option>
            {industries.map((ind) => (
              <option key={ind.value} value={ind.value} className="bg-bg-input">
                {ind.label}
              </option>
            ))}
          </select>
        </div>
        <AddNicheButton industries={industries} />
      </div>
      <div className="flex flex-col border border-border rounded-lg overflow-hidden">
        <div className="flex items-center bg-bg-card px-5 py-3 border-b border-border text-xs font-medium text-text-secondary">
          <div className="flex-1">Name</div>
          <div className="w-40">Industry</div>
          <div className="w-48">Description</div>
          <div className="w-16 text-center">Actions</div>
        </div>
        {filtered.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-text-muted">No niches found</div>
        ) : (
          filtered.map((niche) => (
            <div
              key={niche.id}
              className="flex items-center px-5 py-3.5 border-b border-border hover:bg-bg-card/50 transition-colors"
            >
              <div className="flex-1 text-sm font-medium text-text-primary">{niche.name}</div>
              <div className="w-40 text-sm text-text-secondary">{niche.industryName}</div>
              <div className="w-48 text-sm text-text-secondary truncate">{niche.description || "\u2014"}</div>
              <div className="w-16 flex justify-center">
                <button
                  onClick={() => handleDelete(niche.id)}
                  disabled={deleting === niche.id}
                  className="text-text-muted hover:text-error transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
