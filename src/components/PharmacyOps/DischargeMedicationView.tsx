import React, { useState } from 'react';
import {
  LogOut,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  FileCheck,
  Printer,
  Clock,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { DischargeMedicationSupply, MedicationOrderContext } from '../../types/pharmacyOps';

interface DischargeMedicationViewProps {
  dischargeSupplies: DischargeMedicationSupply[];
  onToggleCounseling: (orderId: string) => void;
  onToggleHandoff: (orderId: string) => void;
  onOpenLabelPreview: (orderId: string) => void;
  onNavigateToAxis8?: (patientId: string) => void;
}

export const DischargeMedicationView: React.FC<DischargeMedicationViewProps> = ({
  dischargeSupplies,
  onToggleCounseling,
  onToggleHandoff,
  onOpenLabelPreview,
  onNavigateToAxis8
}) => {
  return (
    <div className="space-y-4 text-xs">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <LogOut className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold">صيدلية التخريج وحزم الأدوية المنزلية (Discharge Medication Supply)</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                ADT & Med Rec Integrated
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              تجهيز أدوية الخروج بالتنسيق مع ملف المصالحة الدوائية (Axis 8) وجلسات التثقيف وفق سياسة الصنف (Configured Counseling Requirement)
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-300">
          حزم الخروج النشطة: <strong className="text-white font-mono text-sm">{dischargeSupplies.length}</strong>
        </div>
      </div>

      {/* Semantic Distinction Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-950 flex items-center justify-between">
        <span className="leading-relaxed">
          <strong>مبدأ التكامل السريري:</strong> صرف أدوية التخريج (Discharge Supply) يرتبط بمرجعية المصالحة الدوائية عند الخروج (Axis 8 Med Rec) وجاهزية المغادرة في ADT، لكنه مسار تشغيلي مستقل لتركيب وتجهيز وتسليم الأدوية للمريض مع التثقيف.
        </span>
      </div>

      {/* Discharge Orders Cards / Table */}
      <div className="space-y-3">
        {dischargeSupplies.map(item => (
          <div
            key={item.orderId}
            className="bg-white border border-slate-200 hover:border-emerald-500 rounded-xl p-4 transition-all shadow-2xs space-y-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{item.patientName}</span>
                  <span className="font-mono text-xs text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-bold">
                    {item.mrn}
                  </span>
                  <span className="text-[11px] text-slate-500">{item.wardLocation}</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-2">
                  <span>المستحضر: <strong className="text-slate-900">{item.medicationName}</strong></span>
                  <span>•</span>
                  <span>المدة الموصوفة: <strong>{item.supplyDays} يوماً</strong> ({item.quantitySupplied} وحدة)</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 font-mono">
                  Ref: {item.medRecReconciledReference}
                </span>
                {item.adtDischargeReadinessLinked && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                    مرتبط بجاهزية ADT
                  </span>
                )}
              </div>
            </div>

            {/* Checklist & Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Counseling Check */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 text-[11px]">جلسة التثقيف والإرشاد الدوائي (Patient Counseling):</div>
                  <div className="text-[10px] text-slate-500">
                    {item.counselingDone
                      ? 'تم توثيق شرح الجرعات والتداخلات للمريض (Completed)'
                      : 'حالة الإرشاد: مطلوب وفق سياسة الصنف بالمنشأة (Policy: Required)'}
                  </div>
                </div>
                <button
                  onClick={() => onToggleCounseling(item.orderId)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${
                    item.counselingDone
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{item.counselingDone ? 'مكتمل' : 'توثيق الإرشاد'}</span>
                </button>
              </div>

              {/* Handover Check */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 text-[11px]">تسليم العبوة للمريض أو ذويه (Handed Off):</div>
                  <div className="text-[10px] text-slate-500">
                    {item.handedToPatientOrFamily
                      ? 'تم استلام الحزمة الدوائية عند نافذة التخريج'
                      : 'بانتظار حضور المريض أو المرافق'}
                  </div>
                </div>
                <button
                  onClick={() => onToggleHandoff(item.orderId)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${
                    item.handedToPatientOrFamily
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{item.handedToPatientOrFamily ? 'تم التسليم' : 'تأكيد التسليم'}</span>
                </button>
              </div>
            </div>

            {/* Bottom Links */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
              <button
                onClick={() => onOpenLabelPreview(item.orderId)}
                className="text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>معاينة ملصق العبوة المنزلية</span>
              </button>

              {onNavigateToAxis8 && (
                <button
                  onClick={() => onNavigateToAxis8('p6')}
                  className="text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
                >
                  <span>استعراض ملف المصالحة الدوائية (Axis 8 Med Rec)</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
