import { eq, and, isNull, ilike, or } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { generateId } from "../utils/id.js";
import type { CreateIndustryInput, ListIndustriesFilter } from "../types/industry.types.js";

const { industries } = schema;

export async function createIndustry(input: CreateIndustryInput) {
  const id = generateId("industry");
  const [industry] = await db
    .insert(industries)
    .values({
      id,
      name: input.name,
      description: input.description || null,
    })
    .returning();
  return industry;
}

export async function listIndustries(filter: ListIndustriesFilter = {}) {
  const conditions = [isNull(industries.deletedAt)];

  if (filter.search) {
    conditions.push(
      or(
        ilike(industries.name, `%${filter.search}%`),
        ilike(industries.description, `%${filter.search}%`)
      )!
    );
  }

  return db
    .select()
    .from(industries)
    .where(and(...conditions))
    .orderBy(industries.name);
}

export async function getIndustry(idOrName: string) {
  const [byId] = await db
    .select()
    .from(industries)
    .where(and(eq(industries.id, idOrName), isNull(industries.deletedAt)));

  if (byId) return byId;

  const [byName] = await db
    .select()
    .from(industries)
    .where(and(eq(industries.name, idOrName), isNull(industries.deletedAt)));

  return byName || null;
}
