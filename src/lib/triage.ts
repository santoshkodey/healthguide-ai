import {
  AssessmentInput,
  ExplainabilityDetails,
  RecommendedAction,
  TriageResult,
  TriageTier,
  TriggeredRule,
  WarningSignCheck,
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
 * 6. Full Explainability: Explicitly documents reported symptoms, audited warning signs,
 *    clinical uncertainties, missing data, and system boundaries.
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
    const rules: TriggeredRule[] = [
      {
        id: 'RULE_INCONCLUSIVE_INSUFFICIENT_INPUT',
        tier: 'INCONCLUSIVE',
        title: 'Insufficient or Ambiguous Input',
        reason: 'No standard symptoms were selected and the free-text description did not provide recognizable clinical indications.',
        evidence: customText ? [`Submitted text: "${customText}"`] : ['No symptoms or description provided'],
      },
    ];
    const explainability = buildExplainability(input, 'INCONCLUSIVE');
    return createInconclusiveResult(
      timestamp,
      'The provided information is insufficient or too ambiguous for the configured navigation rules to offer structured guidance.',
      rules,
      explainability
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
    const explainability = buildExplainability(input, 'EMERGENCY');
    return createEmergencyResult(timestamp, triggeredRules, explainability);
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
    const explainability = buildExplainability(input, 'URGENT');
    return createUrgentResult(timestamp, triggeredRules, explainability);
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

    const explainability = buildExplainability(input, 'ROUTINE');
    return createRoutineResult(timestamp, triggeredRules, explainability);
  }

  // If nothing matched, default to Inconclusive
  const fallbackRules: TriggeredRule[] = [
    {
      id: 'RULE_INCONCLUSIVE_FALLBACK',
      tier: 'INCONCLUSIVE',
      title: 'Uncategorized Presentation',
      reason: 'The symptom constellation does not match configured prototype patterns.',
      evidence: customText ? [`Submitted text: "${customText}"`] : ['Input did not trigger defined emergency, urgent, or routine rule sets.'],
    },
  ];
  const explainability = buildExplainability(input, 'INCONCLUSIVE');
  return createInconclusiveResult(
    timestamp,
    'The provided information did not contain recognized clinical symptom patterns to categorize under our standard guidance rules.',
    fallbackRules,
    explainability
  );
}

// -----------------------------------------------------------------------------
// EXPLAINABILITY ENGINE
// -----------------------------------------------------------------------------

