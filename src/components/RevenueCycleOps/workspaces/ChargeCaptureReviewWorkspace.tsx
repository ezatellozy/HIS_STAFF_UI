import React, { useState } from 'react';
import {
  FileCheck2,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Plus,
  Search,
  Eye,
  Building2,
  Stethoscope,
  Info
} from 'lucide-react';
import {
  ChargeEventReference,
  ChargeSourceCategory,
  RevenueCycleState
} from '../../../types/revenueCycle';
import { validateAndReviewCharge } from '../../../utils/revenueCycleEngine';

interface ChargeCaptureReviewWorkspaceProps {
  state: RevenueCycleState;
  onUpdateCharges: (updatedCharges: ChargeEventReference[]) => void;
  onAddAuditLog: (action: string, entityId: string, desc: string) => void;
}

export const ChargeCaptureReviewWorkspace: React.FC<ChargeCaptureReviewWorkspaceProps> = ({
  state,
  onUpdateCharges,
  onAddAuditLog
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ChargeSourceCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCharge, setSelectedCharge] = useState<ChargeEventReference | null>(null);
  const [showSimulateModal, setShowSimulateModal] = useState(false);

  // New candidate form state
  const [newPatientId, setNewPatientId] = useState('pat-1001');
  const [newServiceCode, setNewServiceCode] = useState('SBS-99213');
  const [newQuantity, setNewQuantity] = useState(1);
  const [newPerformedStatus, setNewPerformedStatus] = useState<'performed' | 'planned'>('performed');
  const [simulationAlert, setSimulationAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const filteredCharges = state.charges.filter(c => {
    if (state.selectedPatientContextId && c.patientId !== state.selectedPatientContextId) return false;
    if (selectedCategory !== 'all' && c.sourceCategory !== selectedCategory) return false;
    if (selectedStatus === 'unbilled' && (c.billabilityStatus !== 'billable' || c.consumedInInvoiceId)) return false;
    if (selectedStatus === 'billed' && !c.consumedInInvoiceId) return false;
    if (selectedStatus === 'pending_review' && c.billingReviewStatus !== 'pending_review') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.serviceNameAr.toLowerCase().includes(q) ||
        c.serviceCode.toLowerCase().includes(q) ||
        c.patientNameAr.toLowerCase().includes(q) ||
        c.patientMrn.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleApproveForBilling = (chargeId: string) => {
    const target = state.charges.find(c => c.id === chargeId);
    if (!target) return;

    if (target.performedStatus !== 'performed') {
      alert('خطأ: لا يمكن اعتماد الرسوم لخدمة غير مكتملة التنفيذ سريرياً (Order != Performed Service).');
      return;
    }

    const updated = state.charges.map(c =>
      c.id === chargeId
        ? {
            ...c,
            billabilityStatus: 'billable' as const,
            billingReviewStatus: 'approved_for_billing' as const,
            exceptionReason: undefined
          }
        : c
    );

    onUpdateCharges(updated);
    onAddAuditLog('CHARGE_APPROVED', chargeId, `تم اعتماد الرسوم للخدمة ${target.serviceNameAr} للفوترة`);
    if (selectedCharge?.id === chargeId) {
      setSelectedCharge({ ...selectedCharge, billabilityStatus: 'billable', billingReviewStatus: 'approved_for_billing' });
    }
  };

  const handleSimulateNewCapture = () => {
    setSimulationAlert(null);
    const tariff = state.tariffs.find(t => t.serviceCode === newServiceCode);
    if (!tariff) {
      setSimulationAlert({ type: 'error', message: 'كود الخدمة غير مسعر في اللائحة' });
      return;
    }

    const patientName =
      newPatientId === 'pat-1001'
        ? 'محمود سعد الدين إبراهيم'
        : newPatientId === 'pat-1002'
        ? 'نوران حسام الشافعي'
        : newPatientId === 'pat-1005'
        ? 'سميحة فتحي عبد الجواد'
        : 'عبد الرحمن علي الجابري';

    const patientMrn =
      newPatientId === 'pat-1001'
        ? 'MRN-2026-0814'
        : newPatientId === 'pat-1002'
        ? 'MRN-2026-0820'
        : newPatientId === 'pat-1005'
        ? 'MRN-2026-0850'
        : 'MRN-2026-0835';

    const candidate: Omit<ChargeEventReference, 'id' | 'isSyntheticFixture'> = {
      patientId: newPatientId,
      patientMrn,
      patientNameAr: patientName,
      encounterId: `ENC-${newPatientId}-SIM`,
      sourceCategory: 'opd_consultation',
      sourceReferenceId: `SIM-EVT-${Date.now()}`,
      clinicalOrderId: `ORD-SIM-${Math.floor(1000 + Math.random() * 9000)}`,
      performedServiceRef: newPerformedStatus === 'performed' ? `SRV-PERF-${Date.now()}` : undefined,
      serviceCode: newServiceCode,
      serviceNameAr: tariff.serviceNameAr,
      serviceNameEn: tariff.serviceNameEn,
      departmentAr: 'العيادات الخارجية التخصصية',
      quantity: newQuantity,
      unit: 'خدمة',
      serviceTimestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      performedStatus: newPerformedStatus,
      billabilityStatus: newPerformedStatus === 'performed' ? 'billable' : 'unreviewed',
      pricingStatus: 'priced',
      billingReviewStatus: newPerformedStatus === 'performed' ? 'approved_for_billing' : 'pending_review',
      exceptionReason: newPerformedStatus === 'planned' ? 'خدمة مجدولة لم يتم توثيق إنجازها بعد' : undefined,
      unitPriceSar: tariff.standardTariffSar,
      grossAmountSar: tariff.standardTariffSar * newQuantity,
      discountAmountSar: 0,
      netAmountSar: tariff.standardTariffSar * newQuantity,
      taxRatePercent: 0,
      taxAmountSar: 0,
      totalWithTaxSar: tariff.standardTariffSar * newQuantity
    };

    const validation = validateAndReviewCharge(candidate, state.charges, state.tariffs);

    if (!validation.isValid) {
      setSimulationAlert({
        type: 'error',
        message: validation.errorMessageAr || 'فشلت معايير التحقق من الرسوم'
      });
      return;
    }

    if (validation.charge) {
      onUpdateCharges([validation.charge, ...state.charges]);
      onAddAuditLog('NEW_CHARGE_CAPTURED', validation.charge.id, `تم تقييد خدمة جديدة: ${validation.charge.serviceNameAr}`);
      setSimulationAlert({
        type: 'success',
        message: `تم تقييد بند الرسوم بنجاح برقم ${validation.charge.id} (${validation.charge.totalWithTaxSar} ر.س)`
      });
      setTimeout(() => setShowSimulateModal(false), 1200);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-teal-600" />
            <span>حصر الرسوم ومراجعة الفوترة السريرية (Charge Capture & Billing Review)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            التحقق من إنجاز الخدمات السريرية (Order != Performed Service) ومطابقة لائحة الأسعار قبل الفوترة
          </p>
        </div>

        <button
          onClick={() => {
            setSimulationAlert(null);
            setShowSimulateModal(true);
          }}
          className="flex items-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>محاكاة قيد خدمة منفذة</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="البحث باسم الخدمة، كود SBS، اسم المريض أو الملف الطبي..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-teal-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">القسم:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value as any)}
              className="border border-slate-200 rounded-lg text-xs py-1.5 px-2.5 bg-slate-50 focus:outline-hidden"
            >
              <option value="all">كافة الأقسام والمصادر</option>
              <option value="opd_consultation">عيادات خارجية OPD</option>
              <option value="laboratory">مختبرات سريرية</option>
              <option value="radiology">أشعة وتصوير</option>
              <option value="inpatient_stay">تنويم داخلي IPD</option>
              <option value="emergency_service">طوارئ ER</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">حالة الفوترة:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="border border-slate-200 rounded-lg text-xs py-1.5 px-2.5 bg-slate-50 focus:outline-hidden"
            >
              <option value="all">كافة الحالات</option>
              <option value="unbilled">جاهزة للفوترة (غير مفوترة)</option>
              <option value="billed">مفوترة بفاتورة رسمية</option>
              <option value="pending_review">معلقة للتدقيق السريري</option>
            </select>
          </div>
        </div>
      </div>

      {/* Charges Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="py-3 px-4">رقم القيد / التاريخ</th>
                <th className="py-3 px-4">المريض / الملف</th>
                <th className="py-3 px-4">الخدمة السريرية / كود SBS</th>
                <th className="py-3 px-4">القسم والمصدر</th>
                <th className="py-3 px-4">حالة التنفيذ السريري</th>
                <th className="py-3 px-4">المبلغ الإجمالي</th>
                <th className="py-3 px-4">حالة المراجعة المالية</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCharges.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    لا توجد بنود رسوم مطابقة لمعايير البحث والتصفية
                  </td>
                </tr>
              ) : (
                filteredCharges.map(chg => (
                  <tr key={chg.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-slate-900">{chg.id}</div>
                      <div className="text-[11px] text-slate-400">{chg.serviceTimestamp}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{chg.patientNameAr}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{chg.patientMrn}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{chg.serviceNameAr}</div>
                      <div className="text-[11px] text-teal-700 font-mono font-semibold">{chg.serviceCode}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{chg.departmentAr}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          chg.performedStatus === 'performed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : chg.performedStatus === 'planned'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {chg.performedStatus === 'performed' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>تم التنفيذ السريري</span>
                          </>
                        ) : chg.performedStatus === 'planned' ? (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>طلب مجدول لم ينفذ</span>
                          </>
                        ) : (
                          <span>ملغاة</span>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {chg.totalWithTaxSar.toLocaleString()} ر.س
                    </td>
                    <td className="py-3 px-4">
                      {chg.consumedInInvoiceId ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          <span>مفوتر ({chg.consumedInInvoiceId})</span>
                        </span>
                      ) : chg.billingReviewStatus === 'approved_for_billing' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>معتمد للفوترة</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" />
                          <span>قيد التدقيق</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedCharge(chg)}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 cursor-pointer"
                          title="عرض تفاصيل القيد"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {!chg.consumedInInvoiceId && chg.billingReviewStatus !== 'approved_for_billing' && (
                          <button
                            onClick={() => handleApproveForBilling(chg.id)}
                            className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-md text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            اعتماد الفوترة
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charge Detail Modal */}
      {selectedCharge && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-teal-600" />
                <span>تفاصيل قيد الرسوم المالية: {selectedCharge.id}</span>
              </h3>
              <button
                onClick={() => setSelectedCharge(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">المريض:</span>
                <span className="font-bold text-slate-800">{selectedCharge.patientNameAr} ({selectedCharge.patientMrn})</span>
              </div>
              <div>
                <span className="text-slate-400 block">القسم السريري:</span>
                <span className="font-bold text-slate-800">{selectedCharge.departmentAr}</span>
              </div>
              <div>
                <span className="text-slate-400 block">الخدمة وكود التصنيف:</span>
                <span className="font-bold text-teal-700">{selectedCharge.serviceNameAr} ({selectedCharge.serviceCode})</span>
              </div>
              <div>
                <span className="text-slate-400 block">مرجع المصدر السريري:</span>
                <span className="font-mono text-slate-600">{selectedCharge.sourceReferenceId}</span>
              </div>
              <div>
                <span className="text-slate-400 block">الكمية وسعر الوحدة:</span>
                <span className="font-mono font-bold text-slate-800">{selectedCharge.quantity} × {selectedCharge.unitPriceSar} ر.س</span>
              </div>
              <div>
                <span className="text-slate-400 block">الإجمالي شامل الضريبة:</span>
                <span className="font-mono font-black text-slate-900 text-sm">{selectedCharge.totalWithTaxSar} ر.س</span>
              </div>
            </div>

            {selectedCharge.exceptionReason && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <strong className="block">ملاحظة التدقيق السريري:</strong>
                  <span>{selectedCharge.exceptionReason}</span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedCharge(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 cursor-pointer font-bold"
              >
                إغلاق
              </button>
              {!selectedCharge.consumedInInvoiceId && selectedCharge.billingReviewStatus !== 'approved_for_billing' && (
                <button
                  onClick={() => {
                    handleApproveForBilling(selectedCharge.id);
                  }}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 cursor-pointer shadow-xs"
                >
                  اعتماد الفوترة الآن
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Simulate New Performed Service Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-600" />
                <span>محاكاة قيد خدمة سريرية جديدة (Clinical Charge Capture)</span>
              </h3>
              <button
                onClick={() => setShowSimulateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {simulationAlert && (
              <div
                className={`p-3 rounded-lg text-xs font-bold flex items-center gap-2 ${
                  simulationAlert.type === 'error'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {simulationAlert.type === 'error' ? <XCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                <span>{simulationAlert.message}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">المريض المستهدف:</label>
                <select
                  value={newPatientId}
                  onChange={e => setNewPatientId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-hidden"
                >
                  <option value="pat-1001">محمود سعد الدين (MRN-2026-0814) - تأمين بوبا VIP</option>
                  <option value="pat-1002">نوران حسام الشافعي (MRN-2026-0820) - تأمين التعاونية A</option>
                  <option value="pat-1005">سميحة فتحي عبد الجواد (MRN-2026-0850) - علاج نقدي كاش</option>
                  <option value="pat-1003">عبد الرحمن علي الجابري (MRN-2026-0835) - تنويم داخلي</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">كود الخدمة والتعرفة (Tariff Master):</label>
                <select
                  value={newServiceCode}
                  onChange={e => setNewServiceCode(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-hidden"
                >
                  {state.tariffs.map(t => (
                    <option key={t.serviceCode} value={t.serviceCode}>
                      {t.serviceCode} - {t.serviceNameAr} ({t.standardTariffSar} ر.س)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">الكمية:</label>
                  <input
                    type="number"
                    min="1"
                    value={newQuantity}
                    onChange={e => setNewQuantity(parseInt(e.target.value) || 1)}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">حالة الإنجاز السريري:</label>
                  <select
                    value={newPerformedStatus}
                    onChange={e => setNewPerformedStatus(e.target.value as any)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-hidden"
                  >
                    <option value="performed">منفذة فعلياً (Performed)</option>
                    <option value="planned">طلب مجدول فقط (Order Planned)</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-lg text-blue-800 text-[11px]">
                <Info className="w-3.5 h-3.5 inline ml-1 text-blue-600" />
                قاعدة الأعمال: إذا تم اختيار "طلب مجدول فقط"، سيتم حظر الترحيل المالي للرسوم تلقائياً (Order != Performed Service).
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowSimulateModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 cursor-pointer font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleSimulateNewCapture}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 cursor-pointer shadow-xs"
              >
                تأكيد وتقييد الرسوم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
