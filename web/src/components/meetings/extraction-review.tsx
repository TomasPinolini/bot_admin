"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";
import { ConfidenceBadge } from "./confidence-badge";
import { confirmExtraction, rejectExtraction } from "@/lib/actions";

interface MatchResult {
  id: string | null;
  name: string;
  confidence: number;
  matchType: string;
}

interface Extraction {
  id: string;
  meetingId: string;
  rawExtraction: any;
  matchSuggestions: any;
  confirmedData: any;
  status: string;
}

interface Catalog {
  companies: Array<{ id: string; name: string }>;
  industries: Array<{ id: string; name: string }>;
  products: Array<{ id: string; name: string }>;
  services: Array<{ id: string; name: string }>;
}

interface Props {
  meetingId: string;
  meetingStatus: string;
  extraction: Extraction;
  catalog: Catalog;
}

export function ExtractionReview({
  meetingId,
  meetingStatus,
  extraction,
  catalog,
}: Props) {
  const router = useRouter();
  const raw = extraction.rawExtraction as any;
  const matches = extraction.matchSuggestions as any;
  const isReviewable =
    meetingStatus === "ready_for_review" || meetingStatus === "extracted";
  const isConfirmed = extraction.status === "confirmed";
  const isRejected = extraction.status === "rejected";

  // Company state
  const [companyAction, setCompanyAction] = useState<"link" | "create">(
    matches?.company?.id ? "link" : "create"
  );
  const [selectedCompanyId, setSelectedCompanyId] = useState(
    matches?.company?.id ?? ""
  );
  const [companyName, setCompanyName] = useState(
    raw?.company?.name ?? ""
  );
  const [contactName, setContactName] = useState(
    raw?.company?.contactName ?? ""
  );
  const [contactEmail, setContactEmail] = useState(
    raw?.company?.contactEmail ?? ""
  );
  const [website, setWebsite] = useState(raw?.company?.website ?? "");
  const [location, setLocation] = useState(raw?.company?.location ?? "");
  const [companySize, setCompanySize] = useState(
    raw?.company?.companySize ?? ""
  );
  const [revenueRange, setRevenueRange] = useState(
    raw?.company?.revenueRange ?? ""
  );

  // Industry state
  const [industryAction, setIndustryAction] = useState<"link" | "create">(
    matches?.industry?.id ? "link" : "create"
  );
  const [selectedIndustryId, setSelectedIndustryId] = useState(
    matches?.industry?.id ?? ""
  );
  const [industryName, setIndustryName] = useState(
    raw?.industry?.name ?? ""
  );

  // Products state
  const [products, setProducts] = useState<
    Array<{ action: "link" | "create"; id: string; name: string }>
  >(
    (raw?.products ?? []).map((p: any, i: number) => ({
      action: matches?.products?.[i]?.id ? "link" : "create",
      id: matches?.products?.[i]?.id ?? "",
      name: p.name,
    }))
  );

  // Services state
  const [services, setServices] = useState<
    Array<{ action: "link" | "create"; id: string; name: string }>
  >(
    (raw?.services ?? []).map((sv: any, i: number) => ({
      action: matches?.services?.[i]?.id ? "link" : "create",
      id: matches?.services?.[i]?.id ?? "",
      name: sv.name,
    }))
  );

  // Meeting details state
  const [painPoints, setPainPoints] = useState<string[]>(
    raw?.painPoints ?? []
  );
  const [requirements, setRequirements] = useState<string[]>(
    raw?.requirements ?? []
  );
  const [budget, setBudget] = useState(raw?.budget ?? "");
  const [timeline, setTimeline] = useState(raw?.timeline ?? "");
  const [urgency, setUrgency] = useState(raw?.urgency ?? "");
  const [followUpItems, setFollowUpItems] = useState<string[]>(
    raw?.followUpItems ?? []
  );

  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setPending(true);
    setError("");

    const result = await confirmExtraction({
      meetingId,
      companyAction,
      companyId: companyAction === "link" ? selectedCompanyId : undefined,
      companyName: companyAction === "create" ? companyName : undefined,
      companyData: {
        contactName: contactName || undefined,
        contactEmail: contactEmail || undefined,
        website: website || undefined,
        location: location || undefined,
        companySize: companySize || undefined,
        revenueRange: revenueRange || undefined,
        currentTechStack: Array.isArray(raw?.company?.currentTechStack)
          ? raw.company.currentTechStack
          : undefined,
        socialMedia: raw?.company?.socialMedia || undefined,
      },
      industryAction,
      industryId:
        industryAction === "link" ? selectedIndustryId : undefined,
      industryName:
        industryAction === "create" ? industryName : undefined,
      products: products.map((p) => ({
        action: p.action,
        id: p.action === "link" ? p.id : undefined,
        name: p.action === "create" ? p.name : undefined,
      })),
      services: services.map((sv) => ({
        action: sv.action,
        id: sv.action === "link" ? sv.id : undefined,
        name: sv.action === "create" ? sv.name : undefined,
      })),
      confirmedDetails: {
        painPoints,
        requirements,
        budget: budget || null,
        timeline: timeline || null,
        urgency: urgency || null,
        followUpItems,
      },
    });

    setPending(false);
    if ("error" in result) {
      setError(result.error);
    } else {
      router.push("/meetings");
    }
  }

  async function handleReject() {
    setPending(true);
    setError("");
    const result = await rejectExtraction(meetingId);
    setPending(false);
    if ("error" in result) {
      setError(result.error);
    } else {
      router.push("/meetings");
    }
  }

  const companySizeOptions = [
    { value: "solo", label: "Solo (1)" },
    { value: "small", label: "Small (2-10)" },
    { value: "medium", label: "Medium (11-50)" },
    { value: "large", label: "Large (51-200)" },
    { value: "enterprise", label: "Enterprise (200+)" },
  ];

  const urgencyOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];

  const readOnly = !isReviewable;

  return (
    <div className="flex flex-col gap-6">
      {/* Company Section */}
      <section className="bg-bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-base font-medium font-[family-name:var(--font-heading)] text-text-primary">
            Company
          </h2>
          {matches?.company && (
            <ConfidenceBadge confidence={matches.company.confidence} />
          )}
          {matches?.company?.matchType !== "none" && matches?.company?.id && (
            <span className="text-xs text-text-muted">
              Matched: {matches.company.matchType}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input
                type="radio"
                name="companyAction"
                checked={companyAction === "link"}
                onChange={() => setCompanyAction("link")}
                disabled={readOnly}
                className="accent-accent"
              />
              Link existing
            </label>
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input
                type="radio"
                name="companyAction"
                checked={companyAction === "create"}
                onChange={() => setCompanyAction("create")}
                disabled={readOnly}
                className="accent-accent"
              />
              Create new
            </label>
          </div>

          {companyAction === "link" ? (
            <SelectField
              label="Select Company"
              options={catalog.companies.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              disabled={readOnly}
            />
          ) : (
            <InputField
              label="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={readOnly}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Contact Name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              disabled={readOnly}
            />
            <InputField
              label="Contact Email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              disabled={readOnly}
            />
            <InputField
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Company Size"
              options={companySizeOptions}
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              disabled={readOnly}
            />
            <InputField
              label="Revenue Range"
              value={revenueRange}
              onChange={(e) => setRevenueRange(e.target.value)}
              disabled={readOnly}
            />
          </div>

          {/* Tech stack display */}
          {Array.isArray(raw?.company?.currentTechStack) &&
            raw.company.currentTechStack.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-text-secondary">
                  Tech Stack
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(raw.company.currentTechStack as string[]).map(
                    (tech: string) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 text-[11px] bg-bg-active border border-border rounded text-text-secondary"
                      >
                        {tech}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
        </div>
      </section>

      {/* Catalog Section */}
      <section className="bg-bg-card border border-border rounded-lg p-6">
        <h2 className="text-base font-medium font-[family-name:var(--font-heading)] text-text-primary mb-4">
          Catalog
        </h2>

        <div className="flex flex-col gap-5">
          {/* Industry */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-text-secondary">
                Industry
              </span>
              {matches?.industry && (
                <ConfidenceBadge
                  confidence={matches.industry.confidence}
                />
              )}
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                <input
                  type="radio"
                  checked={industryAction === "link"}
                  onChange={() => setIndustryAction("link")}
                  disabled={readOnly}
                  className="accent-accent"
                />
                Link
              </label>
              <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                <input
                  type="radio"
                  checked={industryAction === "create"}
                  onChange={() => setIndustryAction("create")}
                  disabled={readOnly}
                  className="accent-accent"
                />
                Create
              </label>
            </div>
            {industryAction === "link" ? (
              <SelectField
                options={catalog.industries.map((i) => ({
                  value: i.id,
                  label: i.name,
                }))}
                value={selectedIndustryId}
                onChange={(e) => setSelectedIndustryId(e.target.value)}
                disabled={readOnly}
              />
            ) : (
              <InputField
                value={industryName}
                onChange={(e) => setIndustryName(e.target.value)}
                placeholder="New industry name"
                disabled={readOnly}
              />
            )}
          </div>

          {/* Products */}
          {products.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-medium text-text-secondary">
                Products
              </span>
              {products.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <select
                    className="bg-bg-input border border-border rounded px-3 py-2 text-sm text-text-primary w-24"
                    value={p.action}
                    onChange={(e) => {
                      const next = [...products];
                      next[i] = {
                        ...next[i],
                        action: e.target.value as "link" | "create",
                      };
                      setProducts(next);
                    }}
                    disabled={readOnly}
                  >
                    <option value="link">Link</option>
                    <option value="create">Create</option>
                  </select>
                  {p.action === "link" ? (
                    <select
                      className="flex-1 bg-bg-input border border-border rounded px-3 py-2 text-sm text-text-primary"
                      value={p.id}
                      onChange={(e) => {
                        const next = [...products];
                        next[i] = { ...next[i], id: e.target.value };
                        setProducts(next);
                      }}
                      disabled={readOnly}
                    >
                      <option value="">Select...</option>
                      {catalog.products.map((cp) => (
                        <option key={cp.id} value={cp.id}>
                          {cp.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="flex-1 bg-bg-input border border-border rounded px-3 py-2 text-sm text-text-primary"
                      value={p.name}
                      onChange={(e) => {
                        const next = [...products];
                        next[i] = { ...next[i], name: e.target.value };
                        setProducts(next);
                      }}
                      disabled={readOnly}
                    />
                  )}
                  {matches?.products?.[i] && (
                    <ConfidenceBadge
                      confidence={matches.products[i].confidence}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Services */}
          {services.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-medium text-text-secondary">
                Services
              </span>
              {services.map((sv, i) => (
                <div key={i} className="flex items-center gap-3">
                  <select
                    className="bg-bg-input border border-border rounded px-3 py-2 text-sm text-text-primary w-24"
                    value={sv.action}
                    onChange={(e) => {
                      const next = [...services];
                      next[i] = {
                        ...next[i],
                        action: e.target.value as "link" | "create",
                      };
                      setServices(next);
                    }}
                    disabled={readOnly}
                  >
                    <option value="link">Link</option>
                    <option value="create">Create</option>
                  </select>
                  {sv.action === "link" ? (
                    <select
                      className="flex-1 bg-bg-input border border-border rounded px-3 py-2 text-sm text-text-primary"
                      value={sv.id}
                      onChange={(e) => {
                        const next = [...services];
                        next[i] = { ...next[i], id: e.target.value };
                        setServices(next);
                      }}
                      disabled={readOnly}
                    >
                      <option value="">Select...</option>
                      {catalog.services.map((cs) => (
                        <option key={cs.id} value={cs.id}>
                          {cs.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="flex-1 bg-bg-input border border-border rounded px-3 py-2 text-sm text-text-primary"
                      value={sv.name}
                      onChange={(e) => {
                        const next = [...services];
                        next[i] = { ...next[i], name: e.target.value };
                        setServices(next);
                      }}
                      disabled={readOnly}
                    />
                  )}
                  {matches?.services?.[i] && (
                    <ConfidenceBadge
                      confidence={matches.services[i].confidence}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Meeting Details Section */}
      <section className="bg-bg-card border border-border rounded-lg p-6">
        <h2 className="text-base font-medium font-[family-name:var(--font-heading)] text-text-primary mb-4">
          Meeting Details
        </h2>

        <div className="flex flex-col gap-5">
          {/* Pain Points */}
          <EditableList
            label="Pain Points"
            items={painPoints}
            onChange={setPainPoints}
            readOnly={readOnly}
          />

          {/* Requirements */}
          <EditableList
            label="Requirements"
            items={requirements}
            onChange={setRequirements}
            readOnly={readOnly}
          />

          {/* Budget, Timeline, Urgency */}
          <div className="grid grid-cols-3 gap-4">
            <InputField
              label="Budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              disabled={readOnly}
            />
            <InputField
              label="Timeline"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              disabled={readOnly}
            />
            <SelectField
              label="Urgency"
              options={urgencyOptions}
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              disabled={readOnly}
            />
          </div>

          {/* Follow-up Items */}
          <EditableList
            label="Follow-up Items"
            items={followUpItems}
            onChange={setFollowUpItems}
            readOnly={readOnly}
          />

          {/* Stakeholders (read-only display) */}
          {Array.isArray(raw?.stakeholders) && raw.stakeholders.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-medium text-text-secondary">
                Stakeholders
              </span>
              <div className="flex flex-col gap-1.5">
                {(raw.stakeholders as Array<{name: string; role?: string; email?: string}>).map(
                  (s: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-sm text-text-secondary"
                    >
                      <span className="text-text-primary">{s.name}</span>
                      {s.role && (
                        <span className="text-text-muted">({s.role})</span>
                      )}
                      {s.email && (
                        <span className="text-text-muted">{s.email}</span>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Actions */}
      {error && <p className="text-sm text-error">{error}</p>}

      {isReviewable && (
        <div className="flex justify-end gap-3 pb-8">
          <Button
            variant="secondary"
            onClick={handleReject}
            disabled={pending}
          >
            {pending ? "Processing..." : "Reject"}
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={pending}
          >
            {pending ? "Confirming..." : "Confirm & Save"}
          </Button>
        </div>
      )}

      {isConfirmed && (
        <div className="bg-success-bg border border-success/30 rounded-lg p-4 text-sm text-success">
          This extraction has been confirmed and data has been written to
          the database.
        </div>
      )}

      {isRejected && (
        <div className="bg-error-bg border border-error/30 rounded-lg p-4 text-sm text-error">
          This extraction has been rejected. No data was written.
        </div>
      )}
    </div>
  );
}

// ── Editable List Component ───────────────────────────────

function EditableList({
  label,
  items,
  onChange,
  readOnly,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  readOnly: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-medium text-text-secondary">
        {label}
      </span>
      {items.length === 0 ? (
        <p className="text-xs text-text-muted">None extracted</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="checkbox"
                defaultChecked
                onChange={(e) => {
                  if (!e.target.checked) {
                    onChange(items.filter((_, idx) => idx !== i));
                  }
                }}
                disabled={readOnly}
                className="accent-accent w-4 h-4 cursor-pointer shrink-0"
              />
              <input
                className="flex-1 bg-bg-input border border-border rounded px-3 py-1.5 text-sm text-text-primary"
                value={item}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = e.target.value;
                  onChange(next);
                }}
                disabled={readOnly}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
