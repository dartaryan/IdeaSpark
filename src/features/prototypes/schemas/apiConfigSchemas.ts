// src/features/prototypes/schemas/apiConfigSchemas.ts

import { z } from 'zod';

/** Zod schema for HTTP method selection */
export const httpMethodSchema = z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Zod schema for API endpoint configuration form validation.
 * Used with react-hook-form + @hookform/resolvers/zod.
 */
export const apiConfigSchema = z.object({
  name: z
    .string()
    .min(1, 'Endpoint name is required')
    .max(100, 'Name must be 100 characters or fewer')
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_-]*$/,
      'Name must start with a letter and contain only letters, numbers, hyphens, and underscores',
    ),
  url: z.string().url('Must be a valid URL'),
  method: httpMethodSchema,
  headers: z.record(z.string(), z.string()).default({}),
  isMock: z.boolean().default(false),
  mockResponse: z.unknown().optional(),
  mockStatusCode: z.number().int().min(100).max(599).default(200),
  mockDelayMs: z.number().int().min(0).max(10000).default(0),
});

/** Inferred TypeScript type from the Zod schema */
export type ApiConfigFormValues = z.infer<typeof apiConfigSchema>;
