import { z } from 'zod';

/**
 * UpdateProfileSchema: STRICT whitelist for profile mutations.
 * Prevents Mass Assignment and Privilege Escalation.
 */
export const UpdateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50).optional(),
  lastName: z.string().min(1, "Last name is required").max(50).optional(),
  name: z.string().min(1, "Name is required").max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
}).strict(); // .strict() ensures no extra fields are passed in

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
