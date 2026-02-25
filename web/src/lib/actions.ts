"use server";

import { db } from "./db";
import * as s from "./schema";
import { eq, and } from "drizzle-orm";
import { generateId } from "./ids";
import { revalidatePath } from "next/cache";
import { triggerTask } from "./trigger";

// ── Companies ───────────────────────────────────────────────

export async function createCompany(formData: FormData) {
  const name = formData.get("name") as string | null;
  if (!name?.trim()) return { error: "Name is required" };

  try {
    const id = generateId("company");
    await db.insert(s.companies).values({
      id,
      name: name.trim(),
      contactName: (formData.get("contactName") as string)?.trim() || null,
      contactEmail: (formData.get("contactEmail") as string)?.trim() || null,
      contactPhone: (formData.get("contactPhone") as string)?.trim() || null,
      website: (formData.get("website") as string)?.trim() || null,
    });
    revalidatePath("/companies");
    revalidatePath("/");
    return { success: true, id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg.includes("unique")) return { error: "A company with that name already exists" };
    return { error: msg };
  }
}

export async function updateCompany(formData: FormData) {
  const id = formData.get("id") as string | null;
  const name = formData.get("name") as string | null;
  if (!id) return { error: "Missing company ID" };
  if (!name?.trim()) return { error: "Name is required" };

  try {
    const techStackRaw = (formData.get("currentTechStack") as string)?.trim();
    const techStack = techStackRaw
      ? techStackRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : null;

    const socialLinkedin = (formData.get("socialLinkedin") as string)?.trim();
    const socialTwitter = (formData.get("socialTwitter") as string)?.trim();
    const socialMedia =
      socialLinkedin || socialTwitter
        ? { linkedin: socialLinkedin || undefined, twitter: socialTwitter || undefined }
        : null;

    const yearsRaw = (formData.get("yearsInBusiness") as string)?.trim();

    await db
      .update(s.companies)
      .set({
        name: name.trim(),
        contactName: (formData.get("contactName") as string)?.trim() || null,
        contactEmail: (formData.get("contactEmail") as string)?.trim() || null,
        contactPhone: (formData.get("contactPhone") as string)?.trim() || null,
        website: (formData.get("website") as string)?.trim() || null,
        location: (formData.get("location") as string)?.trim() || null,
        companySize: (formData.get("companySize") as string)?.trim() || null,
        revenueRange: (formData.get("revenueRange") as string)?.trim() || null,
        yearsInBusiness: yearsRaw ? parseInt(yearsRaw, 10) : null,
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
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg.includes("unique")) return { error: "A company with that name already exists" };
    return { error: msg };
  }
}

// ── Projects ────────────────────────────────────────────────

export async function createProject(formData: FormData) {
  const companyId = formData.get("companyId") as string | null;
  const name = formData.get("name") as string | null;
  if (!companyId?.trim()) return { error: "Company is required" };
  if (!name?.trim()) return { error: "Name is required" };

  try {
    const id = generateId("project");
    const today = new Date().toISOString().split("T")[0];
    await db.insert(s.projects).values({
      id,
      companyId: companyId.trim(),
      name: name.trim(),
      description: (formData.get("description") as string)?.trim() || null,
      startDate: today,
    });
    revalidatePath("/projects");
    revalidatePath(`/companies/${companyId}`);
    revalidatePath("/");
    return { success: true, id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { error: msg };
  }
}

export async function updateProject(formData: FormData) {
  const id = formData.get("id") as string | null;
  const name = formData.get("name") as string | null;
  if (!id) return { error: "Missing project ID" };
  if (!name?.trim()) return { error: "Name is required" };

  try {
    const status = (formData.get("status") as string) || "planning";
    await db
      .update(s.projects)
      .set({
        name: name.trim(),
        description: (formData.get("description") as string)?.trim() || null,
        status,
        targetDate: (formData.get("targetDate") as string)?.trim() || null,
        completedDate: status === "completed" ? new Date().toISOString().split("T")[0] : null,
        updatedAt: new Date(),
      })
      .where(eq(s.projects.id, id));
    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);
    revalidatePath("/");
    return { success: true, id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { error: msg };
  }
}

// ── Tools ───────────────────────────────────────────────────

export async function createTool(formData: FormData) {
  const name = formData.get("name") as string | null;
  if (!name?.trim()) return { error: "Name is required" };

  try {
    const id = generateId("tool");
    await db.insert(s.tools).values({
      id,
      name: name.trim(),
      category: (formData.get("category") as string)?.trim() || null,
      url: (formData.get("url") as string)?.trim() || null,
      description: (formData.get("description") as string)?.trim() || null,
    });
    revalidatePath("/tools");
    revalidatePath("/");
    return { success: true, id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg.includes("unique")) return { error: "A tool with that name already exists" };
    return { error: msg };
  }
}

// ── Blueprints ──────────────────────────────────────────────

export async function createBlueprint(formData: FormData) {
  const name = formData.get("name") as string | null;
  if (!name?.trim()) return { error: "Name is required" };

  try {
    const id = generateId("blueprint");
    await db.insert(s.blueprints).values({
      id,
      name: name.trim(),
      description: (formData.get("description") as string)?.trim() || null,
    });
    revalidatePath("/blueprints");
    revalidatePath("/");
    return { success: true, id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg.includes("unique")) return { error: "A blueprint with that name already exists" };
    return { error: msg };
  }
}

// ── Catalog: Industries ─────────────────────────────────────

export async function createIndustry(formData: FormData) {
  const name = formData.get("name") as string | null;
  if (!name?.trim()) return { error: "Name is required" };

  try {
    const id = generateId("industry");
    await db.insert(s.industries).values({
      id,
      name: name.trim(),
      description: (formData.get("description") as string)?.trim() || null,
    });
    revalidatePath("/catalog");
    revalidatePath("/");
    return { success: true, id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg.includes("unique")) return { error: "An industry with that name already exists" };
    return { error: msg };
  }
}

// ── Catalog: Niches ─────────────────────────────────────────

export async function createNiche(formData: FormData) {
  const industryId = formData.get("industryId") as string | null;
  const name = formData.get("name") as string | null;
  if (!industryId?.trim()) return { error: "Industry is required" };
  if (!name?.trim()) return { error: "Name is required" };

  try {
    const id = generateId("niche");
    await db.insert(s.niches).values({
      id,
      industryId: industryId.trim(),
      name: name.trim(),
      description: (formData.get("description") as string)?.trim() || null,
    });
    revalidatePath("/catalog");
    revalidatePath("/");
    return { success: true, id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg.includes("unique")) return { error: "A niche with that name already exists in this industry" };
    return { error: msg };
  }
}

// ── Catalog: Products ───────────────────────────────────────

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string | null;
  if (!name?.trim()) return { error: "Name is required" };

  try {
    const id = generateId("product");
    await db.insert(s.products).values({
      id,
      name: name.trim(),
      description: (formData.get("description") as string)?.trim() || null,
    });
    revalidatePath("/catalog");
    revalidatePath("/");
    return { success: true, id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg.includes("unique")) return { error: "A product with that name already exists" };
    return { error: msg };
  }
}

// ── Catalog: Services ───────────────────────────────────────

export async function createService(formData: FormData) {
  const name = formData.get("name") as string | null;
  if (!name?.trim()) return { error: "Name is required" };

  try {
    const id = generateId("service");
    await db.insert(s.services).values({
      id,
      name: name.trim(),
      description: (formData.get("description") as string)?.trim() || null,
    });
    revalidatePath("/catalog");
    revalidatePath("/");
    return { success: true, id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg.includes("unique")) return { error: "A service with that name already exists" };
    return { error: msg };
  }
}

// ── Catalog: Delete ─────────────────────────────────────────

export async function deleteCatalogItem(formData: FormData) {
  const type = formData.get("type") as string | null;
  const id = formData.get("id") as string | null;
  if (!type || !id) return { error: "Missing type or id" };

  try {
    const now = new Date();
    if (type === "industry") {
      await db.update(s.industries).set({ deletedAt: now }).where(eq(s.industries.id, id));
    } else if (type === "niche") {
      await db.update(s.niches).set({ deletedAt: now }).where(eq(s.niches.id, id));
    } else if (type === "product") {
      await db.update(s.products).set({ deletedAt: now }).where(eq(s.products.id, id));
    } else if (type === "service") {
      await db.update(s.services).set({ deletedAt: now }).where(eq(s.services.id, id));
    } else {
      return { error: "Invalid type" };
    }
    revalidatePath("/catalog");
    revalidatePath("/companies");
    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { error: msg };
  }
}

// ── Company Assignments ─────────────────────────────────────

export async function updateCompanyAssignments(formData: FormData) {
  const companyId = formData.get("companyId") as string | null;
  const type = formData.get("type") as string | null;
  const idsJson = formData.get("ids") as string | null;
  if (!companyId || !type) return { error: "Missing companyId or type" };

  const ids: string[] = idsJson ? JSON.parse(idsJson) : [];

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
    } else {
      return { error: "Invalid type" };
    }
    revalidatePath("/catalog");
    revalidatePath(`/companies/${companyId}`);
    revalidatePath("/companies");
    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { error: msg };
  }
}

