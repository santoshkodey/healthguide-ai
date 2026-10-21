import React from 'react';
import { AlertCircle, AlertOctagon, CheckCircle2, HelpCircle } from 'lucide-react';
import { TriageTier } from '@/types/assessment';

interface TriageBadgeProps {
  tier: TriageTier;
  size?: 'sm' | 'md' | 'lg';
}

export function TriageBadge({ tier, size = 'md' }: TriageBadgeProps) {
  const configs = {
    EMERGENCY: {
      label: 'Emergency Warning Identified',
      sublabel: 'Immediate Medical Action Required',
      badgeClass: 'bg-red-50 text-red-700 border-red-200',
      pillClass: 'bg-red-600 text-white',
      icon: AlertOctagon,
      dotClass: 'bg-red-500 animate-ping',
    },
    URGENT: {
      label: 'Urgent Care Consideration',
      sublabel: 'Same-Day Evaluation Recommended',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      pillClass: 'bg-amber-500 text-white',
      icon: AlertCircle,
      dotClass: 'bg-amber-500',
    },
    ROUTINE: {
      label: 'Routine Primary Care / Self-Care',
      sublabel: 'Non-Emergency Symptom Presentation',
      badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
      pillClass: 'bg-teal-600 text-white',
      icon: CheckCircle2,
      dotClass: 'bg-teal-500',
    },
    INCONCLUSIVE: {
      label: 'Inconclusive Presentation',
      sublabel: 'Professional Consultation Advised',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
      pillClass: 'bg-slate-600 text-white',
      icon: HelpCircle,
      dotClass: 'bg-slate-400',
    },
  };

  const current = configs[tier] || configs.INCONCLUSIVE;
  const Icon = current.icon;

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${current.badgeClass}`}>
        <Icon className="w-3.5 h-3.5" />
        {current.label}
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`p-4 rounded-xl border flex items-center gap-3.5 shadow-sm ${current.badgeClass}`}>
        <div className={`p-2.5 rounded-lg ${current.pillClass} shadow-sm shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">{current.label}</span>
          </div>
          <p className="text-sm opacity-90">{current.sublabel}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${current.badgeClass}`}>
      <Icon className="w-4 h-4 shrink-0" />
      <span>{current.label}</span>
    </div>
  );
}
