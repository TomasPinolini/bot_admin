import { eq, and, isNull, ilike, or } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { generateId } from "../utils/id.js";
import type { CreateToolInput, ListToolsFilter } from "../types/tool.types.js";

const { tools } = schema;

export async function createTool(input: CreateToolInput) {
  const id = generateId("tool");
  const [tool] = await db
    .insert(tools)
    .values({
      id,
      name: input.name,
      category: input.category || null,
      url: input.url || null,
      description: input.description || null,
    })
    .returning();
  return tool;
}

export async function listTools(filter: ListToolsFilter = {}) {
  const conditions = [isNull(tools.deletedAt)];

  if (filter.category) {
    conditions.push(eq(tools.category, filter.category));
  }
  if (filter.search) {
    conditions.push(
      or(
        ilike(tools.name, `%${filter.search}%`),
        ilike(tools.description, `%${filter.search}%`)
      )!
    );
  }

  return db
    .select()
    .from(tools)
    .where(and(...conditions))
    .orderBy(tools.name);
}

export async function getTool(idOrName: string) {
  const [byId] = await db
    .select()
    .from(tools)
    .where(and(eq(tools.id, idOrName), isNull(tools.deletedAt)));

  if (byId) return byId;

  const [byName] = await db
    .select()
    .from(tools)
    .where(and(eq(tools.name, idOrName), isNull(tools.deletedAt)));

  return byName || null;
}
