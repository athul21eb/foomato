import { z } from 'zod';

export const updateSellerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Store name must be at least 2 characters')
    .max(100, 'Store name cannot exceed 100 characters'),
  phone: z
    .coerce
    .string()
    .trim()
    .min(10, 'Phone number must be at least 10 digits')
    .max(10, 'Phone number cannot exceed 10 digits')
    .regex(/^[0-9+\-\s()]+$/, 'Please enter a valid phone number'),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description cannot exceed 500 characters'),
  formattedAddress: z
    .string()
    .trim()
    .min(3, 'Address must be at least 3 characters'),
});

export type UpdateSellerFormValues = z.infer<typeof updateSellerSchema>;

export const createSellerSchema = updateSellerSchema.extend({
  latitude: z
    .number({ message: 'Latitude is required' })
    .min(-90)
    .max(90),
  longitude: z
    .number({ message: 'Longitude is required' })
    .min(-180)
    .max(180),
});

export type CreateSellerFormValues = z.infer<typeof createSellerSchema>;

export const menuItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Dish name must be at least 2 characters')
    .max(80, 'Dish name cannot exceed 80 characters'),
  price: z
    .coerce
    .number({ message: 'Price is required' })
    .positive('Price must be greater than 0'),
  description: z
    .string()
    .trim()
    .min(5, 'Description must be at least 5 characters')
    .max(300, 'Description cannot exceed 300 characters'),
  isVeg: z.boolean(),
});

export type MenuItemFormValues = z.infer<typeof menuItemSchema>;
