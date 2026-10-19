import { z } from 'zod';

export const deliveryAddressSchema = z.object({
  tag: z.enum(['Home', 'Work', 'Other'], {
    message: 'Please select a tag',
  }),
  label: z
    .string()
    .trim()
    .min(1, 'Label or nickname is required')
    .max(50, 'Label cannot exceed 50 characters'),
  street: z
    .string()
    .trim()
    .min(3, 'Street address must be at least 3 characters')
    .max(150, 'Street address cannot exceed 150 characters'),
  city: z
    .string()
    .trim()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City cannot exceed 50 characters'),
  state: z
    .string()
    .trim()
    .min(2, 'State must be at least 2 characters')
    .max(50, 'State cannot exceed 50 characters'),
  zipCode: z
    .string()
    .trim()
    .refine((val) => !val || /^\d{6}$/.test(val), {
      message: 'Postal code must be 6 digits',
    }),
  phone: z
    .string()
    .trim()
    .refine((val) => !val || /^[0-9+\-\s()]{7,15}$/.test(val), {
      message: 'Please enter a valid phone number',
    }),
  notes: z
    .string()
    .trim()
    .max(200, 'Notes cannot exceed 200 characters')
    .optional(),
});

export const customerAddressFormSchema = z.object({
  mobile: z
    .string()
    .trim()
    .min(1, 'Mobile number is required')
    .regex(/^[0-9]{10}$/, 'Mobile number must be a valid 10-digit number'),
  formattedAddress: z
    .string()
    .trim()
    .min(5, 'Delivery address is required (minimum 5 characters)')
    .max(300, 'Address cannot exceed 300 characters'),
  instructions: z
    .string()
    .trim()
    .max(250, 'Instructions cannot exceed 250 characters')
    .optional(),
  latitude: z
    .number({
      required_error: 'Please pick a location from the map',
      invalid_type_error: 'Please pick a location from the map',
    })
    .refine((val) => val >= -90 && val <= 90, 'Invalid latitude coordinate'),
  longitude: z
    .number({
      required_error: 'Please pick a location from the map',
      invalid_type_error: 'Please pick a location from the map',
    })
    .refine((val) => val >= -180 && val <= 180, 'Invalid longitude coordinate'),
});

export type CustomerAddressFormValues = z.infer<typeof customerAddressFormSchema>;
