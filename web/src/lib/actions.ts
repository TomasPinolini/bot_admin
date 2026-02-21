"use server";

import { db } from "./db";
import * as s from "./schema";
import { eq } from "drizzle-orm";
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
