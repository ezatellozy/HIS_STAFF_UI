import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Calendar,
  Landmark,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Search,
  Eye
} from 'lucide-react';
import { TreasuryState, BankStatement, BankStatementLine } from '../../types/treasury';
import {
  importBankStatement,
  validateBankStatement
} from '../../utils/treasuryEngine';

interface BankStatementsWorkspaceProps {
  state: TreasuryState;
  onStateUpdate: (newState: TreasuryState) => void;
  onNavigateToReconciliation?: () => void;
}

export const BankStatementsWorkspace: React.FC<BankStatementsWorkspaceProps> = ({
  state,
  onStateUpdate,
  onNavigateToReconciliation
}) => {
  const [selectedStatementId, setSelectedStatementId] = useState<string>(
    state.statements[0]?.id || ''
  );
  const [showImportModal, setShowImportModal] = useState(false);

  // Import form state
  const [importAccountId, setImportAccountId] = useState('TREAS-ACC-SNB-01');
  const [importRef, setImportRef] = useState(`STMT-SNB-2026-W${Math.floor(30 + Math.random() * 10)}`);
  const [importFormat, setImportFormat] = useState<BankStatement['importFormat']>('camt_053');
  const [importPeriodStart, setImportPeriodStart] = useState('2026-09-22');
  const [importPeriodEnd, setImportPeriodEnd] = useState('2026-09-22');
  const [importOpening, setImportOpening] = useState(1485300.0);
  const [importClosing, setImportClosing] = useState(1485300.0);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const selectedStatement = state.statements.find(s => s.id === selectedStatementId) || state.statements[0];
  const targetAccount = state.accounts.find(a => a.id === selectedStatement?.bankAccountId);

  // Validation report of selected statement
  const validationReport = selectedStatement ? validateBankStatement(selectedStatement) : null;

  const handleImportStatement = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(null);
    setImportSuccess(null);

    const res = importBankStatement(state, {
      statementReferenceNumber: importRef,
      bankAccountId: importAccountId,
      importFormat,
      currency: 'SAR',
      periodStart: importPeriodStart,
      periodEnd: importPeriodEnd,
      openingBalance: importOpening,
      closingBalance: importClosing,
      lines: [
        {
          bookingDate: importPeriodEnd,
          valueDate: importPeriodEnd,
          amount: 50.0,
          direction: 'debit',
          descriptionAr: 'رسوم خدمة الصرف الفوري والرسائل المصرفية',
          bankReference: `FEE-${Date.now().toString().slice(-4)}`,
          transactionType: 'bank_charge'
        }
      ]
    });

    if (!res.success) {
      setImportError(res.error || 'فشل استيراد كشف الحساب البنكي');
      return;
    }

    if (res.newState) {
      onStateUpdate(res.newState);
      setShowImportModal(false);
      if (res.statementId) setSelectedStatementId(res.statementId);
      setImportSuccess(`تم استيراد كشف الحساب البنكي بنجاح وتدقيق الحسابات الرياضية.`);
    }
  };

  return (
    <div id="bank-statements-workspace" className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>كشوف الحسابات البنكية (Bank Statements Intake & Audit)</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            استيعاب كشوف الحساب بصيغ ISO 20022 (camt.053) و MT940، فحص تسلسل الأرصدة، وتدقيق العمليات الحسابية بدقة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>استيراد كشف حساب (محاكاة)</span>
          </button>
        </div>
      </div>

      {importSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{importSuccess}</span>
          </div>
          {onNavigateToReconciliation && (
            <button
              onClick={onNavigateToReconciliation}
              className="font-bold underline text-xs text-emerald-700 dark:text-emerald-300"
            >
              الانتقال لشاشة المطابقة
            </button>
          )}
        </div>
      )}

      {/* Main Grid: Statements List (Left) and Statement Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Statements List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            كشوف الحسابات المسجلة ({state.statements.length})
          </h3>

          <div className="space-y-2">
            {state.statements.map(stmt => {
              const acc = state.accounts.find(a => a.id === stmt.bankAccountId);
              const isSelected = stmt.id === selectedStatement?.id;
              const val = validateBankStatement(stmt);

              return (
                <div
                  key={stmt.id}
                  onClick={() => setSelectedStatementId(stmt.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-50/50 dark:bg-purple-950/30 border-purple-400 dark:border-purple-600 shadow-sm'
                      : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-xs text-neutral-900 dark:text-neutral-100 font-mono">
                        {stmt.statementReferenceNumber}
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        {acc?.displayNameAr} ({stmt.currency})
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-1.5 py-0.5 rounded">
                      {stmt.importFormat}
                    </span>
                  </div>

                  <div className="mt-3 flex justify-between items-center text-[11px] text-neutral-600 dark:text-neutral-400 border-t border-neutral-100 dark:border-neutral-800/80 pt-2 font-mono">
                    <span>الفترة: {stmt.periodEnd}</span>
                    <span>{stmt.lines.length} حركات</span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-neutral-500">الرصيد الختامي:</span>
                    <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                      {stmt.closingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} {stmt.currency}
                    </span>
                  </div>

                  {val.isValid ? (
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>مطابق حسابياً</span>
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                      <AlertTriangle className="w-3 h-3" />
                      <span>خلل حسابي في الرصيد ({Math.abs((stmt.openingBalance + val.calculatedMovementTotal) - stmt.closingBalance)} ر.س)</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Statement Inspector & Line Items */}
        <div className="lg:col-span-2 space-y-4">
          {selectedStatement ? (
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm space-y-5">
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      كشف حساب: {selectedStatement.statementReferenceNumber}
                    </h3>
                    <span className="text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded font-mono font-bold">
                      {selectedStatement.importFormat}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    الحساب البنكي: {targetAccount?.displayNameAr} • {targetAccount?.internalAccountCode} • العملة: {selectedStatement.currency}
                  </div>
                </div>

                <div className="text-left font-mono text-xs text-neutral-500">
                  <div>الفترة: {selectedStatement.periodStart} إلى {selectedStatement.periodEnd}</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">تاريخ الاستيراد: {selectedStatement.importedAt}</div>
                </div>
              </div>

              {/* Balance Continuity & Mathematical Audit Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-lg border border-neutral-200/70 dark:border-neutral-700">
                  <span className="text-neutral-500 block text-[11px]">الرصيد الافتتاحي:</span>
                  <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 text-sm mt-1 block">
                    {selectedStatement.openingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200/70 dark:border-emerald-800">
                  <span className="text-emerald-700 dark:text-emerald-400 block text-[11px]">إجمالي الإيداعات (+):</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm mt-1 block">
                    +{selectedStatement.totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-lg border border-rose-200/70 dark:border-rose-800">
                  <span className="text-rose-700 dark:text-rose-400 block text-[11px]">إجمالي المسحوبات (-):</span>
                  <span className="font-mono font-bold text-rose-700 dark:text-rose-400 text-sm mt-1 block">
                    -{selectedStatement.totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-lg border border-neutral-200/70 dark:border-neutral-700">
                  <span className="text-neutral-500 block text-[11px]">الرصيد الختامي:</span>
                  <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 text-sm mt-1 block">
                    {selectedStatement.closingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Arithmetic Audit Validation Result */}
              {validationReport && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                    validationReport.isValid
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {validationReport.isValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{validationReport.errors.length > 0 ? validationReport.errors.join(' • ') : 'كشف الحساب مطابق حسابياً ومتسق مع الرصيد الافتتاحي.'}</span>
                  </div>
                  <span className="font-mono font-bold text-[11px]">
                    الفرق الرياضي: {Math.abs((selectedStatement.openingBalance + validationReport.calculatedMovementTotal) - selectedStatement.closingBalance)} {selectedStatement.currency}
                  </span>
                </div>
              )}

              {/* Statement Lines Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    أسطر الحركات البنكية (Statement Transaction Lines)
                  </h4>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {selectedStatement.lines.length} حركات مسجلة
                  </span>
                </div>

                <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 bg-neutral-50 dark:bg-neutral-800/40">
                        <th className="p-2.5">تاريخ القيد والقيمة</th>
                        <th className="p-2.5">نوع الحركة</th>
                        <th className="p-2.5">المبلغ ({selectedStatement.currency})</th>
                        <th className="p-2.5">المرجع البنكي</th>
                        <th className="p-2.5">البيان والشرح المصرفي</th>
                        <th className="p-2.5">حالة المطابقة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {selectedStatement.lines.map(line => {
                        const isDebit = line.type === 'debit';
                        return (
                          <tr key={line.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40">
                            <td className="p-2.5 font-mono text-neutral-600 dark:text-neutral-400">
                              <div>{line.bookingDate}</div>
                              <div className="text-[10px] text-neutral-400">قيمة: {line.valueDate}</div>
                            </td>

                            <td className="p-2.5">
                              {isDebit ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
                                  <ArrowUpRight className="w-3 h-3" /> مدين (خصم)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                                  <ArrowDownLeft className="w-3 h-3" /> دائن (إيداع)
                                </span>
                              )}
                            </td>

                            <td className="p-2.5 font-mono font-bold">
                              <span className={isDebit ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                                {isDebit ? '-' : '+'}
                                {line.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </span>
                            </td>

                            <td className="p-2.5 font-mono text-neutral-700 dark:text-neutral-300 text-[11px]">
                              {line.proprietaryBankReference || line.bankTransactionCode}
                            </td>

                            <td className="p-2.5 text-neutral-800 dark:text-neutral-200 max-w-xs">
                              {line.remittanceInformationAr}
                            </td>

                            <td className="p-2.5">
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                  line.matchStatus === 'matched'
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                    : line.matchStatus === 'exception'
                                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                                }`}
                              >
                                {line.matchStatus === 'matched'
                                  ? 'تمت المطابقة'
                                  : line.matchStatus === 'exception'
                                  ? 'استثناء مفتوح'
                                  : 'غير مطابق'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-8 text-center text-xs text-neutral-400">
              اختر كشف حساب من القائمة لعرض تفاصيله وأسطره وتدقيق الحسابات.
            </div>
          )}
        </div>
      </div>

      {/* MODAL: IMPORT BANK STATEMENT */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              استيراد كشف حساب بنكي (Bank Statement Import Simulation)
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              محاكاة استيعاب كشف حساب من البنك بصيغة ISO 20022 أو MT940 مع التدقيق الآلي للرصيد.
            </p>

            {importError && (
              <div className="p-2.5 mb-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded">
                {importError}
              </div>
            )}

            <form onSubmit={handleImportStatement} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">الحساب البنكي *</label>
                <select
                  value={importAccountId}
                  onChange={e => setImportAccountId(e.target.value)}
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
                  <label className="block font-medium mb-1">رقم مرجع الكشف *</label>
                  <input
                    type="text"
                    required
                    value={importRef}
                    onChange={e => setImportRef(e.target.value)}
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">صيغة الملف *</label>
                  <select
                    value={importFormat}
                    onChange={e => setImportFormat(e.target.value as any)}
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent"
                  >
                    <option value="camt_053">ISO 20022 (camt.053 XML)</option>
                    <option value="mt940">SWIFT MT940 Text</option>
                    <option value="bai2">BAI2 Cash Format</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">تاريخ بداية الفترة *</label>
                  <input
                    type="date"
                    required
                    value={importPeriodStart}
                    onChange={e => setImportPeriodStart(e.target.value)}
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">تاريخ نهاية الفترة *</label>
                  <input
                    type="date"
                    required
                    value={importPeriodEnd}
                    onChange={e => setImportPeriodEnd(e.target.value)}
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">الرصيد الافتتاحي (Opening) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={importOpening}
                    onChange={e => setImportOpening(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">الرصيد الختامي (Closing) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={importClosing}
                    onChange={e => setImportClosing(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700 text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                يتحقق المحرك آلياً من عدم تكرار رقم مرجع الكشف، وتطابق عملة الكشف مع عملة الحساب، ومطابقة الرصيد الرياضي.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-sm"
                >
                  استيراد وتدقيق
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
