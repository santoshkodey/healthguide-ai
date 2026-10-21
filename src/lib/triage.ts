import {
  AssessmentInput,
  RecommendedAction,
  TriageResult,
  TriggeredRule,
} from '@/types/assessment';
import { EMERGENCY_CONTACTS, GLOBAL_DISCLAIMER, SYMPTOM_DEFINITIONS } from './constants';

/**
 * HealthGuide AI — Safety-First Triage Engine
 *
 * ARCHITECTURAL PRINCIPLES:
 * 1. Deterministic & Transparent: Rules are explicit, auditable code, not black-box ML.
 * 2. Warning-First: Emergency red flags take unconditional priority.
 * 3. Conservative Language: Never claims certainty, diagnoses, or prescribes medications.
 * 4. Failsafe Default: Ambiguous or unsupported inputs default to INCONCLUSIVE.
 * 5. Universal Caution: Even routine recommendations mandate monitoring for warning signs.
 */

// Text pattern matches for critical free-text indicators
const EMERGENCY_KEYWORDS = [
  /\b(chest\s*pain|heart\s*attack|crushing\s*pressure)\b/i,
  /\b(can'?t\s*breathe|cannot\s*breathe|gasping|severe\s*shortness\s*of\s*breath|suffocating)\b/i,
  /\b(passed\s*out|loss\s*of\s*consciousness|fainted|unconscious|blacked\s*out)\b/i,
  /\b(stroke|face\s*droop|slurred\s*speech|paralysis|arm\s*weakness)\b/i,
  /\b(coughing\s*blood|vomiting\s*blood|blood\s*in\s*vomit)\b/i,
  /\b(severe\s*allergic|throat\s*closing|swelling\s*tongue|anaphylaxis)\b/i,
  /\b(uncontrolled\s*bleeding|bleeding\s*heavily|gushing\s*blood)\b/i,
  /\b(worst\s*headache|thunderclap\s*headache)\b/i,
];

const URGENT_KEYWORDS = [
  /\b(high\s*fever|fever\s*over\s*102|fever\s*over\s*39)\b/i,
  /\b(severe\s*stomach\s*pain|appendicitis|rigid\s*belly|severe\s*abdominal)\b/i,
  /\b(can'?t\s*keep\s*water|dehydrated|continuous\s*vomiting|unable\s*to\s*drink)\b/i,
  /\b(deep\s*wound|gaping\s*cut|puncture\s*wound|needs?\s*stitches)\b/i,
  /\b(red\s*streaks|spreading\s*infection|cellulitis)\b/i,
];

const ROUTINE_KEYWORDS = [
  /\b(cough|cold|throat|headache|ache|sore|fever|sniffle|congestion|runny\s*nose|fatigue|tired|exhausted|nausea|cramp|rash|itch|stiffness|malaise|sneez|dull\s*pain)\b/i,
];

const VAGUE_OR_JUNK_PATTERNS = [
  /^(asdf|qwerty|test|hello|hi|nothing|idk|dunno|help|\.|\?|!|\s)+$/i,
  /^[^a-zA-Z0-9]+$/,
];

export function evaluateTriage(input: AssessmentInput): TriageResult {
  const timestamp = new Date().toISOString();
  const triggeredRules: TriggeredRule[] = [];
  const symptomsSet = new Set(input.symptoms);
  const customText = (input.customDescription || '').trim();
  const contextSet = new Set(input.contextFactors);

  // ---------------------------------------------------------------------------
  // STEP 1: CHECK FOR INCONCLUSIVE / MALFORMED INPUT
  // ---------------------------------------------------------------------------
  const isVagueText = customText.length > 0 && VAGUE_OR_JUNK_PATTERNS.some((p) => p.test(customText));
  const hasNoSymptomsSelected = input.symptoms.length === 0;

  if (hasNoSymptomsSelected && (customText.length < 5 || isVagueText)) {
    return createInconclusiveResult(
      timestamp,
      'The provided information is insufficient or too ambiguous for the configured navigation rules to offer structured guidance.',
      [
        {
          id: 'RULE_INCONCLUSIVE_INSUFFICIENT_INPUT',
          tier: 'INCONCLUSIVE',
          title: 'Insufficient or Ambiguous Input',
          reason: 'No standard symptoms were selected and the free-text description did not provide recognizable clinical indications.',
          evidence: customText ? [`Submitted text: "${customText}"`] : ['No symptoms or description provided'],
        },
      ]
    );
  }

  // ---------------------------------------------------------------------------
  // STEP 2: CHECK CRITICAL EMERGENCY WARNING SIGNS (RED FLAGS)
  // ---------------------------------------------------------------------------

  // 2A: Direct Emergency Symptoms
  const emergencyDefinitions = SYMPTOM_DEFINITIONS.filter(
    (s) => s.isEmergencyWarning && symptomsSet.has(s.id)
  );

  if (emergencyDefinitions.length > 0) {
    triggeredRules.push({
      id: 'RULE_EMERGENCY_DIRECT_RED_FLAG',
      tier: 'EMERGENCY',
      title: 'Configured Emergency Warning Sign Selected',
      reason: 'One or more symptoms selected match our configured emergency warning signs requiring immediate emergency medical evaluation.',
      evidence: emergencyDefinitions.map((s) => s.label),
    });
  }

  // 2B: Free-text emergency indicators
  if (customText) {
    const matchedEmergencyKeywords: string[] = [];
    for (const pattern of EMERGENCY_KEYWORDS) {
      const match = customText.match(pattern);
      if (match) {
        matchedEmergencyKeywords.push(match[0]);
      }
    }
    if (matchedEmergencyKeywords.length > 0) {
      triggeredRules.push({
        id: 'RULE_EMERGENCY_KEYWORD_MATCH',
        tier: 'EMERGENCY',
        title: 'Emergency Keyword Identified in Description',
        reason: 'Free-text description contains language commonly associated with acute life-threatening medical emergencies.',
        evidence: matchedEmergencyKeywords.map((k) => `Matched: "${k}"`),
      });
    }
  }

  // 2C: High-risk vulnerable age trigger (Infant < 1 year with fever or respiratory distress)
  if (input.ageGroup === 'infant_under_1') {
    const infantWarningSymptoms = input.symptoms.filter((s) =>
      ['low_grade_fever', 'persistent_high_fever', 'severe_shortness_of_breath', 'inability_to_keep_fluids'].includes(s)
    );
    if (infantWarningSymptoms.length > 0) {
      triggeredRules.push({
        id: 'RULE_EMERGENCY_INFANT_VULNERABILITY',
        tier: 'EMERGENCY',
        title: 'Infant Critical Care Warning',
        reason: 'Fever or acute symptoms in infants under one year of age require urgent or immediate pediatric medical evaluation due to rapid risk of systemic decompensation.',
        evidence: [`Age: Infant (< 1 year)`, `Reported symptoms: ${infantWarningSymptoms.join(', ')}`],
      });
    }
  }

  // 2D: High-risk context compounding (e.g. Pregnancy with acute abdominal pain)
  if (contextSet.has('pregnancy')) {
    if (symptomsSet.has('acute_severe_abdominal_pain') || symptomsSet.has('uncontrolled_bleeding')) {
      triggeredRules.push({
        id: 'RULE_EMERGENCY_PREGNANCY_COMPLICATION',
        tier: 'EMERGENCY',
        title: 'Obstetric Emergency Concern',
        reason: 'Severe abdominal pain or acute bleeding during pregnancy requires urgent specialized obstetric emergency assessment.',
        evidence: ['Context: Pregnant', 'Symptom: Acute abdominal pain or bleeding'],
      });
    }
  }

  // If any emergency rule triggered, return EMERGENCY immediately (Warning-First)
  if (triggeredRules.some((r) => r.tier === 'EMERGENCY')) {
    return createEmergencyResult(timestamp, triggeredRules);
  }

  // ---------------------------------------------------------------------------
  // STEP 3: CHECK URGENT WARNING SIGNS (YELLOW FLAGS)
  // ---------------------------------------------------------------------------

  // 3A: Direct Urgent Symptoms
  const urgentDefinitions = SYMPTOM_DEFINITIONS.filter(
    (s) => s.isUrgentWarning && symptomsSet.has(s.id)
  );

  if (urgentDefinitions.length > 0) {
    triggeredRules.push({
      id: 'RULE_URGENT_DIRECT_FLAG',
      tier: 'URGENT',
      title: 'Configured Urgent Warning Sign Identified',
      reason: 'Symptoms reported require prompt, same-day professional evaluation to prevent complications or worsening.',
      evidence: urgentDefinitions.map((s) => s.label),
    });
  }

  // 3B: Urgent text indicators
  if (customText) {
    const matchedUrgentKeywords: string[] = [];
    for (const pattern of URGENT_KEYWORDS) {
      const match = customText.match(pattern);
      if (match) {
        matchedUrgentKeywords.push(match[0]);
      }
    }
    if (matchedUrgentKeywords.length > 0) {
      triggeredRules.push({
        id: 'RULE_URGENT_KEYWORD_MATCH',
        tier: 'URGENT',
        title: 'Urgent Care Indicator in Free-Text Description',
        reason: 'The description references symptoms that typically require medical review within 24 hours.',
        evidence: matchedUrgentKeywords.map((k) => `Matched: "${k}"`),
      });
    }
  }

  // 3C: High-risk comorbidities with persistent symptoms
  const highRiskConditions = ['diabetes', 'heart_condition', 'asthma_copd', 'immunocompromised'];
  const hasHighRiskComorbidity = input.contextFactors.some((c) => highRiskConditions.includes(c));
  const isProlongedDuration = ['4_to_7_days', '1_to_2_weeks', 'more_than_2_weeks'].includes(input.duration);

  if (hasHighRiskComorbidity && (isProlongedDuration || symptomsSet.has('low_grade_fever'))) {
    triggeredRules.push({
      id: 'RULE_URGENT_COMORBIDITY_RISK',
      tier: 'URGENT',
      title: 'Elevated Risk from Pre-Existing Condition',
      reason: 'Pre-existing medical conditions (such as diabetes, immunocompromise, or respiratory disease) lower physiological reserve and warrant proactive clinical assessment.',
      evidence: [
        `Risk factors: ${input.contextFactors.filter((c) => highRiskConditions.includes(c)).join(', ')}`,
        `Duration: ${input.duration.replace(/_/g, ' ')}`,
      ],
    });
  }

  // 3D: Prolonged duration (> 2 weeks) for any symptoms
  if (input.duration === 'more_than_2_weeks' && input.symptoms.length > 0) {
    triggeredRules.push({
      id: 'RULE_URGENT_PROLONGED_DURATION',
      tier: 'URGENT',
      title: 'Prolonged Symptom Duration',
      reason: 'Symptoms persisting beyond two weeks should be evaluated by a healthcare professional to identify underlying causes.',
      evidence: ['Duration exceeds 14 days without resolution'],
    });
  }

  // If any urgent rule triggered, return URGENT result
  if (triggeredRules.some((r) => r.tier === 'URGENT')) {
    return createUrgentResult(timestamp, triggeredRules);
  }

  // ---------------------------------------------------------------------------
  // STEP 4: ROUTINE / GENERAL PRIMARY CARE NAVIGATION
  // ---------------------------------------------------------------------------
  // Check if remaining symptoms are recognized routine symptoms
  const routineSymptoms = input.symptoms.filter((id) =>
    SYMPTOM_DEFINITIONS.some((s) => s.id === id && !s.isEmergencyWarning && !s.isUrgentWarning)
  );

  const hasRecognizedRoutineKeywords = customText.length >= 3 && ROUTINE_KEYWORDS.some((p) => p.test(customText));

  if (routineSymptoms.length > 0 || hasRecognizedRoutineKeywords) {
    triggeredRules.push({
      id: 'RULE_ROUTINE_PRIMARY_CARE',
      tier: 'ROUTINE',
      title: 'Common Mild / Self-Limiting Pattern',
      reason: 'Reported symptoms align with mild, non-emergency conditions that may be managed with self-care or routine primary care consultation.',
      evidence: routineSymptoms.length > 0 ? routineSymptoms : ['Mild descriptive symptom text provided'],
    });

    return createRoutineResult(timestamp, triggeredRules);
  }

  // If nothing matched, default to Inconclusive
  return createInconclusiveResult(
    timestamp,
    'The provided information did not contain recognized clinical symptom patterns to categorize under our standard guidance rules.',
    [
      {
        id: 'RULE_INCONCLUSIVE_FALLBACK',
        tier: 'INCONCLUSIVE',
        title: 'Uncategorized Presentation',
        reason: 'The symptom constellation does not match configured prototype patterns.',
        evidence: customText ? [`Submitted text: "${customText}"`] : ['Input did not trigger defined emergency, urgent, or routine rule sets.'],
      },
    ]
  );
}

// -----------------------------------------------------------------------------
// RESULT BUILDERS
// -----------------------------------------------------------------------------

function createEmergencyResult(timestamp: string, triggeredRules: TriggeredRule[]): TriageResult {
  const actions: RecommendedAction[] = [
    {
      order: 1,
      action: 'Call Emergency Services Immediately',
      urgency: 'immediate',
      detail: 'Dial 112 (National Emergency in India) or 108 (Ambulance), or have someone drive you to the nearest Emergency Department.',
    },
    {
      order: 2,
      action: 'Do Not Drive Yourself',
      urgency: 'immediate',
      detail: 'If you feel faint, short of breath, or disoriented, do not drive. Request an ambulance or ask someone you trust.',
    },
    {
      order: 3,
      action: 'Rest in a Safe, Comfortable Position',
      urgency: 'immediate',
      detail: 'Sit comfortably, loosen tight clothing around your neck and chest, and keep your phone nearby while waiting for help.',
    },
    {
      order: 4,
      action: 'Alert Someone Nearby',
      urgency: 'immediate',
      detail: 'Notify a family member, neighbor, or colleague immediately so they can assist you and emergency responders.',
    },
  ];

  return {
    tier: 'EMERGENCY',
    headline: 'Immediate Emergency Care Recommended',
    summary:
      'Based on the configured safety rules, one or more reported symptoms represent potential medical emergency warning signs. Do not wait for symptoms to worsen. Please seek immediate professional medical attention.',
    triggeredRules,
    recommendedActions: actions,
    emergencyContacts: EMERGENCY_CONTACTS,
    questionsForDoctor: [
      'What is the immediate priority for stabilizing my condition?',
      'Are diagnostic imaging or emergency blood tests needed right away?',
      'What should I watch for after acute stabilization?',
    ],
    monitoringGuidance: [
      'Look for any worsening difficulty breathing or blue/pale lips or fingers.',
      'Watch for changes in alertness, confusion, or slurred speech.',
      'Check for spreading chest pressure or radiating pain.',
    ],
    disclaimer: GLOBAL_DISCLAIMER,
    timestamp,
  };
}

function createUrgentResult(timestamp: string, triggeredRules: TriggeredRule[]): TriageResult {
  const actions: RecommendedAction[] = [
    {
      order: 1,
      action: 'Seek Same-Day Medical Evaluation',
      urgency: 'same_day',
      detail: 'Visit an urgent care center, community health center, or outpatient clinic today.',
    },
    {
      order: 2,
      action: 'Monitor for Red Flag Symptoms',
      urgency: 'same_day',
      detail: 'If symptoms suddenly escalate into chest pain, breathing difficulty, or fainting, dial 112 immediately.',
    },
    {
      order: 3,
      action: 'Maintain Safe Hydration',
      urgency: 'same_day',
      detail: 'Sip water or oral rehydration solutions slowly unless instructed otherwise by a clinician.',
    },
  ];

  return {
    tier: 'URGENT',
    headline: 'Prompt Medical Evaluation Recommended (Within 24 Hours)',
    summary:
      'Your reported symptoms or health context suggest an issue that warrants same-day medical evaluation. While these are not identified as immediate life-threatening emergency signs, delay may lead to complications.',
    triggeredRules,
    recommendedActions: actions,
    emergencyContacts: EMERGENCY_CONTACTS.filter((c) => c.isPrimary),
    questionsForDoctor: [
      'Could these symptoms indicate an infection requiring targeted prescription treatment?',
      'What specific signs would indicate that my condition is worsening and requires an ER visit?',
      'How many days should I expect these symptoms to take to improve?',
    ],
    monitoringGuidance: [
      'Monitor your temperature every 4 to 6 hours if fever is present.',
      'Ensure adequate fluid intake and monitor urine color (pale straw is ideal).',
      'Seek emergency care immediately if you develop sudden shortness of breath or unbearable pain.',
    ],
    disclaimer: GLOBAL_DISCLAIMER,
    timestamp,
  };
}

function createRoutineResult(timestamp: string, triggeredRules: TriggeredRule[]): TriageResult {
  const actions: RecommendedAction[] = [
    {
      order: 1,
      action: 'Rest and Supportive Hydration',
      urgency: 'self_care',
      detail: 'Ensure adequate sleep, rest your voice/body, and drink plenty of warm fluids (water, broth, herbal tea).',
    },
    {
      order: 2,
      action: 'Schedule a Non-Urgent Doctor Appointment If Unimproved',
      urgency: 'scheduled',
      detail: 'If symptoms do not begin to improve within 3 to 5 days, consult your primary care doctor.',
    },
    {
      order: 3,
      action: 'Watch for Escalation',
      urgency: 'self_care',
      detail: 'Review the warning signs below. Seek prompt medical care if new or severe symptoms appear.',
    },
  ];

  return {
    tier: 'ROUTINE',
    headline: 'Routine Primary Care / Monitored Self-Care Guidance',
    summary:
      'The symptoms reported do not currently match configured emergency or urgent warning signs. Mild viral or tension symptoms often respond to rest and supportive hydration, but you should consult a doctor if they persist or worry you.',
    triggeredRules,
    recommendedActions: actions,
    emergencyContacts: [],
    questionsForDoctor: [
      'What over-the-counter remedies are safe considering my personal medical history?',
      'How long is this illness typically contagious?',
      'At what point should I come in for follow-up testing?',
    ],
    monitoringGuidance: [
      'Red flag: Fever rising above 39°C (102.2°F) or persisting beyond 3 days.',
      'Red flag: Any new chest pain, shortness of breath, or stiff neck.',
      'Red flag: Inability to keep fluids down for more than 24 hours.',
    ],
    disclaimer: GLOBAL_DISCLAIMER,
    timestamp,
  };
}

function createInconclusiveResult(
  timestamp: string,
  summary: string,
  triggeredRules: TriggeredRule[]
): TriageResult {
  const actions: RecommendedAction[] = [
    {
      order: 1,
      action: 'Consult a Healthcare Professional in Person',
      urgency: 'scheduled',
      detail: 'An in-person clinical exam and doctor conversation is essential when symptoms are atypical, unclear, or complex.',
    },
    {
      order: 2,
      action: 'Re-assess with Specific Details If Needed',
      urgency: 'self_care',
      detail: 'You may re-run this navigator and select specific symptoms from the checklist to review configured safety warnings.',
    },
    {
      order: 3,
      action: 'Seek Immediate Care If Experiencing Severe Distress',
      urgency: 'immediate',
      detail: 'If you feel critically unwell, do not wait for online tools. Call 112 or visit an emergency room right away.',
    },
  ];

  return {
    tier: 'INCONCLUSIVE',
    headline: 'Assessment Inconclusive — Clinical Consultation Advised',
    summary,
    triggeredRules,
    recommendedActions: actions,
    emergencyContacts: EMERGENCY_CONTACTS.filter((c) => c.isPrimary),
    questionsForDoctor: [
      'What diagnostic evaluation is most appropriate for the symptoms I am feeling?',
      'Could my lifestyle, stress, or medications be contributing to how I feel?',
    ],
    monitoringGuidance: [
      'Keep a written log of when symptoms occur, their severity, and what makes them better or worse.',
      'If you develop any chest pain, severe shortness of breath, or confusion, call 112 immediately.',
    ],
    disclaimer: GLOBAL_DISCLAIMER,
    timestamp,
  };
}
