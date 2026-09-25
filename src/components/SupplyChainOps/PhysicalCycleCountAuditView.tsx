import React, { useState } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Search,
  Building2,
  Calendar,
  X,
  History,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import {
  CycleCountBatch,
  CycleCountLine,
  ItemMasterRecord,
  StorageLocation,
  PhysicalStockBalance
} from '../../types/supplyChainOps';

interface PhysicalCycleCountAuditViewProps {
  cycleCountBatches: CycleCountBatch[];
  stockBalances: PhysicalStockBalance[];
  catalogItems: ItemMasterRecord[];
  locations: StorageLocation[];
  onApproveCycleCountVariance: (batchId: string, lineId: string, approvedBy: string, reason: string) => void;
  onApplyCycleCountAdjustment?: (batchId: string, lineId: string, appliedBy: string) => void;
  onRequestRecount?: (batchId: string, lineId: string, requestedBy: string) => void;
  onRecordBlindCount?: (batchId: string, lineId: string, countedQty: number, countedBy: string) => void;
  onOpenScenarioModal?: () => void;
}

export const PhysicalCycleCountAuditView: React.FC<PhysicalCycleCountAuditViewProps> = ({
  cycleCountBatches,
  stockBalances,
  catalogItems,
  locations,
  onApproveCycleCountVariance,
  onApplyCycleCountAdjustment,
  onRequestRecount,
  onRecordBlindCount,
  onOpenScenarioModal
}) => {
  const [selectedBatchId, setSelectedBatchId] = useState<string>(cycleCountBatches[0]?.id || '');
  const [selectedLineForAdjustment, setSelectedLineForAdjustment] = useState<{ batchId: string; line: CycleCountLine } | null>(null);
  const [approverName, setApproverName] = useState<string>('د. طارق الحازمي (المراقب المالي وسلاسل الإمداد)');
  const [adjustmentReason, setAdjustmentReason] = useState<string>('تلف أثناء النقل الداخلي تم إتلافه دون تقييد مسبق، تم اعتماد التسوية المالية وتعديل الرصيد.');
  const [auditPhase, setAuditPhase] = useState<'audit_reconciliation' | 'blind_field_counting'>('audit_reconciliation');
  const [blindCountInput, setBlindCountInput] = useState<{ [lineId: string]: number }>({});
  const [blindCounterName, setBlindCounterName] = useState<string>('سعد المنصور (مدقق الجرد الميداني)');

  const itemMap = new Map<string, ItemMasterRecord>(catalogItems.map(i => [i.id, i]));
  const locationMap = new Map<string, StorageLocation>(locations.map(l => [l.id, l]));

  const activeBatch = cycleCountBatches.find(b => b.id === selectedBatchId) || cycleCountBatches[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <span>الجرد الدوري والتدقيق الميداني للمخزون (Cycle Counting & Inventory Audit)</span>
          </h2>
          <p className="text-xs text-slate-400">
            مطابقة الأرصدة الفعلية على الرفوف مع السجلات النظامية، حصر الفروقات والفاقد، واعتماد التسويات الرقابية (Scenarios I24 & I25).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Blind Count Phase Switcher */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setAuditPhase('blind_field_counting')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                auditPhase === 'blind_field_counting'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              مرحلة العد الميداني الأعمى (Blind Count)
            </button>
            <button
              onClick={() => setAuditPhase('audit_reconciliation')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                auditPhase === 'audit_reconciliation'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              مطابقة وتدقيق المراقب المالي (Reconciliation)
            </button>
          </div>

          <select
            value={selectedBatchId}
            onChange={e => setSelectedBatchId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono font-bold cursor-pointer"
          >
            {cycleCountBatches.map(b => (
              <option key={b.id} value={b.id}>
                {b.batchNumber} — {b.cycleScope}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Blind Count Regulatory Banner */}
      {auditPhase === 'blind_field_counting' ? (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>وضع الجرد الأعمى (Blind Count Mode):</strong> تُحجب الأرصدة الدفترية المسجلة بالنظام تماماً عن فريق الفحص الميداني لمنع التحيز وضمان النزاهة التامة في عد الرفوف، ولا تُكشف المقارنة إلا بعد رفع المحضر للاعتماد الرقابي.
          </span>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/60 text-emerald-200 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>مرحلة التسوية والمطابقة المالية:</strong> تم كشف الأرصدة الدفترية ومقارنتها بالعد الميداني المحفوظ. لا يتم تعديل أي رصيد فعلي في السجل العام إلا بمصادقة المراقب المالي الصريحة.
          </span>
        </div>
      )}

      {/* Batch Overview Banner */}
      {activeBatch && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-emerald-400">{activeBatch.batchNumber}</span>
                <span className="text-xs text-slate-400 font-mono">📅 تاريخ الجرد: {activeBatch.scheduledDate}</span>
              </div>
              <div className="text-xs text-slate-300 mt-1">
                المدقق الميداني: <span className="font-bold text-white">{activeBatch.auditorName}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800">
                {activeBatch.status === 'reconciliation_pending' ? 'بانتظار اعتماد تسوية الفروقات (I24)' : 'مكتمل ومعتمد'}
              </span>
            </div>
          </div>

          {/* Lines Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-[11px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">رمز واسم الصنف</th>
                  <th className="p-3">موقع الرف المدقق</th>
                  <th className="p-3">التشغيلة</th>
                  <th className="p-3 text-center">الرصيد الدفتري للنظام</th>
                  <th className="p-3 text-center font-bold text-white">العدد الفعلي الميداني</th>
                  <th className="p-3 text-center">الفارق (Variance)</th>
                  <th className="p-3">حالة التسوية</th>
                  <th className="p-3 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {activeBatch.lines.map(line => {
                  const item = itemMap.get(line.itemId);
                  const isNegativeVariance = line.varianceQty < 0;
                  const isPositiveVariance = line.varianceQty > 0;

                  return (
                    <tr key={line.lineId} className="hover:bg-slate-800/40">
                      <td className="p-3 font-sans">
                        <div className="font-bold text-white">{item?.nameAr || line.itemId}</div>
                        <div className="text-[11px] text-amber-400 font-mono">{item?.code}</div>
                      </td>

                      <td className="p-3 font-sans">
                        <div className="text-slate-200">{line.locationId}</div>
                      </td>

                      <td className="p-3">
                        <div className="text-slate-200">{line.lotNumber || 'بدون تشغيلة'}</div>
                      </td>

                      <td className="p-3 text-center font-bold text-slate-400">
                        {auditPhase === 'blind_field_counting' ? (
                          <span className="text-amber-400/80 font-mono tracking-wider italic text-[11px] bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                            *** [محجوب بالجرد الأعمى]
                          </span>
                        ) : (
                          <span>{line.systemRecordedQty} {line.uom}</span>
                        )}
                      </td>

                      <td className="p-3 text-center font-extrabold text-white text-sm bg-slate-950/60">
                        {line.physicalCountedQty} {line.uom}
                      </td>

                      <td className="p-3 text-center font-extrabold text-sm">
                        {auditPhase === 'blind_field_counting' ? (
                          <span className="text-slate-500 font-mono text-[11px]">[يُحسب بعد رفع المحضر]</span>
                        ) : isNegativeVariance ? (
                          <span className="text-red-400">{line.varianceQty} (عجز/فقد)</span>
                        ) : isPositiveVariance ? (
                          <span className="text-emerald-400">+{line.varianceQty} (زيادة)</span>
                        ) : (
                          <span className="text-slate-500">0 (مطابق)</span>
                        )}
                      </td>

                      <td className="p-3 font-sans whitespace-nowrap">
                        {auditPhase === 'blind_field_counting' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                            العد الميداني قيد الإجراء
                          </span>
                        ) : line.reconciliationStatus === 'recount_in_progress' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-1 w-fit">
                            <History className="w-3 h-3" />
                            إعادة العد قيد التنفيذ (Recount)
                          </span>
                        ) : line.reconciliationStatus === 'stale_rejected' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1 w-fit" title={line.adjustmentReason}>
                            <AlertTriangle className="w-3 h-3" />
                            مرفوض - جرد قديم (Stale Count)
                          </span>
                        ) : line.reconciliationStatus === 'pending_approval' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                            بانتظار الاعتماد الرقابي (I24)
                          </span>
                        ) : line.reconciliationStatus === 'approved_pending_action' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                            معتمد رقابياً (بانتظار التطبيق)
                          </span>
                        ) : line.reconciliationStatus === 'adjusted' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            تمت التسوية وتعديل الرصيد
                          </span>
                        ) : (
                          <span className="text-slate-500">مطابق تماماً</span>
                        )}
                      </td>

                      <td className="p-3 text-center font-sans whitespace-nowrap">
                        {auditPhase === 'blind_field_counting' ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min="0"
                              placeholder={String(line.physicalCountedQty)}
                              className="w-16 px-1.5 py-1 text-center bg-slate-900 border border-slate-700 rounded text-xs text-white"
                              value={blindCountInput[line.lineId] ?? ''}
                              onChange={e => {
                                const val = parseInt(e.target.value, 10);
                                setBlindCountInput(prev => ({ ...prev, [line.lineId]: isNaN(val) ? 0 : val }));
                              }}
                            />
                            <button
                              onClick={() => {
                                const qty = blindCountInput[line.lineId] ?? line.physicalCountedQty;
                                onRecordBlindCount?.(activeBatch.id, line.lineId, qty, blindCounterName);
                              }}
                              className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] cursor-pointer"
                            >
                              قيد
                            </button>
                          </div>
                        ) : line.reconciliationStatus === 'pending_approval' ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedLineForAdjustment({ batchId: activeBatch.id, line })}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition-colors"
                            >
                              اعتماد التسوية &larr;
                            </button>
                            <button
                              onClick={() => onRequestRecount?.(activeBatch.id, line.lineId, approverName)}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[11px] cursor-pointer border border-slate-700"
                              title="طلب إعادة عد ثانية بواسطة فريق رقابي مستقل"
                            >
                              طلب إعادة عد
                            </button>
                          </div>
                        ) : line.reconciliationStatus === 'approved_pending_action' ? (
                          <button
                            onClick={() => onApplyCycleCountAdjustment?.(activeBatch.id, line.lineId, approverName)}
                            className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer transition-colors shadow-xs"
                          >
                            تطبيق التسوية المخزنية &larr;
                          </button>
                        ) : line.reconciliationStatus === 'stale_rejected' ? (
                          <button
                            onClick={() => onRequestRecount?.(activeBatch.id, line.lineId, approverName)}
                            className="px-2.5 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 font-bold text-[11px] cursor-pointer border border-rose-700 flex items-center gap-1"
                          >
                            <History className="w-3 h-3" />
                            طلب إعادة عد (مطلوب)
                          </button>
                        ) : line.reconciliationStatus === 'recount_in_progress' ? (
                          <span className="text-purple-400 text-xs font-mono">قيد العد الميداني</span>
                        ) : (
                          <span className="text-slate-500 text-xs">مغلق</span>
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

      {/* Variance Adjustment Approval Modal (Scenario I24 & I25) */}
      {selectedLineForAdjustment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>اعتماد تسوية الفارق الجردي وتعديل الرصيد (Scenario I24)</span>
              </div>
              <button
                onClick={() => setSelectedLineForAdjustment(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              تعديل رصيد المخزون الدفتري ليطابق العد الفعلي الميداني مع تثبيت محضر العجز/الزيادة في السجل الرقابي والمالي للمستشفى:
            </p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
              <div className="text-white font-bold">
                الفارق المطلوب تسويته: {selectedLineForAdjustment.line.varianceQty} {selectedLineForAdjustment.line.uom}
              </div>
              <div className="text-slate-400">
                الرصيد الدفتري الحالي: {selectedLineForAdjustment.line.systemRecordedQty} &rarr; الرصيد الجديد بعد التسوية: {selectedLineForAdjustment.line.physicalCountedQty}
              </div>
              <div className="text-amber-400/90 text-[11px] pt-1">
                🛡️ الضابط الرقابي: الفصل بين المصادقة المالية (Approval) وتطبيق القيد المخزني (Adjustment Application).
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">المسؤول المصادق على التسوية:</label>
                <input
                  type="text"
                  value={approverName}
                  onChange={e => setApproverName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">سبب ومبرر التسوية (Justification):</label>
                <textarea
                  rows={3}
                  value={adjustmentReason}
                  onChange={e => setAdjustmentReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedLineForAdjustment(null)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  onApproveCycleCountVariance(
                    selectedLineForAdjustment.batchId,
                    selectedLineForAdjustment.line.lineId,
                    approverName,
                    adjustmentReason
                  );
                  setSelectedLineForAdjustment(null);
                }}
                className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-amber-200 font-bold text-xs cursor-pointer border border-amber-700/50"
              >
                اعتماد رقابي فقط (بانتظار التطبيق)
              </button>
              <button
                type="button"
                onClick={() => {
                  onApproveCycleCountVariance(
                    selectedLineForAdjustment.batchId,
                    selectedLineForAdjustment.line.lineId,
                    approverName,
                    adjustmentReason
                  );
                  onApplyCycleCountAdjustment?.(
                    selectedLineForAdjustment.batchId,
                    selectedLineForAdjustment.line.lineId,
                    approverName
                  );
                  setSelectedLineForAdjustment(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                اعتماد وتطبيق فوري على المخزون الفعلي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
