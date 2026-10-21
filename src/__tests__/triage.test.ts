import { describe, it, expect } from 'vitest';
import { evaluateTriage } from '@/lib/triage';
import { AssessmentInput } from '@/types/assessment';

describe('Safety-First Triage Engine (Deterministic Rules)', () => {
  it('triggers EMERGENCY tier for configured red flag: crushing chest pain', () => {
    const input: AssessmentInput = {
      ageGroup: 'adult_18_64',
      symptoms: ['chest_pain_crushing'],
      customDescription: '',
      duration: 'less_than_24h',
      contextFactors: ['none'],
    };

    const result = evaluateTriage(input);
    expect(result.tier).toBe('EMERGENCY');
    expect(result.headline).toContain('Immediate Emergency Care Recommended');
    expect(result.triggeredRules.some((r) => r.id === 'RULE_EMERGENCY_DIRECT_RED_FLAG')).toBe(true);
    expect(result.emergencyContacts.some((c) => c.number === '112')).toBe(true);
    expect(result.disclaimer).toBeTruthy();
  });

  it('triggers EMERGENCY tier for stroke symptoms (FAST signs)', () => {
    const input: AssessmentInput = {
      ageGroup: 'senior_65_plus',
      symptoms: ['stroke_symptoms'],
      customDescription: 'Sudden weakness on one side of face',
      duration: 'less_than_24h',
      contextFactors: ['hypertension'],
    };

    const result = evaluateTriage(input);
    expect(result.tier).toBe('EMERGENCY');
    expect(result.triggeredRules.some((r) => r.tier === 'EMERGENCY')).toBe(true);
  });

  it('triggers EMERGENCY tier for infant under 1 year with fever', () => {
    const input: AssessmentInput = {
      ageGroup: 'infant_under_1',
      symptoms: ['low_grade_fever'],
      customDescription: 'Baby feels warm and irritable',
      duration: 'less_than_24h',
      contextFactors: ['none'],
    };

    const result = evaluateTriage(input);
    expect(result.tier).toBe('EMERGENCY');
    expect(result.triggeredRules.some((r) => r.id === 'RULE_EMERGENCY_INFANT_VULNERABILITY')).toBe(true);
  });

  it('triggers EMERGENCY tier for pregnant user with severe abdominal pain', () => {
    const input: AssessmentInput = {
      ageGroup: 'adult_18_64',
      symptoms: ['acute_severe_abdominal_pain'],
      customDescription: 'Sharp lower pelvic pain',
      duration: 'less_than_24h',
      contextFactors: ['pregnancy'],
    };

    const result = evaluateTriage(input);
    expect(result.tier).toBe('EMERGENCY');
    expect(result.triggeredRules.some((r) => r.id === 'RULE_EMERGENCY_PREGNANCY_COMPLICATION')).toBe(true);
  });

  it('triggers EMERGENCY tier from free-text emergency keywords (e.g. "cannot breathe")', () => {
    const input: AssessmentInput = {
      ageGroup: 'adult_18_64',
      symptoms: [],
      customDescription: 'I cannot breathe and my lips look pale',
      duration: 'less_than_24h',
      contextFactors: ['none'],
    };

    const result = evaluateTriage(input);
    expect(result.tier).toBe('EMERGENCY');
    expect(result.triggeredRules.some((r) => r.id === 'RULE_EMERGENCY_KEYWORD_MATCH')).toBe(true);
  });

  it('triggers URGENT tier for persistent high fever (> 3 days)', () => {
    const input: AssessmentInput = {
      ageGroup: 'adult_18_64',
      symptoms: ['persistent_high_fever'],
      customDescription: 'Fever has been 103 for four days',
      duration: '4_to_7_days',
      contextFactors: ['none'],
    };

    const result = evaluateTriage(input);
    expect(result.tier).toBe('URGENT');
    expect(result.headline).toContain('Prompt Medical Evaluation Recommended');
    expect(result.triggeredRules.some((r) => r.tier === 'URGENT')).toBe(true);
  });

  it('triggers URGENT tier for severe dehydration risk (inability to keep fluids)', () => {
    const input: AssessmentInput = {
      ageGroup: 'child_1_12',
      symptoms: ['inability_to_keep_fluids'],
      customDescription: '',
      duration: '1_to_3_days',
      contextFactors: ['none'],
    };

    const result = evaluateTriage(input);
    expect(result.tier).toBe('URGENT');
  });

  it('triggers URGENT tier for high-risk comorbidity (e.g. diabetes with prolonged illness)', () => {
    const input: AssessmentInput = {
      ageGroup: 'adult_18_64',
      symptoms: ['mild_cough', 'mild_sore_throat'],
      customDescription: 'Cough not resolving',
      duration: '1_to_2_weeks',
      contextFactors: ['diabetes'],
    };

    const result = evaluateTriage(input);
    expect(result.tier).toBe('URGENT');
    expect(result.triggeredRules.some((r) => r.id === 'RULE_URGENT_COMORBIDITY_RISK')).toBe(true);
  });

  it('evaluates mild viral symptoms as ROUTINE self-care with red flag monitoring', () => {
    const input: AssessmentInput = {
      ageGroup: 'adult_18_64',
      symptoms: ['mild_cough', 'runny_or_stuffy_nose', 'mild_sore_throat'],
      customDescription: 'Scratchy throat and sneezing since yesterday',
      duration: '1_to_3_days',
      contextFactors: ['none'],
    };

    const result = evaluateTriage(input);
    expect(result.tier).toBe('ROUTINE');
    expect(result.headline).toContain('Routine Primary Care');
    expect(result.monitoringGuidance.length).toBeGreaterThan(0);
    // Safety check: Never promises "healthy" or "no doctor ever"
    expect(result.summary).not.toContain('You are healthy');
    expect(result.summary).not.toContain('You do not need a doctor');
  });

  it('returns INCONCLUSIVE for vague, junk, or empty text without selected symptoms', () => {
    const input: AssessmentInput = {
      ageGroup: 'adult_18_64',
      symptoms: [],
      customDescription: 'asdfghjkl test hello',
      duration: 'less_than_24h',
      contextFactors: ['none'],
    };

    const result = evaluateTriage(input);
    expect(result.tier).toBe('INCONCLUSIVE');
    expect(result.headline).toContain('Assessment Inconclusive');
  });

  it('never displays numerical risk scores and always includes medical disclaimer', () => {
    const input: AssessmentInput = {
      ageGroup: 'adult_18_64',
      symptoms: ['mild_headache'],
      customDescription: '',
      duration: 'less_than_24h',
      contextFactors: ['none'],
    };

    const result = evaluateTriage(input);
    const rawResult = result as unknown as Record<string, unknown>;
    expect(rawResult.riskScore).toBeUndefined();
    expect(rawResult.score).toBeUndefined();
    expect(result.disclaimer).toContain('HealthGuide AI is an educational decision-support navigator');
  });
});
