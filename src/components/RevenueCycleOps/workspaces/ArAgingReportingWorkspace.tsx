import React, { useState } from 'react';
import {
  Scale,
  Calendar,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Building,
  User,
  Clock,
  Filter,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { RevenueCycleState } from '../../../types/revenueCycle';
import { calculateArAgingSummary } from '../../../utils/revenueCycleEngine';

interface ArAgingReportingWorkspaceProps {
  state: RevenueCycleState;
}

export const ArAgingReportingWorkspace: React.FC<ArAgingReportingWorkspaceProps> = ({ state }) => {
  const [agingFilter, setAgingFilter] = useState<'all' | 'patient' | 'payer'>('all');

  const agingSummary = calculateArAgingSummary(
    state.invoices,
    state.charges,
    state.creditBalances,
    state.remittances
  );

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-600" />
            <span>تقرير أعمار الذمم المدينة والمطابقة المحاسبية (AR Aging & Reconciliation)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            توزيع الاستحقاقات الزمنية، مقارنة ذمم المرضى والتأمين، والتحقق الرياضي من مطابقة الذمم (RC27 / NEG-W)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {agingSummary.reconciliationCheckPassed ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>المطابقة المحاسبية: متطابقة بنسبة 100%</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-bold">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>يوجد فارق تسوية محاسبي</span>
            </div>
          )}
        </div>
      </div>

      {/* High-Level Aging Bucket Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 block">إجمالي الذمم المدينة</span>
          <span className="text-xl font-black text-slate-900 font-mono mt-1 block">
            {agingSummary.totalReceivables.totalSar.toLocaleString()} <span className="text-xs font-normal">ر.س</span>
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">شامل كافة المدينين</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 text-center shadow-xs">
          <span className="text-[11px] font-bold text-emerald-800 block">حالية (0 - 30 يوماً)</span>
          <span className="text-xl font-black text-emerald-900 font-mono mt-1 block">
            {agingSummary.totalReceivables.currentSar.toLocaleString()} <span className="text-xs font-normal">ر.س</span>
          </span>
          <span className="text-[10px] text-emerald-700 mt-1 block">ضمن فترة السداد النظامية</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/30 text-center shadow-xs">
          <span className="text-[11px] font-bold text-blue-800 block">31 - 60 يوماً</span>
          <span className="text-xl font-black text-blue-900 font-mono mt-1 block">
            {agingSummary.totalReceivables.days31To60Sar.toLocaleString()} <span className="text-xs font-normal">ر.س</span>
          </span>
          <span className="text-[10px] text-blue-700 mt-1 block">متابعة إشعارات السداد</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30 text-center shadow-xs">
          <span className="text-[11px] font-bold text-amber-800 block">61 - 90 يوماً</span>
          <span className="text-xl font-black text-amber-900 font-mono mt-1 block">
            {agingSummary.totalReceivables.days61To90Sar.toLocaleString()} <span className="text-xs font-normal">ر.س</span>
          </span>
          <span className="text-[10px] text-amber-700 mt-1 block">إخطارات التحصيل الرسمية</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/30 text-center shadow-xs col-span-2 lg:col-span-1">
          <span className="text-[11px] font-bold text-red-800 block">أكثر من 90 يوماً</span>
          <span className="text-xl font-black text-red-900 font-mono mt-1 block">
            {agingSummary.totalReceivables.days91PlusSar.toLocaleString()} <span className="text-xs font-normal">ر.س</span>
          </span>
          <span className="text-[10px] text-red-700 mt-1 block">متأخرات حرجة تتطلب تصعيداً</span>
        </div>
      </div>

      {/* Aging Matrix Table (Patient AR vs Payer AR) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-700">مصفوفة توزيع أعمار الذمم التفصيلية حسب فئة المدين</h3>
          <div className="flex gap-1">
            <button
              onClick={() => setAgingFilter('all')}
              className={`px-2.5 py-1 text-xs rounded-md font-bold cursor-pointer ${
                agingFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setAgingFilter('payer')}
              className={`px-2.5 py-1 text-xs rounded-md font-bold cursor-pointer ${
                agingFilter === 'payer' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              شركات التأمين
            </button>
            <button
              onClick={() => setAgingFilter('patient')}
              className={`px-2.5 py-1 text-xs rounded-md font-bold cursor-pointer ${
                agingFilter === 'patient' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              سداد المرضى الذاتي
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">فئة المدين / الحساب</th>
                <th className="py-3 px-4">حالية (0 - 30)</th>
                <th className="py-3 px-4">31 - 60 يوماً</th>
                <th className="py-3 px-4">61 - 90 يوماً</th>
                <th className="py-3 px-4">أكثر من 90 يوماً</th>
                <th className="py-3 px-4 font-black">إجمالي الذمة (ر.س)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {(agingFilter === 'all' || agingFilter === 'payer') && (
                <tr className="hover:bg-slate-50/70 font-semibold">
                  <td className="py-3 px-4 text-slate-800 font-sans flex items-center gap-2">
                    <Building className="w-4 h-4 text-teal-600" />
                    <span>شركات التأمين الصحي (B2B Insurance Payers)</span>
                  </td>
                  <td className="py-3 px-4 text-emerald-700">{agingSummary.insurancePayerAr.currentSar.toLocaleString()}</td>
                  <td className="py-3 px-4 text-blue-700">{agingSummary.insurancePayerAr.days31To60Sar.toLocaleString()}</td>
                  <td className="py-3 px-4 text-amber-700">{agingSummary.insurancePayerAr.days61To90Sar.toLocaleString()}</td>
                  <td className="py-3 px-4 text-red-600">{agingSummary.insurancePayerAr.days91PlusSar.toLocaleString()}</td>
                  <td className="py-3 px-4 font-black text-slate-900">{agingSummary.insurancePayerAr.totalSar.toLocaleString()}</td>
                </tr>
              )}

              {(agingFilter === 'all' || agingFilter === 'patient') && (
                <tr className="hover:bg-slate-50/70 font-semibold">
                  <td className="py-3 px-4 text-slate-800 font-sans flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>مستحقات المرضى المباشرة (Patient Self-Pay AR)</span>
                  </td>
                  <td className="py-3 px-4 text-emerald-700">{agingSummary.patientAr.currentSar.toLocaleString()}</td>
                  <td className="py-3 px-4 text-blue-700">{agingSummary.patientAr.days31To60Sar.toLocaleString()}</td>
                  <td className="py-3 px-4 text-amber-700">{agingSummary.patientAr.days61To90Sar.toLocaleString()}</td>
                  <td className="py-3 px-4 text-red-600">{agingSummary.patientAr.days91PlusSar.toLocaleString()}</td>
                  <td className="py-3 px-4 font-black text-slate-900">{agingSummary.patientAr.totalSar.toLocaleString()}</td>
                </tr>
              )}

              {/* Total Aggregate Row */}
              <tr className="bg-slate-100 font-black text-slate-900">
                <td className="py-3 px-4 font-sans">المجموع الإجمالي العام</td>
                <td className="py-3 px-4 text-emerald-800">{agingSummary.totalReceivables.currentSar.toLocaleString()}</td>
                <td className="py-3 px-4 text-blue-800">{agingSummary.totalReceivables.days31To60Sar.toLocaleString()}</td>
                <td className="py-3 px-4 text-amber-800">{agingSummary.totalReceivables.days61To90Sar.toLocaleString()}</td>
                <td className="py-3 px-4 text-red-800">{agingSummary.totalReceivables.days91PlusSar.toLocaleString()}</td>
                <td className="py-3 px-4 text-base text-slate-950 font-black">{agingSummary.totalReceivables.totalSar.toLocaleString()} ر.س</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplemental Balances Strip (DNFB and Unallocated) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block">رسوم منجزة مؤهلة غير مفوترة (DNFB)</span>
            <span className="text-lg font-black text-slate-900 font-mono mt-1 block">
              {agingSummary.unbilledEligibleChargesSar.toLocaleString()} ر.س
            </span>
            <span className="text-[11px] text-slate-400">خدمات تم تنفيذها سريرياً ومعتمدة بانتظار إصدار الفاتورة</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            DNFB
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block">إجمالي الأرصدة الدائنة المعلقة للمرضى</span>
            <span className="text-lg font-black text-emerald-700 font-mono mt-1 block">
              {agingSummary.creditBalancesSar.toLocaleString()} ر.س
            </span>
            <span className="text-[11px] text-slate-400">مبالغ مسددة بالزيادة أو مبالغ تأمين مؤهلة للاسترداد</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            CR
          </div>
        </div>
      </div>
    </div>
  );
};
