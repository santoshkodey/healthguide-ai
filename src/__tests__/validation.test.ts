import { describe, it, expect } from 'vitest';
import { assessmentInputSchema, hospitalSearchSchema } from '@/lib/validation';

describe('Assessment Input Validation (Zod Schema)', () => {
  it('accepts valid input with selected symptoms', () => {
    const valid = {
      ageGroup: 'adult_18_64',
      symptoms: ['mild_cough', 'mild_sore_throat'],
      customDescription: 'Feeling a bit tired since yesterday.',
      duration: '1_to_3_days',
      contextFactors: ['none'],
    };

    const result = assessmentInputSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('accepts valid input with no checklist symptoms if valid custom description is provided', () => {
    const validWithDescriptionOnly = {
      ageGroup: 'senior_65_plus',
      symptoms: [],
      customDescription: 'Experiencing mild body fatigue and low energy.',
      duration: '4_to_7_days',
      contextFactors: ['hypertension'],
    };

    const result = assessmentInputSchema.safeParse(validWithDescriptionOnly);
    expect(result.success).toBe(true);
  });

  it('rejects input when age group is missing or invalid', () => {
    const invalidAge = {
      ageGroup: 'not_a_real_age_group',
      symptoms: ['mild_cough'],
      customDescription: '',
      duration: '1_to_3_days',
      contextFactors: [],
    };

    const result = assessmentInputSchema.safeParse(invalidAge);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('ageGroup'))).toBe(true);
    }
  });

  it('rejects input when duration is missing or invalid', () => {
    const invalidDuration = {
      ageGroup: 'adult_18_64',
      symptoms: ['mild_cough'],
      customDescription: '',
      duration: 'three_centuries',
      contextFactors: [],
    };

    const result = assessmentInputSchema.safeParse(invalidDuration);
    expect(result.success).toBe(false);
  });

  it('rejects input when both symptoms array is empty AND custom description is too short/empty', () => {
    const emptySymptoms = {
      ageGroup: 'adult_18_64',
      symptoms: [],
      customDescription: '   ',
      duration: '1_to_3_days',
      contextFactors: [],
    };

    const result = assessmentInputSchema.safeParse(emptySymptoms);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('symptoms'))).toBe(true);
    }
  });

  it('rejects description exceeding 1000 characters', () => {
    const excessiveText = 'a'.repeat(1001);
    const tooLong = {
      ageGroup: 'adult_18_64',
      symptoms: ['mild_cough'],
      customDescription: excessiveText,
      duration: '1_to_3_days',
      contextFactors: [],
    };

    const result = assessmentInputSchema.safeParse(tooLong);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('customDescription'))).toBe(true);
    }
  });
});

describe('Hospital Search Validation (Zod Schema)', () => {
  it('accepts search with text query only', () => {
    const result = hospitalSearchSchema.safeParse({
      query: 'Bengaluru',
    });
    expect(result.success).toBe(true);
  });

  it('accepts search with latitude and longitude coordinates', () => {
    const result = hospitalSearchSchema.safeParse({
      lat: 28.6139,
      lng: 77.209,
    });
    expect(result.success).toBe(true);
  });

  it('rejects when both query and coordinates are omitted', () => {
    const result = hospitalSearchSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects invalid out-of-range coordinates', () => {
    const invalidCoords = hospitalSearchSchema.safeParse({
      lat: 105.0, // Lat must be between -90 and 90
      lng: 200.0, // Lng must be between -180 and 180
    });
    expect(invalidCoords.success).toBe(false);
  });
});
