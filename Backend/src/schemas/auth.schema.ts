import { z } from 'zod';

export const signupSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9]{3,}$/, 'Username must be at least 3 characters (letters/numbers only)'),
  email: z
    .string()
    .email('Invalid email address')
    .regex(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
      'Password must have 8+ characters with uppercase, lowercase, number & special character'
    ),
  role: z.enum(['admin', 'unitManager', 'user']).default('user'),
});

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .regex(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
      'Password must have 8+ characters with uppercase, lowercase, number & special character'
    ),
  role: z.enum(['superadmin', 'admin', 'unitManager', 'user']).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const updateRoleSchema = z.object({
  role: z.enum(['admin', 'unitManager', 'user']),
});