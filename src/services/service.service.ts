import { eq, and, isNull, ilike, or } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { generateId } from "../utils/id.js";
import type { CreateServiceInput, ListServicesFilter } from "../types/service.types.js";

const { services } = schema;

export async function createService(input: CreateServiceInput) {
  const id = generateId("service");
  const [service] = await db
    .insert(services)
    .values({
      id,
      name: input.name,
      description: input.description || null,
    })
    .returning();
  return service;
}

export async function listServices(filter: ListServicesFilter = {}) {
  const conditions = [isNull(services.deletedAt)];

  if (filter.search) {
    conditions.push(
      or(
        ilike(services.name, `%${filter.search}%`),
        ilike(services.description, `%${filter.search}%`)
      )!
    );
  }

  return db
    .select()
    .from(services)
    .where(and(...conditions))
    .orderBy(services.name);
}

export async function getService(idOrName: string) {
  const [byId] = await db
    .select()
    .from(services)
    .where(and(eq(services.id, idOrName), isNull(services.deletedAt)));

  if (byId) return byId;

  const [byName] = await db
    .select()
    .from(services)
    .where(and(eq(services.name, idOrName), isNull(services.deletedAt)));

  return byName || null;
}
