import { z } from "zod";

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Current password must be at least 6 characters long"),
  newPassword: z.string().min(6, "New password must be at least 6 characters long"),
});

export const changePasswordResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type ChangePasswordResponse = z.infer<typeof changePasswordResponseSchema>;
