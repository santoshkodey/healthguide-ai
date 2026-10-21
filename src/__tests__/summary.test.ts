import { describe, it, expect } from 'vitest';
import { generateCareSummaryText } from '@/lib/summary';
import { evaluateTriage } from '@/lib/triage';
import { AssessmentInput } from '@/types/assessment';

describe('Shareable Care Summary Generator', () => {
  it('generates a complete, structured care summary text with accurate user inputs', () => {
    const input: AssessmentInput = {
      ageGroup: 'adult_18_64',
      symptoms: ['mild_headache', 'mild_fatigue'],
      customDescription: 'Throbbing temple headache since this morning after staring at screen',
      duration: 'less_than_24h',
      contextFactors: ['none'],
    };

    const triageResult = evaluateTriage(input);
    const summaryText = generateCareSummaryText(input, triageResult);

    // Header & Non-diagnostic disclaimer
    expect(summaryText).toContain('HEALTHGUIDE AI — SMART CARE NAVIGATOR');
    expect(summaryText).toContain('CARE SUMMARY & CLINICAL COMMUNICATION BRIEF');
    expect(summaryText).toContain('USER-REPORTED INFORMATION — NOT A MEDICAL DIAGNOSIS');

    // Anonymous patient info
    expect(summaryText).toContain('Adult (18 – 64 years)');
    expect(summaryText).toContain('Sudden / Less than 24 hours');
    expect(summaryText).toContain('Mild to moderate tension headache');
    expect(summaryText).toContain('Throbbing temple headache since this morning after staring at screen');

    // Triage outcome
    expect(summaryText).toContain(triageResult.tier);
    expect(summaryText).toContain(triageResult.headline);

    // Explainability section
    expect(summaryText).toContain('EXPLAINABILITY & SAFETY CHECKS');
    expect(summaryText).toContain('Warning-Sign Audits Conducted:');
    expect(summaryText).toContain('Clinical Data Missing (Uncertainties):');
    expect(summaryText).toContain('Application Limitations:');
    expect(summaryText).toContain('Deterministic safety rules in src/lib/triage.ts');

    // Emergency directory
    expect(summaryText).toContain('112 (Police, Fire, Ambulance)');
    expect(summaryText).toContain('108 (Ambulance Dispatch)');

    // Clinician Notice
    expect(summaryText).toContain('NOTICE TO CLINICIAN:');
    expect(summaryText).toContain('No identifiable patient data (name, phone number, government ID) is collected or stored.');
  });

  it('includes DETECTED warning sign indicator for emergency cases', () => {
    const input: AssessmentInput = {
      ageGroup: 'adult_18_64',
      symptoms: ['chest_pain_crushing'],
      customDescription: 'Tight band around chest radiating down left arm',
      duration: 'less_than_24h',
      contextFactors: ['heart_condition'],
    };

    const triageResult = evaluateTriage(input);
    const summaryText = generateCareSummaryText(input, triageResult);

    expect(summaryText).toContain('EMERGENCY');
    expect(summaryText).toContain('[DETECTED]');
    expect(summaryText).toContain('Known Heart Disease');
  });

  it('handles empty custom description gracefully without errors', () => {
    const input: AssessmentInput = {
      ageGroup: 'teen_13_17',
      symptoms: ['mild_cough'],
      customDescription: '',
      duration: '1_to_3_days',
      contextFactors: ['asthma_copd'],
    };

    const triageResult = evaluateTriage(input);
    const summaryText = generateCareSummaryText(input, triageResult);

    expect(summaryText).toContain('"None provided"');
    expect(summaryText).toContain('Asthma / COPD / Respiratory Condition');
  });
});
