import { z } from 'zod';

export const createRiderSchema = z.object({
  riderName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(60, 'Full name cannot exceed 60 characters')
    .regex(
      /^[a-zA-Z\s.'-]+$/,
      'Full name should only contain letters and standard characters',
    )
    .transform((val) => val.trim()),
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
  aadharNumber: z
    .string()
    .min(1, 'Aadhaar number is required')
    .transform((val) => val.replace(/[\s-]/g, ''))
    .refine((val) => /^\d{12}$/.test(val), {
      message: 'Aadhaar number must be exactly 12 digits',
    }),
  drivingLicenseNumber: z
    .string()
    .min(1, 'Driving License number is required')
    .regex(
      /^[A-Z0-9-]{5,20}$/i,
      'Driving license should be valid alphanumeric format (5-20 characters)',
    )
    .transform((val) => val.toUpperCase().trim()),
  latitude: z
    .number({
      required_error: 'Please pick your service location on the map',
      invalid_type_error: 'Please pick your service location on the map',
    })
    .min(-90)
    .max(90),
  longitude: z
    .number({
      required_error: 'Please pick your service location on the map',
      invalid_type_error: 'Please pick your service location on the map',
    })
    .min(-180)
    .max(180),
  formattedAddress: z.string().optional(),
});

export type CreateRiderFormData = z.infer<typeof createRiderSchema>;

export const updateRiderSchema = z.object({
  riderName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(60, 'Full name cannot exceed 60 characters')
    .regex(
      /^[a-zA-Z\s.'-]+$/,
      'Full name should only contain letters and standard characters',
    )
    .transform((val) => val.trim())
    .optional(),
  phoneNumber: z
    .string()
    .refine((val) => !val || /^[6-9]\d{9}$/.test(val), {
      message: 'Please enter a valid 10-digit mobile number',
    })
    .optional(),
  aadharNumber: z
    .string()
    .transform((val) => val.replace(/[\s-]/g, ''))
    .refine((val) => !val || /^\d{12}$/.test(val), {
      message: 'Aadhaar number must be exactly 12 digits',
    })
    .optional(),
  drivingLicenseNumber: z
    .string()
    .refine((val) => !val || /^[A-Z0-9-]{5,20}$/i.test(val), {
      message:
        'Driving license should be valid alphanumeric format (5-20 characters)',
    })
    .transform((val) => (val ? val.toUpperCase().trim() : val))
    .optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  formattedAddress: z.string().optional(),
});

export type UpdateRiderFormData = z.infer<typeof updateRiderSchema>;
