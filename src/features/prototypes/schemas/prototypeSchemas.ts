// src/features/prototypes/schemas/prototypeSchemas.ts

import { z } from 'zod';

export const prototypeStatusSchema = z.enum(['generating', 'ready', 'failed']);

export const createPrototypeSchema = z.object({
  prdId: z.string().uuid('Invalid PRD ID'),
  ideaId: z.string().uuid('Invalid Idea ID'),
  url: z.string().url().optional(),
  code: z.string().optional(),
  status: prototypeStatusSchema.optional(),
});

export const createVersionSchema = z.object({
  prdId: z.string().uuid('Invalid PRD ID'),
  ideaId: z.string().uuid('Invalid Idea ID'),
  refinementPrompt: z.string().min(1, 'Refinement prompt is required'),
  url: z.string().url().optional(),
  code: z.string().optional(),
});

export const updatePrototypeSchema = z.object({
  url: z.string().url().optional(),
  code: z.string().optional(),
  status: prototypeStatusSchema.optional(),
});

export type CreatePrototypeSchema = z.infer<typeof createPrototypeSchema>;
export type CreateVersionSchema = z.infer<typeof createVersionSchema>;
export type UpdatePrototypeSchema = z.infer<typeof updatePrototypeSchema>;
