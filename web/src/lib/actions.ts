"use server";

import { db } from "./db";
import * as s from "./schema";
import { eq, and } from "drizzle-orm";
import { generateId } from "./ids";
import { revalidatePath } from "next/cache";

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
    await db
      .update(s.companies)
      .set({
        name: name.trim(),
        contactName: (formData.get("contactName") as string)?.trim() || null,
        contactEmail: (formData.get("contactEmail") as string)?.trim() || null,
        contactPhone: (formData.get("contactPhone") as string)?.trim() || null,
        website: (formData.get("website") as string)?.trim() || null,
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
