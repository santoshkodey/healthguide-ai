import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  FileCode2,
  HelpCircle,
  Info,
  Lock,
  PhoneCall,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';
import { EMERGENCY_CONTACTS } from '@/lib/constants';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-12">
      {/* Hero / Header */}
      <div className="text-center sm:text-left space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Ethics, Clinical Safety & Protocol Transparency</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About HealthGuide AI & Safety Principles
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-3xl leading-relaxed">
          HealthGuide AI was created to solve a universal healthcare dilemma: the confusion people face when acute symptoms arise. Here is our complete architectural documentation, safety rules, and privacy commitments.
        </p>
      </div>

      {/* Core Safety Manifesto */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">The Safety-First Paradigm</h2>
            <p className="text-xs text-slate-500">Why We Reject Black-Box Generative Diagnostics</p>
          </div>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed">
          Modern Large Language Models (LLMs) are prone to hallucinations, false certainty, and unpredictable variance. In healthcare, an AI incorrectly saying &ldquo;You just have a cold, drink water&rdquo; when a patient is presenting with early atypical myocardial infarction can be catastrophic.
        </p>

        <p className="text-sm text-slate-700 leading-relaxed font-semibold">
          Therefore, HealthGuide AI adheres to four non-negotiable architectural mandates:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
              <AlertOctagon className="w-4 h-4" />
              <span>1. Warning Signs Take Priority</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              If a user reports crushing chest pain, difficulty breathing, or stroke symptoms, the system immediately short-circuits to an EMERGENCY tier with instructions to dial 112. No chatbot is allowed to override or downplay this.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-teal-700 font-bold text-sm">
              <FileCode2 className="w-4 h-4" />
              <span>2. Auditable Deterministic Code</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Triage decisions are made by transparent, peer-reviewable TypeScript logic in <code className="font-mono text-[11px] bg-slate-200 px-1 py-0.5 rounded">src/lib/triage.ts</code>. Every recommendation explicitly lists the exact rule ID and evidence factors that triggered it.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
              <HelpCircle className="w-4 h-4" />
              <span>3. Ambiguity Defaults to Inconclusive</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              If a user provides incomplete, contradictory, or unrecognizable information, we do not guess. The system returns an INCONCLUSIVE outcome advising an in-person physician exam.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
              <ShieldAlert className="w-4 h-4" />
              <span>4. Never Guarantee False Safety</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Absence of evidence is not evidence of absence. Even when routine self-care is indicated, the application explicitly includes monitoring instructions and red flags to watch for.
            </p>
          </div>
        </div>
      </div>

      {/* Rules Engine Documentation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Documented Rules Hierarchy</h2>
            <p className="text-xs text-slate-500">Tier Classification & Evaluation Order</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Tier 1 */}
          <div className="border border-red-200 rounded-xl p-4 bg-red-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-red-900 text-sm">Tier 1: EMERGENCY (Immediate Action)</span>
              <span className="text-[10px] font-mono bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold">
                PRIORITY: 1
              </span>
            </div>
            <p className="text-xs text-red-950 leading-relaxed">
              Triggered by acute red flag symptoms (crushing chest pain, severe shortness of breath, FAST stroke signs, anaphylaxis, uncontrollable bleeding, thunderclap headache), infant &lt; 1 year with fever, or pregnant patient with severe abdominal pain.
            </p>
            <p className="text-xs text-red-800 font-medium">
              Action: Call 112 / 108 immediately or go to the nearest Emergency Department. Do not drive oneself.
            </p>
          </div>

          {/* Tier 2 */}
          <div className="border border-amber-200 rounded-xl p-4 bg-amber-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900 text-sm">Tier 2: URGENT (Within 24 Hours)</span>
              <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                PRIORITY: 2
              </span>
            </div>
            <p className="text-xs text-amber-950 leading-relaxed">
              Triggered by persistent high fever (&gt;39°C for 3+ days), acute abdominal pain, continuous vomiting with inability to retain fluids (&gt;24 hours), spreading skin redness, deep cuts requiring sutures, or high-risk comorbidities (diabetes, asthma, immunocompromise) with prolonged illness.
            </p>
            <p className="text-xs text-amber-800 font-medium">
              Action: Visit urgent care clinic or outpatient medical center today.
            </p>
          </div>

          {/* Tier 3 */}
          <div className="border border-teal-200 rounded-xl p-4 bg-teal-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-teal-900 text-sm">Tier 3: ROUTINE (Primary Care / Monitored Self-Care)</span>
              <span className="text-[10px] font-mono bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-bold">
                PRIORITY: 3
              </span>
            </div>
            <p className="text-xs text-teal-950 leading-relaxed">
              Triggered by mild viral upper respiratory symptoms, mild tension headache, low-grade fever (&lt;48h), or minor fatigue without any emergency red flags.
            </p>
            <p className="text-xs text-teal-800 font-medium">
              Action: Rest, hydrate, and book a non-urgent doctor consultation if unimproved within 3 to 5 days.
            </p>
          </div>

          {/* Tier 4 */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-sm">Tier 4: INCONCLUSIVE (Clinical Evaluation Advised)</span>
              <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                DEFAULT
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Triggered when input contains no symptoms, contradictory selections, or vague/unrecognized descriptions.
            </p>
            <p className="text-xs text-slate-700 font-medium">
              Action: In-person consultation with a medical provider.
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Contacts Directory */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">National Emergency Contacts (India)</h2>
            <p className="text-xs text-slate-500">Free, 24/7 Government Emergency Hotlines</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {EMERGENCY_CONTACTS.map((contact) => (
            <div
              key={contact.number}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3"
            >
              <div>
                <span className="font-bold text-slate-900 text-sm block">{contact.label}</span>
                <span className="text-xs text-slate-500 mt-1 block leading-relaxed">
                  {contact.description}
                </span>
              </div>
              <a
                href={`tel:${contact.number.replace(/[^0-9]/g, '')}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white font-extrabold text-xs hover:bg-red-700 transition shrink-0"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{contact.number}</span>
              </a>
            </div>
          ))}
        </div>

        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            <strong>International Note:</strong> If you are outside India, dial your local emergency services (such as <strong>911</strong> in the United States & Canada, <strong>999</strong> in the United Kingdom, or <strong>112</strong> across the European Union).
          </span>
        </div>
      </div>

      {/* Privacy and Data Protection */}
      <div id="privacy" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Privacy & Data Governance</h2>
            <p className="text-xs text-slate-500">Engineered with Zero Surveillance Architecture</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-600">
          <div className="space-y-1.5">
            <span className="font-bold text-slate-900 text-sm block">No Registration Required</span>
            <p className="leading-relaxed">
              Users can evaluate symptoms and locate hospitals anonymously without creating accounts, entering emails, or verifying phone numbers.
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="font-bold text-slate-900 text-sm block">Zero PII Storage</span>
            <p className="leading-relaxed">
              We never collect or persist patient names, dates of birth, insurance numbers, or medical history to a remote database.
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="font-bold text-slate-900 text-sm block">Ephemeral Client State</span>
            <p className="leading-relaxed">
              Draft assessment data lives solely in your browser&apos;s sessionStorage and is purged when you close the tab or click reset.
            </p>
          </div>
        </div>
      </div>

      {/* Clinical Limitations */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          Clinical Limitations & Educational Notice
        </h3>
        <ul className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed list-disc pl-5">
          <li>
            This application is an educational care-navigation demonstration. Its assessment rules have not been clinically validated in randomized trials.
          </li>
          <li>
            The rules in <code className="font-mono text-xs bg-slate-200 px-1 py-0.5 rounded">src/lib/triage.ts</code> are a documented, rules-based prototype intended for care navigation, not diagnostic certainty. They are designed to be reviewed and modified by licensed clinicians before any clinical deployment.
          </li>
          <li>
            Hospital records are retrieved directly from OpenStreetMap Overpass API or Google Places API. While these are real facilities, operating hours and emergency readiness should always be verified by calling ahead when practical.
          </li>
          <li>
            Never ignore or postpone seeing a doctor because of results presented here.
          </li>
        </ul>
      </div>

      {/* Medical Disclaimer */}
      <MedicalDisclaimer />
    </div>
  );
}
