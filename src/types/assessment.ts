export type AgeGroup =
  | 'infant_under_1'
  | 'child_1_12'
  | 'teen_13_17'
  | 'adult_18_64'
  | 'senior_65_plus';

export type SymptomDuration =
  | 'less_than_24h'
  | '1_to_3_days'
  | '4_to_7_days'
  | '1_to_2_weeks'
  | 'more_than_2_weeks';

export type ContextFactor =
  | 'pregnancy'
  | 'diabetes'
  | 'hypertension'
  | 'heart_condition'
  | 'asthma_copd'
  | 'immunocompromised'
  | 'recent_surgery'
  | 'recent_injury'
  | 'none';

export type TriageTier = 'EMERGENCY' | 'URGENT' | 'ROUTINE' | 'INCONCLUSIVE';

export interface SymptomDefinition {
  id: string;
  label: string;
  category: 'critical' | 'respiratory' | 'cardiovascular' | 'neurological' | 'gastrointestinal' | 'general' | 'skin';
  isEmergencyWarning: boolean;
  isUrgentWarning: boolean;
  description?: string;
}

export interface AssessmentInput {
  ageGroup: AgeGroup;
  symptoms: string[];
  customDescription: string;
  duration: SymptomDuration;
  contextFactors: ContextFactor[];
  inputLanguage?: string;
}

export interface TriggeredRule {
  id: string;
  tier: TriageTier;
  title: string;
  reason: string;
  evidence: string[];
}

export interface RecommendedAction {
  order: number;
  action: string;
  urgency: 'immediate' | 'same_day' | 'scheduled' | 'self_care';
  detail: string;
}

export interface EmergencyContact {
  label: string;
  number: string;
  description: string;
  isPrimary?: boolean;
}

export interface WarningSignCheck {
  id: string;
  category: string;
  question: string;
  status: 'detected' | 'not_detected';
  reason: string;
}

export interface ExplainabilityDetails {
  reportedSymptoms: string[];
  checkedWarningSigns: WarningSignCheck[];
  guidanceRationale: string;
  missingInformation: string[];
  systemLimitations: string[];
  logicSource: 'deterministic_safety_rules' | 'ai_insights';
  clinicalReviewNotice: string;
}

export interface TriageResult {
  tier: TriageTier;
  headline: string;
  summary: string;
  triggeredRules: TriggeredRule[];
  recommendedActions: RecommendedAction[];
  emergencyContacts: EmergencyContact[];
  questionsForDoctor: string[];
  monitoringGuidance: string[];
  explainability: ExplainabilityDetails;
  disclaimer: string;
  timestamp: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distanceKm?: number;
  phone?: string;
  isOpenNow?: boolean;
  isEmergencyCapable?: boolean;
  source: 'google' | 'osm' | 'direct_search';
  mapUrl: string;
  directionsUrl: string;
}

export interface HospitalSearchResponse {
  success: boolean;
  provider: 'google' | 'osm' | 'fallback';
  providerMessage: string;
  locationName?: string;
  hospitals: Hospital[];
  fallbackSearchUrl?: string;
  error?: string;
}
