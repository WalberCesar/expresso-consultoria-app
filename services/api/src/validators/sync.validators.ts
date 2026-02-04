import { z } from 'zod';

const RawRecordSchema = z.object({
  id: z.string(),
}).passthrough();

const TableChangesSchema = z.object({
  created: z.array(RawRecordSchema),
  updated: z.array(RawRecordSchema),
  deleted: z.array(z.string()),
});

const ChangesSchema = z.record(z.string(), TableChangesSchema);

export const PullRequestSchema = z.object({
  lastPulledAt: z.number().nullable(),
  schemaVersion: z.number(),
  migration: z.object({
    from: z.number(),
    tables: z.array(z.string()),
    columns: z.array(
      z.object({
        table: z.string(),
        columns: z.array(z.string()),
      })
    ),
  }).optional(),
});

export const PushRequestSchema = z.object({
  changes: ChangesSchema,
  lastPulledAt: z.number(),
});
