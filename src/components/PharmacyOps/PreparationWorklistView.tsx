import React, { useState } from 'react';
import {
  FlaskConical,
  Package,
  Layers,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  Sparkles,
  Filter,
  Eye
} from 'lucide-react';
import {
  CompoundingWorksheet,
  MedicationOrderContext,
  PreparationType
} from '../../types/pharmacyOps';

interface PreparationWorklistViewProps {
  worksheets: CompoundingWorksheet[];
  ordersInPrep: MedicationOrderContext[];
  onOpenStandardPrep: (order: MedicationOrderContext) => void;
  onOpenSterileWorksheet: (worksheet: CompoundingWorksheet) => void;
  onOpenLabelPreview: (order: MedicationOrderContext) => void;
}

export const PreparationWorklistView: React.FC<PreparationWorklistViewProps> = ({
  worksheets,
  ordersInPrep,
  onOpenStandardPrep,
  onOpenSterileWorksheet,
  onOpenLabelPreview
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');

  return (
    <div className="space-y-4 text-xs">
      {/* Top Banner / Cleanroom Status */}
      <div className="bg-gradient-to-r from-slate-900 to-cyan-950 text-white rounded-xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold">قائمة تحضير المحاليل والجرعات (Preparation & Cleanroom Worklist)</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-900/60 text-cyan-300 border border-cyan-700">
                Cleanroom Hoods ISO-5 Active
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              إدارة التحضير المعقم للمحاليل الوريدية، العبوات أحادية الجرعة، وتوثيق الفحص المستقل المزدوج
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300">الطلبات قيد الإعداد:</span>
          <span className="font-bold font-mono text-sm px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            {ordersInPrep.length + worksheets.length}
          </span>
        </div>
      </div>

      {/* Sterile Compounding Worksheets Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Layers className="w-4 h-4 text-teal-600" />
            <span>أوراق التحضير المعقم النشطة (Sterile IV Admixtures & Infusions)</span>
          </div>
          <span className="text-[11px] text-slate-500">يتطلب توثيق فني التحضير وتوقيع الصيدلي الفاحص</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {worksheets.map(ws => (
            <div
              key={ws.id}
              className="bg-white border border-slate-200 hover:border-cyan-500 rounded-xl p-4 transition-all shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                      {ws.id}
                    </span>
                    <span className="font-bold text-slate-900 text-xs">{ws.primaryDrug}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    المريض: <strong>{ws.patientName}</strong> ({ws.mrn})
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  ws.preparationState === 'passed_final_check'
                    ? 'bg-emerald-100 text-emerald-800'
                    : ws.preparationState === 'prepared_awaiting_check'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-cyan-100 text-cyan-800'
                }`}>
                  {ws.preparationState === 'passed_final_check'
                    ? 'اجتاز الفحص المزدوج'
                    : ws.preparationState === 'prepared_awaiting_check'
                    ? 'بانتظار تدقيق الصيدلي'
                    : 'قيد التحضير المعقم'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-500 block">المحلول والحجم:</span>
                  <span className="font-bold text-slate-800">{ws.diluentName} ({ws.diluentVolume})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">صلاحية ما بعد التحضير (BUD):</span>
                  <span className="font-bold text-rose-700">{ws.beyondUseDate}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className="text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>سياسة التحقق: {ws.verificationPolicy === 'independent_double_check' ? 'فحص مزدوج مستقل' : 'فحص أحادي'}</span>
                </span>

                <button
                  onClick={() => onOpenSterileWorksheet(ws)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>فتح ورقة التحضير</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Routine Inpatient Unit-Dose Prep Queue */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Package className="w-4 h-4 text-teal-600" />
            <span>طابور تجهيز الأدوية المعتمدة (Verified Orders Awaiting Prep & Packaging)</span>
          </div>
          <span className="text-[11px] text-slate-500">جاهزة لسحب العبوات ومطابقة الباركود</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold">
                <th className="py-2.5 px-3.5">كود الطلب</th>
                <th className="py-2.5 px-3.5">المريض والموقع</th>
                <th className="py-2.5 px-3.5">المستحضر والشكل الدوائي</th>
                <th className="py-2.5 px-3.5">الكمية المقررة</th>
                <th className="py-2.5 px-3.5">موقع المخزون</th>
                <th className="py-2.5 px-3.5 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ordersInPrep.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-3.5 font-mono font-bold text-slate-900">{order.id}</td>
                  <td className="py-3 px-3.5">
                    <div className="font-bold text-slate-900">{order.patientName}</div>
                    <div className="text-[10px] text-slate-500">{order.locationWardBed}</div>
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="font-bold text-slate-900">{order.brandName}</div>
                    <div className="text-[10px] text-slate-500">{order.orderedDose} • {order.dosageForm}</div>
                  </td>
                  <td className="py-3 px-3.5 font-bold text-slate-800">
                    {order.totalQuantityOrdered} {order.quantityUnit}
                  </td>
                  <td className="py-3 px-3.5 text-[11px] text-slate-600">
                    {order.stockContext.defaultLocation}
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <button
                      onClick={() => onOpenStandardPrep(order)}
                      className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 transition-colors mx-auto shadow-2xs"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>تجهيز العبوة</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
