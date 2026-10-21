import { AgeGroup, ContextFactor, EmergencyContact, SymptomDefinition, SymptomDuration } from '@/types/assessment';

export const AGE_GROUP_OPTIONS: { value: AgeGroup; label: string; description: string }[] = [
  { value: 'infant_under_1', label: 'Infant (< 1 year)', description: 'Requires immediate pediatric medical caution' },
  { value: 'child_1_12', label: 'Child (1 – 12 years)', description: 'Pediatric care considerations apply' },
  { value: 'teen_13_17', label: 'Adolescent (13 – 17 years)', description: 'Young adult physiology' },
  { value: 'adult_18_64', label: 'Adult (18 – 64 years)', description: 'Standard adult care navigation' },
  { value: 'senior_65_plus', label: 'Senior (65+ years)', description: 'Higher vulnerability to rapid progression' },
];

export const DURATION_OPTIONS: { value: SymptomDuration; label: string }[] = [
  { value: 'less_than_24h', label: 'Sudden / Less than 24 hours' },
  { value: '1_to_3_days', label: '1 to 3 days' },
  { value: '4_to_7_days', label: '4 to 7 days' },
  { value: '1_to_2_weeks', label: '1 to 2 weeks' },
  { value: 'more_than_2_weeks', label: 'More than 2 weeks (persistent/chronic)' },
];

export const CONTEXT_OPTIONS: { value: ContextFactor; label: string; description: string }[] = [
  { value: 'pregnancy', label: 'Currently Pregnant', description: 'Requires specialized maternal evaluation' },
  { value: 'heart_condition', label: 'Known Heart Disease / Prior Cardiac Event', description: 'Elevated cardiac risk' },
  { value: 'asthma_copd', label: 'Asthma / COPD / Respiratory Condition', description: 'Elevated respiratory risk' },
  { value: 'diabetes', label: 'Diabetes', description: 'Prone to metabolic complications and infection spread' },
  { value: 'hypertension', label: 'High Blood Pressure', description: 'Cardiovascular risk factor' },
  { value: 'immunocompromised', label: 'Immunocompromised / Chemotherapy', description: 'High infection vulnerability' },
  { value: 'recent_surgery', label: 'Recent Surgery (past 30 days)', description: 'Post-operative complication risk' },
  { value: 'recent_injury', label: 'Recent Physical Trauma / Head Impact', description: 'Potential internal or head injury' },
  { value: 'none', label: 'None of the above', description: 'No known pre-existing vulnerability factors' },
];

