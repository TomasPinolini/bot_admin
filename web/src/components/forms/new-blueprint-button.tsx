"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input";
import { TextareaField } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { Plus } from "lucide-react";
import { createBlueprint } from "@/lib/actions";

export function NewBlueprintButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const result = await createBlueprint(new FormData(e.currentTarget));
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
        New Blueprint
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="New Blueprint">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputField label="Blueprint Name *" name="name" placeholder="E-commerce Bot" required />
          <TextareaField label="Description" name="description" placeholder="What is this blueprint for?" />
          {error && <p className="text-sm text-error">{error}</p>}
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create Blueprint"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
