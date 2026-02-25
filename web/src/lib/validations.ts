import { z } from "zod";

// Treat empty strings as null for optional fields
function emptyToNull(val: unknown): string | null {
  if (typeof val !== "string") return null;
  const trimmed = val.trim();
  return trimmed === "" ? null : trimmed;
}

const optionalString = z.preprocess(emptyToNull, z.string().max(500).nullable());
const optionalEmail = z.preprocess(
  emptyToNull,
  z.string().email("Invalid email format").max(255).nullable(),
);
const optionalUrl = z.preprocess(
  emptyToNull,
  z.string().url("Invalid URL format").max(500).nullable(),
);
const requiredName = z.string().trim().min(1, "Name is required").max(255);
const requiredId = z.string().trim().min(1, "ID is required");

// ── Companies ───────────────────────────────────────────────

export const createCompanySchema = z.object({
  name: requiredName,
  contactName: optionalString,
  contactEmail: optionalEmail,
  contactPhone: z.preprocess(emptyToNull, z.string().max(50).nullable()),
  website: optionalUrl,
});

export const updateCompanySchema = z.object({
  id: requiredId,
  name: requiredName,
  contactName: optionalString,
  contactEmail: optionalEmail,
  contactPhone: z.preprocess(emptyToNull, z.string().max(50).nullable()),
  website: optionalUrl,
  location: optionalString,
  companySize: optionalString,
  revenueRange: optionalString,
  yearsInBusiness: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? null : v),
    z.coerce.number().int().min(0).max(500).nullable(),
  ),
  currentTechStack: optionalString,
  socialLinkedin: optionalUrl,
  socialTwitter: optionalUrl,
});

// ── Projects ────────────────────────────────────────────────

export const createProjectSchema = z.object({
  companyId: requiredId,
  name: requiredName,
  description: optionalString,
});

export const updateProjectSchema = z.object({
  id: requiredId,
  name: requiredName,
  description: optionalString,
  status: z.enum(["planning", "in_progress", "review", "completed"]).default("planning"),
  targetDate: optionalString,
});

// ── Tools ───────────────────────────────────────────────────

export const createToolSchema = z.object({
  name: requiredName,
  category: optionalString,
  url: optionalUrl,
  description: optionalString,
});

// ── Blueprints ──────────────────────────────────────────────

export const createBlueprintSchema = z.object({
  name: requiredName,
  description: optionalString,
});

// ── Catalog ─────────────────────────────────────────────────

export const createIndustrySchema = z.object({
  name: requiredName,
  description: optionalString,
});

export const createNicheSchema = z.object({
  industryId: requiredId,
  name: requiredName,
  description: optionalString,
});

export const createProductSchema = z.object({
  name: requiredName,
  description: optionalString,
});

export const createServiceSchema = z.object({
  name: requiredName,
  description: optionalString,
});

export const deleteCatalogItemSchema = z.object({
  type: z.enum(["industry", "niche", "product", "service"], {
    message: "Invalid catalog type",
  }),
  id: requiredId,
});

// ── Company Assignments ─────────────────────────────────────

export const updateCompanyAssignmentsSchema = z.object({
  companyId: requiredId,
  type: z.enum(["industry", "product", "service"], {
    message: "Invalid assignment type",
  }),
  ids: z.preprocess(
    (v) => {
      if (typeof v === "string") {
        try { return JSON.parse(v); } catch { return []; }
      }
      return v ?? [];
    },
    z.array(z.string()),
  ),
});

// ── Meetings ────────────────────────────────────────────────

export const retryExtractionSchema = z.object({
  meetingId: requiredId,
});

export const rejectExtractionSchema = z.object({
  meetingId: requiredId,
});

export const confirmExtractionSchema = z.object({
  meetingId: requiredId,
  companyAction: z.enum(["link", "create"]),
  companyId: z.string().optional(),
  companyName: z.string().max(255).optional(),
  companyData: z.object({
    contactName: z.string().max(255).optional(),
    contactEmail: z.string().email().max(255).optional().or(z.literal("")),
    website: z.string().url().max(500).optional().or(z.literal("")),
    location: z.string().max(500).optional(),
    companySize: z.string().max(100).optional(),
    revenueRange: z.string().max(100).optional(),
    yearsInBusiness: z.number().int().min(0).max(500).optional(),
    currentTechStack: z.array(z.string()).optional(),
    socialMedia: z.object({
      linkedin: z.string().optional(),
      twitter: z.string().optional(),
      facebook: z.string().optional(),
    }).optional(),
  }),
  industryAction: z.enum(["link", "create"]),
  industryId: z.string().optional(),
  industryName: z.string().max(255).optional(),
  products: z.array(z.object({
    action: z.enum(["link", "create"]),
    id: z.string().optional(),
    name: z.string().max(255).optional(),
  })),
  services: z.array(z.object({
    action: z.enum(["link", "create"]),
    id: z.string().optional(),
    name: z.string().max(255).optional(),
  })),
  confirmedDetails: z.object({
    painPoints: z.array(z.string()),
    requirements: z.array(z.string()),
    budget: z.string().nullable(),
    timeline: z.string().nullable(),
    urgency: z.string().nullable(),
    followUpItems: z.array(z.string()),
  }),
});
