import { z } from "zod";

export const joinGroupSchema = z.object({
    groupId: z.string().uuid("Invalid group ID"),
});

export const joinGroupResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.object({
        groupId: z.string(),
        name: z.string(),
        memberCount: z.number(),
    }).optional(),
});

export type JoinGroupResponse = z.infer<typeof joinGroupResponseSchema>;
