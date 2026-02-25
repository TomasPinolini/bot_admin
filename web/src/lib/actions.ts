"use server";

import { db } from "./db";
import * as s from "./schema";
import { eq, and } from "drizzle-orm";
import { generateId } from "./ids";
import { revalidatePath } from "next/cache";
import { triggerTask } from "./trigger";
import { auth } from "./auth";
import { sanitizeError } from "./errors";
import {
  createCompanySchema,
  updateCompanySchema,
  createProjectSchema,
  updateProjectSchema,
  createToolSchema,
  createBlueprintSchema,
  createIndustrySchema,
  createNicheSchema,
  createProductSchema,
  createServiceSchema,
  deleteCatalogItemSchema,
  updateCompanyAssignmentsSchema,
  confirmExtractionSchema,
} from "./validations";

async function requireAuth() {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };
  return null;
}

function formToObject(formData: FormData, fields: string[]): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const field of fields) {
    obj[field] = formData.get(field) as string | null;
  }
  return obj;
}

// ── Companies ───────────────────────────────────────────────

export async function createCompany(formData: FormData) {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = createCompanySchema.safeParse(
    formToObject(formData, ["name", "contactName", "contactEmail", "contactPhone", "website"]),
  );
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const id = generateId("company");
    await db.insert(s.companies).values({
      id,
      name: parsed.data.name,
      contactName: parsed.data.contactName,
      contactEmail: parsed.data.contactEmail,
      contactPhone: parsed.data.contactPhone,
      website: parsed.data.website,
    });
    revalidatePath("/companies");
    revalidatePath("/");
    return { success: true, id };
  } catch (e: unknown) {
    return { error: sanitizeError(e, "createCompany") };
  }
}

export async function updateCompany(formData: FormData) {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = updateCompanySchema.safeParse(
    formToObject(formData, [
      "id", "name", "contactName", "contactEmail", "contactPhone", "website",
      "location", "companySize", "revenueRange", "yearsInBusiness",
      "currentTechStack", "socialLinkedin", "socialTwitter",
    ]),
  );
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const { id, currentTechStack, socialLinkedin, socialTwitter, yearsInBusiness, ...rest } = parsed.data;

    const techStack = currentTechStack
      ? currentTechStack.split(",").map((s) => s.trim()).filter(Boolean)
      : null;

    const socialMedia =
      socialLinkedin || socialTwitter
        ? { linkedin: socialLinkedin || undefined, twitter: socialTwitter || undefined }
        : null;

    await db
      .update(s.companies)
      .set({
        ...rest,
        yearsInBusiness: yearsInBusiness ?? null,
        currentTechStack: techStack,
        socialMedia,
        updatedAt: new Date(),
      })
      .where(eq(s.companies.id, id));
    revalidatePath("/companies");
    revalidatePath(`/companies/${id}`);
    revalidatePath("/");
    return { success: true, id };
  } catch (e: unknown) {
    return { error: sanitizeError(e, "updateCompany") };
  }
}

// ── Projects ────────────────────────────────────────────────

export async function createProject(formData: FormData) {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = createProjectSchema.safeParse(
    formToObject(formData, ["companyId", "name", "description"]),
  );
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const id = generateId("project");
    const today = new Date().toISOString().split("T")[0];
    await db.insert(s.projects).values({
      id,
      companyId: parsed.data.companyId,
      name: parsed.data.name,
      description: parsed.data.description,
      startDate: today,
    });
    revalidatePath("/projects");
    revalidatePath(`/companies/${parsed.data.companyId}`);
    revalidatePath("/");
    return { success: true, id };
  } catch (e: unknown) {
    return { error: sanitizeError(e, "createProject") };
  }
}

export async function updateProject(formData: FormData) {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = updateProjectSchema.safeParse(
    formToObject(formData, ["id", "name", "description", "status", "targetDate"]),
  );
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const { id, status, ...rest } = parsed.data;
    await db
      .update(s.projects)
      .set({
        ...rest,
        status,
        completedDate: status === "completed" ? new Date().toISOString().split("T")[0] : null,
        updatedAt: new Date(),
      })
      .where(eq(s.projects.id, id));
    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);
    revalidatePath("/");
    return { success: true, id };
  } catch (e: unknown) {
    return { error: sanitizeError(e, "updateProject") };
  }
}

