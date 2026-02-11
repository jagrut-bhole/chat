import { z } from "zod";

export const createGroupSchema = z.object({
  groupName: z
    .string()
    .min(3, "Group name must be at least 3 characters long")
    .max(50, "Group name must be at most 50 characters long"),
  description: z.string().max(1000, "Description must be at most 1000 characters long"),
  maxMembers: z.number().int().max(1000, "Group can have at most 1000 members").optional(),
  expiryDate: z
    .string()
    .refine(
      (val) => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && date > new Date();
      },
      {
        message: "Expiry date must be a valid date in the future",
        path: ["expiryDate"],
      }
    )
    .optional(),
  latitude: z.number().refine((val) => val >= -90 && val <= 90, {
    message: "Latitude must be between -90 and 90",
  }),
  longitude: z.number().refine((val) => val >= -180 && val <= 180, {
    message: "Longitude must be between -180 and 180",
  }),
});

export const createGroupResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z
    .object({
      groupId: z.string(),
      name: z.string(),
      description: z.string(),
      maxMembers: z.number().int().nullable(),
      expiryDate: z.date().nullable(),
      createdAt: z.date(),
    })
    .optional(),
});

export type CreateGroupResponse = z.infer<typeof createGroupResponseSchema>;
