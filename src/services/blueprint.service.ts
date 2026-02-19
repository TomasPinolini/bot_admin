import { eq, and, isNull, ilike, or, asc } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { generateId } from "../utils/id.js";
import type {
  CreateBlueprintInput,
  AddBlueprintStepInput,
  AddBlueprintToolInput,
  ApplyBlueprintInput,
  ListBlueprintsFilter,
} from "../types/blueprint.types.js";

const {
  blueprints,
  blueprintSteps,
  blueprintTools,
  tools,
  projects,
  projectTools,
} = schema;

export async function createBlueprint(input: CreateBlueprintInput) {
  const id = generateId("blueprint");
  const [bp] = await db
    .insert(blueprints)
    .values({
      id,
      name: input.name,
      description: input.description || null,
      targetIndustry: input.targetIndustry || null,
      targetNiche: input.targetNiche || null,
    })
    .returning();
  return bp;
}

export async function listBlueprints(filter: ListBlueprintsFilter = {}) {
  const conditions = [isNull(blueprints.deletedAt)];

  if (filter.industry) {
    conditions.push(ilike(blueprints.targetIndustry, `%${filter.industry}%`));
  }
  if (filter.niche) {
    conditions.push(ilike(blueprints.targetNiche, `%${filter.niche}%`));
  }
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

  return { ...bp, steps, tools: bpTools };
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

  // Create a project from the blueprint
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

  // Assign blueprint tools to the project
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
