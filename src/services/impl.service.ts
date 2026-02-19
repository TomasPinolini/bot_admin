import { eq, and, isNull, asc } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { generateId } from "../utils/id.js";
import type {
  CreateImplInput,
  UpdateImplInput,
  ListImplFilter,
} from "../types/impl.types.js";

const { implementationDetails } = schema;

export async function createImpl(input: CreateImplInput) {
  const id = generateId("impl");
  const [impl] = await db
    .insert(implementationDetails)
    .values({
      id,
      projectId: input.projectId,
      type: input.type,
      title: input.title,
      content: input.content,
      metadataJson: input.metadataJson || null,
      sortOrder: input.sortOrder ?? 0,
    })
    .returning();
  return impl;
}

export async function listImpls(filter: ListImplFilter) {
  const conditions = [
    eq(implementationDetails.projectId, filter.projectId),
    isNull(implementationDetails.deletedAt),
  ];

  if (filter.type) {
    conditions.push(eq(implementationDetails.type, filter.type));
  }

  return db
    .select()
    .from(implementationDetails)
    .where(and(...conditions))
    .orderBy(asc(implementationDetails.sortOrder), asc(implementationDetails.createdAt));
}

export async function getImpl(id: string) {
  const [impl] = await db
    .select()
    .from(implementationDetails)
    .where(
      and(eq(implementationDetails.id, id), isNull(implementationDetails.deletedAt))
    );
  return impl || null;
}

export async function updateImpl(id: string, input: UpdateImplInput) {
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (input.type !== undefined) updates.type = input.type;
  if (input.title !== undefined) updates.title = input.title;
  if (input.content !== undefined) updates.content = input.content;
  if (input.metadataJson !== undefined) updates.metadataJson = input.metadataJson;
  if (input.sortOrder !== undefined) updates.sortOrder = input.sortOrder;

  const [impl] = await db
    .update(implementationDetails)
    .set(updates)
    .where(eq(implementationDetails.id, id))
    .returning();
  return impl;
}