export const SYMPTOM_DEFINITIONS: SymptomDefinition[] = [
  // CRITICAL / EMERGENCY WARNING SIGNS
  {
    id: 'chest_pain_crushing',
    label: 'Crushing or radiating chest pain / pressure',
    category: 'cardiovascular',
    isEmergencyWarning: true,
    isUrgentWarning: false,
    description: 'Pain, pressure, or tightness in the center of the chest, radiating to jaw, neck, arm, or back.',
  },
  {
    id: 'severe_shortness_of_breath',
    label: 'Severe shortness of breath or gasping for air',
    category: 'respiratory',
    isEmergencyWarning: true,
    isUrgentWarning: false,
    description: 'Inability to speak in full sentences, blue lips or fingers, or severe respiratory struggle.',
  },
  {
    id: 'stroke_symptoms',
    label: 'Sudden face drooping, arm weakness, or slurred speech',
    category: 'neurological',
    isEmergencyWarning: true,
    isUrgentWarning: false,
    description: 'Classic FAST signs of stroke: sudden facial asymmetry, unilateral weakness, or garbled speech.',
  },
  {
    id: 'sudden_loss_of_consciousness',
    label: 'Loss of consciousness, fainting, or sudden collapse',
    category: 'neurological',
    isEmergencyWarning: true,
    isUrgentWarning: false,
    description: 'Passing out, unresponsiveness, or profound sudden confusion.',
  },
  {
    id: 'coughing_vomiting_blood',
    label: 'Coughing up blood or vomiting bright red/dark blood',
    category: 'critical',
    isEmergencyWarning: true,
    isUrgentWarning: false,
    description: 'Sign of potential internal or pulmonary hemorrhage.',
  },
  {
    id: 'anaphylaxis_signs',
    label: 'Severe allergic swelling (throat/lips/tongue) with breathing distress',
    category: 'critical',
    isEmergencyWarning: true,
    isUrgentWarning: false,
    description: 'Rapid onset swelling of airway passages following food, medication, or insect sting.',
  },
  {
    id: 'uncontrolled_bleeding',
    label: 'Severe, uncontrolled bleeding not stopping with pressure',
    category: 'critical',
    isEmergencyWarning: true,
    isUrgentWarning: false,
    description: 'Heavy arterial or continuous venous bleeding that soaks through dressings.',
  },
  {
    id: 'worst_headache_of_life',
    label: 'Sudden "thunderclap" severe headache (worst of life)',
    category: 'neurological',
    isEmergencyWarning: true,
    isUrgentWarning: false,
    description: 'Abrupt onset headache reaching maximum intensity within seconds, unlike previous headaches.',
  },

  // URGENT EVALUATION SIGNS
  {
    id: 'persistent_high_fever',
    label: 'Persistent high fever (above 39°C / 102.2°F for 3+ days)',
    category: 'general',
    isEmergencyWarning: false,
    isUrgentWarning: true,
    description: 'High body temperature not responding to standard reduction or lasting multiple days.',
  },
  {
    id: 'acute_severe_abdominal_pain',
    label: 'Acute severe abdominal pain or rigid stomach',
    category: 'gastrointestinal',
    isEmergencyWarning: false,
    isUrgentWarning: true,
    description: 'Intense belly pain, especially if localized to right lower abdomen or accompanied by vomiting.',
  },
  {
    id: 'inability_to_keep_fluids',
    label: 'Severe persistent vomiting, unable to keep liquids down (> 24 hours)',
    category: 'gastrointestinal',
    isEmergencyWarning: false,
    isUrgentWarning: true,
    description: 'Risk of acute dehydration, sunken eyes, dry mouth, or minimal urination.',
  },
  {
    id: 'spreading_skin_infection',
    label: 'Rapidly spreading red, hot, swollen skin or red streaks',
    category: 'skin',
    isEmergencyWarning: false,
    isUrgentWarning: true,
    description: 'Signs of cellulitis or spreading bacterial infection following a cut or bite.',
  },
  {
    id: 'deep_wound_or_laceration',
    label: 'Deep wound, gaping cut, or puncture requiring sutures',
    category: 'critical',
    isEmergencyWarning: false,
    isUrgentWarning: true,
    description: 'Open laceration needing professional cleaning, closure, and tetanus booster evaluation.',
  },

  // GENERAL & ROUTINE SYMPTOMS
  {
    id: 'mild_cough',
    label: 'Mild cough or throat irritation',
    category: 'respiratory',
    isEmergencyWarning: false,
    isUrgentWarning: false,
    description: 'Dry or slightly productive cough without chest pain or breathing difficulty.',
  },
  {
    id: 'runny_or_stuffy_nose',
    label: 'Runny or congested nose, sneezing',
    category: 'respiratory',
    isEmergencyWarning: false,
    isUrgentWarning: false,
    description: 'Common cold or seasonal allergic rhinitis symptoms.',
  },
  {
    id: 'mild_sore_throat',
    label: 'Mild to moderate sore throat',
    category: 'respiratory',
    isEmergencyWarning: false,
    isUrgentWarning: false,
    description: 'Scratchy or painful sensation when swallowing, without inability to swallow saliva.',
  },
  {
    id: 'mild_headache',
    label: 'Mild to moderate tension headache',
    category: 'neurological',
    isEmergencyWarning: false,
    isUrgentWarning: false,
    description: 'Dull ache across forehead or temples, relieved by rest or standard over-the-counter measures.',
  },
  {
    id: 'low_grade_fever',
    label: 'Low-grade fever (under 38.5°C / 101.3°F)',
    category: 'general',
    isEmergencyWarning: false,
    isUrgentWarning: false,
    description: 'Mild elevation in body temperature lasting less than 48 hours.',
  },
  {
    id: 'general_fatigue',
    label: 'General fatigue or body tiredness',
    category: 'general',
    isEmergencyWarning: false,
    isUrgentWarning: false,
    description: 'Feeling sluggish, tired, or low energy without fainting or confusion.',
  },
  {
    id: 'mild_muscle_aches',
    label: 'Mild muscle aches or body stiffness',
    category: 'general',
    isEmergencyWarning: false,
    isUrgentWarning: false,
    description: 'Generalized mild soreness typical of viral illness or physical exertion.',
  },
  {
    id: 'mild_nausea',
    label: 'Mild nausea or upset stomach (able to hydrate)',
    category: 'gastrointestinal',
    isEmergencyWarning: false,
    isUrgentWarning: false,
    description: 'Queasiness without severe pain or persistent inability to retain fluids.',
  },
  {
    id: 'minor_localized_rash',
    label: 'Minor localized rash or itchiness',
    category: 'skin',
    isEmergencyWarning: false,
    isUrgentWarning: false,
    description: 'Small patch of rash without facial swelling, fever, or blistering.',
  },
];

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    label: 'National Emergency Services (India)',
    number: '112',
    description: 'Unified national emergency number for immediate police, fire, or medical dispatch across India.',
    isPrimary: true,
  },
  {
    label: 'Emergency Medical Services / Ambulance (India)',
    number: '108',
    description: 'Direct government emergency medical and ambulance dispatch.',
    isPrimary: true,
  },
  {
    label: 'Janani Shishu Suraksha / Patient Transport (India)',
    number: '102',
    description: 'Maternal and pediatric emergency medical transport.',
    isPrimary: false,
  },
  {
    label: 'Kiran Mental Health Helpline (Govt of India)',
    number: '1800-599-0019',
    description: 'Toll-free 24/7 mental health and psychological crisis counseling.',
    isPrimary: false,
  },
];

export const GLOBAL_DISCLAIMER =
  'HealthGuide AI is an educational decision-support navigator built for a hackathon demonstration. It is NOT a diagnostic tool, medical device, or replacement for professional clinical judgment. If you or someone around you is experiencing life-threatening symptoms, call emergency services (112 in India, 911 in the US) or proceed to the nearest emergency room immediately.';
