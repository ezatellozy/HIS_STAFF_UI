import React from 'react';
import {
  History,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Pill,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { MedicationHistoryItem } from '../../../types/clinicalMedicationsMar';

interface MedicationHistoryViewProps {
  pastMedications: MedicationHistoryItem[];
}

export const MedicationHistoryView: React.FC<MedicationHistoryViewProps> = ({
  pastMedications
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">
              التاريخ الدوائي الطولي (Longitudinal Medication History)
            </h4>
            <span className="text-xs text-slate-500">
              سجل الأدوية المكتملة، الموقوفة، أو المعدلة في التنويم الحالي والزيارات السابقة
            </span>
          </div>
        </div>
        <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-xl text-slate-600">
          {pastMedications.length} سجلات تاريخية
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100 text-xs">
          {pastMedications.map(med => {
            return (
              <div key={med.id} className="p-4 hover:bg-slate-50/70 transition-colors space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-black text-slate-900">
                      {med.medicationName}
                    </strong>
                    <span className="text-xs font-semibold text-slate-500">
                      ({med.genericName})
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        med.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {med.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono">
                    الزيارة: <strong className="text-blue-700">{med.sourceEncounter}</strong> • الطبيب: {med.prescribedBy}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-700">
                  <div>الجرعة: <strong className="font-mono text-slate-900">{med.dose}</strong></div>
                  <div>المسار: <strong className="text-slate-900">{med.route}</strong></div>
                  <div>التكرار: <span>{med.frequency}</span></div>
                  <div>الفترة: <span className="font-mono text-slate-600">{med.period}</span></div>
                </div>

                <div className="text-[11px] text-slate-600 space-y-1">
                  <div>الداعي الطبي: <strong className="text-slate-800">{med.indication}</strong></div>
                  {med.discontinueReason && (
                    <p className="text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
                      ⚠️ سبب الإيقاف: {med.discontinueReason}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
