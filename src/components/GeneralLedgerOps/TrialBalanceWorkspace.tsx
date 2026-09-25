import React, { useState } from 'react';
import { 
  Scale, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Download, 
  Search, 
  Eye, 
  FileText, 
  ArrowUpRight, 
  ArrowDownLeft,
  Filter,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  TrialBalanceSummary, 
  GeneralLedgerState, 
  AccountNode, 
  FiscalCalendar, 
  AccountingPeriod,
  GeneralLedgerVoucherEntry
} from '../../types/generalLedger';
import { calculateTrialBalance, getAccountActivitySummary } from '../../utils/generalLedgerEngine';

interface TrialBalanceWorkspaceProps {
  glState: GeneralLedgerState;
  activeCalendar: FiscalCalendar;
  activePeriod: AccountingPeriod;
  onChangePeriod: (periodId: string) => void;
  onViewVoucher: (voucherNumber: string) => void;
}

export const TrialBalanceWorkspace: React.FC<TrialBalanceWorkspaceProps> = ({
  glState,
  activeCalendar,
  activePeriod,
  onChangePeriod,
  onViewVoucher
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [inspectedAccountCode, setInspectedAccountCode] = useState<string | null>(null);

  // Compute trial balance for the currently selected period
  const trialBalance = calculateTrialBalance(glState, activePeriod.id, activeCalendar.id);

  // Filter rows
  const filteredRows = trialBalance.rows.filter(row => {
    if (selectedCategory !== 'all' && row.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const codeMatch = row.accountCode.toLowerCase().includes(q);
      const nameMatch = row.accountNameAr.toLowerCase().includes(q);
      if (!codeMatch && !nameMatch) return false;
    }
    return true;
  });

  // Inspected account activity ledger
  const accountActivity = inspectedAccountCode
    ? getAccountActivitySummary(glState, inspectedAccountCode, activePeriod.id)
    : null;

  const inspectedAccount = inspectedAccountCode
    ? glState.accounts.find(a => a.accountCode === inspectedAccountCode)
    : null;

  return (
    <div id="trial-balance-workspace" className="space-y-6">
      
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              ميزان المراجعة المحاسبي (Trial Balance Verification)
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              فترة: {activePeriod.periodNameAr} ({activePeriod.id})
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            التحقق الحسابي الدقيق من توازن دفتر الأستاذ العام (أرصدة افتتاحية + حركات الفترة = أرصدة إقفال متوازنة) مع إمكانية فحص كشف الحساب التحليلي.
          </p>
        </div>

        {/* Period Selector Controls */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span className="text-slate-400">الفترة المالية:</span>
          <select
            id="tb-period-select"
            value={activePeriod.id}
            onChange={(e) => onChangePeriod(e.target.value)}
            className="bg-transparent text-white font-mono font-bold focus:outline-none cursor-pointer"
          >
            {activeCalendar.periods.map(p => (
              <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                {p.periodNameAr} ({p.status === 'open' ? 'مفتوحة' : 'مغلقة'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Trial Balance Health Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        trialBalance.status === 'VERIFIED_BALANCED'
          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
          : trialBalance.status === 'UNBALANCED_EXCEPTION'
          ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
      }`}>
        <div className="flex items-center gap-3">
          {trialBalance.status === 'VERIFIED_BALANCED' ? (
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          ) : (
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
              <AlertCircle className="w-6 h-6" />
            </div>
          )}
          <div>
            <div className="font-bold text-sm">
              {trialBalance.status === 'VERIFIED_BALANCED' && 'ميزان المراجعة متوازن حسابياً بالكامل (VERIFIED BALANCED)'}
              {trialBalance.status === 'UNBALANCED_EXCEPTION' && 'استثناء رقابي: ميزان المراجعة غير متوازن حسابياً (UNBALANCED EXCEPTION)'}
              {trialBalance.status === 'NOT_VERIFIED_INCOMPLETE_DATA' && 'لم يكتمل التحقق: عدم اكتمال أرصدة أول المدة (INCOMPLETE DATA)'}
            </div>
            <div className="text-xs opacity-90 mt-0.5">
              {trialBalance.status === 'VERIFIED_BALANCED' && 'تتطابق القيود المدينة والدائنة للأرصدة الافتتاحية وحركات الفترة وأرصدة نهاية المدة بدقة رياضية تامة.'}
              {trialBalance.status === 'UNBALANCED_EXCEPTION' && `يوجد فارق قدره ${trialBalance.netDebitCreditDifferenceSar.toLocaleString()} ر.س بين إجمالي المدين والدائن.`}
              {trialBalance.status === 'NOT_VERIFIED_INCOMPLETE_DATA' && 'يتطلب إدخال جميع الأرصدة الافتتاحية لحسابات الأستاذ لإتمام المطابقة.'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-900/60 px-3 py-1.5 rounded border border-slate-700">
            <span className="opacity-75">إجمالي المدين:</span>{' '}
            <span className="font-bold text-emerald-400">{trialBalance.totalClosingDebitSar.toLocaleString()} ر.س</span>
          </div>
          <div className="bg-slate-900/60 px-3 py-1.5 rounded border border-slate-700">
            <span className="opacity-75">إجمالي الدائن:</span>{' '}
            <span className="font-bold text-amber-400">{trialBalance.totalClosingCreditSar.toLocaleString()} ر.س</span>
          </div>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        
        {/* Opening Balances */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <div className="font-sans text-slate-400 text-xs mb-2">أرصدة أول المدة (Opening Balances)</div>
          <div className="flex justify-between items-center text-slate-200">
            <span>مدين:</span>
            <span className="font-bold text-blue-400">{trialBalance.totalOpeningDebitSar.toLocaleString()} ر.س</span>
          </div>
          <div className="flex justify-between items-center text-slate-200 mt-1">
            <span>دائن:</span>
            <span className="font-bold text-amber-400">{trialBalance.totalOpeningCreditSar.toLocaleString()} ر.س</span>
          </div>
        </div>

        {/* Period Movements */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <div className="font-sans text-slate-400 text-xs mb-2">حركات الفترة {activePeriod.id} (Movements)</div>
          <div className="flex justify-between items-center text-slate-200">
            <span>حركة مدينة:</span>
            <span className="font-bold text-emerald-400">{trialBalance.totalPeriodDebitMovementSar.toLocaleString()} ر.س</span>
          </div>
          <div className="flex justify-between items-center text-slate-200 mt-1">
            <span>حركة دائنة:</span>
            <span className="font-bold text-purple-400">{trialBalance.totalPeriodCreditMovementSar.toLocaleString()} ر.س</span>
          </div>
        </div>

        {/* Closing Balances */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <div className="font-sans text-slate-400 text-xs mb-2">أرصدة آخر المدة (Closing Balances)</div>
          <div className="flex justify-between items-center text-slate-200">
            <span>صافي مدين:</span>
            <span className="font-bold text-emerald-400">{trialBalance.totalClosingDebitSar.toLocaleString()} ر.س</span>
          </div>
          <div className="flex justify-between items-center text-slate-200 mt-1">
            <span>صافي دائن:</span>
            <span className="font-bold text-amber-400">{trialBalance.totalClosingCreditSar.toLocaleString()} ر.س</span>
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="بحث برمز أو اسم الحساب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pr-8 pl-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">تصفية الفئة:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none cursor-pointer"
          >
            <option value="all">جميع الفئات</option>
            <option value="asset">أصول</option>
            <option value="liability">التزامات</option>
            <option value="equity">حقوق ملكية</option>
            <option value="revenue">إيرادات</option>
            <option value="expense">مصروفات</option>
          </select>
        </div>
      </div>

      {/* Trial Balance Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
              <tr>
                <th rowSpan={2} className="py-3 px-3 border-l border-slate-800 font-semibold">رمز الحساب</th>
                <th rowSpan={2} className="py-3 px-3 border-l border-slate-800 font-semibold">اسم الحساب</th>
                <th colSpan={2} className="py-2 px-3 border-l border-slate-800 text-center bg-slate-900/50 font-semibold">
                  أرصدة أول المدة
                </th>
                <th colSpan={2} className="py-2 px-3 border-l border-slate-800 text-center bg-slate-900/70 font-semibold">
                  حركات الفترة
                </th>
                <th colSpan={2} className="py-2 px-3 border-l border-slate-800 text-center bg-slate-900/50 font-semibold">
                  أرصدة نهاية المدة
                </th>
                <th rowSpan={2} className="py-3 px-3 text-left font-semibold">كشف الحساب</th>
              </tr>
              <tr className="border-t border-slate-800 text-[11px] font-mono">
                <th className="py-1 px-3 text-blue-400 border-l border-slate-800 text-center">مدين</th>
                <th className="py-1 px-3 text-amber-400 border-l border-slate-800 text-center">دائن</th>
                <th className="py-1 px-3 text-emerald-400 border-l border-slate-800 text-center">مدين</th>
                <th className="py-1 px-3 text-purple-400 border-l border-slate-800 text-center">دائن</th>
                <th className="py-1 px-3 text-emerald-400 border-l border-slate-800 text-center">مدين</th>
                <th className="py-1 px-3 text-amber-400 border-l border-slate-800 text-center">دائن</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredRows.map(row => (
                <tr key={row.accountId} className="hover:bg-slate-800/40 transition-colors">
                  
                  {/* Account Code */}
                  <td className="py-2.5 px-3 font-bold text-white border-l border-slate-800/60 whitespace-nowrap">
                    {row.accountCode}
                  </td>

                  {/* Account Name */}
                  <td className="py-2.5 px-3 font-sans text-slate-200 border-l border-slate-800/60">
                    <div className="font-medium">{row.accountNameAr}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {row.normalBalance === 'debit' ? 'طبيعة مدينة' : 'طبيعة دائنة'}
                    </div>
                  </td>

                  {/* Opening Debit */}
                  <td className="py-2.5 px-3 border-l border-slate-800/60 text-center text-slate-300">
                    {row.openingDebitSar > 0 ? row.openingDebitSar.toLocaleString() : '-'}
                  </td>

                  {/* Opening Credit */}
                  <td className="py-2.5 px-3 border-l border-slate-800/60 text-center text-slate-300">
                    {row.openingCreditSar > 0 ? row.openingCreditSar.toLocaleString() : '-'}
                  </td>

                  {/* Period Debit Movement */}
                  <td className="py-2.5 px-3 border-l border-slate-800/60 text-center text-emerald-400 font-bold">
                    {row.periodDebitMovementSar > 0 ? row.periodDebitMovementSar.toLocaleString() : '-'}
                  </td>

                  {/* Period Credit Movement */}
                  <td className="py-2.5 px-3 border-l border-slate-800/60 text-center text-purple-400 font-bold">
                    {row.periodCreditMovementSar > 0 ? row.periodCreditMovementSar.toLocaleString() : '-'}
                  </td>

                  {/* Closing Debit */}
                  <td className="py-2.5 px-3 border-l border-slate-800/60 text-center text-emerald-400 font-bold bg-slate-950/20">
                    {row.closingDebitSar > 0 ? row.closingDebitSar.toLocaleString() : '-'}
                  </td>

                  {/* Closing Credit */}
                  <td className="py-2.5 px-3 border-l border-slate-800/60 text-center text-amber-400 font-bold bg-slate-950/20">
                    {row.closingCreditSar > 0 ? row.closingCreditSar.toLocaleString() : '-'}
                  </td>

                  {/* Drill-down action */}
                  <td className="py-2.5 px-3 font-sans text-left whitespace-nowrap">
                    <button
                      onClick={() => setInspectedAccountCode(row.accountCode)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-bold cursor-pointer flex items-center gap-1"
                      title="استعراض حركة كشف الحساب التفصيلي"
                    >
                      <Eye className="w-3 h-3" />
                      <span>كشف حساب</span>
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
            {/* Table Summary Footer */}
            <tfoot className="bg-slate-950 font-mono font-bold text-white border-t-2 border-slate-700 text-xs">
              <tr>
                <td colSpan={2} className="py-3 px-3 font-sans text-left border-l border-slate-800">
                  الإجمالي العام لميزان المراجعة (Grand Totals):
                </td>
                <td className="py-3 px-3 text-center border-l border-slate-800 text-blue-400">
                  {trialBalance.totalOpeningDebitSar.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-center border-l border-slate-800 text-amber-400">
                  {trialBalance.totalOpeningCreditSar.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-center border-l border-slate-800 text-emerald-400">
                  {trialBalance.totalPeriodDebitMovementSar.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-center border-l border-slate-800 text-purple-400">
                  {trialBalance.totalPeriodCreditMovementSar.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-center border-l border-slate-800 text-emerald-400 bg-slate-900/80">
                  {trialBalance.totalClosingDebitSar.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-center border-l border-slate-800 text-amber-400 bg-slate-900/80">
                  {trialBalance.totalClosingCreditSar.toLocaleString()}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ACCOUNT ACTIVITY LEDGER DRILL-DOWN MODAL */}
      {inspectedAccount && accountActivity && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full p-6 space-y-4 shadow-2xl text-xs my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-white text-sm">
                    كشف حساب الأستاذ العام: {inspectedAccount.accountCode} - {inspectedAccount.nameAr}
                  </h3>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">
                  طبيعة الرصيد: {inspectedAccount.normalBalance === 'debit' ? 'مدين (Debit)' : 'دائن (Credit)'} • الفترة: {activePeriod.id}
                </span>
              </div>
              <button
                onClick={() => setInspectedAccountCode(null)}
                className="text-slate-400 hover:text-white text-base cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Account Activity Summary Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono">
              <div>
                <span className="text-slate-500 font-sans">رصيد أول المدة:</span>
                <div className="font-bold text-blue-400 text-sm">
                  {accountActivity.openingBalanceSar.toLocaleString()} ر.س
                </div>
              </div>
              <div>
                <span className="text-slate-500 font-sans">إجمالي المدين:</span>
                <div className="font-bold text-emerald-400 text-sm">
                  {accountActivity.totalDebitSar.toLocaleString()} ر.س
                </div>
              </div>
              <div>
                <span className="text-slate-500 font-sans">إجمالي الدائن:</span>
                <div className="font-bold text-amber-400 text-sm">
                  {accountActivity.totalCreditSar.toLocaleString()} ر.س
                </div>
              </div>
              <div>
                <span className="text-slate-500 font-sans">الرصيد الختامي:</span>
                <div className="font-bold text-white text-sm">
                  {accountActivity.closingBalanceSar.toLocaleString()} ر.س
                </div>
              </div>
            </div>

            {/* Activity Entries List */}
            <div className="border border-slate-800 rounded-lg overflow-hidden max-h-72 overflow-y-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 text-slate-400 sticky top-0 font-sans">
                  <tr>
                    <th className="py-2 px-3">التاريخ</th>
                    <th className="py-2 px-3">رقم السند</th>
                    <th className="py-2 px-3">مركز التكلفة / القسم</th>
                    <th className="py-2 px-3">البيان</th>
                    <th className="py-2 px-3">مدين (SAR)</th>
                    <th className="py-2 px-3">دائن (SAR)</th>
                    <th className="py-2 px-3">الرصيد التراكمي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {accountActivity.lines.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-500 font-sans">
                        لا توجد حركات مرحلة على هذا الحساب خلال الفترة المالية المحددة.
                      </td>
                    </tr>
                  ) : (
                    accountActivity.lines.map((line, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="py-2 px-3 text-slate-300">{line.accountingDate}</td>
                        <td className="py-2 px-3 text-emerald-400 font-bold">
                          <button
                            onClick={() => {
                              onViewVoucher(line.voucherNumber);
                              setInspectedAccountCode(null);
                            }}
                            className="hover:underline cursor-pointer"
                          >
                            {line.voucherNumber}
                          </button>
                        </td>
                        <td className="py-2 px-3 text-slate-400 font-sans">
                          {line.dimensions.costCenterCode || line.dimensions.departmentId || '-'}
                        </td>
                        <td className="py-2 px-3 font-sans text-slate-200">{line.descriptionAr}</td>
                        <td className="py-2 px-3 text-emerald-400">{(line.debitSar ?? line.debit ?? 0) > 0 ? (line.debitSar ?? line.debit ?? 0).toLocaleString() : '-'}</td>
                        <td className="py-2 px-3 text-amber-400">{(line.creditSar ?? line.credit ?? 0) > 0 ? (line.creditSar ?? line.credit ?? 0).toLocaleString() : '-'}</td>
                        <td className="py-2 px-3 text-white font-bold">{line.runningBalanceSar.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setInspectedAccountCode(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
