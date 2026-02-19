import { eq, and, isNull, ilike, or } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { generateId } from "../utils/id.js";
import type {
  CreateCompanyInput,
  UpdateCompanyInput,
  ListCompaniesFilter,
} from "../types/company.types.js";

const { companies } = schema;

export async function createCompany(input: CreateCompanyInput) {
  const id = generateId("company");
  const [company] = await db
    .insert(companies)
    .values({
      id,
      name: input.name,
      industry: input.industry,
      niche: input.niche || null,
      contactName: input.contactName || null,
      contactEmail: input.contactEmail || null,
      contactPhone: input.contactPhone || null,
      website: input.website || null,
      notes: input.notes || null,
    })
    .returning();
  return company;
}

export async function listCompanies(filter: ListCompaniesFilter = {}) {
  const conditions = [isNull(companies.deletedAt)];

  if (filter.industry) {
    conditions.push(ilike(companies.industry, `%${filter.industry}%`));
  }
  if (filter.status) {
    conditions.push(eq(companies.status, filter.status));
  }
  if (filter.search) {
    conditions.push(
      or(
        ilike(companies.name, `%${filter.search}%`),
        ilike(companies.industry, `%${filter.search}%`),
        ilike(companies.niche, `%${filter.search}%`)
      )!
    );
  }

  return db
    .select()
    .from(companies)
    .where(and(...conditions))
    .orderBy(companies.name);
}

export async function getCompany(idOrName: string) {
  // Try by ID first
  const [byId] = await db
    .select()
    .from(companies)
    .where(and(eq(companies.id, idOrName), isNull(companies.deletedAt)));

  if (byId) return byId;

  // Fallback: search by exact name
  const [byName] = await db
    .select()
    .from(companies)
    .where(and(eq(companies.name, idOrName), isNull(companies.deletedAt)));

  return byName || null;
}

export async function updateCompany(id: string, input: UpdateCompanyInput) {
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (input.name !== undefined) updates.name = input.name;
  if (input.industry !== undefined) updates.industry = input.industry;
  if (input.niche !== undefined) updates.niche = input.niche;
  if (input.contactName !== undefined) updates.contactName = input.contactName;
  if (input.contactEmail !== undefined) updates.contactEmail = input.contactEmail;
  if (input.contactPhone !== undefined) updates.contactPhone = input.contactPhone;
  if (input.website !== undefined) updates.website = input.website;
  if (input.notes !== undefined) updates.notes = input.notes;
  if (input.status !== undefined) updates.status = input.status;

  const [company] = await db
    .update(companies)
    .set(updates)
    .where(eq(companies.id, id))
    .returning();
  return company;
}
