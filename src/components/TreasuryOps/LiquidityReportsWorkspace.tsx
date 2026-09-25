import React, { useState } from 'react';
import {
  TrendingUp,
  Landmark,
  ArrowRightLeft,
  Calendar,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
  Plus
} from 'lucide-react';
import { TreasuryState } from '../../types/treasury';
import {
  calculateTreasuryLiquidity,
  executeInterAccountTransfer
} from '../../utils/treasuryEngine';

interface LiquidityReportsWorkspaceProps {
  state: TreasuryState;
  onStateUpdate: (newState: TreasuryState) => void;
}

export const LiquidityReportsWorkspace: React.FC<LiquidityReportsWorkspaceProps> = ({
  state,
  onStateUpdate
}) => {
  const liquidityViews = calculateTreasuryLiquidity(state);
  const sarLiquidity = liquidityViews.find(v => v.currency === 'SAR') || liquidityViews[0];
  const liquidity = {
    totalAvailableSar: sarLiquidity ? sarLiquidity.demoAvailableCashSar : 0,
    totalRestrictedSar: sarLiquidity ? sarLiquidity.restrictedFloatBalance : 0
  };

  // Transfer Modal
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [sourceAccId, setSourceAccId] = useState('TREAS-ACC-SNB-01');
  const [targetAccId, setTargetAccId] = useState('TREAS-ACC-RJ-02');
  const [transferAmount, setTransferAmount] = useState(150000.0);
  const [transferPurpose, setTransferPurpose] = useState('تغطية مسيرات رواتب الكادر الطبي والتمريضي');
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError(null);
    setTransferSuccess(null);

    const actor = state.activePersona === 'treasury_clerk'
      ? 'طارق العمري (كاتب الخزينة)'
      : 'سليمان القحطاني (مدير الخزينة)';

    const res = executeInterAccountTransfer(state, {
      sourceAccountId: sourceAccId,
      destinationAccountId: targetAccId,
      amount: transferAmount,
      currency: 'SAR',
      notesAr: transferPurpose,
      actor
    });

    if (!res.success) {
      setTransferError(res.error || 'فشل تنفيذ التحويل الداخلي بين الحسابات');
      return;
    }

    if (res.newState) {
      onStateUpdate(res.newState);
      setShowTransferModal(false);
      setTransferSuccess(`تم تنفيذ التحويل الداخلي بنجاح بقيمة ${transferAmount.toLocaleString()} ر.س وتم تحديث أرصدة الحسابات.`);
    }
  };

  // Mock 14-day rolling cash flow projection days
  const rollingProjection = [
    { day: 'اليوم (22 سبت)', inflow: 350000, outflow: 145000, net: 205000, balance: 14853000, sourceCategory: 'حركات الصندوق وحوالات AP المعتمدة' },
    { day: '+1 يوم (23 سبت)', inflow: 420000, outflow: 80000, net: 340000, balance: 15193000, sourceCategory: 'مقبوضات كاشير متوقعة' },
    { day: '+2 يوم (24 سبت)', inflow: 280000, outflow: 120000, net: 160000, balance: 15353000, sourceCategory: 'تحصيلات متوقعة ودفعات موردين' },
    { day: '+3 يوم (25 سبت)', inflow: 190000, outflow: 350000, net: -160000, balance: 15193000, sourceCategory: 'مدفوعات أدوية ومستلزمات دورية' },
    { day: '+5 يوم (27 سبت - مسير الرواتب)', inflow: 500000, outflow: 4800000, net: -4300000, balance: 10893000, isPayrollFixture: true, sourceCategory: 'عينة رواتب محاكاة [SYNTHETIC DEMO FIXTURE]' },
    { day: '+7 يوم (29 سبت)', inflow: 850000, outflow: 210000, net: 640000, balance: 11533000, sourceCategory: 'تسويات نقطية وصناديق' },
    { day: '+14 يوم (06 أكت - تسوية التأمين)', inflow: 3200000, outflow: 450000, net: 2750000, balance: 14283000, sourceCategory: 'تقدير دفعات شركات التأمين (محاكاة)' }
  ];

  return (
    <div id="liquidity-reports-workspace" className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>موقف السيولة والتنبؤ بالتدفقات النقدية (Liquidity & Cash Forecasting)</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            متابعة السيولة المتاحة والودائع المقيدة، التحويلات بين البنوك، وسلم التنبؤ النقدي للـ 14 يوماً القادمة.
          </p>
        </div>

        <button
          onClick={() => setShowTransferModal(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>تحويل سيولة بين البنوك (Inter-Account Transfer)</span>
        </button>
      </div>

      {transferSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{transferSuccess}</span>
        </div>
      )}

      {/* KPI Cards: Net Liquid vs Restricted */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 text-xs mb-1">
            <span>السيولة النقدية الحرة المتاحة (Available SAR)</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
            {liquidity.totalAvailableSar.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>جاهزة لمقابلة مسيرات الرواتب والموردين</span>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 text-xs mb-1">
            <span>الأرصدة المقيدة والضمانات (Restricted SAR)</span>
            <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
            {liquidity.totalRestrictedSar.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            عهدة فكة + حساب الضمان المشروط للأجهزة الطبية
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 text-xs mb-1">
            <span>إجمالي المركز المالي للخزينة (Total Treasury)</span>
            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600">
              <Landmark className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
            {(liquidity.totalAvailableSar + liquidity.totalRestrictedSar).toLocaleString('en-US', {
              minimumFractionDigits: 2
            })}{' '}
            ر.س
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">
            عبر {state.accounts.length} حسابات وصناديق معتمدة
          </div>
        </div>
      </div>

      {/* 14-Day Rolling Cash Flow Projection Ladder */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>سلم التنبؤ بالسيولة المتوقعة (14-Day Rolling Cash Flow Ladder)</span>
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                INCOMPLETE — عينة استرشادية غير مكتملة المصادر آلياً
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              توقع التدفقات الداخلة والخارجة (الرواتب، الموردين) ورصيد الأمان المستهدف.
            </p>
          </div>
          <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded text-neutral-600 dark:text-neutral-300 font-mono">
            الحد الأدنى للأمان: 5,000,000 ر.س
          </span>
        </div>

        {/* Payroll Source Integrity & Incomplete Notice */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-lg text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>تنويه نزاهة مصادر البيانات وسلّم السيولة (Payroll & Forecast Source Integrity):</span>
          </div>
          <p className="text-amber-700 dark:text-amber-300 leading-relaxed text-[11px]">
            لا يوجد ربط برمجي مباشر مع نظام الرواتب أو شؤون الموظفين (<strong>Payroll Finance Integration is NOT connected</strong>). مسيرات الرواتب المعروضة في سلم التنبؤ أدناه هي <strong>عينة محاكاة استرشادية مصطنعة فقط (Synthetic Demo Fixture)</strong> وليست بيانات استحقاق فعلية. تم وسم هذا التنبؤ بعلامة <strong>INCOMPLETE</strong> لعدم اكتمال التغذية الآلية الشاملة.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 bg-neutral-50 dark:bg-neutral-800/40">
                <th className="p-3">الفترة الزمنية</th>
                <th className="p-3">تصنيف المصدر</th>
                <th className="p-3">المتحصلات المتوقعة (+)</th>
                <th className="p-3">المدفوعات والالتزامات (-)</th>
                <th className="p-3">صافي التدفق اليومي</th>
                <th className="p-3">الرصيد التراكمي المتوقع</th>
                <th className="p-3">مؤشر كفاية السيولة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-mono">
              {rollingProjection.map((row, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 ${
                    row.isPayrollFixture ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                  }`}
                >
                  <td className="p-3 font-sans font-semibold text-neutral-900 dark:text-neutral-100">
                    <div className="flex items-center gap-1.5">
                      <span>{row.day}</span>
                      {row.isPayrollFixture && (
                        <span className="text-[9px] bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 px-1 py-0.2 rounded font-sans font-bold">
                          محاكاة رواتب
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-3 font-sans text-[11px] text-neutral-500 dark:text-neutral-400">
                    {row.sourceCategory}
                  </td>

                  <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                    +{row.inflow.toLocaleString()} ر.س
                  </td>

                  <td className="p-3 text-rose-600 dark:text-rose-400 font-semibold">
                    -{row.outflow.toLocaleString()} ر.س
                  </td>

                  <td className="p-3 font-bold">
                    <span className={row.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {row.net >= 0 ? '+' : ''}
                      {row.net.toLocaleString()} ر.س
                    </span>
                  </td>

                  <td className="p-3 font-bold text-neutral-900 dark:text-neutral-100">
                    {row.balance.toLocaleString()} ر.س
                  </td>

                  <td className="p-3 font-sans">
                    {row.balance > 10000000 ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        سيولة ممتازة
                      </span>
                    ) : row.balance > 5000000 ? (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                        ضمن نطاق الأمان
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                        تنبيه عجز متوقع
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Internal Transfers History */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
          سجل التحويلات الداخلية بين حسابات الخزينة (Inter-Account Transfers)
        </h3>

        {state.interAccountTransfers.length === 0 ? (
          <div className="text-xs text-neutral-400 text-center py-4">
            لم يتم تسجيل تحويلات داخلية في الجلسة الحالية.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {state.interAccountTransfers.map(tx => {
              const src = state.accounts.find(a => a.id === tx.sourceAccountId);
              const tgt = state.accounts.find(a => a.id === tx.targetAccountId);

              return (
                <div key={tx.id} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                      من: {src?.displayNameAr} ← إلى: {tgt?.displayNameAr}
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      الغرض: {tx.purposeAr} • المسؤول: {tx.authorizedByStaffName}
                    </div>
                  </div>
                  <div className="text-left font-mono">
                    <div className="font-bold text-blue-600 dark:text-blue-400">
                      {tx.amountSar.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                    </div>
                    <div className="text-[10px] text-neutral-400">{tx.timestamp}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: INTER-ACCOUNT TRANSFER */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              تحويل سيولة داخلي بين الحسابات البنكية
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              إعادة توزيع السيولة (مثل تغذية حساب الرواتب أو صندوق العمليات التشغيلية).
            </p>

            {transferError && (
              <div className="p-2.5 mb-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded">
                {transferError}
              </div>
            )}

            <form onSubmit={handleExecuteTransfer} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">الحساب المصدر (Source Account) *</label>
                <select
                  value={sourceAccId}
                  onChange={e => setSourceAccId(e.target.value)}
                  className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent"
                >
                  {state.accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.displayNameAr} ({acc.currency}) - الرصيد: {acc.currentLedgerBalance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">الحساب المحول إليه (Target Account) *</label>
                <select
                  value={targetAccId}
                  onChange={e => setTargetAccId(e.target.value)}
                  className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent"
                >
                  {state.accounts
                    .filter(a => a.id !== sourceAccId)
                    .map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.displayNameAr} ({acc.currency})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">مبلغ التحويل (SAR) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={transferAmount}
                  onChange={e => setTransferAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">الغرض والمبرر المالي للتحويل *</label>
                <input
                  type="text"
                  required
                  value={transferPurpose}
                  onChange={e => setTransferPurpose(e.target.value)}
                  className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent"
                />
              </div>

              <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 text-[11px] leading-relaxed">
                ضابط السيولة: لا يُسمح بالتحويل خارج حدود الرصيد المتاح، ولا يُسمح بالسحب من حسابات الضمان المشروطة المقيدة دون موافقة استثنائية.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                >
                  تأكيد التحويل البنكي
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
