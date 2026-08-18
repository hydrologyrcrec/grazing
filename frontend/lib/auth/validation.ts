import { z } from "zod";

const email = z.string().trim().toLowerCase().email().max(255);
const password = z.string().min(12).max(128);

export const signUpSchema = z.object({
  email,
  password,
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(128),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
