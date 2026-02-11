import { z } from "zod";

export const SignupSchemaRequest = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .trim()
    .regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(6).max(100).trim(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type SignupRequest = z.infer<typeof SignupSchemaRequest>;

export const SignupSchemaResponse = z.object({
  success: z.boolean(),
  message: z.string(),
  user: z
    .object({
      id: z.string(),
      username: z.string(),
      createdAt: z.string(),
    })
    .optional(),
});

export type SignupResponse = z.infer<typeof SignupSchemaResponse>;
