import { z } from 'zod';

export const ageGroupEnum = z.enum([
  'infant_under_1',
  'child_1_12',
  'teen_13_17',
  'adult_18_64',
  'senior_65_plus',
], {
  errorMap: () => ({ message: 'Please select a valid age group.' }),
});

export const durationEnum = z.enum([
  'less_than_24h',
  '1_to_3_days',
  '4_to_7_days',
  '1_to_2_weeks',
  'more_than_2_weeks',
], {
  errorMap: () => ({ message: 'Please select how long you have experienced symptoms.' }),
});

export const contextFactorEnum = z.enum([
  'pregnancy',
  'diabetes',
  'hypertension',
  'heart_condition',
  'asthma_copd',
  'immunocompromised',
  'recent_surgery',
  'recent_injury',
  'none',
]);

export const assessmentInputSchema = z
  .object({
    ageGroup: ageGroupEnum,
    symptoms: z.array(z.string()).default([]),
    customDescription: z
      .string()
      .max(1000, { message: 'Description cannot exceed 1000 characters.' })
      .default(''),
    duration: durationEnum,
    contextFactors: z.array(contextFactorEnum).default([]),
  })
  .superRefine((data, ctx) => {
    const hasSymptoms = Array.isArray(data.symptoms) && data.symptoms.length > 0;
    const hasDescription = typeof data.customDescription === 'string' && data.customDescription.trim().length >= 5;

    if (!hasSymptoms && !hasDescription) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['symptoms'],
        message: 'Please select at least one symptom or describe your symptoms in at least 5 characters.',
      });
    }
  });

export type ValidatedAssessmentInput = z.infer<typeof assessmentInputSchema>;

export const hospitalSearchSchema = z.object({
  query: z.string().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(1000).max(50000).default(10000).optional(),
}).refine((data) => {
  const hasQuery = Boolean(data.query && data.query.trim().length > 0);
  const hasCoords = typeof data.lat === 'number' && typeof data.lng === 'number';
  return hasQuery || hasCoords;
}, {
  message: 'Please enter a search location (city/area) or enable location coordinates.',
  path: ['query'],
});

export type ValidatedHospitalSearchInput = z.infer<typeof hospitalSearchSchema>;
