"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";
import { TextareaField } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { Plus } from "lucide-react";
import { createTool } from "@/lib/actions";

const categoryOptions = [
  { value: "ai_platform", label: "AI Platform" },
  { value: "messaging", label: "Messaging" },
  { value: "analytics", label: "Analytics" },
  { value: "crm", label: "CRM" },
  { value: "automation", label: "Automation" },
  { value: "other", label: "Other" },
];

export function AddToolButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const result = await createTool(new FormData(e.currentTarget));
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
        Add Tool
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Add Tool">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputField label="Tool Name *" name="name" placeholder="ChatGPT API" required />
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Category" name="category" options={categoryOptions} />
            <InputField label="URL" name="url" placeholder="https://..." />
          </div>
          <TextareaField label="Description" name="description" placeholder="What does this tool do?" />
          {error && <p className="text-sm text-error">{error}</p>}
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create Tool"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
