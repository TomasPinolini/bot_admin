"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Pencil } from "lucide-react";
import { updateCompany } from "@/lib/actions";

interface Company {
  id: string;
  name: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  website: string | null;
  location: string | null;
  companySize: string | null;
  revenueRange: string | null;
  yearsInBusiness: number | null;
  currentTechStack: unknown;
  socialMedia: unknown;
}

const companySizeOptions = [
  { value: "solo", label: "Solo (1)" },
  { value: "small", label: "Small (2-10)" },
  { value: "medium", label: "Medium (11-50)" },
  { value: "large", label: "Large (51-200)" },
  { value: "enterprise", label: "Enterprise (200+)" },
];

export function EditCompanyButton({ company }: { company: Company }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const result = await updateCompany(new FormData(e.currentTarget));
    setPending(false);
    if ("error" in result) {
      setError(result.error);
    } else {
      setOpen(false);
    }
  }

  return (
    <>
      <Button variant="secondary" icon={<Pencil size={14} />} onClick={() => setOpen(true)}>
        Edit
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Edit Company">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={company.id} />
          <InputField label="Company Name *" name="name" defaultValue={company.name} required />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Contact Name" name="contactName" defaultValue={company.contactName ?? ""} />
            <InputField label="Contact Email" name="contactEmail" type="email" defaultValue={company.contactEmail ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Contact Phone" name="contactPhone" defaultValue={company.contactPhone ?? ""} />
            <InputField label="Website" name="website" defaultValue={company.website ?? ""} />
          </div>
          <div className="border-t border-border pt-4 mt-1">
            <p className="text-[13px] font-medium text-text-secondary mb-3">Enrichment</p>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Location" name="location" defaultValue={company.location ?? ""} />
                <SelectField label="Company Size" name="companySize" options={companySizeOptions} defaultValue={company.companySize ?? ""} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Revenue Range" name="revenueRange" defaultValue={company.revenueRange ?? ""} placeholder="e.g. $1M-$5M" />
                <InputField label="Years in Business" name="yearsInBusiness" type="number" defaultValue={company.yearsInBusiness?.toString() ?? ""} />
              </div>
              <InputField label="Tech Stack (comma-separated)" name="currentTechStack" defaultValue={Array.isArray(company.currentTechStack) ? (company.currentTechStack as string[]).join(", ") : ""} placeholder="e.g. React, Node.js, AWS" />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="LinkedIn URL" name="socialLinkedin" defaultValue={(company.socialMedia as Record<string, string> | null)?.linkedin ?? ""} />
                <InputField label="Twitter URL" name="socialTwitter" defaultValue={(company.socialMedia as Record<string, string> | null)?.twitter ?? ""} />
              </div>
            </div>
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
