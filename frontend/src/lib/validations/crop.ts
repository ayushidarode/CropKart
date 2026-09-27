import { z } from 'zod';

export const cropSchema = z.object({
  name: z.string().min(2, 'Crop name must be at least 2 characters'),
  variety: z.string().min(2, 'Variety is required'),
  category: z.enum(['Grain', 'Vegetable', 'Fruit', 'Pulse', 'Oilseed', 'Commercial', 'Spices']),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unit: z.string().default('kg'),
  price_per_unit: z.number().positive('Price must be greater than 0'),
  quality_grade: z.enum(['Grade A', 'Grade B', 'Standard', 'Premium']),
  organic: z.boolean().default(false),
  harvest_date: z.string().optional(),
  available_from: z.string().optional(),
  location: z.string().min(3, 'Location is required'),
  district: z.string().optional(),
  state: z.string().optional(),
  description: z.string().optional(),
  moisture_percent: z.number().min(0).max(100).optional(),
  storage_type: z.string().optional(),
  fertilizers_used: z.string().optional(),
  primary_image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export type CropFormValues = z.infer<typeof cropSchema>;
