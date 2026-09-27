import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['farmer', 'buyer', 'transporter']),
  mobile: z.string().regex(/^[0-9]{10}$/, 'Mobile must be a 10-digit number').optional().or(z.literal('')),
  location: z.string().min(2, 'Location is required'),
  farmOrCompanyName: z.string().min(2, 'Farm or Company name is required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
