import React, { useState } from 'react';
import { 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  ArrowRightLeft, 
  Eye, 
  DollarSign,
  Layers,
  FileCheck
} from 'lucide-react';
import { 
  GeneralLedgerState, 
  GlReconciliationRecord 
} from '../../types/generalLedger';
import { calculateReconciliationDiscrepancies } from '../../utils/generalLedgerEngine';

interface GlReconciliationWorkspaceProps {
  glState: GeneralLedgerState;
}

export const GlReconciliationWorkspace: React.FC<GlReconciliationWorkspaceProps> = ({
  glState
}) => {
  const [selectedRecord, setSelectedRecord] = useState<GlReconciliationRecord | null>(null);

  // Compute live reconciliation records
  const reconciliations = calculateReconciliationDiscrepancies(glState, glState.activePeriodId);

  const balancedCount = reconciliations.filter(r => r.status === 'reconciled').length;
  const discrepancyCount = reconciliations.filter(r => r.status === 'discrepancy' || r.status === 'missing_valuation').length;

  return (
    <div id="gl-reconciliation-workspace" className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white">
            مطابقة دفتر الأستاذ العام مع الأنظمة الفرعية (Subledger Reconciliation)
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          مطابقة دورية بين أرصدة الحسابات الرقابية في دفتر الأستاذ العام (مثل الموردين، المخزون، والبنك) ومجاميع السجلات بالأنظمة الفرعية مع الإفصاح الأمين عن الفروقات.
        </p>

        {/* Honest Disclosure Principle (GL26) */}
        <div className="mt-3 p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-cyan-200 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">
              مبدأ الإفصاح الرقابي الصريح (GL26):
            </span>
            <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
              إذا كان النظام الفرعي للمخزون أو المشتريات لا يملك آلية تقييم مالي مكتملة، يتم <b>الإفصاح الصريح عن ذلك</b> كفارق تسوية وملاحظة رقابية معلنة بدلاً من إخفائها أو تزييف توازن غير حقيقي.
            </p>
          </div>
        </div>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="font-sans text-slate-400">إجمالي الحسابات الرقابية المفحوصة</div>
          <div className="text-2xl font-bold text-white mt-1">{reconciliations.length}</div>
          <div className="font-sans text-[11px] text-slate-500 mt-1">موردين، مخزون، نقدية، ومدينين</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="font-sans text-slate-400">حسابات متطابقة تماماً (Reconciled)</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{balancedCount}</div>
          <div className="font-sans text-[11px] text-slate-500 mt-1">لا يوجد أي فارق بين الأستاذ والفرعي</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="font-sans text-slate-400">فروقات واستثناءات مفصح عنها</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">{discrepancyCount}</div>
          <div className="font-sans text-[11px] text-slate-500 mt-1">تتطلب تسوية بنكية أو استكمال تقييم المخزون</div>
        </div>
      </div>

      {/* Reconciliations Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 font-semibold">الحساب الرقابي بالأستاذ</th>
                <th className="py-3 px-3 font-semibold">النظام الفرعي المقابل</th>
                <th className="py-3 px-3 font-semibold">رصيد دفتر الأستاذ (SAR)</th>
                <th className="py-3 px-3 font-semibold">رصيد النظام الفرعي (SAR)</th>
                <th className="py-3 px-3 font-semibold">الفارق الحسابي (Variance)</th>
                <th className="py-3 px-3 font-semibold">حالة المطابقة</th>
                <th className="py-3 px-3 font-semibold text-left">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {reconciliations.map(rec => {
                const isReconciled = rec.status === 'reconciled';
                const isDiscrepancy = rec.status === 'discrepancy';
                const isMissing = rec.status === 'missing_valuation';

                return (
                  <tr key={rec.id} className="hover:bg-slate-800/40">
                    
                    {/* GL Account */}
                    <td className="py-3 px-3 font-sans">
                      <div className="font-mono font-bold text-white">{rec.glControlAccountCode}</div>
                      <div className="text-[11px] text-slate-400">{rec.glControlAccountNameAr}</div>
                    </td>

                    {/* Subledger Type */}
                    <td className="py-3 px-3 font-sans text-slate-300 whitespace-nowrap">
                      {rec.subledgerType === 'accounts_payable' ? 'أستاذ الموردين المساعد (AP Subledger)' :
                       rec.subledgerType === 'inventory' ? 'نظام المستودعات وتقييم المخزون' :
                       rec.subledgerType === 'bank' ? 'كشف الحساب البنكي / التسويات' :
                       'حسابات المرضى والشركات الضامنة'}
                    </td>

                    {/* GL Balance */}
                    <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                      {rec.glBalanceSar.toLocaleString()} ر.س
                    </td>

                    {/* Subledger Balance */}
                    <td className="py-3 px-3 font-bold text-slate-300 whitespace-nowrap">
                      {rec.subledgerBalanceSar.toLocaleString()} ر.س
                    </td>

                    {/* Variance */}
                    <td className="py-3 px-3 font-bold whitespace-nowrap">
                      {rec.varianceSar === 0 ? (
                        <span className="text-emerald-400">0.00 ر.س</span>
                      ) : (
                        <span className="text-rose-400">{rec.varianceSar.toLocaleString()} ر.س</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 font-sans whitespace-nowrap">
                      {isReconciled && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>مطابق بالكامل</span>
                        </span>
                      )}
                      {isDiscrepancy && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1 w-fit">
                          <AlertCircle className="w-3 h-3 text-rose-400" />
                          <span>يوجد فارق تسوية</span>
                        </span>
                      )}
                      {isMissing && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          <span>تقييم غير مكتمل</span>
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 font-sans text-left whitespace-nowrap">
                      <button
                        onClick={() => setSelectedRecord(rec)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-cyan-400" />
                        <span>مذكرة التسوية</span>
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reconciliation Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">
                  مذكرة مطابقة الحساب الرقابي: {selectedRecord.glControlAccountCode}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-white text-base cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono">
              <div>
                <span className="text-slate-400 font-sans">رصيد الأستاذ العام (GL):</span>
                <div className="font-bold text-white text-sm">{selectedRecord.glBalanceSar.toLocaleString()} ر.س</div>
              </div>
              <div>
                <span className="text-slate-400 font-sans">رصيد النظام الفرعي:</span>
                <div className="font-bold text-slate-300 text-sm">{selectedRecord.subledgerBalanceSar.toLocaleString()} ر.س</div>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-800">
                <span className="text-slate-400 font-sans">الفارق المحاسبي:</span>
                <div className={`font-bold text-sm ${selectedRecord.varianceSar === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {selectedRecord.varianceSar.toLocaleString()} ر.س
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
              <span className="font-bold text-white">إيضاح ومذكرة التسوية الرقابية:</span>
              <p className="text-slate-300 leading-relaxed">
                {selectedRecord.notesAr}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRecord(null)}
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
