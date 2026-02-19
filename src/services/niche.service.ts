import { eq, and, isNull, ilike, or } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { generateId } from "../utils/id.js";
import type { CreateNicheInput, ListNichesFilter } from "../types/niche.types.js";

const { niches, industries } = schema;

export async function createNiche(input: CreateNicheInput) {
  const id = generateId("niche");
  const [niche] = await db
    .insert(niches)
    .values({
      id,
      industryId: input.industryId,
      name: input.name,
      description: input.description || null,
    })
    .returning();
  return niche;
}

export async function listNiches(filter: ListNichesFilter = {}) {
  const conditions = [isNull(niches.deletedAt)];

  if (filter.industryId) {
    conditions.push(eq(niches.industryId, filter.industryId));
  }
  if (filter.search) {
    conditions.push(
      or(
        ilike(niches.name, `%${filter.search}%`),
        ilike(niches.description, `%${filter.search}%`)
      )!
    );
  }

  return db
    .select({
      id: niches.id,
      industryId: niches.industryId,
      industryName: industries.name,
      name: niches.name,
      description: niches.description,
      createdAt: niches.createdAt,
      deletedAt: niches.deletedAt,
    })
    .from(niches)
    .innerJoin(industries, eq(niches.industryId, industries.id))
    .where(and(...conditions))
    .orderBy(niches.name);
}

export async function getNiche(idOrName: string) {
  const [byId] = await db
    .select({
      id: niches.id,
      industryId: niches.industryId,
      industryName: industries.name,
      name: niches.name,
      description: niches.description,
      createdAt: niches.createdAt,
      deletedAt: niches.deletedAt,
    })
    .from(niches)
    .innerJoin(industries, eq(niches.industryId, industries.id))
    .where(and(eq(niches.id, idOrName), isNull(niches.deletedAt)));

  if (byId) return byId;

  const [byName] = await db
    .select({
      id: niches.id,
      industryId: niches.industryId,
      industryName: industries.name,
      name: niches.name,
      description: niches.description,
      createdAt: niches.createdAt,
      deletedAt: niches.deletedAt,
    })
    .from(niches)
    .innerJoin(industries, eq(niches.industryId, industries.id))
    .where(and(eq(niches.name, idOrName), isNull(niches.deletedAt)));

  return byName || null;
}
