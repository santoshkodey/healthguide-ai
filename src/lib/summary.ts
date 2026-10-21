import { AssessmentInput, TriageResult } from '@/types/assessment';
import { AGE_GROUP_OPTIONS, CONTEXT_OPTIONS, DURATION_OPTIONS, SYMPTOM_DEFINITIONS } from './constants';

export function generateCareSummaryText(input: AssessmentInput, result: TriageResult): string {
  const ageLabel = AGE_GROUP_OPTIONS.find((a) => a.value === input.ageGroup)?.label || input.ageGroup;
  const durationLabel = DURATION_OPTIONS.find((d) => d.value === input.duration)?.label || input.duration;
  const contextList =
    input.contextFactors.length === 0 || input.contextFactors.includes('none')
      ? 'None reported'
      : input.contextFactors
          .map((c) => CONTEXT_OPTIONS.find((opt) => opt.value === c)?.label || c)
          .join(', ');

  const reportedSymptomsList =
    input.symptoms.length > 0
      ? input.symptoms
          .map((id) => {
            const sym = SYMPTOM_DEFINITIONS.find((s) => s.id === id);
            return `  • ${sym?.label || id}`;
          })
          .join('\n')
      : '  • No standard checklist symptoms selected';

  const triggeredRulesList =
    result.triggeredRules.length > 0
      ? result.triggeredRules
          .map((r) => `  [${r.id}] ${r.title}\n    Reason: ${r.reason}\n    Evidence: ${r.evidence.join(', ')}`)
          .join('\n\n')
      : '  No specific emergency or urgent rules triggered.';

  const actionsList = result.recommendedActions
    .map((a) => `  ${a.order}. ${a.action} [Urgency: ${a.urgency.toUpperCase()}]\n     ${a.detail}`)
    .join('\n');

  const questionsList =
    result.questionsForDoctor.length > 0
      ? result.questionsForDoctor.map((q, i) => `  ${i + 1}. ${q}`).join('\n')
      : '  Consult your primary care clinician for tailored guidance.';

  const warningSignsAudit = result.explainability?.checkedWarningSigns
    ? result.explainability.checkedWarningSigns
        .map((w) => `  - [${w.status === 'detected' ? 'DETECTED' : 'CLEAR'}] ${w.question}\n      ${w.reason}`)
        .join('\n')
    : '  Rules evaluation complete.';

  const missingInfoList = result.explainability?.missingInformation
    ? result.explainability.missingInformation.map((m) => `  • ${m}`).join('\n')
    : '  Vital signs, physical exam, and laboratory diagnostics.';

  const systemLimitationsList = result.explainability?.systemLimitations
    ? result.explainability.systemLimitations.map((l) => `  • ${l}`).join('\n')
    : '  Non-diagnostic care navigator.';

  return `================================================================================
HEALTHGUIDE AI — SMART CARE NAVIGATOR
CARE SUMMARY & CLINICAL COMMUNICATION BRIEF
USER-REPORTED INFORMATION — NOT A MEDICAL DIAGNOSIS
================================================================================

ASSESSMENT TIMESTAMP: ${new Date(result.timestamp).toLocaleString('en-US', { timeZoneName: 'short' })}
ASSESSMENT ID: ${result.timestamp.replace(/[^0-9]/g, '').slice(0, 14)}

--------------------------------------------------------------------------------
1. PATIENT-REPORTED INFORMATION (ANONYMOUS)
--------------------------------------------------------------------------------
Age Bracket:      ${ageLabel}
Symptom Duration: ${durationLabel}
Context Factors:  ${contextList}

Reported Symptoms:
${reportedSymptomsList}

User Free-Text Notes:
"${input.customDescription || 'None provided'}"

--------------------------------------------------------------------------------
2. CARE NAVIGATION EVALUATION
--------------------------------------------------------------------------------
Evaluation Tier:  ${result.tier}
Headline:         ${result.headline}

Clinical Rationale Summary:
${result.summary}

Rules Triggered (Deterministic Logic):
${triggeredRulesList}

--------------------------------------------------------------------------------
3. EXPLAINABILITY & SAFETY CHECKS
--------------------------------------------------------------------------------
Warning-Sign Audits Conducted:
${warningSignsAudit}

Clinical Data Missing (Uncertainties):
${missingInfoList}

Application Limitations:
${systemLimitationsList}

Logic Source: Deterministic safety rules in src/lib/triage.ts (Auditable code)
Clinical Review Notice: ${result.explainability?.clinicalReviewNotice || 'Requires qualified clinical review.'}

--------------------------------------------------------------------------------
4. RECOMMENDED NEXT STEPS
--------------------------------------------------------------------------------
${actionsList}

--------------------------------------------------------------------------------
5. QUESTIONS TO ASK YOUR HEALTHCARE PROVIDER
--------------------------------------------------------------------------------
${questionsList}

--------------------------------------------------------------------------------
6. EMERGENCY CONTACT DIRECTORY (INDIA)
--------------------------------------------------------------------------------
• National Emergency Services:           112 (Police, Fire, Ambulance)
• Emergency Medical Services:            108 (Ambulance Dispatch)
• Maternal & Neonatal Transport:         102
• Kiran Mental Health Helpline:          1800-599-0019

--------------------------------------------------------------------------------
7. MEDICAL DISCLAIMER & PRIVACY NOTICE
--------------------------------------------------------------------------------
${result.disclaimer}

NOTICE TO CLINICIAN:
This summary reflects self-reported symptoms input into HealthGuide AI for care navigation.
It is NOT an electronic health record, validated medical chart, or diagnosis.
No identifiable patient data (name, phone number, government ID) is collected or stored.
================================================================================
`;
}

export function downloadFile(content: string, filename: string, mimeType = 'text/plain;charset=utf-8') {
  if (typeof window === 'undefined') return;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
