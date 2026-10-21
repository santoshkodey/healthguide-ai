import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  FileText,
  HeartPulse,
  Hospital,
  Lock,
  PhoneCall,
  Shield,
  ShieldAlert,
  Stethoscope,
} from 'lucide-react';
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Top Emergency Action Bar */}
      <div className="bg-rose-50 border-b border-rose-200 py-2.5 px-4 text-xs sm:text-sm text-rose-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              Experiencing crushing chest pain, difficulty breathing, or stroke symptoms?
            </span>
          </div>
          <a
            href="tel:112"
            className="inline-flex items-center gap-1.5 font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 px-3 py-1 rounded-full transition"
          >
            <PhoneCall className="w-3.5 h-3.5" /> Call 112 Immediately
          </a>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline and CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs sm:text-sm font-medium">
                <Shield className="w-4 h-4 text-teal-600" />
                <span>Safety-First Healthcare Navigation • College Hackathon Edition</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Understand Your Symptoms.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
                  Find the Right Care.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl">
                When health concerns arise, knowing whether to rest, visit a doctor, or seek an emergency room shouldn’t be confusing. HealthGuide AI evaluates your symptoms against transparent clinical safety rules and directs you to real, verified hospitals nearby.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  href="/assessment"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-base font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
                >
                  <HeartPulse className="w-5 h-5" />
                  <span>Start Free Assessment</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  href="/hospitals"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm hover:shadow transition focus:outline-none focus:ring-2 focus:ring-teal-600"
                >
                  <Hospital className="w-5 h-5 text-teal-600" />
                  <span>Find Nearby Hospitals</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 max-w-lg text-slate-600">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                  <Lock className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>No Sign-Up or PII</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Auditable Rules</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                  <Compass className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Real Map Data</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Card Preview */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-7 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-2xl -z-10" />

                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Care Navigation Tiers</h2>
                      <p className="text-xs text-slate-500">Transparent Rule Hierarchy</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                    Deterministic
                  </span>
                </div>

                <div className="space-y-3 mt-4 text-sm">
                  {/* Emergency Tier */}
                  <div className="p-3.5 rounded-xl bg-red-50/80 border border-red-200 flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                    <div>
                      <h3 className="font-bold text-red-900 text-xs sm:text-sm">Tier 1: Emergency Warning</h3>
                      <p className="text-xs text-red-800 mt-0.5">
                        Detects chest pain, respiratory distress, and stroke signs. Triggers immediate 112 dialing instructions.
                      </p>
                    </div>
                  </div>

                  {/* Urgent Tier */}
                  <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <div>
                      <h3 className="font-bold text-amber-900 text-xs sm:text-sm">Tier 2: Urgent Evaluation</h3>
                      <p className="text-xs text-amber-800 mt-0.5">
                        Prolonged high fever, severe abdominal pain, or vulnerable context factors requiring same-day doctor review.
                      </p>
                    </div>
                  </div>

                  {/* Routine Tier */}
                  <div className="p-3.5 rounded-xl bg-teal-50/80 border border-teal-200 flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                    <div>
                      <h3 className="font-bold text-teal-900 text-xs sm:text-sm">Tier 3: Routine Self-Care</h3>
                      <p className="text-xs text-teal-800 mt-0.5">
                        Mild, self-limiting symptoms with monitored hydration and explicit red flags to watch for.
                      </p>
                    </div>
                  </div>

                  {/* Inconclusive Tier */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                    <div>
                      <h3 className="font-bold text-slate-800 text-xs sm:text-sm">Tier 4: Inconclusive Review</h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Ambiguous or incomplete answers safely return a prompt to consult an in-person physician.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Zero automated risk scores</span>
                  <Link href="/about" className="text-teal-600 font-semibold hover:underline">
                    Read Safety Rules →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prominent Medical Disclaimer Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <MedicalDisclaimer />
      </section>

      {/* Core Feature Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Engineered for Patient Clarity and Safety
          </h2>
          <p className="text-slate-600 text-base mt-2">
            Every feature is designed with conservative medical ethics, patient privacy, and verifiable information.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Structured Symptom Intake</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Captures age group, duration, multi-select symptom tags, and context (such as pregnancy or diabetes) without harvesting names or phone numbers.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100">
              <Link
                href="/assessment"
                className="inline-flex items-center text-sm font-semibold text-teal-600 hover:text-teal-700"
              >
                Launch assessment form <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Auditable Safety Engine</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Rules execute transparently in code. We never allow generative AI to independently declare a patient safe or fabricate clinical diagnostic conclusions.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100">
              <Link
                href="/about"
                className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Inspect rules documentation <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Hospital className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Live Hospital Discovery</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Locate real hospitals via Google Places API or OpenStreetMap Overpass. Get real addresses, external driving directions, and emergency contacts.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100">
              <Link
                href="/hospitals"
                className="inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Search healthcare facilities <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Navigation Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              How HealthGuide AI Navigates Care
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Three clear, deterministic steps to help you decide your next medical move.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm relative">
              <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-base mb-4 shadow">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Share Symptoms & Context</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Select your age bracket, duration, and key symptoms. Add free-text description and any relevant underlying conditions in complete privacy.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm relative">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-base mb-4 shadow">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Review Rule Evaluation</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                The safety engine checks for emergency red flags and urgent care indications, presenting conservative guidance and questions to ask your physician.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm relative">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-base mb-4 shadow">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Find Verified Facilities</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                If professional review is indicated, seamlessly search for nearby hospitals and urgent care centers with one-click driving navigation and emergency hotlines.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/assessment"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow transition"
            >
              <span>Begin Your Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* About the Prototype & Limitations Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Ethical AI Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                About HealthGuide AI & Prototype Limitations
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                HealthGuide AI was built for a college hackathon with a singular guiding philosophy: <strong>do no harm through unwarranted certainty</strong>. Unlike black-box diagnostic bots that guess clinical diseases, this system functions as an emergency-aware navigator.
              </p>
              <ul className="space-y-2 text-sm text-slate-700 pt-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 mt-1 shrink-0" />
                  <span><strong>No diagnostic claims:</strong> We never state &ldquo;You have disease X&rdquo; or &ldquo;You are 100% fine.&rdquo;</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 mt-1 shrink-0" />
                  <span><strong>No medication prescriptions:</strong> We never suggest specific prescription drugs, dosages, or self-medication regimens.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 mt-1 shrink-0" />
                  <span><strong>Emergency prioritized:</strong> India national emergency contacts (112, 108) are highlighted whenever critical symptoms appear.</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-4 bg-slate-50 p-6 rounded-xl border border-slate-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mx-auto">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Want to inspect the codebase?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Explore our modular rules engine, testing suite, and privacy policies.
                </p>
              </div>
              <Link
                href="/about"
                className="inline-block w-full py-2.5 px-4 rounded-lg bg-white border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition shadow-sm"
              >
                Learn More About Our Safety Rules
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
