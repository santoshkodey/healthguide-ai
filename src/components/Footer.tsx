import React from 'react';
import Link from 'next/link';
import { Activity, Shield, Lock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">HealthGuide AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              An intelligent, safety-first care navigator designed to assist patients in understanding symptoms and discovering real healthcare facilities.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400 bg-slate-800/80 px-2.5 py-1.5 rounded-md border border-slate-700/60 w-fit">
              <Lock className="w-3.5 h-3.5" />
              <span>Zero PII Stored • Client-Side Privacy</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-teal-400 transition">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link href="/assessment" className="hover:text-teal-400 transition">
                  Symptom Assessment
                </Link>
              </li>
              <li>
                <Link href="/hospitals" className="hover:text-teal-400 transition">
                  Hospital Locator
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-teal-400 transition">
                  Safety Protocol & Rules
                </Link>
              </li>
            </ul>
          </div>

          {/* Emergency Hotlines */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Emergency Services (India)
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-rose-400 font-bold">112</span>
                <span className="text-slate-400">— All-in-One National Emergency</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-rose-400 font-bold">108</span>
                <span className="text-slate-400">— Ambulance & Disaster Medical</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-rose-400 font-bold">102</span>
                <span className="text-slate-400">— Maternal & Neonatal Transport</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-rose-400 font-bold">1800-599-0019</span>
                <span className="text-slate-400">— Kiran Mental Health</span>
              </li>
            </ul>
          </div>

          {/* Hackathon & Safety */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Hackathon Prototype</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Built for demonstration purposes. Features deterministic rule-based safety triage, live OpenStreetMap & Google Places connectivity, and optional AI doctor conversation prep.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Shield className="w-3.5 h-3.5 text-teal-400" />
              <span>Not a diagnostic device or doctor replacement.</span>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} HealthGuide AI. Developed for College Hackathon Demonstration.</p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-teal-300">
              Medical Limitations
            </Link>
            <span>•</span>
            <Link href="/about#privacy" className="hover:text-teal-300">
              Privacy Notice
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
