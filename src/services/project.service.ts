import { eq, and, isNull, ilike, or } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { generateId } from "../utils/id.js";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  ListProjectsFilter,
  AssignToolInput,
} from "../types/project.types.js";

const { projects, projectTools, tools, companies } = schema;

const PHASE_ORDER = [
  "planning",
  "in_progress",
  "review",
  "completed",
] as const;

export async function createProject(input: CreateProjectInput) {
  const id = generateId("project");
  const [project] = await db
    .insert(projects)
    .values({
      id,
      companyId: input.companyId,
      name: input.name,
      description: input.description || null,
      startDate: input.startDate || null,
      targetDate: input.targetDate || null,
    })
    .returning();
  return project;
}

export async function listProjects(filter: ListProjectsFilter = {}) {
  const conditions = [isNull(projects.deletedAt)];

  if (filter.companyId) {
    conditions.push(eq(projects.companyId, filter.companyId));
  }
  if (filter.status) {
    conditions.push(eq(projects.status, filter.status));
  }
  if (filter.search) {
    conditions.push(
      or(
        ilike(projects.name, `%${filter.search}%`),
        ilike(projects.description, `%${filter.search}%`)
      )!
    );
  }

  return db
    .select({
      id: projects.id,
      companyId: projects.companyId,
      companyName: companies.name,
      name: projects.name,
      description: projects.description,
      status: projects.status,
      startDate: projects.startDate,
      targetDate: projects.targetDate,
      completedDate: projects.completedDate,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
    })
    .from(projects)
    .leftJoin(companies, eq(projects.companyId, companies.id))
    .where(and(...conditions))
    .orderBy(projects.createdAt);
}

export async function getProject(id: string) {
  const [project] = await db
    .select({
      id: projects.id,
      companyId: projects.companyId,
      companyName: companies.name,
      name: projects.name,
      description: projects.description,
      status: projects.status,
      startDate: projects.startDate,
      targetDate: projects.targetDate,
      completedDate: projects.completedDate,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
    })
    .from(projects)
    .leftJoin(companies, eq(projects.companyId, companies.id))
    .where(and(eq(projects.id, id), isNull(projects.deletedAt)));

  return project || null;
}

export async function updateProject(id: string, input: UpdateProjectInput) {
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (input.name !== undefined) updates.name = input.name;
  if (input.description !== undefined) updates.description = input.description;
  if (input.status !== undefined) updates.status = input.status;
  if (input.startDate !== undefined) updates.startDate = input.startDate;
  if (input.targetDate !== undefined) updates.targetDate = input.targetDate;
  if (input.completedDate !== undefined) updates.completedDate = input.completedDate;

  const [project] = await db
    .update(projects)
    .set(updates)
    .where(eq(projects.id, id))
    .returning();
  return project;
}

export async function advanceProject(id: string) {
  const project = await getProject(id);
  if (!project) return null;

  const currentIdx = PHASE_ORDER.indexOf(
    project.status as (typeof PHASE_ORDER)[number]
  );
  if (currentIdx === -1 || currentIdx >= PHASE_ORDER.length - 1) {
    return { project, advanced: false, reason: "Already at final status" };
  }

  const nextStatus = PHASE_ORDER[currentIdx + 1];
  const updates: Record<string, unknown> = {
    status: nextStatus,
    updatedAt: new Date(),
  };
  if (nextStatus === "completed") {
    updates.completedDate = new Date().toISOString().split("T")[0];
  }

  const [updated] = await db
    .update(projects)
    .set(updates)
    .where(eq(projects.id, id))
    .returning();

  return { project: { ...updated, companyName: project.companyName }, advanced: true, newStatus: nextStatus };
}

export async function assignTool(input: AssignToolInput) {
  const id = generateId("projectTool");
  const [pt] = await db
    .insert(projectTools)
    .values({
      id,
      projectId: input.projectId,
      toolId: input.toolId,
      configJson: input.configJson || null,
      notes: input.notes || null,
    })
    .returning();
  return pt;
}

export async function getProjectTools(projectId: string) {
  return db
    .select({
      id: projectTools.id,
      toolId: projectTools.toolId,
      toolName: tools.name,
      toolCategory: tools.category,
      configJson: projectTools.configJson,
      notes: projectTools.notes,
      createdAt: projectTools.createdAt,
    })
    .from(projectTools)
    .innerJoin(tools, eq(projectTools.toolId, tools.id))
    .where(eq(projectTools.projectId, projectId));
}
