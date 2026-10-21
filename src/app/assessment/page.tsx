'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Info,
  Loader2,
  Lock,
  RefreshCw,
  Search,
  Shield,
  Stethoscope,
  User,
} from 'lucide-react';
import {
  AGE_GROUP_OPTIONS,
  CONTEXT_OPTIONS,
  DURATION_OPTIONS,
  SYMPTOM_DEFINITIONS,
} from '@/lib/constants';
import { AgeGroup, ContextFactor, SymptomDuration } from '@/types/assessment';
import { assessmentInputSchema } from '@/lib/validation';
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';

interface FormDataState {
  ageGroup: AgeGroup | '';
  symptoms: string[];
  customDescription: string;
  duration: SymptomDuration | '';
  contextFactors: ContextFactor[];
}

const INITIAL_FORM_STATE: FormDataState = {
  ageGroup: 'adult_18_64',
  symptoms: [],
  customDescription: '',
  duration: '1_to_3_days',
  contextFactors: [],
};

const STORAGE_KEY = 'healthguide_draft_assessment';
const RESULT_STORAGE_KEY = 'healthguide_triage_result';

export default function AssessmentPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormDataState>(INITIAL_FORM_STATE);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [symptomSearch, setSymptomSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load draft from sessionStorage on mount if exists
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // Ignore storage read error
    }
  }, []);

  // Save draft whenever formData changes
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch {
      // Ignore storage write error
    }
  }, [formData]);

  const handleToggleSymptom = (id: string) => {
    setFormData((prev) => {
      const exists = prev.symptoms.includes(id);
      const updated = exists ? prev.symptoms.filter((s) => s !== id) : [...prev.symptoms, id];
      return { ...prev, symptoms: updated };
    });
    // Clear error if user selects a symptom
    if (fieldErrors.symptoms) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.symptoms;
        return next;
      });
    }
  };

  const handleToggleContext = (factor: ContextFactor) => {
    setFormData((prev) => {
      if (factor === 'none') {
        return { ...prev, contextFactors: ['none'] };
      }
      const withoutNone = prev.contextFactors.filter((c) => c !== 'none');
      const exists = withoutNone.includes(factor);
      const updated = exists ? withoutNone.filter((c) => c !== factor) : [...withoutNone, factor];
      return { ...prev, contextFactors: updated.length === 0 ? ['none'] : updated };
    });
  };

  const handleResetForm = () => {
    if (window.confirm('Are you sure you want to reset all form inputs?')) {
      setFormData(INITIAL_FORM_STATE);
      setActiveStep(1);
      setFieldErrors({});
      setServerError(null);
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore
      }
    }
  };

  // Validate step before advancing
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1 && !formData.ageGroup) {
      errors.ageGroup = 'Please choose your appropriate age group.';
    }

    if (step === 2) {
      const hasSymptoms = formData.symptoms.length > 0;
      const hasText = formData.customDescription.trim().length >= 5;
      if (!hasSymptoms && !hasText) {
        errors.symptoms = 'Please select at least one symptom or describe your symptoms below.';
      }
    }

    if (step === 4 && !formData.duration) {
      errors.duration = 'Please specify how long you have experienced symptoms.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => (Math.min(prev + 1, 6) as 1 | 2 | 3 | 4 | 5 | 6));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setActiveStep((prev) => (Math.max(prev - 1, 1) as 1 | 2 | 3 | 4 | 5 | 6));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submission to Server
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});

    // Client-side schema validation using Zod
    const validationResult = assessmentInputSchema.safeParse({
      ageGroup: formData.ageGroup,
      symptoms: formData.symptoms,
      customDescription: formData.customDescription,
      duration: formData.duration,
      contextFactors: formData.contextFactors.length === 0 ? ['none'] : formData.contextFactors,
    });

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => {
        const path = err.path.join('.') || 'general';
        errors[path] = err.message;
      });
      setFieldErrors(errors);
      // Return to the first step with error
      if (errors.ageGroup) setActiveStep(1);
      else if (errors.symptoms) setActiveStep(2);
      else if (errors.duration) setActiveStep(4);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validationResult.data),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.fieldErrors) {
          const flatErrors: Record<string, string> = {};
          Object.entries(data.fieldErrors).forEach(([k, v]: [string, unknown]) => {
            flatErrors[k] = Array.isArray(v) ? String(v[0]) : String(v);
          });
          setFieldErrors(flatErrors);
        }
        throw new Error(data.error || 'Server rejected the assessment input.');
      }

      // Store results in sessionStorage
      sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(data.result));
      sessionStorage.setItem('healthguide_submitted_input', JSON.stringify(validationResult.data));

      // Route to results page
      router.push('/results');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'A network error occurred while submitting. Your inputs were preserved.';
      setServerError(message);
      setIsSubmitting(false);
    }
  };

  // Filter symptoms based on search and category
  const filteredSymptoms = SYMPTOM_DEFINITIONS.filter((s) => {
    const matchesSearch =
      s.label.toLowerCase().includes(symptomSearch.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(symptomSearch.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'All Symptoms' },
    { id: 'critical', label: 'Emergency Red Flags' },
    { id: 'respiratory', label: 'Respiratory / Breathing' },
    { id: 'cardiovascular', label: 'Chest / Heart' },
    { id: 'neurological', label: 'Head / Nervous System' },
    { id: 'gastrointestinal', label: 'Stomach / Digestion' },
    { id: 'general', label: 'Fever & General' },
    { id: 'skin', label: 'Skin & Wounds' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
      {/* Header */}
      <div className="mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-3">
          <Activity className="w-3.5 h-3.5" />
          <span>Interactive Symptom Navigator</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Symptom Assessment
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl">
          Complete the guided assessment below to evaluate your symptoms against our safety rules. We do not collect names, phone numbers, or identifiable records.
        </p>
      </div>

      {/* Emergency Notice Banner */}
      <div className="mb-8">
        <MedicalDisclaimer compact />
      </div>

      {/* Step Indicator */}
      <div className="mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
          <span>Step {activeStep} of 6: {
            activeStep === 1 ? 'Age Bracket' :
            activeStep === 2 ? 'Symptom Checklist' :
            activeStep === 3 ? 'Detailed Description' :
            activeStep === 4 ? 'Duration' :
            activeStep === 5 ? 'Health Context' : 'Review & Submit'
          }</span>
          <span className="text-teal-700 font-bold">{Math.round((activeStep / 6) * 100)}% Completed</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-teal-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${(activeStep / 6) * 100}%` }}
          />
        </div>

        {/* Step Tabs for direct navigation if user already completed them */}
        <div className="hidden sm:grid grid-cols-6 gap-1 pt-3 text-[11px] font-medium text-slate-500 text-center">
          {['1. Age', '2. Symptoms', '3. Details', '4. Duration', '5. Context', '6. Review'].map((label, idx) => (
            <button
              key={label}
              type="button"
              onClick={() => setActiveStep((idx + 1) as 1 | 2 | 3 | 4 | 5 | 6)}
              className={`py-1 rounded hover:bg-slate-50 transition ${
                activeStep === idx + 1 ? 'text-teal-700 font-bold bg-teal-50' : ''
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold">Submission Notice</p>
            <p>{serverError}</p>
          </div>
        </div>
      )}

      {/* Form Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {/* ================================================================= */}
        {/* STEP 1: AGE GROUP */}
        {/* ================================================================= */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-teal-600" />
                Who is this assessment for?
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Age calibrates clinical safety thresholds (for example, fevers in infants trigger immediate pediatric warnings). We do not require full birth dates.
              </p>
            </div>

            {fieldErrors.ageGroup && (
              <p className="text-sm text-red-600 font-medium">{fieldErrors.ageGroup}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {AGE_GROUP_OPTIONS.map((opt) => {
                const isSelected = formData.ageGroup === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, ageGroup: opt.value }));
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.ageGroup;
                        return next;
                      });
                    }}
                    className={`text-left p-4 rounded-xl border transition-all flex items-start justify-between ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-600 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{opt.label}</p>
                      <p className="text-xs text-slate-500 mt-1">{opt.description}</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 ml-2">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 2: MULTI-SYMPTOM SELECTION */}
        {/* ================================================================= */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" />
                Select Experienced Symptoms
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Select all symptoms that apply. Configured warning signs are highlighted for transparency.
              </p>
            </div>

            {fieldErrors.symptoms && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{fieldErrors.symptoms}</span>
              </div>
            )}

            {/* Search and Category Filter */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={symptomSearch}
                  onChange={(e) => setSymptomSearch(e.target.value)}
                  placeholder="Search symptoms (e.g., chest pain, fever, cough)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                      selectedCategory === cat.id
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms Grid */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {filteredSymptoms.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm border border-dashed rounded-xl">
                  No matching symptoms found. You can write your symptoms in Step 3!
                </div>
              ) : (
                filteredSymptoms.map((sym) => {
                  const isChecked = formData.symptoms.includes(sym.id);
                  return (
                    <label
                      key={sym.id}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                        isChecked
                          ? 'border-teal-600 bg-teal-50/50 ring-1 ring-teal-600'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSymptom(sym.id)}
                        className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 mt-1 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-900 text-sm">{sym.label}</span>
                          {sym.isEmergencyWarning && (
                            <span className="text-[10px] font-bold uppercase bg-red-100 text-red-800 px-2 py-0.5 rounded-full border border-red-200">
                              Red Flag Warning
                            </span>
                          )}
                          {sym.isUrgentWarning && (
                            <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                              Urgent Flag
                            </span>
                          )}
                        </div>
                        {sym.description && (
                          <p className="text-xs text-slate-500 mt-0.5">{sym.description}</p>
                        )}
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            <div className="text-xs text-slate-500 pt-2 flex items-center justify-between">
              <span>{formData.symptoms.length} symptom(s) selected</span>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, symptoms: [] }))}
                className="text-slate-400 hover:text-slate-600 underline"
              >
                Clear all selections
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 3: FREE TEXT DESCRIPTION */}
        {/* ================================================================= */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                Describe Your Symptoms in Your Own Words
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Add any nuance, sensation, or context not captured by the checklist above.
              </p>
            </div>

            <div className="space-y-2">
              <textarea
                rows={5}
                value={formData.customDescription}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, customDescription: e.target.value }))
                }
                placeholder="Example: I woke up with a dull throat ache and mild chills yesterday. Able to drink fluids but feeling fatigued..."
                maxLength={1000}
                className="w-full p-4 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 placeholder:text-slate-400"
              />
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Do not include full names, phone numbers, or insurance IDs.</span>
                <span>{formData.customDescription.length} / 1000 characters</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>
                Our rules engine scans description text for acute safety indicators (e.g. references to chest pain, sudden numbness, or shortness of breath) to safeguard against missed red flags.
              </span>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 4: DURATION */}
        {/* ================================================================= */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-600" />
                How long have you felt these symptoms?
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Duration is a critical clinical factor in determining whether symptoms are acute, progressive, or prolonged.
              </p>
            </div>

            {fieldErrors.duration && (
              <p className="text-sm text-red-600 font-medium">{fieldErrors.duration}</p>
            )}

            <div className="space-y-3">
              {DURATION_OPTIONS.map((opt) => {
                const isSelected = formData.duration === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, duration: opt.value }));
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.duration;
                        return next;
                      });
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition flex items-center justify-between ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-600'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-semibold text-slate-900 text-sm">{opt.label}</span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 5: OPTIONAL HEALTH CONTEXT */}
        {/* ================================================================= */}
        {activeStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-600" />
                Any relevant health context or pre-existing conditions?
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Certain conditions require greater medical vigilance when assessing otherwise common symptoms.
              </p>
            </div>

            <div className="space-y-2.5">
              {CONTEXT_OPTIONS.map((opt) => {
                const isChecked = formData.contextFactors.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                      isChecked
                        ? 'border-teal-600 bg-teal-50/50 ring-1 ring-teal-600'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleContext(opt.value)}
                      className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 mt-1 cursor-pointer"
                    />
                    <div>
                      <span className="font-semibold text-slate-900 text-sm">{opt.label}</span>
                      <p className="text-xs text-slate-500 mt-0.5">{opt.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 6: REVIEW STEP BEFORE SUBMISSION */}
        {/* ================================================================= */}
        {activeStep === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-600" />
                Review Your Answers Before Triage
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Verify your entries below. You can jump back to any section before generating your guidance.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4 text-sm">
              {/* Age */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-xs font-bold uppercase text-slate-500">Age Bracket</span>
                  <p className="font-semibold text-slate-900 mt-0.5">
                    {AGE_GROUP_OPTIONS.find((a) => a.value === formData.ageGroup)?.label || 'Not specified'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="text-xs font-semibold text-teal-600 hover:underline"
                >
                  Edit
                </button>
              </div>

              {/* Symptoms */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-xs font-bold uppercase text-slate-500">Selected Symptoms</span>
                  {formData.symptoms.length === 0 ? (
                    <p className="text-xs text-slate-500 italic mt-0.5">None chosen from checklist</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {formData.symptoms.map((sId) => {
                        const sym = SYMPTOM_DEFINITIONS.find((s) => s.id === sId);
                        return (
                          <span
                            key={sId}
                            className={`inline-flex items-center text-xs px-2.5 py-1 rounded-md font-medium border ${
                              sym?.isEmergencyWarning
                                ? 'bg-red-50 text-red-800 border-red-200'
                                : sym?.isUrgentWarning
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            {sym?.label || sId}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="text-xs font-semibold text-teal-600 hover:underline"
                >
                  Edit
                </button>
              </div>

              {/* Description */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-xs font-bold uppercase text-slate-500">Free-Text Description</span>
                  <p className="text-xs text-slate-700 mt-1 italic">
                    {formData.customDescription.trim() || 'No additional description provided.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="text-xs font-semibold text-teal-600 hover:underline"
                >
                  Edit
                </button>
              </div>

              {/* Duration */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-xs font-bold uppercase text-slate-500">Symptom Duration</span>
                  <p className="font-semibold text-slate-900 mt-0.5">
                    {DURATION_OPTIONS.find((d) => d.value === formData.duration)?.label || 'Not specified'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStep(4)}
                  className="text-xs font-semibold text-teal-600 hover:underline"
                >
                  Edit
                </button>
              </div>

              {/* Context */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-slate-500">Health Context Factors</span>
                  <p className="font-semibold text-slate-900 mt-0.5">
                    {formData.contextFactors.length === 0 || formData.contextFactors.includes('none')
                      ? 'No known pre-existing vulnerability factors'
                      : formData.contextFactors
                          .map((c) => CONTEXT_OPTIONS.find((o) => o.value === c)?.label || c)
                          .join(', ')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStep(5)}
                  className="text-xs font-semibold text-teal-600 hover:underline"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Privacy Commitment Note */}
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-700 shrink-0" />
              <span>
                <strong>Privacy Guaranteed:</strong> This session will not be saved to any remote medical record or persistent user database.
              </span>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* BUTTONS / CONTROLS */}
        {/* ================================================================= */}
        <div className="pt-6 mt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {activeStep > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleResetForm}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-1 px-3 py-2.5 text-xs text-slate-500 hover:text-red-600 transition"
              title="Reset all form data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <div className="w-full sm:w-auto">
            {activeStep < 6 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-50 transition shadow-md focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Evaluating Safety Rules...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Generate Triage Guidance</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