// ── Tools ───────────────────────────────────────────────────

export async function createTool(formData: FormData) {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = createToolSchema.safeParse(
    formToObject(formData, ["name", "category", "url", "description"]),
  );
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const id = generateId("tool");
    await db.insert(s.tools).values({
      id,
      name: parsed.data.name,
      category: parsed.data.category,
      url: parsed.data.url,
      description: parsed.data.description,
    });
    revalidatePath("/tools");
    revalidatePath("/");
    return { success: true, id };
  } catch (e: unknown) {
    return { error: sanitizeError(e, "createTool") };
  }
}

// ── Blueprints ──────────────────────────────────────────────

export async function createBlueprint(formData: FormData) {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = createBlueprintSchema.safeParse(
    formToObject(formData, ["name", "description"]),
  );
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const id = generateId("blueprint");
    await db.insert(s.blueprints).values({
      id,
      name: parsed.data.name,
      description: parsed.data.description,
    });
    revalidatePath("/blueprints");
    revalidatePath("/");
    return { success: true, id };
  } catch (e: unknown) {
    return { error: sanitizeError(e, "createBlueprint") };
  }
}

// ── Catalog: Industries ─────────────────────────────────────

export async function createIndustry(formData: FormData) {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = createIndustrySchema.safeParse(
    formToObject(formData, ["name", "description"]),
  );
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const id = generateId("industry");
    await db.insert(s.industries).values({
      id,
      name: parsed.data.name,
      description: parsed.data.description,
    });
    revalidatePath("/catalog");
    revalidatePath("/");
    return { success: true, id };
  } catch (e: unknown) {
    return { error: sanitizeError(e, "createIndustry") };
  }
}

// ── Catalog: Niches ─────────────────────────────────────────

export async function createNiche(formData: FormData) {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = createNicheSchema.safeParse(
    formToObject(formData, ["industryId", "name", "description"]),
  );
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const id = generateId("niche");
    await db.insert(s.niches).values({
      id,
      industryId: parsed.data.industryId,
      name: parsed.data.name,
      description: parsed.data.description,
    });
    revalidatePath("/catalog");
    revalidatePath("/");
    return { success: true, id };
  } catch (e: unknown) {
    return { error: sanitizeError(e, "createNiche") };
  }
}

// ── Catalog: Products ───────────────────────────────────────

export async function createProduct(formData: FormData) {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = createProductSchema.safeParse(
    formToObject(formData, ["name", "description"]),
  );
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const id = generateId("product");
    await db.insert(s.products).values({
      id,
      name: parsed.data.name,
      description: parsed.data.description,
    });
    revalidatePath("/catalog");
    revalidatePath("/");
    return { success: true, id };
  } catch (e: unknown) {
    return { error: sanitizeError(e, "createProduct") };
  }
}

// ── Catalog: Services ───────────────────────────────────────

export async function createService(formData: FormData) {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = createServiceSchema.safeParse(
    formToObject(formData, ["name", "description"]),
  );
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const id = generateId("service");
    await db.insert(s.services).values({
      id,
      name: parsed.data.name,
      description: parsed.data.description,
    });
    revalidatePath("/catalog");
    revalidatePath("/");
    return { success: true, id };
  } catch (e: unknown) {
    return { error: sanitizeError(e, "createService") };
  }
}

// ── Catalog: Delete ─────────────────────────────────────────

export async function deleteCatalogItem(formData: FormData) {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = deleteCatalogItemSchema.safeParse(
    formToObject(formData, ["type", "id"]),
  );
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const { type, id } = parsed.data;
    const now = new Date();
    if (type === "industry") {
      await db.update(s.industries).set({ deletedAt: now }).where(eq(s.industries.id, id));
    } else if (type === "niche") {
      await db.update(s.niches).set({ deletedAt: now }).where(eq(s.niches.id, id));
    } else if (type === "product") {
      await db.update(s.products).set({ deletedAt: now }).where(eq(s.products.id, id));
    } else if (type === "service") {
      await db.update(s.services).set({ deletedAt: now }).where(eq(s.services.id, id));
    }
    revalidatePath("/catalog");
    revalidatePath("/companies");
    return { success: true };
  } catch (e: unknown) {
    return { error: sanitizeError(e, "deleteCatalogItem") };
  }
}

