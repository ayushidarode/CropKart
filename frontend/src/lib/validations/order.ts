import { z } from 'zod';

export const sampleRequestSchema = z.object({
  crop_id: z.string().min(1, 'Crop selection required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().default('kg'),
  delivery_address: z.string().min(10, 'Full delivery address with PIN code is required'),
  notes: z.string().optional(),
});

export const bulkOrderSchema = z.object({
  crop_id: z.string().min(1, 'Crop selection required'),
  quantity: z.number().positive('Order quantity must be positive'),
  unit: z.string().default('kg'),
  price_per_unit: z.number().positive(),
  pickup_location: z.string().min(3, 'Pickup location is required'),
  delivery_location: z.string().min(10, 'Delivery address is required'),
  payment_method: z.enum(['upi', 'bank_transfer', 'cod']),
  notes: z.string().optional(),
});

export type SampleRequestFormValues = z.infer<typeof sampleRequestSchema>;
export type BulkOrderFormValues = z.infer<typeof bulkOrderSchema>;
