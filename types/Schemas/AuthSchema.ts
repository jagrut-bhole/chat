import { z } from "zod";

export const SignUpSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username must be at most 20 characters long")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password is too long"),
});

export const LocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export const UserProfileSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    id: z.string(),
    username: z.string(),
    createdAt: z.string(),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
    lastLocation: z.string().nullable(),
    location: z.string().nullable(),
    groupMemberships: z.array(
      z.object({
        id: z.string(),
        userId: z.string(),
        groupId: z.string(),
        joinedAt: z.string(),
        group: z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          maxMembers: z.number().nullable(),
          expiresAt: z.string().nullable(),
        }),
      })
    ),
  }),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Current password must be at least 6 characters long"),
  newPassword: z.string().min(6, "New password must be at least 6 characters long"),
});

export const UpdateLocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export const DeleteAccountSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters long"),
  userId: z.string(),
});