// ── Company Assignments ─────────────────────────────────────

export async function updateCompanyAssignments(formData: FormData) {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = updateCompanyAssignmentsSchema.safeParse(
    formToObject(formData, ["companyId", "type", "ids"]),
  );
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { companyId, type, ids } = parsed.data;

  try {
    if (type === "industry") {
      await db.delete(s.companyIndustries).where(eq(s.companyIndustries.companyId, companyId));
      if (ids.length > 0) {
        await db.insert(s.companyIndustries).values(
          ids.map((industryId) => ({
            id: generateId("companyIndustry"),
            companyId,
            industryId,
          }))
        );
      }
    } else if (type === "product") {
      await db.delete(s.companyProducts).where(eq(s.companyProducts.companyId, companyId));
      if (ids.length > 0) {
        await db.insert(s.companyProducts).values(
          ids.map((productId) => ({
            id: generateId("companyProduct"),
            companyId,
            productId,
          }))
        );
      }
    } else if (type === "service") {
      await db.delete(s.companyServices).where(eq(s.companyServices.companyId, companyId));
      if (ids.length > 0) {
        await db.insert(s.companyServices).values(
          ids.map((serviceId) => ({
            id: generateId("companyService"),
            companyId,
            serviceId,
          }))
        );
      }
    }
    revalidatePath("/catalog");
    revalidatePath(`/companies/${companyId}`);
    revalidatePath("/companies");
    return { success: true };
  } catch (e: unknown) {
    return { error: sanitizeError(e, "updateCompanyAssignments") };
  }
}

// ── Meetings: Retry Extraction ──────────────────────────────

export async function retryExtraction(meetingId: string) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    await db
      .delete(s.meetingExtractions)
      .where(eq(s.meetingExtractions.meetingId, meetingId));

    await db
      .update(s.meetings)
      .set({ status: "pending_extraction", updatedAt: new Date() })
      .where(eq(s.meetings.id, meetingId));

    await triggerTask("extract-meeting", { meetingId });

    revalidatePath("/meetings");
    return { success: true };
  } catch (e: unknown) {
    return { error: sanitizeError(e, "retryExtraction") };
  }
}

// ── Meetings: Reject Extraction ─────────────────────────────

export async function rejectExtraction(meetingId: string) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    await db
      .update(s.meetings)
      .set({ status: "rejected", updatedAt: new Date() })
      .where(eq(s.meetings.id, meetingId));

    await db
      .update(s.meetingExtractions)
      .set({ status: "rejected", updatedAt: new Date() })
      .where(eq(s.meetingExtractions.meetingId, meetingId));

    revalidatePath("/meetings");
    revalidatePath(`/meetings/${meetingId}/review`);
    return { success: true };
  } catch (e: unknown) {
    return { error: sanitizeError(e, "rejectExtraction") };
  }
}

// ── Meetings: Confirm Extraction ────────────────────────────

interface ConfirmPayload {
  meetingId: string;
  companyAction: "link" | "create";
  companyId?: string;
  companyName?: string;
  companyData: {
    contactName?: string;
    contactEmail?: string;
    website?: string;
    location?: string;
    companySize?: string;
    revenueRange?: string;
    yearsInBusiness?: number;
    currentTechStack?: string[];
    socialMedia?: { linkedin?: string; twitter?: string; facebook?: string };
  };
  industryAction: "link" | "create";
  industryId?: string;
  industryName?: string;
  products: Array<{ action: "link" | "create"; id?: string; name?: string }>;
  services: Array<{ action: "link" | "create"; id?: string; name?: string }>;
  confirmedDetails: {
    painPoints: string[];
    requirements: string[];
    budget: string | null;
    timeline: string | null;
    urgency: string | null;
    followUpItems: string[];
  };
}

