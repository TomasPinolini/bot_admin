import { db } from "../../db/index.js";
import * as schema from "../../db/schema.js";
import { isNull, sql, ilike } from "drizzle-orm";
import type { ExtractionResult } from "./extraction-prompt.js";

export interface MatchResult {
  id: string | null;
  name: string;
  confidence: number;
  matchType: "exact" | "ilike" | "website" | "substring" | "none";
}

export interface MatchSuggestions {
  company: MatchResult;
  industry: MatchResult;
  niche: MatchResult | null;
  products: MatchResult[];
  services: MatchResult[];
}

async function matchCompany(
  extraction: ExtractionResult
): Promise<MatchResult> {
  const { name, website } = extraction.company;

  // 1. Exact name match
  const exactRows = await db
    .select({ id: schema.companies.id, name: schema.companies.name })
    .from(schema.companies)
    .where(
      sql`${schema.companies.name} = ${name} AND ${schema.companies.deletedAt} IS NULL`
    )
    .limit(1);

  if (exactRows.length > 0) {
    return {
      id: exactRows[0].id,
      name: exactRows[0].name,
      confidence: 1.0,
      matchType: "exact",
    };
  }

  // 2. Case-insensitive match
  const ilikeRows = await db
    .select({ id: schema.companies.id, name: schema.companies.name })
    .from(schema.companies)
    .where(
      sql`${schema.companies.name} ILIKE ${name} AND ${schema.companies.deletedAt} IS NULL`
    )
    .limit(1);

  if (ilikeRows.length > 0) {
    return {
      id: ilikeRows[0].id,
      name: ilikeRows[0].name,
      confidence: 0.95,
      matchType: "ilike",
    };
  }

  // 3. Website domain match
  if (website) {
    const domain = extractDomain(website);
    if (domain) {
      const websiteRows = await db
        .select({ id: schema.companies.id, name: schema.companies.name })
        .from(schema.companies)
        .where(
          sql`${schema.companies.website} ILIKE ${"%" + domain + "%"} AND ${schema.companies.deletedAt} IS NULL`
        )
        .limit(1);

      if (websiteRows.length > 0) {
        return {
          id: websiteRows[0].id,
          name: websiteRows[0].name,
          confidence: 0.8,
          matchType: "website",
        };
      }
    }
  }

  // 4. Substring match
  const substringRows = await db
    .select({ id: schema.companies.id, name: schema.companies.name })
    .from(schema.companies)
    .where(
      sql`(${schema.companies.name} ILIKE ${"%" + name + "%"} OR ${name} ILIKE '%' || ${schema.companies.name} || '%') AND ${schema.companies.deletedAt} IS NULL`
    )
    .limit(1);

  if (substringRows.length > 0) {
    return {
      id: substringRows[0].id,
      name: substringRows[0].name,
      confidence: 0.7,
      matchType: "substring",
    };
  }

  // 5. No match
  return { id: null, name, confidence: 0.0, matchType: "none" };
}

async function matchCatalogItem(
  extractedName: string,
  table: typeof schema.industries | typeof schema.products | typeof schema.services
): Promise<MatchResult> {
  // 1. Exact match
  const exactRows = await db
    .select({ id: table.id, name: table.name })
    .from(table)
    .where(sql`${table.name} = ${extractedName} AND ${table.deletedAt} IS NULL`)
    .limit(1);

  if (exactRows.length > 0) {
    return {
      id: exactRows[0].id,
      name: exactRows[0].name,
      confidence: 1.0,
      matchType: "exact",
    };
  }

  // 2. Case-insensitive match
  const ilikeRows = await db
    .select({ id: table.id, name: table.name })
    .from(table)
    .where(
      sql`${table.name} ILIKE ${extractedName} AND ${table.deletedAt} IS NULL`
    )
    .limit(1);

  if (ilikeRows.length > 0) {
    return {
      id: ilikeRows[0].id,
      name: ilikeRows[0].name,
      confidence: 0.95,
      matchType: "ilike",
    };
  }

  // 3. Substring match
  const substringRows = await db
    .select({ id: table.id, name: table.name })
    .from(table)
    .where(
      sql`(${table.name} ILIKE ${"%" + extractedName + "%"} OR ${extractedName} ILIKE '%' || ${table.name} || '%') AND ${table.deletedAt} IS NULL`
    )
    .limit(1);

  if (substringRows.length > 0) {
    return {
      id: substringRows[0].id,
      name: substringRows[0].name,
      confidence: 0.7,
      matchType: "substring",
    };
  }

  // 4. No match
  return { id: null, name: extractedName, confidence: 0.0, matchType: "none" };
}

export async function matchEntities(
  extraction: ExtractionResult
): Promise<MatchSuggestions> {
  const company = await matchCompany(extraction);

  const industry = await matchCatalogItem(
    extraction.industry.name,
    schema.industries
  );

  let niche: MatchResult | null = null;
  if (extraction.niche) {
    // For niches, do a simple name match across all niches
    const nicheRows = await db
      .select({ id: schema.niches.id, name: schema.niches.name })
      .from(schema.niches)
      .where(
        sql`${schema.niches.name} ILIKE ${extraction.niche.name} AND ${schema.niches.deletedAt} IS NULL`
      )
      .limit(1);

    niche = nicheRows.length > 0
      ? { id: nicheRows[0].id, name: nicheRows[0].name, confidence: 0.95, matchType: "ilike" as const }
      : { id: null, name: extraction.niche.name, confidence: 0.0, matchType: "none" as const };
  }

  const products = await Promise.all(
    extraction.products.map((p) =>
      matchCatalogItem(p.name, schema.products)
    )
  );

  const services = await Promise.all(
    extraction.services.map((sv) =>
      matchCatalogItem(sv.name, schema.services)
    )
  );

  return { company, industry, niche, products, services };
}

function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(
      url.startsWith("http") ? url : `https://${url}`
    );
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