// ── Meetings: Retry Extraction ──────────────────────────────

export async function retryExtraction(meetingId: string) {
  try {
    // Delete existing extraction if any
    await db
      .delete(s.meetingExtractions)
      .where(eq(s.meetingExtractions.meetingId, meetingId));

    // Reset meeting status
    await db
      .update(s.meetings)
      .set({ status: "pending_extraction", updatedAt: new Date() })
      .where(eq(s.meetings.id, meetingId));

    // Trigger extraction task
    await triggerTask("extract-meeting", { meetingId });

    revalidatePath("/meetings");
    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { error: msg };
  }
}

// ── Meetings: Reject Extraction ─────────────────────────────

export async function rejectExtraction(meetingId: string) {
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
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { error: msg };
  }
}

// ── Meetings: Confirm Extraction ────────────────────────────

interface ConfirmPayload {
  meetingId: string;
  companyAction: "link" | "create";
  companyId?: string; // when linking
  companyName?: string; // when creating
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
  try {
    // Use a transaction for atomicity
    const result = await db.transaction(async (tx) => {
      // 1. Resolve company
      let companyId: string;
      if (payload.companyAction === "link" && payload.companyId) {
        companyId = payload.companyId;
        // Update company with enrichment data
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

      // Link industry to company if resolved
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
        // Check if junction already exists
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
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { error: msg };
  }
}
