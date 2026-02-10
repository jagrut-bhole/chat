import { z } from "zod";

export const CreateGroupSchema = z.object({
    groupName: z.string(),
    description: z.string(),
    maxMembers: z.number().optional(),
    expiryDate: z.string().optional(),
    latitude: z.number(),
    longitude: z.number(),
});

export const JoinGroupSchema = z.object({
    groupId: z.string(),
});

export const GroupSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    memberCount: z.number(),
    maxMembers: z.number().nullable(),
    expiryDate: z.string().nullable(),
    createdAt: z.string(),
});

export const GroupsResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.array(GroupSchema).optional(),
});