function buildExplainability(
  input: AssessmentInput,
  tier: TriageTier
): ExplainabilityDetails {
  const symptomsSet = new Set(input.symptoms);
  const customText = (input.customDescription || '').toLowerCase();
  const contextSet = new Set(input.contextFactors);

  const reportedSymptoms = input.symptoms.map((id) => {
    const sym = SYMPTOM_DEFINITIONS.find((s) => s.id === id);
    return sym?.label || id;
  });
  if (input.customDescription.trim()) {
    reportedSymptoms.push(`Free-text note: "${input.customDescription.trim()}"`);
  }

  // Audited warning signs
  const checks: WarningSignCheck[] = [
    {
      id: 'CHECK_CARDIAC',
      category: 'Cardiovascular',
      question: 'Crushing or radiating chest pain / pressure (acute coronary warning sign)',
      status: symptomsSet.has('chest_pain_crushing') || customText.includes('chest pain') ? 'detected' : 'not_detected',
      reason: symptomsSet.has('chest_pain_crushing') || customText.includes('chest pain')
        ? 'Reported in checklist or description.'
        : 'No acute cardiac distress markers reported.',
    },
    {
      id: 'CHECK_RESPIRATORY',
      category: 'Respiratory',
      question: 'Severe shortness of breath, gasping, or blue discoloration (respiratory failure)',
      status: symptomsSet.has('severe_shortness_of_breath') || customText.includes('cannot breathe') || customText.includes("can't breathe") ? 'detected' : 'not_detected',
      reason: symptomsSet.has('severe_shortness_of_breath') || customText.includes('cannot breathe') || customText.includes("can't breathe")
        ? 'Reported in checklist or description.'
        : 'No acute respiratory failure markers reported.',
    },
    {
      id: 'CHECK_STROKE_FAST',
      category: 'Neurological',
      question: 'Sudden face drooping, arm weakness, or slurred speech (FAST stroke signs)',
      status: symptomsSet.has('stroke_symptoms') || customText.includes('stroke') || customText.includes('slurred') ? 'detected' : 'not_detected',
      reason: symptomsSet.has('stroke_symptoms') || customText.includes('stroke') || customText.includes('slurred')
        ? 'Acute neurological asymmetry reported.'
        : 'No focal neurological deficits reported.',
    },
    {
      id: 'CHECK_SYNCOPE',
      category: 'Neurological',
      question: 'Sudden loss of consciousness, fainting, or collapse',
      status: symptomsSet.has('sudden_loss_of_consciousness') || customText.includes('fainted') || customText.includes('passed out') ? 'detected' : 'not_detected',
      reason: symptomsSet.has('sudden_loss_of_consciousness') || customText.includes('fainted') || customText.includes('passed out')
        ? 'Loss of consciousness event reported.'
        : 'No fainting or collapse reported.',
    },
    {
      id: 'CHECK_HEMORRHAGE',
      category: 'Critical',
      question: 'Coughing or vomiting blood, or uncontrolled heavy bleeding',
      status: symptomsSet.has('coughing_vomiting_blood') || symptomsSet.has('uncontrolled_bleeding') || customText.includes('vomiting blood') || customText.includes('coughing blood') ? 'detected' : 'not_detected',
      reason: symptomsSet.has('coughing_vomiting_blood') || symptomsSet.has('uncontrolled_bleeding') || customText.includes('vomiting blood') || customText.includes('coughing blood')
        ? 'Active hemorrhage or blood loss reported.'
        : 'No acute bleeding reported.',
    },
    {
      id: 'CHECK_ANAPHYLAXIS',
      category: 'Allergic / Airway',
      question: 'Severe throat, lip, or tongue swelling with breathing distress (anaphylaxis)',
      status: symptomsSet.has('anaphylaxis_signs') || customText.includes('anaphylaxis') || customText.includes('throat closing') ? 'detected' : 'not_detected',
      reason: symptomsSet.has('anaphylaxis_signs') || customText.includes('anaphylaxis') || customText.includes('throat closing')
        ? 'Airway compromise or severe allergic reaction reported.'
        : 'No anaphylactic airway symptoms reported.',
    },
    {
      id: 'CHECK_THUNDERCLAP_HEADACHE',
      category: 'Neurological',
      question: 'Sudden explosive severe headache reaching peak intensity in seconds ("worst of life")',
      status: symptomsSet.has('worst_headache_of_life') || customText.includes('worst headache') || customText.includes('thunderclap') ? 'detected' : 'not_detected',
      reason: symptomsSet.has('worst_headache_of_life') || customText.includes('worst headache') || customText.includes('thunderclap')
        ? 'Abrupt onset severe headache reported.'
        : 'No thunderclap headache pattern reported.',
    },
    {
      id: 'CHECK_PEDIATRIC_VULNERABILITY',
      category: 'Pediatric',
      question: 'Infant (< 1 year) with fever or acute illness requiring immediate pediatric evaluation',
      status: input.ageGroup === 'infant_under_1' && (symptomsSet.has('low_grade_fever') || symptomsSet.has('persistent_high_fever') || customText.includes('fever')) ? 'detected' : 'not_detected',
      reason: input.ageGroup === 'infant_under_1'
        ? (symptomsSet.has('low_grade_fever') || symptomsSet.has('persistent_high_fever') ? 'Fever reported in infant under 1 year.' : 'Patient is infant; no acute fever reported.')
        : 'Not applicable (patient age is not infant < 1 year).',
    },
    {
      id: 'CHECK_OBSTETRIC',
      category: 'Obstetric',
      question: 'Acute severe abdominal pain or bleeding during pregnancy',
      status: contextSet.has('pregnancy') && (symptomsSet.has('acute_severe_abdominal_pain') || symptomsSet.has('uncontrolled_bleeding')) ? 'detected' : 'not_detected',
      reason: contextSet.has('pregnancy')
        ? (symptomsSet.has('acute_severe_abdominal_pain') ? 'Severe abdominal pain reported during pregnancy.' : 'Pregnant; no acute abdominal pain/bleeding reported.')
        : 'Not applicable (pregnancy not reported in context).',
    },
    {
      id: 'CHECK_PERSISTENT_HIGH_FEVER',
      category: 'Infection / Systemic',
      question: 'High fever (> 39°C / 102.2°F) persisting for 3 or more days',
      status: symptomsSet.has('persistent_high_fever') || customText.includes('high fever') ? 'detected' : 'not_detected',
      reason: symptomsSet.has('persistent_high_fever') || customText.includes('high fever')
        ? 'Prolonged high fever reported.'
        : 'No prolonged high fever reported.',
    },
    {
      id: 'CHECK_DEHYDRATION_RISK',
      category: 'Gastrointestinal',
      question: 'Persistent vomiting unable to retain fluids for over 24 hours',
      status: symptomsSet.has('inability_to_keep_fluids') || customText.includes('cannot keep water') || customText.includes("can't keep water") ? 'detected' : 'not_detected',
      reason: symptomsSet.has('inability_to_keep_fluids') || customText.includes('cannot keep water') || customText.includes("can't keep water")
        ? 'Acute dehydration risk reported.'
        : 'Oral hydration reported as maintained.',
    },
    {
      id: 'CHECK_PROLONGED_DURATION',
      category: 'Progression',
      question: 'Symptom duration exceeding 14 days without clinical resolution',
      status: input.duration === 'more_than_2_weeks' ? 'detected' : 'not_detected',
      reason: input.duration === 'more_than_2_weeks'
        ? 'Symptoms have persisted for more than two weeks.'
        : `Duration (${input.duration.replace(/_/g, ' ')}) is under two weeks.`,
    },
  ];

  let guidanceRationale = '';
  if (tier === 'EMERGENCY') {
    guidanceRationale = 'Immediate emergency care is recommended because one or more critical warning signs (red flags) were identified. Configured emergency signs take priority over all ordinary guidance.';
  } else if (tier === 'URGENT') {
    guidanceRationale = 'Same-day urgent medical evaluation is recommended because symptoms indicate acute progression or vulnerability factors (such as prolonged fever or comorbidities) without immediate life-threatening emergency signs.';
  } else if (tier === 'ROUTINE') {
    guidanceRationale = 'Routine primary care and monitored self-care are indicated because reported symptoms match mild, self-limiting patterns with no emergency or urgent warning signs detected.';
  } else {
    guidanceRationale = 'The assessment is inconclusive because the provided information was too limited, ambiguous, or outside the scope of configured safety rules. An in-person clinical exam is advised.';
  }

  const missingInformation = [
    'Real-time vital signs (blood pressure, pulse rate, oxygen saturation SpO2, core body temperature)',
    'In-person physical examination (lung/heart auscultation, abdominal palpation, throat examination)',
    'Diagnostic clinical laboratory tests (complete blood count, metabolic panel, inflammatory markers)',
    'Complete medical records, current prescription medication list, and allergy profile',
  ];

  const systemLimitations = [
    'Cannot diagnose specific clinical diseases, pathogens (viral vs bacterial), or pathological conditions.',
    'Absence of reported warning signs does NOT guarantee that a person is healthy or that an illness will not progress.',
    'Cannot perform clinical imaging (X-rays, CT/MRI scans, ultrasound) or 12-lead electrocardiograms (ECG/EKG).',
    'Automated rules provide decision support for navigation only and require clinical evaluation.',
  ];

  return {
    reportedSymptoms,
    checkedWarningSigns: checks,
    guidanceRationale,
    missingInformation,
    systemLimitations,
    logicSource: 'deterministic_safety_rules',
    clinicalReviewNotice:
      'This rules-based prototype is an educational care navigator and requires qualified clinical review prior to any clinical deployment. Always consult a physician.',
  };
}

// -----------------------------------------------------------------------------
// RESULT BUILDERS
// -----------------------------------------------------------------------------

function createEmergencyResult(
  timestamp: string,
  triggeredRules: TriggeredRule[],
  explainability: ExplainabilityDetails
): TriageResult {
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
    explainability,
    disclaimer: GLOBAL_DISCLAIMER,
    timestamp,
  };
}

function createUrgentResult(
  timestamp: string,
  triggeredRules: TriggeredRule[],
  explainability: ExplainabilityDetails
): TriageResult {
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
    explainability,
    disclaimer: GLOBAL_DISCLAIMER,
    timestamp,
  };
}

function createRoutineResult(
  timestamp: string,
  triggeredRules: TriggeredRule[],
  explainability: ExplainabilityDetails
): TriageResult {
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
    explainability,
    disclaimer: GLOBAL_DISCLAIMER,
    timestamp,
  };
}

function createInconclusiveResult(
  timestamp: string,
  summary: string,
  triggeredRules: TriggeredRule[],
  explainability: ExplainabilityDetails
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
    explainability,
    disclaimer: GLOBAL_DISCLAIMER,
    timestamp,
  };
}