export async function confirmExtraction(payload: ConfirmPayload) {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = confirmExtractionSchema.safeParse(payload);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const result = await db.transaction(async (tx) => {
      // 1. Resolve company
      let companyId: string;
      if (payload.companyAction === "link" && payload.companyId) {
        companyId = payload.companyId;
        await tx
          .update(s.companies)
          .set({
            contactName: payload.companyData.contactName || undefined,
            contactEmail: payload.companyData.contactEmail || undefined,
            website: payload.companyData.website || undefined,
            location: payload.companyData.location || undefined,
            companySize: payload.companyData.companySize || undefined,
            revenueRange: payload.companyData.revenueRange || undefined,
            yearsInBusiness: payload.companyData.yearsInBusiness || undefined,
            currentTechStack: payload.companyData.currentTechStack?.length
              ? payload.companyData.currentTechStack
              : undefined,
            socialMedia: payload.companyData.socialMedia || undefined,
            updatedAt: new Date(),
          })
          .where(eq(s.companies.id, companyId));
      } else {
        companyId = generateId("company");
        await tx.insert(s.companies).values({
          id: companyId,
          name: payload.companyName!.trim(),
          contactName: payload.companyData.contactName || null,
          contactEmail: payload.companyData.contactEmail || null,
          website: payload.companyData.website || null,
          location: payload.companyData.location || null,
          companySize: payload.companyData.companySize || null,
          revenueRange: payload.companyData.revenueRange || null,
          yearsInBusiness: payload.companyData.yearsInBusiness || null,
          currentTechStack: payload.companyData.currentTechStack?.length
            ? payload.companyData.currentTechStack
            : null,
          socialMedia: payload.companyData.socialMedia || null,
        });
      }

      // 2. Resolve industry
      let industryId: string | null = null;
      if (payload.industryAction === "link" && payload.industryId) {
        industryId = payload.industryId;
      } else if (payload.industryName) {
        industryId = generateId("industry");
        await tx.insert(s.industries).values({
          id: industryId,
          name: payload.industryName.trim(),
        });
      }

      if (industryId) {
        await tx
          .delete(s.companyIndustries)
          .where(eq(s.companyIndustries.companyId, companyId));
        await tx.insert(s.companyIndustries).values({
          id: generateId("companyIndustry"),
          companyId,
          industryId,
        });
      }

      // 3. Resolve products
      for (const p of payload.products) {
        let productId: string;
        if (p.action === "link" && p.id) {
          productId = p.id;
        } else {
          productId = generateId("product");
          await tx.insert(s.products).values({
            id: productId,
            name: p.name!.trim(),
          });
        }
        const existing = await tx
          .select({ id: s.companyProducts.id })
          .from(s.companyProducts)
          .where(
            and(
              eq(s.companyProducts.companyId, companyId),
              eq(s.companyProducts.productId, productId)
            )
          )
          .limit(1);
        if (existing.length === 0) {
          await tx.insert(s.companyProducts).values({
            id: generateId("companyProduct"),
            companyId,
            productId,
          });
        }
      }

      // 4. Resolve services
      for (const sv of payload.services) {
        let serviceId: string;
        if (sv.action === "link" && sv.id) {
          serviceId = sv.id;
        } else {
          serviceId = generateId("service");
          await tx.insert(s.services).values({
            id: serviceId,
            name: sv.name!.trim(),
          });
        }
        const existing = await tx
          .select({ id: s.companyServices.id })
          .from(s.companyServices)
          .where(
            and(
              eq(s.companyServices.companyId, companyId),
              eq(s.companyServices.serviceId, serviceId)
            )
          )
          .limit(1);
        if (existing.length === 0) {
          await tx.insert(s.companyServices).values({
            id: generateId("companyService"),
            companyId,
            serviceId,
          });
        }
      }

      // 5. Update meeting
      await tx
        .update(s.meetings)
        .set({
          companyId,
          status: "reviewed",
          updatedAt: new Date(),
        })
        .where(eq(s.meetings.id, payload.meetingId));

      // 6. Update extraction
      await tx
        .update(s.meetingExtractions)
        .set({
          confirmedData: {
            companyId,
            industryId,
            ...payload.confirmedDetails,
          },
          status: "confirmed",
          updatedAt: new Date(),
        })
        .where(eq(s.meetingExtractions.meetingId, payload.meetingId));

      return { companyId };
    });

    revalidatePath("/meetings");
    revalidatePath("/companies");
    revalidatePath("/");
    return { success: true, companyId: result.companyId };
  } catch (e: unknown) {
    return { error: sanitizeError(e, "confirmExtraction") };
  }
}
