"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input";
import { TextareaField } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { Plus } from "lucide-react";
import { createIndustry } from "@/lib/actions";

export function AddIndustryButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const result = await createIndustry(new FormData(e.currentTarget));
    setPending(false);
    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
    }
  }

  return (
    <>
      <Button variant="primary" icon={<Plus size={14} />} onClick={() => setOpen(true)}>
        Add Industry
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Add Industry">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputField label="Name *" name="name" placeholder="e.g. Healthcare" required />
          <TextareaField label="Description" name="description" placeholder="Optional description" />
          {error && <p className="text-sm text-error">{error}</p>}
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create Industry"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
