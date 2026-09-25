import React, { useState } from 'react';
import {
  Coins,
  ShieldAlert,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Truck,
  Lock,
  FileText,
  Clock,
  Landmark,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { TreasuryState, CashCustodyRecord, DepositBatch } from '../../types/treasury';
import {
  recordCashHandover,
  createDepositBatch
} from '../../utils/treasuryEngine';

interface CashReceiptsDepositsWorkspaceProps {
  state: TreasuryState;
  onStateUpdate: (newState: TreasuryState) => void;
}

export const CashReceiptsDepositsWorkspace: React.FC<CashReceiptsDepositsWorkspaceProps> = ({
  state,
  onStateUpdate
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'handovers' | 'batches' | 'floats'>('handovers');

  // Modal 1: Handover
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [custodianName, setCustodianName] = useState('');
  const [locationContext, setLocationContext] = useState('كاشير العيادات الخارجية - مكتب 4');
  const [custodyType, setCustodyType] = useState<CashCustodyRecord['custodyType']>('patient_cashier_handover');
  const [sourceReceiptCount, setSourceReceiptCount] = useState(12);
  const [expectedAmount, setExpectedAmount] = useState(3500.0);
  const [countedAmount, setCountedAmount] = useState(3500.0);
  const [varianceReason, setVarianceReason] = useState('');
  const [handoverError, setHandoverError] = useState<string | null>(null);

  // Modal 2: Deposit Batch
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedCustodyIds, setSelectedCustodyIds] = useState<string[]>([]);
  const [targetBankAccountId, setTargetBankAccountId] = useState('TREAS-ACC-SNB-01');
  const [sealNumber, setSealNumber] = useState(`SEAL-SNB-${Math.floor(100000 + Math.random() * 900000)}`);
  const [carrierRef, setCarrierRef] = useState('شركة نقل الأموال الأمنية المتخصصة');
  const [batchError, setBatchError] = useState<string | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  // Available custody records for deposit
  const availableCustodyRecords = state.custodyRecords.filter(
    r => r.stage === 'cash_handed_over' || r.stage === 'cash_counted'
  );

  const handleCreateHandover = (e: React.FormEvent) => {
    e.preventDefault();
    setHandoverError(null);

    const actor = state.activePersona === 'treasury_clerk'
      ? 'طارق العمري (كاتب الخزينة)'
      : 'سليمان القحطاني (مدير الخزينة)';

    const res = recordCashHandover(state, {
      custodianStaffName: custodianName || 'أمين الصندوق المناوب',
      locationContext,
      branchId: 'main_hospital',
      custodyType,
      sourceReceiptCount,
      expectedAmountSar: expectedAmount,
      countedAmountSar: countedAmount,
      varianceReasonAr: varianceReason || undefined,
      actor
    });

    if (!res.success) {
      setHandoverError(res.error || 'فشل تسجيل استلام النقدية');
      return;
    }

    if (res.newState) {
      onStateUpdate(res.newState);
      setShowHandoverModal(false);
      setCustodianName('');
      const varAmount = countedAmount - expectedAmount;
      if (Math.abs(varAmount) > 0.01) {
        setNotification(`تم تسجيل استلام النقدية بنجاح مع رصد فارق عد (${varAmount} ر.س) وفُتح استثناء رقابي آلي للتحقيق.`);
      } else {
        setNotification(`تم تسجيل استلام النقدية بنجاح دون أي فروقات.`);
      }
    }
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    setBatchError(null);

    if (selectedCustodyIds.length === 0) {
      setBatchError('يجب اختيار سجل تسليم نقد واحد على الأقل لإنشاء الدفعة.');
      return;
    }

    const res = createDepositBatch(
      state,
      selectedCustodyIds,
      targetBankAccountId,
      sealNumber,
      carrierRef
    );

    if (!res.success) {
      setBatchError(res.error || 'فشل تجميع دفعة الإيداع البنكي');
      return;
    }

    if (res.newState) {
      onStateUpdate(res.newState);
      setShowBatchModal(false);
      setSelectedCustodyIds([]);
      setNotification(`تم إنشاء دفعة الإيداع البنكي برقم (${res.batchId}) وتشميع الحقيبة برقم السيل (${sealNumber}).`);
    }
  };

  return (
    <div id="cash-receipts-deposits-workspace" className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>إدارة النقدية والإيداعات البنكية (Cash Office & Deposit Batches)</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            استلام إيرادات الصناديق وخدمات المرضى من الكاشير، توثيق المحاضر، وإعداد دفعات الإيداع المجمعة بحقائب الأمان لشركة نقل الأموال.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <div className="inline-flex rounded-lg border border-neutral-200 dark:border-neutral-700 p-0.5 bg-neutral-100 dark:bg-neutral-800 text-xs">
            <button
              onClick={() => setActiveSubTab('handovers')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeSubTab === 'handovers'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              تسليمات الكاشير ({state.custodyRecords.length})
            </button>
            <button
              onClick={() => setActiveSubTab('batches')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeSubTab === 'batches'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              دفعات الإيداع البنكي ({state.depositBatches.length})
            </button>
            <button
              onClick={() => setActiveSubTab('floats')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeSubTab === 'floats'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              عهد الفكة والصناديق (Float)
            </button>
          </div>

          {activeSubTab === 'handovers' && (
            <button
              onClick={() => setShowHandoverModal(true)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل تسليم كاشير</span>
            </button>
          )}

          {activeSubTab === 'batches' && (
            <button
              onClick={() => {
                setSelectedCustodyIds(availableCustodyRecords.map(r => r.id));
                setShowBatchModal(true);
              }}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm shrink-0"
            >
              <Truck className="w-4 h-4" />
              <span>إعداد دفعة إيداع بنكي</span>
            </button>
          )}
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* TAB 1: CASH HANDOVERS */}
      {activeSubTab === 'handovers' && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 bg-neutral-50 dark:bg-neutral-800/40">
                  <th className="p-3">رقم السجل</th>
                  <th className="p-3">الموقع / الكاشير</th>
                  <th className="p-3">تاريخ ووقت الاستلام</th>
                  <th className="p-3">عدد السندات</th>
                  <th className="p-3">المبلغ المتوقع (SAR)</th>
                  <th className="p-3">المبلغ الفعلي المعدود</th>
                  <th className="p-3">فارق العد (Variance)</th>
                  <th className="p-3">مرحلة الإيداع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {state.custodyRecords.map(record => {
                  const hasShortage = record.varianceSar < -0.01;
                  const hasOverage = record.varianceSar > 0.01;

                  return (
                    <tr key={record.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40">
                      <td className="p-3 font-mono font-bold text-neutral-900 dark:text-neutral-100">
                        {record.id}
                      </td>

                      <td className="p-3">
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100">{record.locationContext}</div>
                        <div className="text-[11px] text-neutral-500">{record.custodianStaffName}</div>
                      </td>

                      <td className="p-3 font-mono text-neutral-600 dark:text-neutral-400">
                        {record.handoverTimestamp}
                      </td>

                      <td className="p-3 font-mono">
                        {record.sourceReceiptCount} سند قبض
                      </td>

                      <td className="p-3 font-mono font-semibold text-neutral-700 dark:text-neutral-300">
                        {record.expectedAmountSar.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="p-3 font-mono font-bold text-neutral-900 dark:text-neutral-100">
                        {record.countedAmountSar.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="p-3">
                        {hasShortage ? (
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{record.varianceSar.toFixed(2)} ر.س عجز</span>
                          </span>
                        ) : hasOverage ? (
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                            <span>+{record.varianceSar.toFixed(2)} ر.س فائض</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>مطابق (0.00)</span>
                          </span>
                        )}

                        {record.varianceReasonAr && (
                          <div className="text-[10px] text-neutral-500 mt-0.5 max-w-xs truncate">
                            {record.varianceReasonAr}
                          </div>
                        )}
                      </td>

                      <td className="p-3">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            record.stage === 'cash_deposited'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {record.stage === 'cash_deposited' ? 'تم التضمين بدفعة الإيداع' : 'مستلم بخزينة المستشفى'}
                        </span>
                        {record.depositBatchId && (
                          <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                            الدفعة: {record.depositBatchId}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DEPOSIT BATCHES */}
      {activeSubTab === 'batches' && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 bg-neutral-50 dark:bg-neutral-800/40">
                  <th className="p-3">رقم الدفعة</th>
                  <th className="p-3">الحساب البنكي المودع فيه</th>
                  <th className="p-3">رقم سيل الحقيبة الأمنية</th>
                  <th className="p-3">شركة نقل الأموال</th>
                  <th className="p-3">المبلغ الإجمالي (SAR)</th>
                  <th className="p-3">تاريخ التجهيز</th>
                  <th className="p-3">الحالة والمطابقة البنكية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {state.depositBatches.map(batch => {
                  const targetAcc = state.accounts.find(a => a.id === batch.targetBankAccountId);
                  const isReconciled = batch.status === 'reconciled_with_statement';

                  return (
                    <tr key={batch.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40">
                      <td className="p-3">
                        <div className="font-mono font-bold text-neutral-900 dark:text-neutral-100">{batch.batchNumber}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">{batch.id}</div>
                        <div className="text-[10px] text-blue-600 dark:text-blue-400">
                          {batch.custodyRecordIds.length} محاضر تسليم مجمعة
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {targetAcc?.displayNameAr || batch.targetBankAccountId}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          {targetAcc?.internalAccountCode} • {targetAcc?.bankNameAr}
                        </div>
                      </td>

                      <td className="p-3 font-mono font-bold text-neutral-800 dark:text-neutral-200">
                        <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">
                          {batch.cashBagSealNumber}
                        </span>
                      </td>

                      <td className="p-3 text-neutral-700 dark:text-neutral-300">
                        {batch.carrierReference}
                      </td>

                      <td className="p-3 font-mono font-bold text-sm text-neutral-900 dark:text-neutral-100">
                        {batch.expectedDepositAmountSar.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                      </td>

                      <td className="p-3 font-mono text-neutral-600 dark:text-neutral-400">
                        {batch.submissionDate}
                      </td>

                      <td className="p-3">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            isReconciled
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                          }`}
                        >
                          {isReconciled ? 'مطابق بكشف الحساب' : 'مشمع ومسلم للناقل'}
                        </span>
                        {batch.bankAcknowledgedAmountSar > 0 && (
                          <div className="text-[10px] text-emerald-600 font-mono mt-0.5">
                            المعتمد بالبنك: {batch.bankAcknowledgedAmountSar.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FLOATS */}
      {activeSubTab === 'floats' && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>أرصدة العهد النقدية المقيدة المخصصة للفكة (Restricted Cash Floats)</span>
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            وفق ضوابط حوكمة الخزينة الطبية، لا يتم إدراج مبالغ عهد الفكة في سيولة النقد التشغيلي المتاح للإنفاق (Available Cash)، حيث يتم تقييدها كأرصدة دائمة مخصصة لنقاط الاستقبال وصناديق الطوارئ.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-700">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-xs">صندوق الخزينة المركزي (الرئيسي)</h4>
                  <div className="text-[11px] text-neutral-500 font-mono mt-0.5">TREAS-ACC-CASH-VAULT</div>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                  25,000.00 ر.س
                </span>
              </div>
              <div className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-2">
                المسؤول: سليمان القحطاني • الموقع: الخزنة الفولاذية المركزية
              </div>
            </div>

            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-700">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-xs">عهدة فكة طوارئ واستقبال العيادات</h4>
                  <div className="text-[11px] text-neutral-500 font-mono mt-0.5">TREAS-ACC-FLOAT-ER</div>
                </div>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                  10,000.00 ر.س
                </span>
              </div>
              <div className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-2">
                المسؤول: أمين صندوق الطوارئ • مخصصة للفكة اليومية للمرضى
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: RECORD CASH HANDOVER */}
      {showHandoverModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              تسجيل استلام نقدية من كاشير المرضى
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              توثيق عد النقدية المستلمة، السندات، ورصد أي عجز أو زيادة نظامية.
            </p>

            {handoverError && (
              <div className="p-2.5 mb-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded">
                {handoverError}
              </div>
            )}

            <form onSubmit={handleCreateHandover} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">اسم الكاشير / أمين الصندوق *</label>
                <input
                  type="text"
                  required
                  value={custodianName}
                  onChange={e => setCustodianName(e.target.value)}
                  placeholder="مثال: بدر الحربي"
                  className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">موقع الاستلام / الشباك *</label>
                <input
                  type="text"
                  required
                  value={locationContext}
                  onChange={e => setLocationContext(e.target.value)}
                  className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">عدد سندات القبض *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={sourceReceiptCount}
                    onChange={e => setSourceReceiptCount(parseInt(e.target.value) || 0)}
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">نوع التسليم *</label>
                  <select
                    value={custodyType}
                    onChange={e => setCustodyType(e.target.value as any)}
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent"
                  >
                    <option value="patient_cashier_handover">تسليم إيراد كاشير مرضى</option>
                    <option value="er_emergency_handover">صندوق استقبال الطوارئ</option>
                    <option value="petty_cash_replenishment">استعاضة عهدة نثرية</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">المتوقع حسب الفواتير (SAR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={expectedAmount}
                    onChange={e => setExpectedAmount(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">الفعلي المعدود بالخزينة (SAR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={countedAmount}
                    onChange={e => setCountedAmount(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono"
                  />
                </div>
              </div>

              {Math.abs(countedAmount - expectedAmount) > 0.01 && (
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200">
                  <div className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>فارق العد: {(countedAmount - expectedAmount).toFixed(2)} ر.س</span>
                  </div>
                  <div className="mt-1">
                    <label className="block font-medium mb-0.5">سبب الفارق / تقرير أولي *</label>
                    <input
                      type="text"
                      required
                      value={varianceReason}
                      onChange={e => setVarianceReason(e.target.value)}
                      placeholder="بيان سبب النقص أو الزيادة لمحضَر التحقيق..."
                      className="w-full p-1.5 rounded border border-rose-300 dark:border-rose-700 bg-white dark:bg-neutral-900"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowHandoverModal(false)}
                  className="px-4 py-2 rounded text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
                >
                  حفظ الاستلام
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE DEPOSIT BATCH */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 max-w-lg w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              إعداد دفعة إيداع بنكي وحقيبة أمنية
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              تجميع مبالغ الكاشير المستلمة وتشميع الحقيبة برقم سيل أمني لتسليمها لشركة نقل الأموال.
            </p>

            {batchError && (
              <div className="p-2.5 mb-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded">
                {batchError}
              </div>
            )}

            <form onSubmit={handleCreateBatch} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">سجلات التسليم المتاحة للتضمين *</label>
                <div className="max-h-36 overflow-y-auto space-y-1.5 border border-neutral-200 dark:border-neutral-700 rounded p-2">
                  {availableCustodyRecords.length === 0 ? (
                    <div className="text-neutral-400 text-center py-2">لا توجد سجلات تسليم نقد بانتظار الإيداع.</div>
                  ) : (
                    availableCustodyRecords.map(rec => (
                      <label key={rec.id} className="flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 p-1.5 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCustodyIds.includes(rec.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedCustodyIds([...selectedCustodyIds, rec.id]);
                            } else {
                              setSelectedCustodyIds(selectedCustodyIds.filter(id => id !== rec.id));
                            }
                          }}
                          className="rounded text-blue-600"
                        />
                        <div className="flex-1 flex justify-between font-mono">
                          <span>{rec.id} - {rec.locationContext}</span>
                          <span className="font-bold">{rec.countedAmountSar.toLocaleString()} ر.س</span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">الحساب البنكي المودع فيه (Target Account) *</label>
                <select
                  value={targetBankAccountId}
                  onChange={e => setTargetBankAccountId(e.target.value)}
                  className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent"
                >
                  {state.accounts
                    .filter(a => a.accountType !== 'main_cash_vault' && a.accountType !== 'petty_cash_float')
                    .map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.displayNameAr} ({acc.currency})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">رقم سيل الحقيبة الأمنية *</label>
                  <input
                    type="text"
                    required
                    value={sealNumber}
                    onChange={e => setSealNumber(e.target.value)}
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">شركة نقل الأموال *</label>
                  <input
                    type="text"
                    required
                    value={carrierRef}
                    onChange={e => setCarrierRef(e.target.value)}
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-[11px] leading-relaxed">
                سيتم تحديث حالة سجلات النقد المحددة إلى (cash_deposited) وربطها برقم هذه الدفعة لضمان التتبع الكامل حتى المطابقة مع كشف الحساب البنكي.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 rounded text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                >
                  إنشاء وتشميع الدفعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
