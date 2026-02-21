"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { AddCatalogItemButton } from "@/components/forms/add-catalog-item-button";
import { deleteCatalogItem } from "@/lib/actions";

interface Item {
  id: string;
  name: string;
  description: string | null;
}

interface SimpleCatalogTableProps {
  type: "product" | "service";
  items: Item[];
}

export function SimpleCatalogTable({ type, items }: SimpleCatalogTableProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeleting(id);
    const fd = new FormData();
    fd.set("type", type);
    fd.set("id", id);
    await deleteCatalogItem(fd);
    setDeleting(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <AddCatalogItemButton type={type} />
      </div>
      <div className="flex flex-col border border-border rounded-lg overflow-hidden">
        <div className="flex items-center bg-bg-card px-5 py-3 border-b border-border text-xs font-medium text-text-secondary">
          <div className="flex-1">Name</div>
          <div className="w-64">Description</div>
          <div className="w-16 text-center">Actions</div>
        </div>
        {items.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-text-muted">
            No {type === "product" ? "products" : "services"} yet
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center px-5 py-3.5 border-b border-border hover:bg-bg-card/50 transition-colors"
            >
              <div className="flex-1 text-sm font-medium text-text-primary">{item.name}</div>
              <div className="w-64 text-sm text-text-secondary truncate">{item.description || "\u2014"}</div>
              <div className="w-16 flex justify-center">
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deleting === item.id}
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
