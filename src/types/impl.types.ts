import { z } from "zod";
import { implTypeEnum } from "./common.js";

export const createImplSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  type: implTypeEnum,
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  metadataJson: z.record(z.unknown()).optional(),
  sortOrder: z.number().int().optional(),
});
export type CreateImplInput = z.infer<typeof createImplSchema>;

export const updateImplSchema = z.object({
  type: implTypeEnum.optional(),
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  metadataJson: z.record(z.unknown()).optional(),
  sortOrder: z.number().int().optional(),
});
export type UpdateImplInput = z.infer<typeof updateImplSchema>;

export const listImplSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  type: implTypeEnum.optional(),
});
export type ListImplFilter = z.infer<typeof listImplSchema>;
