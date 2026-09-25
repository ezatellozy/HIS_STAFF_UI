import React, { useState } from 'react';
import {
  Scale,
  ShieldCheck,
  Calculator,
  Percent,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Building,
  Info
} from 'lucide-react';
import {
  RevenueCycleState,
  CoverageReference,
  TariffReference
} from '../../../types/revenueCycle';
import { determinePricingAndCoverage } from '../../../utils/revenueCycleEngine';

interface PricingCoverageWorkbenchProps {
  state: RevenueCycleState;
}

export const PricingCoverageWorkbench: React.FC<PricingCoverageWorkbenchProps> = ({ state }) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('pat-1001');
  const [selectedServiceCode, setSelectedServiceCode] = useState<string>('SBS-99213');
  const [isCitizen, setIsCitizen] = useState<boolean>(true);

  const selectedCoverage = state.coverages.find(c => c.patientId === selectedPatientId);
  const selectedTariff = state.tariffs.find(t => t.serviceCode === selectedServiceCode) || state.tariffs[0];

  // Dummy charge representation for real-time preview
  const dummyCharge = {
    id: 'CHG-SIM-PREVIEW',
    patientId: selectedPatientId,
    patientMrn: selectedCoverage?.patientMrn || 'MRN-SIM',
    patientNameAr: selectedPatientId === 'pat-1001' ? 'محمود سعد الدين' : selectedPatientId === 'pat-1005' ? 'سميحة فتحي' : 'نوران الشافعي',
    encounterId: 'ENC-PREVIEW',
    sourceCategory: 'opd_consultation' as const,
    sourceReferenceId: 'PREVIEW-REF',
    serviceCode: selectedTariff.serviceCode,
    serviceNameAr: selectedTariff.serviceNameAr,
    serviceNameEn: selectedTariff.serviceNameEn,
    departmentAr: 'العيادات الخارجية',
    quantity: 1,
    unit: 'خدمة',
    serviceTimestamp: 'الآن',
    performedStatus: 'performed' as const,
    billabilityStatus: 'billable' as const,
    pricingStatus: 'priced' as const,
    billingReviewStatus: 'approved_for_billing' as const,
    unitPriceSar: selectedTariff.contractedPayerPriceSar || selectedTariff.standardTariffSar,
    grossAmountSar: selectedTariff.standardTariffSar,
    discountAmountSar: (selectedTariff.standardTariffSar - (selectedTariff.contractedPayerPriceSar || selectedTariff.standardTariffSar)),
    netAmountSar: selectedTariff.contractedPayerPriceSar || selectedTariff.standardTariffSar,
    taxRatePercent: 0,
    taxAmountSar: 0,
    totalWithTaxSar: selectedTariff.contractedPayerPriceSar || selectedTariff.standardTariffSar,
    isSyntheticFixture: true
  };

  const calculation = determinePricingAndCoverage(dummyCharge, selectedCoverage, isCitizen);

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Scale className="w-5 h-5 text-indigo-600" />
          <span>منظومة التسعير، التغطية والمسؤولية المالية (Pricing, Coverage & Responsibility)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          محاكاة حاسبة توزيع المسؤولية المالية بين المريض وشركة التأمين وتطبيق ضريبة القيمة المضافة (ZATCA / Citizen Relief)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Simulation Controls */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Calculator className="w-4 h-4 text-indigo-500" />
            <span>معايير الاحتساب المالي للمطالبة</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">المريض وسجل التأمين:</label>
            <select
              value={selectedPatientId}
              onChange={e => setSelectedPatientId(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-hidden"
            >
              <option value="pat-1001">محمود سعد الدين (MRN-0814) — بوبا العربية VIP (تحمل 10% بحد أقصى 100 ر.س)</option>
              <option value="pat-1002">نوران حسام الشافعي (MRN-0820) — التعاونية للتأمين A (تحمل 20%)</option>
              <option value="pat-1003">عبد الرحمن علي الجابري (MRN-0835) — ميدنت للتأمين B (تحمل 25%)</option>
              <option value="pat-1005">سميحة فتحي عبد الجواد (MRN-0850) — سداد نقدي ذاتي Self-Pay (تحمل 100%)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">الخدمة والتعرفة المعتمدة (SBS Tariff):</label>
            <select
              value={selectedServiceCode}
              onChange={e => setSelectedServiceCode(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-hidden"
            >
              {state.tariffs.map(t => (
                <option key={t.serviceCode} value={t.serviceCode}>
                  {t.serviceCode} — {t.serviceNameAr} ({t.standardTariffSar} ر.س)
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={isCitizen}
                onChange={e => setIsCitizen(e.target.checked)}
                className="rounded-sm text-indigo-600 focus:ring-0"
              />
              <span>مواطن سعودي (أهلية تحمل الدولة لضريبة الخدمات الصحية المؤهلة)</span>
            </label>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
              <div className="font-bold text-slate-700">التصنيف الضريبي للتوريد:</div>
              <div>• تصنيف التوريد: <span className="font-mono font-bold text-slate-800">{calculation.taxTreatment?.supplyClassification || 'standard_rated_15'}</span></div>
              <div>• النسبة النظامية: <span className="font-mono font-bold text-slate-800">{calculation.taxTreatment?.applicableRatePercent ?? 15}%</span></div>
              <div>• وضع تحمل الدولة: <span className="font-bold text-teal-700">{calculation.taxTreatment?.governmentBearingStatus === 'citizen_government_borne' ? 'تتحملها الدولة عن المواطن' : 'غير منطبق / على المستفيد أو الجهة الضامنة'}</span></div>
            </div>
          </div>

          {/* Active Policy Snapshot */}
          {selectedCoverage && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-xs">
              <div className="font-bold text-slate-800 flex items-center justify-between">
                <span>وثيقة التأمين:</span>
                <span className="font-mono text-indigo-700">{selectedCoverage.policyNumber}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>شركة التأمين:</span>
                <span>{selectedCoverage.payerNameAr}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>الفئة ونسبة التحمل:</span>
                <span className="font-bold text-slate-800">{selectedCoverage.planClass} — {selectedCoverage.coPayPercent}%</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>الرصيد السنوي المتبقي:</span>
                <span className="font-mono font-bold text-emerald-700">{selectedCoverage.remainingBenefitSar.toLocaleString()} ر.س</span>
              </div>
              {selectedCoverage.isPriorAuthRequired && (
                <div className="pt-1 border-t border-slate-200 text-amber-700 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>تتطلب موافقة مسبقة (Pre-Auth Required)</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Real-time Calculation Outcome Panel */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-2 space-y-5">
          <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-emerald-500" />
              <span>نتائج توزيع المسؤولية المالية (Financial Responsibility Breakdown)</span>
            </span>
            <span className="text-[11px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
              معاينة فورية
            </span>
          </h3>

          {/* Visual Split Graph */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-blue-700">حصة المريض: {calculation.patientShareSar.toLocaleString()} ر.س ({calculation.coPayPercent}%)</span>
              <span className="text-teal-700">حصة شركة التأمين: {calculation.payerShareSar.toLocaleString()} ر.س ({100 - calculation.coPayPercent}%)</span>
            </div>
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${calculation.coPayPercent}%` }}
              />
              <div
                className="bg-teal-500 h-full transition-all duration-300"
                style={{ width: `${100 - calculation.coPayPercent}%` }}
              />
            </div>
          </div>

          {/* Detailed Financial Ledger Simulation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 block">السعر المعياري للخدمة</span>
              <span className="text-base font-black text-slate-800 font-mono mt-1 block">
                {selectedTariff.standardTariffSar.toLocaleString()} ر.س
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 block">الخصم التعاقدي المعتمد</span>
              <span className="text-base font-black text-indigo-700 font-mono mt-1 block">
                {dummyCharge.discountAmountSar.toLocaleString()} ر.س
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 block">ضريبة القيمة المضافة</span>
              <span className="text-base font-black text-slate-800 font-mono mt-1 block">
                {calculation.vatAmountSar.toLocaleString()} ر.س ({isCitizen ? '0%' : '15%'})
              </span>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <span className="text-[11px] text-emerald-800 font-bold block">صافي الإجمالي المستحق</span>
              <span className="text-base font-black text-emerald-900 font-mono mt-1 block">
                {calculation.totalWithVatSar.toLocaleString()} ر.س
              </span>
            </div>
          </div>

          {/* Compliance & Rules Summary Note */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-xs text-blue-900">
            <div className="font-bold flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-700" />
              <span>ضوابط الاعتماد المالي وفق المعايير التنظيمية السعودية (Regulatory & Tax Profile)</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-blue-800">
              <li>المريض مشمول بحد أقصى للتحمل في العيادات الخارجية بموجب شروط الوثيقة المعتمدة.</li>
              <li>ضريبة الخدمات الصحية المؤهلة للمواطنين تتحملها الدولة (Borne by State) ولا تعني بالضرورة توريداً خاضعاً لنسبة الصفر بطبيعته.</li>
              <li>فصل حصة المريض عن حصة شركة التأمين المستقلة، مع توثيق الأثر الضريبي لكل طرف بشكل منفصل.</li>
              <li>أي رفض لاحق من شركة التأمين لا يُحول تلقائياً إلى ذمة على المريض (Patient Debt) إلا بعد تفويض وسند تعاقدي معتمد.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Hospital Tariffs Table Reference */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-700">لائحة أسعار الخدمات الطبية المعتمدة (Hospital Master Tariff)</h3>
          <span className="text-[11px] text-slate-500">ترميز موحد SBS / CPT / ACHI</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">كود الخدمة</th>
                <th className="py-2.5 px-4">اسم الإجراء الطبي</th>
                <th className="py-2.5 px-4">سعر القائمة (List Price)</th>
                <th className="py-2.5 px-4">السعر المعياري (Standard Tariff)</th>
                <th className="py-2.5 px-4">السعر التعاقدي للتأمين</th>
                <th className="py-2.5 px-4">فئة الضريبة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.tariffs.map(t => (
                <tr key={t.serviceCode} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-4 font-mono font-bold text-indigo-700">{t.serviceCode}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-800">{t.serviceNameAr}</td>
                  <td className="py-2.5 px-4 font-mono text-slate-600">{t.listPriceSar} ر.س</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{t.standardTariffSar} ر.س</td>
                  <td className="py-2.5 px-4 font-mono text-teal-700 font-bold">
                    {t.contractedPayerPriceSar ? `${t.contractedPayerPriceSar} ر.س` : '—'}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {t.vatCategory === 'zero_rated' ? '0% معفى (مواطنين)' : '15% قياسي'}
                    </span>
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
