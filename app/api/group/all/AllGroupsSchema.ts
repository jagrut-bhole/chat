import { z } from "zod";

export const allGroupsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        memberCount: z.number(),
        maxMembers: z.number().nullable(),
        expiryDate: z.string().nullable(),
        createdAt: z.string(),
      })
    )
    .optional(),
});

export type AllGroupsResponse = z.infer<typeof allGroupsResponseSchema>;
