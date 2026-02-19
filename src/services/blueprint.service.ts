import { eq, and, isNull, ilike, or, asc } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { generateId } from "../utils/id.js";
import type {
  CreateBlueprintInput,
  AddBlueprintStepInput,
  AddBlueprintToolInput,
  ApplyBlueprintInput,
  ListBlueprintsFilter,
  AssignBlueprintIndustryInput,
  AssignBlueprintNicheInput,
} from "../types/blueprint.types.js";

const {
  blueprints,
  blueprintSteps,
  blueprintTools,
  blueprintIndustries,
  blueprintNiches,
  tools,
  projects,
  projectTools,
  industries,
  niches,
} = schema;

export async function createBlueprint(input: CreateBlueprintInput) {
  const id = generateId("blueprint");
  const [bp] = await db
    .insert(blueprints)
    .values({
      id,
      name: input.name,
      description: input.description || null,
    })
    .returning();
  return bp;
}

export async function listBlueprints(filter: ListBlueprintsFilter = {}) {
  const conditions = [isNull(blueprints.deletedAt)];

  if (filter.search) {
    conditions.push(
      or(
        ilike(blueprints.name, `%${filter.search}%`),
        ilike(blueprints.description, `%${filter.search}%`)
      )!
    );
  }

  return db
    .select()
    .from(blueprints)
    .where(and(...conditions))
    .orderBy(blueprints.name);
}

export async function getBlueprint(id: string) {
  const [bp] = await db
    .select()
    .from(blueprints)
    .where(and(eq(blueprints.id, id), isNull(blueprints.deletedAt)));

  if (!bp) return null;

  const steps = await db
    .select()
    .from(blueprintSteps)
    .where(eq(blueprintSteps.blueprintId, id))
    .orderBy(asc(blueprintSteps.stepOrder));

  const bpTools = await db
    .select({
      id: blueprintTools.id,
      toolId: blueprintTools.toolId,
      toolName: tools.name,
      roleInBlueprint: blueprintTools.roleInBlueprint,
      notes: blueprintTools.notes,
    })
    .from(blueprintTools)
    .innerJoin(tools, eq(blueprintTools.toolId, tools.id))
    .where(eq(blueprintTools.blueprintId, id));

  const linkedIndustries = await getBlueprintIndustries(id);
  const linkedNiches = await getBlueprintNiches(id);

  return { ...bp, steps, tools: bpTools, industries: linkedIndustries, niches: linkedNiches };
}

export async function addStep(input: AddBlueprintStepInput) {
  const id = generateId("blueprintStep");
  const [step] = await db
    .insert(blueprintSteps)
    .values({
      id,
      blueprintId: input.blueprintId,
      stepOrder: input.stepOrder,
      title: input.title,
      description: input.description || null,
    })
    .returning();
  return step;
}

export async function addTool(input: AddBlueprintToolInput) {
  const id = generateId("blueprintTool");
  const [bt] = await db
    .insert(blueprintTools)
    .values({
      id,
      blueprintId: input.blueprintId,
      toolId: input.toolId,
      roleInBlueprint: input.roleInBlueprint || null,
      notes: input.notes || null,
    })
    .returning();
  return bt;
}

export async function applyBlueprint(input: ApplyBlueprintInput) {
  const bp = await getBlueprint(input.blueprintId);
  if (!bp) return null;

  const projectId = generateId("project");
  const projectName =
    input.projectName || `${bp.name} (from blueprint)`;

  const [project] = await db
    .insert(projects)
    .values({
      id: projectId,
      companyId: input.companyId,
      name: projectName,
      description: bp.description,
    })
    .returning();

  for (const bt of bp.tools) {
    const ptId = generateId("projectTool");
    await db.insert(projectTools).values({
      id: ptId,
      projectId: projectId,
      toolId: bt.toolId,
      notes: bt.notes,
    });
  }

  return { project, blueprint: bp };
}

// ── Junction helpers ──────────────────────────────────────

export async function assignIndustry(input: AssignBlueprintIndustryInput) {
  const id = generateId("blueprintIndustry");
  const [row] = await db
    .insert(blueprintIndustries)
    .values({ id, blueprintId: input.blueprintId, industryId: input.industryId })
    .returning();
  return row;
}

export async function removeIndustry(blueprintId: string, industryId: string) {
  const [row] = await db
    .delete(blueprintIndustries)
    .where(and(eq(blueprintIndustries.blueprintId, blueprintId), eq(blueprintIndustries.industryId, industryId)))
    .returning();
  return row || null;
}

export async function assignNiche(input: AssignBlueprintNicheInput) {
  const id = generateId("blueprintNiche");
  const [row] = await db
    .insert(blueprintNiches)
    .values({ id, blueprintId: input.blueprintId, nicheId: input.nicheId })
    .returning();
  return row;
}

export async function removeNiche(blueprintId: string, nicheId: string) {
  const [row] = await db
    .delete(blueprintNiches)
    .where(and(eq(blueprintNiches.blueprintId, blueprintId), eq(blueprintNiches.nicheId, nicheId)))
    .returning();
  return row || null;
}

export async function getBlueprintIndustries(blueprintId: string) {
  return db
    .select({
      id: blueprintIndustries.id,
      industryId: industries.id,
      industryName: industries.name,
    })
    .from(blueprintIndustries)
    .innerJoin(industries, eq(blueprintIndustries.industryId, industries.id))
    .where(eq(blueprintIndustries.blueprintId, blueprintId));
}

export async function getBlueprintNiches(blueprintId: string) {
  return db
    .select({
      id: blueprintNiches.id,
      nicheId: niches.id,
      nicheName: niches.name,
      industryName: industries.name,
    })
    .from(blueprintNiches)
    .innerJoin(niches, eq(blueprintNiches.nicheId, niches.id))
    .innerJoin(industries, eq(niches.industryId, industries.id))
    .where(eq(blueprintNiches.blueprintId, blueprintId));
}
