import { eq, and, isNull, ilike, or } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { generateId } from "../utils/id.js";
import type { CreateProductInput, ListProductsFilter } from "../types/product.types.js";

const { products } = schema;

export async function createProduct(input: CreateProductInput) {
  const id = generateId("product");
  const [product] = await db
    .insert(products)
    .values({
      id,
      name: input.name,
      description: input.description || null,
    })
    .returning();
  return product;
}

export async function listProducts(filter: ListProductsFilter = {}) {
  const conditions = [isNull(products.deletedAt)];

  if (filter.search) {
    conditions.push(
      or(
        ilike(products.name, `%${filter.search}%`),
        ilike(products.description, `%${filter.search}%`)
      )!
    );
  }

  return db
    .select()
    .from(products)
    .where(and(...conditions))
    .orderBy(products.name);
}

export async function getProduct(idOrName: string) {
  const [byId] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, idOrName), isNull(products.deletedAt)));

  if (byId) return byId;

  const [byName] = await db
    .select()
    .from(products)
    .where(and(eq(products.name, idOrName), isNull(products.deletedAt)));

  return byName || null;
}
