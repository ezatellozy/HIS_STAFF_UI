import React from 'react';
import {
  X,
  Droplet,
  Calendar,
  Thermometer,
  ShieldCheck,
  Clock,
  User,
  History,
  Tag,
  CheckCircle2,
  Box,
  Layers,
  Flame,
  AlertTriangle
} from 'lucide-react';
import { BloodProductUnit, ProductTraceabilityEvent } from '../../types/bloodBankOps';

interface ProductUnitDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: BloodProductUnit | null;
  traceabilityEvents: ProductTraceabilityEvent[] | Record<string, ProductTraceabilityEvent[]>;
}

export const ProductUnitDetailModal: React.FC<ProductUnitDetailModalProps> = ({
  isOpen,
  onClose,
  unit,
  traceabilityEvents
}) => {
  if (!isOpen || !unit) return null;

  const eventsList: ProductTraceabilityEvent[] = Array.isArray(traceabilityEvents)
    ? traceabilityEvents
    : (traceabilityEvents[unit.id] || traceabilityEvents['DIN-W2026-0941-RBC'] || []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30">
              <Droplet className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">بطاقة تعريف وتتبع وحدة الدم (Product Traceability Detail)</h3>
                <span className="font-mono text-xs text-red-300 font-bold bg-red-950 px-2 py-0.5 rounded border border-red-800">
                  {unit.unitNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                باركود وتنسيق قياسي ISBT-128 ومسار التتبع التشغيلي
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Unit Identification Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono">ISBT-128 DIN Barcode</div>
              <div className="text-lg font-bold font-mono text-slate-900 tracking-wider">{unit.unitNumber}</div>
              <div className="text-xs font-bold text-red-900 mt-1">{unit.componentNameAr} ({unit.componentNameEn})</div>
            </div>

            <div className="text-center p-3 rounded-xl bg-white border border-red-200 shadow-2xs">
              <div className="text-[10px] text-slate-500">فصيلة المشتق (ABO/Rh):</div>
              <div className="text-2xl font-bold font-mono text-red-700">{unit.bloodGroup.displayAr}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">حجم الوحدة: {unit.volumeMl} mL</div>
            </div>
          </div>

          {/* Unit Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] text-slate-500 block">حالة الوحدة:</span>
              <span className="font-bold text-teal-700 text-xs mt-1 block uppercase">{unit.status}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] text-slate-500 block">مكان الحفظ:</span>
              <span className="font-bold text-slate-800 text-xs mt-1 block">{unit.storageLocation}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] text-slate-500 block">درجة الحرارة المراقبة:</span>
              <span className="font-bold font-mono text-slate-800 text-xs mt-1 block">{unit.storageTemperatureC}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] text-slate-500 block">تاريخ انتهاء الصلاحية:</span>
              <span className="font-bold font-mono text-red-700 text-xs mt-1 block">{unit.expiryDate}</span>
            </div>
          </div>

          {/* Preparation & Attributes */}
          <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 space-y-2">
            <span className="font-bold text-purple-950 text-xs block">المواصفات والتحضيرات المخبرية المعتمدة:</span>
            <div className="flex flex-wrap gap-1.5">
              {unit.specialAttributes.map(att => (
                <span key={att} className="px-2.5 py-1 rounded-lg bg-white text-purple-900 border border-purple-300 font-bold text-xs shadow-2xs">
                  {att === 'irradiated' ? 'مشعع (Irradiated)' :
                   att === 'leukocyte_reduced' ? 'مفلتر الكريات البيضاء' :
                   att === 'antigen_negative' ? 'سالب لمستضدات محددة' :
                   att === 'phenotype_matched' ? 'مطابق فينوتيبياً' : att}
                </span>
              ))}
              {unit.antigenProfile && (
                <span className="px-2.5 py-1 rounded-lg bg-white text-blue-900 border border-blue-300 font-mono font-bold text-xs shadow-2xs">
                  Phenotype: {unit.antigenProfile.join(', ')}
                </span>
              )}
            </div>

            {unit.preparationState?.isThawed && (
              <div className="mt-2 p-2 rounded-lg bg-white/80 border border-purple-200 text-xs text-purple-900">
                تمت إذابة البلازما: {unit.preparationState.thawedAt} • {unit.preparationState.thawExpiry}
              </div>
            )}
          </div>

          {/* Allocation & Issue Context if present */}
          {unit.allocatedToPatientName && (
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-1">
              <span className="font-bold block">سياق التخصيص والصرف:</span>
              <div className="flex justify-between">
                <span>مخصص للمريض: <strong>{unit.allocatedToPatientName}</strong> (MRN: {unit.allocatedToPatientMrn})</span>
                <span>تاريخ التخصيص: {unit.allocatedAt}</span>
              </div>
              {unit.issuedAt && (
                <div className="flex justify-between text-[11px] text-blue-800 pt-1 border-t border-blue-200/60">
                  <span>تم الصرف إلى: <strong>{unit.issuedToLocation}</strong></span>
                  <span>ساعة الصرف: {unit.issuedAt}</span>
                </div>
              )}
            </div>
          )}

          {/* Cradle-to-Grave Traceability Timeline */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <History className="w-4 h-4 text-slate-700" />
              <h4 className="font-bold text-slate-900 text-xs">سجل التتبع الشامل للوحدة (Cradle-to-Grave Lifecycle Traceability)</h4>
            </div>

            <div className="space-y-3 pr-2">
              {eventsList.length > 0 ? (
                eventsList.map((evt, idx) => (
                  <div key={evt.id} className="relative flex items-start gap-3 pl-4">
                    <div className="w-3 h-3 rounded-full bg-red-600 border-2 border-white shadow-2xs mt-1 shrink-0"></div>
                    <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{evt.eventTitleAr}</span>
                        <span className="text-[10px] font-mono text-slate-500">{evt.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{evt.details}</p>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 pt-1 border-t border-slate-200/60">
                        <span>المسؤول: {evt.actorName} ({evt.actorRole})</span>
                        <span>•</span>
                        <span>الموقع: {evt.location}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-500">
                  لا توجد سجلات تتبع إضافية لهذه الوحدة.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            سجل التتبع التشغيلي لوحدة الدم متوافق مع مبادئ سلامة نقل الدم والجودة المرجعية.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
