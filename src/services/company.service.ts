import { eq, and, isNull, ilike, or } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { generateId } from "../utils/id.js";
import type {
  CreateCompanyInput,
  UpdateCompanyInput,
  ListCompaniesFilter,
  AssignIndustryInput,
  AssignNicheInput,
  AssignProductInput,
  AssignServiceInput,
} from "../types/company.types.js";

const {
  companies,
  companyIndustries,
  companyNiches,
  companyProducts,
  companyServices,
  industries,
  niches,
  products,
  services,
} = schema;

export async function createCompany(input: CreateCompanyInput) {
  const id = generateId("company");
  const [company] = await db
    .insert(companies)
    .values({
      id,
      name: input.name,
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

  if (filter.status) {
    conditions.push(eq(companies.status, filter.status));
  }
  if (filter.search) {
    conditions.push(ilike(companies.name, `%${filter.search}%`));
  }

  return db
    .select()
    .from(companies)
    .where(and(...conditions))
    .orderBy(companies.name);
}

export async function getCompany(idOrName: string) {
  const [byId] = await db
    .select()
    .from(companies)
    .where(and(eq(companies.id, idOrName), isNull(companies.deletedAt)));

  const company = byId ?? (await db
    .select()
    .from(companies)
    .where(and(eq(companies.name, idOrName), isNull(companies.deletedAt)))
    .then(rows => rows[0]));

  if (!company) return null;

  const linkedIndustries = await getCompanyIndustries(company.id);
  const linkedNiches = await getCompanyNiches(company.id);
  const linkedProducts = await getCompanyProducts(company.id);
  const linkedServices = await getCompanyServices(company.id);

  return {
    ...company,
    industries: linkedIndustries,
    niches: linkedNiches,
    products: linkedProducts,
    services: linkedServices,
  };
}

export async function updateCompany(id: string, input: UpdateCompanyInput) {
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (input.name !== undefined) updates.name = input.name;
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

// ── Junction helpers ──────────────────────────────────────

export async function assignIndustry(input: AssignIndustryInput) {
  const id = generateId("companyIndustry");
  const [row] = await db
    .insert(companyIndustries)
    .values({ id, companyId: input.companyId, industryId: input.industryId })
    .returning();
  return row;
}

export async function assignNiche(input: AssignNicheInput) {
  const id = generateId("companyNiche");
  const [row] = await db
    .insert(companyNiches)
    .values({ id, companyId: input.companyId, nicheId: input.nicheId })
    .returning();
  return row;
}

export async function assignProduct(input: AssignProductInput) {
  const id = generateId("companyProduct");
  const [row] = await db
    .insert(companyProducts)
    .values({ id, companyId: input.companyId, productId: input.productId, notes: input.notes || null })
    .returning();
  return row;
}

export async function assignService(input: AssignServiceInput) {
  const id = generateId("companyService");
  const [row] = await db
    .insert(companyServices)
    .values({ id, companyId: input.companyId, serviceId: input.serviceId, notes: input.notes || null })
    .returning();
  return row;
}

export async function getCompanyIndustries(companyId: string) {
  return db
    .select({
      id: companyIndustries.id,
      industryId: industries.id,
      industryName: industries.name,
    })
    .from(companyIndustries)
    .innerJoin(industries, eq(companyIndustries.industryId, industries.id))
    .where(eq(companyIndustries.companyId, companyId));
}

export async function getCompanyNiches(companyId: string) {
  return db
    .select({
      id: companyNiches.id,
      nicheId: niches.id,
      nicheName: niches.name,
      industryName: industries.name,
    })
    .from(companyNiches)
    .innerJoin(niches, eq(companyNiches.nicheId, niches.id))
    .innerJoin(industries, eq(niches.industryId, industries.id))
    .where(eq(companyNiches.companyId, companyId));
}

export async function getCompanyProducts(companyId: string) {
  return db
    .select({
      id: companyProducts.id,
      productId: products.id,
      productName: products.name,
      notes: companyProducts.notes,
    })
    .from(companyProducts)
    .innerJoin(products, eq(companyProducts.productId, products.id))
    .where(eq(companyProducts.companyId, companyId));
}

export async function getCompanyServices(companyId: string) {
  return db
    .select({
      id: companyServices.id,
      serviceId: services.id,
      serviceName: services.name,
      notes: companyServices.notes,
    })
    .from(companyServices)
    .innerJoin(services, eq(companyServices.serviceId, services.id))
    .where(eq(companyServices.companyId, companyId));
}
