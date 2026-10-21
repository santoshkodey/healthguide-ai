'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Bot,
  Compass,
  CornerDownRight,
  Edit3,
  Hospital,
  Info,
  ListChecks,
  Loader2,
  PhoneCall,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { AssessmentInput, TriageResult } from '@/types/assessment';
import { TriageBadge } from '@/components/TriageBadge';
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';
import { AGE_GROUP_OPTIONS, DURATION_OPTIONS, SYMPTOM_DEFINITIONS } from '@/lib/constants';

const RESULT_STORAGE_KEY = 'healthguide_triage_result';
const INPUT_STORAGE_KEY = 'healthguide_submitted_input';

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<TriageResult | null>(null);
  const [inputData, setInputData] = useState<AssessmentInput | null>(null);
  const [loading, setLoading] = useState(true);

  // Optional AI Insights state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<{
    configured: boolean;
    content?: string;
    source?: string;
    disclaimer?: string;
    message?: string;
  } | null>(null);

  useEffect(() => {
    try {
      const storedResult = sessionStorage.getItem(RESULT_STORAGE_KEY);
      const storedInput = sessionStorage.getItem(INPUT_STORAGE_KEY);

      if (storedResult) {
        setResult(JSON.parse(storedResult));
      }
      if (storedInput) {
        setInputData(JSON.parse(storedInput));
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFetchAiInsights = async () => {
    if (!inputData) return;
    setAiLoading(true);

    try {
      const res = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputData),
      });

      const data = await res.json();
      setAiResponse(data);
    } catch {
      setAiResponse({
        configured: false,
        message: 'Unable to reach the optional AI service at this time.',
      });
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Retrieving assessment results...</p>
      </div>
    );
  }

  // Empty State: If no assessment data exists in session
  if (!result || !inputData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto mb-4">
          <Stethoscope className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">No Assessment Found</h1>
        <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto">
          You haven&apos;t completed an assessment during this browser session yet. Start an assessment to evaluate symptoms against safety rules.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/assessment"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 transition"
          >
            <span>Start Symptom Assessment</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/hospitals"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
          >
            <Hospital className="w-4 h-4 text-teal-600" />
            <span>Search Hospitals Directly</span>
          </Link>
        </div>
      </div>
    );
  }

  const isEmergency = result.tier === 'EMERGENCY';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">
      {/* Top Breadcrumb & Action */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <button
          onClick={() => router.push('/assessment')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-teal-700 hover:text-teal-800 transition"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Symptoms & Re-Assess</span>
        </button>

        <div className="flex items-center gap-3">
          <Link
            href="/hospitals"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 transition shadow-sm"
          >
            <Hospital className="w-4 h-4" />
            <span>Find Nearby Hospitals</span>
          </Link>
        </div>
      </div>

      {/* EMERGENCY HIGH-PRIORITY ALERT BANNER (If Tier is EMERGENCY) */}
      {isEmergency && (
        <div className="bg-red-600 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-red-700 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-700/80 rounded-xl shrink-0">
              <AlertOctagon className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-black uppercase tracking-wider bg-red-800 text-white px-2.5 py-0.5 rounded-full inline-block">
                Immediate Action Required
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Emergency Warning Signs Identified
              </h2>
              <p className="text-red-100 text-sm sm:text-base leading-relaxed">
                One or more of your reported symptoms match configured life-threatening medical emergencies. Do not delay or wait for symptoms to improve on their own.
              </p>
            </div>
          </div>

          <div className="bg-red-700/60 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-red-500/40">
            <div className="text-sm">
              <span className="font-bold text-white block">Call National Emergency Services (India):</span>
              <span className="text-red-200 text-xs">Available 24/7 • Free of charge from any phone</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href="tel:112"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-red-700 font-extrabold text-base hover:bg-red-50 shadow transition"
              >
                <PhoneCall className="w-5 h-5 text-red-600" />
                <span>Dial 112 Now</span>
              </a>
              <a
                href="tel:108"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-800 text-white font-bold text-sm hover:bg-red-900 border border-red-600 transition"
              >
                <span>Ambulance: 108</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Results Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Assessment Outcome
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {result.headline}
            </h1>
          </div>
          <TriageBadge tier={result.tier} size="md" />
        </div>

        {/* Clinical Rationale Summary */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Summary & Clinical Rationale
          </h2>
          <p className="text-slate-700 text-base leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
            {result.summary}
          </p>
        </div>

        {/* Triggered Rules Breakdown (Transparency) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Transparent Rules Triggered ({result.triggeredRules.length})
            </h2>
            <span className="text-xs text-slate-500 font-medium">Deterministic Rule Match</span>
          </div>

          <div className="space-y-2.5">
            {result.triggeredRules.map((rule) => (
              <div
                key={rule.id}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-1.5"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-bold text-slate-900 text-sm">{rule.title}</span>
                  <span className="text-[10px] font-mono text-slate-600 px-2 py-0.5 rounded bg-slate-100">
                    {rule.id}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{rule.reason}</p>
                {rule.evidence.length > 0 && (
                  <div className="pt-1.5 flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold text-slate-500">Evidence factors:</span>
                    {rule.evidence.map((ev, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {ev}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Recommended Next Steps
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {result.recommendedActions.map((act) => (
              <div
                key={act.order}
                className={`p-4 rounded-xl border ${
                  act.urgency === 'immediate'
                    ? 'bg-red-50/70 border-red-200'
                    : act.urgency === 'same_day'
                    ? 'bg-amber-50/70 border-amber-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-1">
                  <div className="w-5 h-5 rounded-full bg-slate-800 text-white text-xs flex items-center justify-center shrink-0">
                    {act.order}
                  </div>
                  <span>{act.action}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-7">{act.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Questions for Doctor */}
        {result.questionsForDoctor.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              Helpful Questions to Ask Your Doctor
            </h2>
            <p className="text-xs text-slate-500">
              Write these down or take a screenshot before speaking with a clinician:
            </p>
            <ul className="space-y-2">
              {result.questionsForDoctor.map((q, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200"
                >
                  <CornerDownRight className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Monitoring Guidance / Warning signs to watch for */}
        {result.monitoringGuidance.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Signs That Warrant Urgent Escalation
            </h2>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {result.monitoringGuidance.map((g, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Submitted Assessment Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <ListChecks className="w-4 h-4 text-teal-600" />
            <span>Summary of Submitted Symptoms</span>
          </div>
          <button
            onClick={() => router.push('/assessment')}
            className="text-xs font-semibold text-teal-600 hover:underline flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Modify</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div>
            <span className="font-bold text-slate-500 uppercase block">Age Bracket:</span>
            <span className="text-slate-800 font-medium">
              {AGE_GROUP_OPTIONS.find((a) => a.value === inputData.ageGroup)?.label || inputData.ageGroup}
            </span>
          </div>
          <div>
            <span className="font-bold text-slate-500 uppercase block">Duration:</span>
            <span className="text-slate-800 font-medium">
              {DURATION_OPTIONS.find((d) => d.value === inputData.duration)?.label || inputData.duration}
            </span>
          </div>
          <div>
            <span className="font-bold text-slate-500 uppercase block">Context Factors:</span>
            <span className="text-slate-800 font-medium">
              {inputData.contextFactors.join(', ') || 'None specified'}
            </span>
          </div>
        </div>

        {inputData.symptoms.length > 0 && (
          <div className="pt-2">
            <span className="font-bold text-slate-500 uppercase text-xs block mb-1">
              Checklist Symptoms ({inputData.symptoms.length}):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {inputData.symptoms.map((sId) => {
                const sym = SYMPTOM_DEFINITIONS.find((s) => s.id === sId);
                return (
                  <span
                    key={sId}
                    className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {sym?.label || sId}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {inputData.customDescription && (
          <div className="pt-2 text-xs">
            <span className="font-bold text-slate-500 uppercase block mb-1">User Notes:</span>
            <p className="italic text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              &ldquo;{inputData.customDescription}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Hospital Navigation Callout */}
      <div className="bg-gradient-to-r from-teal-700 to-blue-800 text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-600/60 text-xs font-semibold text-teal-100">
            <Compass className="w-3.5 h-3.5" />
            <span>Real Hospital Locator</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Need to see a healthcare professional?
          </h2>
          <p className="text-teal-100 text-sm max-w-xl">
            Locate verified nearby hospitals, emergency trauma units, and medical clinics using live OpenStreetMap or Google Places map services.
          </p>
        </div>

        <Link
          href="/hospitals"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-teal-800 font-extrabold text-sm hover:bg-teal-50 shadow transition shrink-0 w-full sm:w-auto"
        >
          <Hospital className="w-5 h-5 text-teal-700" />
          <span>Locate Nearby Hospitals</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Optional AI Assistant Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                <span>AI Clinical Communication Companion</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                  Optional
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Enhance your doctor visit preparation with an AI conversation summary (strictly non-diagnostic).
              </p>
            </div>
          </div>

          {!aiResponse && (
            <button
              onClick={handleFetchAiInsights}
              disabled={aiLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting to AI Provider...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate AI Visit Questions</span>
                </>
              )}
            </button>
          )}
        </div>

        {aiResponse && (
          <div className="pt-3 border-t border-slate-100 space-y-3">
            {aiResponse.configured ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-indigo-700">Provider: {aiResponse.source}</span>
                  <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                    Strict Non-Diagnostic Guardrails Active
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                  {aiResponse.content}
                </div>
                {aiResponse.disclaimer && (
                  <p className="text-[11px] text-slate-500 italic">
                    Notice: {aiResponse.disclaimer}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">AI Assistant Not Configured:</span>{' '}
                  {aiResponse.message ||
                    'An optional server API key (GEMINI_API_KEY or OPENAI_API_KEY) is not set. All safety navigation remains fully operative under the core deterministic rules engine.'}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Global Medical Disclaimer Banner */}
      <MedicalDisclaimer />
    </div>
  );
}
