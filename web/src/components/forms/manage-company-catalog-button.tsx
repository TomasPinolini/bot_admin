"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Settings2 } from "lucide-react";
import { updateCompanyAssignments } from "@/lib/actions";

interface ManageCompanyCatalogButtonProps {
  companyId: string;
  type: "industry" | "product" | "service";
  allItems: { id: string; name: string }[];
  assignedIds: string[];
}

export function ManageCompanyCatalogButton({
  companyId,
  type,
  allItems,
  assignedIds,
}: ManageCompanyCatalogButtonProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set(assignedIds));
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const label = type === "industry" ? "Industries" : type === "product" ? "Products" : "Services";
  const filtered = allItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleOpen() {
    setSelected(new Set(assignedIds));
    setSearch("");
    setError("");
    setOpen(true);
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSave() {
    setPending(true);
    setError("");
    const fd = new FormData();
    fd.set("companyId", companyId);
    fd.set("type", type);
    fd.set("ids", JSON.stringify(Array.from(selected)));
    const result = await updateCompanyAssignments(fd);
    setPending(false);
    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="text-xs text-accent hover:text-accent-hover transition-colors cursor-pointer"
      >
        <Settings2 size={14} />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={`Manage ${label}`}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center bg-bg-input border border-border rounded px-4 py-3">
            <input
              className="bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none w-full"
              placeholder={`Search ${label.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-64 overflow-y-auto flex flex-col gap-1">
            {filtered.length === 0 ? (
              <p className="text-sm text-text-muted py-4 text-center">No items found</p>
            ) : (
              filtered.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-2 rounded hover:bg-bg-active transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(item.id)}
                    onChange={() => toggle(item.id)}
                    className="accent-accent w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm text-text-primary">{item.name}</span>
                </label>
              ))
            )}
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" type="button" onClick={handleSave} disabled={pending}>
              {pending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
