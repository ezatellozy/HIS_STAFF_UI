import React, { useState } from 'react';
import {
  Pill,
  ShieldAlert,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Layers,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { ActiveMedicationItem } from '../../../types/clinicalMedicationsMar';

interface ActiveMedicationsListViewProps {
  medications: ActiveMedicationItem[];
  onSelectMedicationForMar: (medicationId: string) => void;
}

export const ActiveMedicationsListView: React.FC<ActiveMedicationsListViewProps> = ({
  medications,
  onSelectMedicationForMar
}) => {
  const [filterType, setFilterType] = useState<'all' | 'scheduled' | 'prn' | 'high_alert' | 'iv'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = medications.filter(med => {
    if (filterType === 'scheduled' && (med.isPrn || med.isContinuousInfusion)) return false;
    if (filterType === 'prn' && !med.isPrn) return false;
    if (filterType === 'high_alert' && !med.isHighAlert) return false;
    if (filterType === 'iv' && !med.route.includes('IV')) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        med.genericName.toLowerCase().includes(q) ||
        med.brandName.toLowerCase().includes(q) ||
        med.therapeuticClass.toLowerCase().includes(q) ||
        med.indication.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-500 ml-1">تصفية القائمة:</span>
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            جميع الأدوية النشطة ({medications.length})
          </button>
          <button
            onClick={() => setFilterType('scheduled')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'scheduled'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            المجدولة بانتظام (Scheduled)
          </button>
          <button
            onClick={() => setFilterType('prn')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'prn'
                ? 'bg-blue-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            عند اللزوم (PRN)
          </button>
          <button
            onClick={() => setFilterType('high_alert')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              filterType === 'high_alert'
                ? 'bg-rose-700 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>عالية الخطورة (High-Alert)</span>
          </button>
          <button
            onClick={() => setFilterType('iv')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'iv'
                ? 'bg-purple-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            محاليل ووريدية (IV)
          </button>
        </div>

        <div className="relative min-w-56">
          <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم العلمي أو التجاري..."
            className="w-full pr-8 pl-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
      </div>

      {/* Medication Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(med => {
          return (
            <div
              key={med.id}
              className={`bg-white rounded-2xl border transition-all p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md ${
                med.isHighAlert
                  ? 'border-rose-300 ring-1 ring-rose-100'
                  : 'border-slate-200'
              }`}
            >
              <div>
                {/* Header & Badges */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-base text-slate-900">
                        {med.genericName}
                      </h4>
                      <span className="text-xs font-semibold text-slate-500">
                        ({med.brandName})
                      </span>
                    </div>
                    <span className="text-[11px] text-teal-700 font-semibold block">
                      {med.therapeuticClass}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {med.isHighAlert && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-rose-600" />
                        <span>High-Alert</span>
                      </span>
                    )}

                    {med.isPrn && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        PRN عند اللزوم
                      </span>
                    )}

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        med.dispensingStatus === 'floor_stock'
                          ? 'bg-emerald-100 text-emerald-800'
                          : med.dispensingStatus === 'dispensed_central_pharmacy'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {med.dispensingStatus === 'floor_stock'
                        ? 'مخزون القسم'
                        : med.dispensingStatus === 'dispensed_central_pharmacy'
                        ? 'مصروف من الصيدلية'
                        : 'قيد الصرف'}
                    </span>
                  </div>
                </div>

                {/* Core Clinical Dosing Spec */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">الجرعة المحددة</span>
                    <strong className="text-slate-900 font-mono text-sm block mt-0.5">
                      {med.orderedDose}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">طريق الإعطاء</span>
                    <strong className="text-slate-900 block mt-0.5">
                      {med.route}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">التكرار والجدول</span>
                    <strong className="text-slate-900 block mt-0.5">
                      {med.frequency}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">المواعيد القياسية</span>
                    <span className="font-mono text-slate-700 text-[11px] block mt-0.5">
                      {med.timingSchedule.join(', ')}
                    </span>
                  </div>
                </div>

                {/* Clinical Indication & Hold Parameters */}
                <div className="space-y-1.5 mt-3 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">داعي الاستعمال:</span>
                    <strong className="text-slate-800">{med.indication}</strong>
                  </div>

                  {med.holdParameters && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>{med.holdParameters}</span>
                    </div>
                  )}

                  {med.instructions && (
                    <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                      💡 {med.instructions}
                    </p>
                  )}
                </div>
              </div>

              {/* Footer Provenance & Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-400">
                  <span>طلب: <strong className="font-mono text-blue-700">{med.orderId}</strong></span>
                  <span className="mx-1">•</span>
                  <span>الطبيب: {med.prescribedBy}</span>
                </div>

                <button
                  onClick={() => onSelectMedicationForMar(med.id)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>سجل إعطاء eMAR</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
