import React, { useState } from 'react';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRightLeft,
  Sparkles,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  FileText,
  Clock,
  ExternalLink,
  Lock,
  Plus
} from 'lucide-react';
import {
  TreasuryState,
  BankStatementLine,
  BankReconciliationMatch,
  TreasuryException
} from '../../types/treasury';
import {
  createReconciliationMatch,
  reverseReconciliationMatch
} from '../../utils/treasuryEngine';

interface ReconciliationExceptionsWorkspaceProps {
  state: TreasuryState;
  onStateUpdate: (newState: TreasuryState) => void;
}

export const ReconciliationExceptionsWorkspace: React.FC<ReconciliationExceptionsWorkspaceProps> = ({
  state,
  onStateUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'workbench' | 'matches' | 'exceptions'>('workbench');

  // Selected for matching
  const [selectedBankLineIds, setSelectedBankLineIds] = useState<string[]>([]);
  const [selectedInternalRefs, setSelectedInternalRefs] = useState<string[]>([]);

  // Reverse match modal
  const [showReverseModal, setShowReverseModal] = useState(false);
  const [selectedMatchForReverse, setSelectedMatchForReverse] = useState<BankReconciliationMatch | null>(null);
  const [reverseReason, setReverseReason] = useState('');

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const activeRec = state.reconciliations[0];

  // Aggregate all unmatched bank statement lines
  const allUnmatchedBankLines: BankStatementLine[] = state.statements.flatMap(s =>
    s.lines.filter(l => l.matchStatus === 'unmatched')
  );

  // Internal candidates:
  // 1. Payment Instructions that are confirmed or submitted
  const internalPaymentCandidates = state.instructions.filter(
    i => i.status === 'confirmed' || i.status === 'simulated_external_submitted'
  );

  // 2. Deposit batches
  const internalDepositCandidates = state.depositBatches.filter(
    b => b.status === 'bag_sealed_and_logged' || b.status === 'submitted_to_cash_carrier'
  );

  // Calculations for selection
  const selectedBankLines = allUnmatchedBankLines.filter(l => selectedBankLineIds.includes(l.id));
  const totalSelectedBankAmount = selectedBankLines.reduce((sum, l) => sum + l.amount, 0);

  let totalSelectedInternalAmount = 0;
  selectedInternalRefs.forEach(ref => {
    const inst = internalPaymentCandidates.find(i => i.id === ref);
    if (inst) totalSelectedInternalAmount += inst.amount;
    const dep = internalDepositCandidates.find(d => d.id === ref);
    if (dep) totalSelectedInternalAmount += dep.expectedDepositAmountSar;
  });

  const differenceAmount = Math.abs(totalSelectedBankAmount - totalSelectedInternalAmount);
  const isExactMatch = selectedBankLineIds.length > 0 && selectedInternalRefs.length > 0 && differenceAmount < 0.01;

  const handleExecuteMatch = () => {
    setActionError(null);
    setActionSuccess(null);

    if (!activeRec) {
      setActionError('لا توجد جلسة مطابقة نشطة.');
      return;
    }

    const actor = state.activePersona === 'reconciliation_reviewer'
      ? 'محمد الدوسري (مراجع التسويات البنكية)'
      : 'سليمان القحطاني (مدير الخزينة)';

    const res = createReconciliationMatch(
      state,
      activeRec.id,
      selectedBankLineIds,
      selectedInternalRefs,
      actor
    );

    if (!res.success) {
      setActionError(res.error || 'فشلت عملية المطابقة');
      return;
    }

    if (res.newState) {
      onStateUpdate(res.newState);
      setSelectedBankLineIds([]);
      setSelectedInternalRefs([]);
      setActionSuccess(`تمت المطابقة بنجاح وربط الحركات البنكية بالدفتر الداخلي.`);
    }
  };

  const handleOpenReverse = (match: BankReconciliationMatch) => {
    setSelectedMatchForReverse(match);
    setReverseReason('');
    setActionError(null);
    setShowReverseModal(true);
  };

  const handleExecuteReverse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchForReverse || !activeRec) return;

    const actor = state.activePersona === 'reconciliation_reviewer'
      ? 'محمد الدوسري (مراجع التسويات البنكية)'
      : 'سليمان القحطاني (مدير الخزينة)';

    const res = reverseReconciliationMatch(
      state,
      activeRec.id,
      selectedMatchForReverse.id,
      reverseReason,
      actor
    );

    if (!res.success) {
      setActionError(res.error || 'فشل إلغاء المطابقة');
      return;
    }

    if (res.newState) {
      onStateUpdate(res.newState);
      setShowReverseModal(false);
      setActionSuccess(`تم فك الارتباط وإلغاء المطابقة بنجاح وإعادة الأسطر لقائمة غير المطابق.`);
    }
  };

  return (
    <div id="reconciliation-exceptions-workspace" className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Scale className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>منصة المطابقة البنكية والاستثناءات (Bank Reconciliation & Exceptions)</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            مطابقة أسطر كشف الحساب مع دفاتر الخزينة الداخلية (1-to-1, 1-to-many, many-to-one)، وإدارة الفروقات والرسوم البنكية المكتشفة.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <div className="inline-flex rounded-lg border border-neutral-200 dark:border-neutral-700 p-0.5 bg-neutral-100 dark:bg-neutral-800 text-xs">
            <button
              onClick={() => setActiveTab('workbench')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'workbench'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              طاولة المطابقة الثنائية ({allUnmatchedBankLines.length})
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'matches'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              المطابقات المعتمدة ({activeRec?.matches.filter(m => !m.isReversed).length || 0})
            </button>
            <button
              onClick={() => setActiveTab('exceptions')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'exceptions'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              الاستثناءات والرسوم ({state.exceptions.length})
            </button>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* TAB 1: TWO-COLUMN INTERACTIVE RECONCILIATION WORKBENCH */}
      {activeTab === 'workbench' && (
        <div className="space-y-4">
          {/* Matching Status Summary Action Bar */}
          <div className="bg-gradient-to-r from-purple-50 via-white to-blue-50 dark:from-purple-950/20 dark:via-neutral-900 dark:to-blue-950/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs font-mono">
              <div>
                <span className="text-neutral-500 block text-[11px]">مجموع البنك المحدد:</span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                  {totalSelectedBankAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                </span>
              </div>
              <ArrowRightLeft className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <span className="text-neutral-500 block text-[11px]">مجموع الدفتر المحدد:</span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                  {totalSelectedInternalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                </span>
              </div>
              <div className="border-r border-neutral-300 dark:border-neutral-700 pr-4">
                <span className="text-neutral-500 block text-[11px]">الفارق (Variance):</span>
                <span className={`font-bold text-sm ${differenceAmount < 0.01 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {differenceAmount.toFixed(2)} ر.س
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={!isExactMatch}
                onClick={handleExecuteMatch}
                className={`px-4 py-2 rounded-lg font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 ${
                  isExactMatch
                    ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer'
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>اعتماد المطابقة ({selectedBankLineIds.length} بنك ↔ {selectedInternalRefs.length} دفتر)</span>
              </button>
            </div>
          </div>

          {/* Dual Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Bank Statement Lines */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
                <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span>حركات كشف الحساب البنكي غير المطابقة ({allUnmatchedBankLines.length})</span>
                </h3>
                <span className="text-[10px] text-neutral-500 font-mono">Bank Lines</span>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {allUnmatchedBankLines.length === 0 ? (
                  <div className="text-center py-10 text-xs text-neutral-400">
                    جميع أسطر كشف الحساب مطابقة بنجاح!
                  </div>
                ) : (
                  allUnmatchedBankLines.map(line => {
                    const isSelected = selectedBankLineIds.includes(line.id);
                    const isDebit = line.direction === 'debit';

                    return (
                      <div
                        key={line.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedBankLineIds(selectedBankLineIds.filter(id => id !== line.id));
                          } else {
                            setSelectedBankLineIds([...selectedBankLineIds, line.id]);
                          }
                        }}
                        className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 shadow-sm'
                            : 'bg-neutral-50/60 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded text-purple-600 pointer-events-none"
                            />
                            <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                              {line.bankReference || line.id}
                            </span>
                          </div>
                          <span
                            className={`font-mono font-bold text-xs ${
                              isDebit ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {isDebit ? '-' : '+'}
                            {line.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                          </span>
                        </div>

                        <div className="mt-1.5 text-neutral-700 dark:text-neutral-300 text-[11px] leading-relaxed">
                          {line.descriptionAr}
                        </div>

                        <div className="mt-2 flex justify-between items-center text-[10px] text-neutral-400 font-mono">
                          <span>تاريخ القيمة: {line.valueDate || line.bookingDate}</span>
                          <span>{isDebit ? 'خصم بنكي' : 'إيداع بنكي'}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Internal Book Candidates */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
                <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>حركات الخزينة الدفترية الداخلية (أوامر صرف وإيداعات)</span>
                </h3>
                <span className="text-[10px] text-neutral-500 font-mono">Book Transactions</span>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {/* 1. Payment Instructions */}
                {internalPaymentCandidates.map(inst => {
                  const isSelected = selectedInternalRefs.includes(inst.id);
                  return (
                    <div
                      key={inst.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedInternalRefs(selectedInternalRefs.filter(ref => ref !== inst.id));
                        } else {
                          setSelectedInternalRefs([...selectedInternalRefs, inst.id]);
                        }
                      }}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 shadow-sm'
                          : 'bg-neutral-50/60 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded text-blue-600 pointer-events-none"
                          />
                          <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                            {inst.id}
                          </span>
                          <span className="text-[10px] bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.2 rounded font-sans">
                            أمر صرف سريع
                          </span>
                        </div>
                        <span className="font-mono font-bold text-xs text-rose-600 dark:text-rose-400">
                          -{inst.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                        </span>
                      </div>

                      <div className="mt-1.5 text-neutral-700 dark:text-neutral-300 text-[11px]">
                        المستفيد: {inst.beneficiaryName}
                      </div>

                      <div className="mt-2 flex justify-between items-center text-[10px] text-neutral-400 font-mono">
                        <span>المجدول: {inst.scheduledDate}</span>
                        <span>{inst.status === 'bank_confirmed' ? 'مؤكد بنكياً' : 'مرسل'}</span>
                      </div>
                    </div>
                  );
                })}

                {/* 2. Deposit Batches */}
                {internalDepositCandidates.map(dep => {
                  const isSelected = selectedInternalRefs.includes(dep.id);
                  return (
                    <div
                      key={dep.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedInternalRefs(selectedInternalRefs.filter(ref => ref !== dep.id));
                        } else {
                          setSelectedInternalRefs([...selectedInternalRefs, dep.id]);
                        }
                      }}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-sm'
                          : 'bg-neutral-50/60 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded text-emerald-600 pointer-events-none"
                          />
                          <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                            {dep.batchNumber}
                          </span>
                          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded font-sans">
                            دفعة إيداع كاش
                          </span>
                        </div>
                        <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                          +{dep.expectedDepositAmountSar.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                        </span>
                      </div>

                      <div className="mt-1.5 text-neutral-700 dark:text-neutral-300 text-[11px]">
                        سيل الحقيبة: {dep.cashBagSealNumber} • {dep.carrierReference}
                      </div>

                      <div className="mt-2 flex justify-between items-center text-[10px] text-neutral-400 font-mono">
                        <span>تاريخ الإرسال: {dep.submissionDate}</span>
                        <span>{dep.custodyRecordIds.length} سندات نقد</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE MATCHES & REVERSAL */}
      {activeTab === 'matches' && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
            <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
              المطابقات المعتمدة المسجلة في الجلسة ({activeRec?.matches.length || 0})
            </h3>
            <span className="text-xs text-neutral-500">
              يمكن إلغاء أي مطابقة مع توثيق السبب وإعادة الحركة للمطابقة
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 bg-neutral-50 dark:bg-neutral-800/40">
                  <th className="p-3">رقم المطابقة</th>
                  <th className="p-3">طبيعة المطابقة</th>
                  <th className="p-3">أسطر كشف الحساب</th>
                  <th className="p-3">مراجع الحركات الدفترية</th>
                  <th className="p-3">المبلغ المطابق</th>
                  <th className="p-3">المسؤول ووقت المطابقة</th>
                  <th className="p-3">الإجراء الرقابي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {activeRec?.matches.map(m => (
                  <tr
                    key={m.id}
                    className={`hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 ${
                      m.isReversed ? 'opacity-50 line-through' : ''
                    }`}
                  >
                    <td className="p-3 font-mono font-bold text-neutral-900 dark:text-neutral-100">{m.id}</td>

                    <td className="p-3">
                      <span className="text-[10px] font-mono bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded">
                        {m.matchNature}
                      </span>
                    </td>

                    <td className="p-3 font-mono text-neutral-700 dark:text-neutral-300">
                      {m.bankStatementLineIds.join(', ')}
                    </td>

                    <td className="p-3 font-mono text-neutral-700 dark:text-neutral-300">
                      {m.internalTransactionReferences.join(', ')}
                    </td>

                    <td className="p-3 font-mono font-bold text-neutral-900 dark:text-neutral-100">
                      {m.matchedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                    </td>

                    <td className="p-3 text-neutral-500">
                      <div>{m.matchedByStaffName}</div>
                      <div className="text-[10px] font-mono text-neutral-400">{m.matchedAt}</div>
                    </td>

                    <td className="p-3">
                      {m.isReversed ? (
                        <span className="text-[10px] text-rose-600 font-semibold">تم إلغاؤها سابقاً</span>
                      ) : (
                        <button
                          onClick={() => handleOpenReverse(m)}
                          className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 border border-rose-200 dark:border-rose-800 px-2 py-1 rounded"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>إلغاء المطابقة (Reverse)</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TREASURY EXCEPTIONS & BANK CHARGES BRIDGE */}
      {activeTab === 'exceptions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.exceptions.map(exc => (
              <div
                key={exc.id}
                className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-sm space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">{exc.titleAr}</h4>
                      <div className="text-[10px] text-neutral-400 font-mono">
                        {exc.id} • {exc.exceptionType}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                    {exc.status === 'open_investigation'
                      ? 'قيد التحقيق'
                      : exc.status === 'action_proposed'
                      ? 'مقترح إجراء'
                      : 'تمت المعالجة'}
                  </span>
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {exc.descriptionAr}
                </p>

                <div className="flex justify-between items-center text-xs font-mono pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-500">القيمة:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    {exc.amountSar.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                  </span>
                </div>

                {exc.proposedAccountingReference && (
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded border border-blue-200 dark:border-blue-800 text-[11px] text-blue-900 dark:text-blue-200">
                    <div className="font-semibold flex items-center gap-1 mb-0.5">
                      <ExternalLink className="w-3 h-3" />
                      <span>قيد المعالجة المقترح لدفتر الأستاذ العام (Suggested GL Bridge):</span>
                    </div>
                    <div className="font-mono text-[10px] text-blue-700 dark:text-blue-300">
                      {exc.proposedAccountingReference}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: REVERSE MATCH WITH MANDATORY JUSTIFICATION */}
      {showReverseModal && selectedMatchForReverse && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              إلغاء مطابقة بنكية (Reverse Reconciliation Match)
            </h3>
            <p className="text-xs text-neutral-500 mb-4 font-mono">
              رقم المطابقة: {selectedMatchForReverse.id} • المبلغ: {selectedMatchForReverse.matchedAmount} ر.س
            </p>

            <form onSubmit={handleExecuteReverse} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">سبب إلغاء المطابقة (إلزامي للتدقيق الرقابي) *</label>
                <textarea
                  required
                  rows={3}
                  value={reverseReason}
                  onChange={e => setReverseReason(e.target.value)}
                  placeholder="بيان سبب فك الارتباط، مثل اكتشاف خطأ في رقم الإشعار أو تكرار بالدفتر..."
                  className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent"
                />
              </div>

              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                سيتم إعادة أسطر كشف الحساب المعنية إلى حالة (unmatched) وتسجيل محضر إلغاء في السجل الرقابي.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowReverseModal(false)}
                  className="px-4 py-2 rounded text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm"
                >
                  تأكيد فك الارتباط
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
