import React from 'react';
import { AlertTriangle, PhoneCall } from 'lucide-react';
import { GLOBAL_DISCLAIMER } from '@/lib/constants';

interface MedicalDisclaimerProps {
  compact?: boolean;
}

export function MedicalDisclaimer({ compact = false }: MedicalDisclaimerProps) {
  if (compact) {
    return (
      <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg text-xs text-amber-900 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Medical Notice:</span> HealthGuide AI provides informational care navigation and does not provide medical diagnoses or prescriptions. If experiencing an emergency, dial <a href="tel:112" className="font-bold underline text-amber-950">112</a> immediately.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 shadow-sm text-sm text-amber-950">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="font-bold text-amber-900 text-base">Important Medical Disclaimer & Notice</h4>
            <span className="inline-flex items-center gap-1.5 text-xs bg-red-100 text-red-800 font-semibold px-2.5 py-0.5 rounded-full border border-red-200">
              <PhoneCall className="w-3 h-3" /> India Emergency: 112
            </span>
          </div>
          <p className="text-amber-800 leading-relaxed">
            {GLOBAL_DISCLAIMER}
          </p>
          <p className="text-xs text-amber-700">
            Never disregard professional medical advice or delay seeking care because of guidance displayed in this application.
          </p>
        </div>
      </div>
    </div>
  );
}
