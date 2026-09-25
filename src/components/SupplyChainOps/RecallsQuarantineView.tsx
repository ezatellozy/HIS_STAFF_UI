import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertOctagon,
  CheckCircle2,
  Lock,
  Unlock,
  AlertTriangle,
  History,
  Layers,
  Sparkles,
  FileText,
  X,
  Search,
  Building2,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import {
  PhysicalStockBalance,
  ItemMasterRecord,
  StorageLocation,
  SupplyRecallRecord
} from '../../types/supplyChainOps';

interface RecallsQuarantineViewProps {
  recalls: any[];
  stockBalances: PhysicalStockBalance[];
  catalogItems: ItemMasterRecord[];
  locations: StorageLocation[];
  onTriggerRecallSweep: (recallId: string) => void;
  onAcknowledgeLocationRecall?: (recallId: string, locationId: string) => void;
  onReleaseQuarantine: (balanceId: string, authorizedBy: string, rationale: string) => void;
  onOpenScenarioModal?: () => void;
}

export const RecallsQuarantineView: React.FC<RecallsQuarantineViewProps> = ({
  recalls,
  stockBalances,
  catalogItems,
  locations,
  onTriggerRecallSweep,
  onAcknowledgeLocationRecall,
  onReleaseQuarantine,
  onOpenScenarioModal
}) => {
  const [selectedRecallId, setSelectedRecallId] = useState<string>(recalls[0]?.id || '');
  const [releaseTargetBalance, setReleaseTargetBalance] = useState<PhysicalStockBalance | null>(null);
  const [releaseAuthorizedBy, setReleaseAuthorizedBy] = useState('د. منى السالم (مديرة ضمان الجودة الدوائية والطبية)');
  const [releaseRationale, setReleaseRationale] = useState('تم استلام شهادة المطابقة المحدثة من المختبر المرجعي الوطني وتأكيد سلامة التشغيلة مخبرياً.');
  const [activeTab, setActiveTab] = useState<'recalls' | 'quarantine_balances'>('recalls');

  const itemMap = new Map<string, ItemMasterRecord>(catalogItems.map(i => [i.id, i]));
  const locationMap = new Map<string, StorageLocation>(locations.map(l => [l.id, l]));

  // Quarantined stock items
  const quarantinedBalances = stockBalances.filter(b => b.quarantined > 0);

  const selectedRecall = recalls.find(r => r.id === selectedRecallId) || recalls[0];

  // Schema normalization helpers
  const getRecallRef = (r: any) => r.recallReference || r.recallNoticeNumber || r.id;
  const getIssuingAgency = (r: any) => r.initiatingAgency || r.issuingAgency || 'الهيئة العامة للغذاء والدواء (SFDA)';
  const getReason = (r: any) => r.recallReasonAr || r.hazardDescription || 'اشتباه في جودة وسلامة التصنيع';
  const getSeverity = (r: any) => r.severity || r.recallClass || 'class_2_urgent';
  const getLots = (r: any): string[] => r.affectedLotNumbers || r.affectedLots || [];
  const getDate = (r: any) => r.alertDate || r.issuedAt || '2026-09-18';
  const getItemId = (r: any) => r.itemId || r.affectedItemCode || 'ITEM-MS-001';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <span>إدارة استدعاءات السلامة والحجر الفني (Product Recalls & Quarantine Engine)</span>
          </h2>
          <p className="text-xs text-slate-400">
            الاستجابة الفورية لتعاميم هيئة الغذاء والدواء، حصر التشغيلات المتأثرة، حظر الصرف، وعزلها بالأجنحة والمستودعات (Scenario I22 & I23).
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
          <button
            onClick={() => setActiveTab('recalls')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'recalls'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            تعاميم الاستدعاء النشطة ({recalls.length})
          </button>
          <button
            onClick={() => setActiveTab('quarantine_balances')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'quarantine_balances'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            الأرصدة المحجورة ({quarantinedBalances.length})
          </button>
        </div>
      </div>

      {activeTab === 'recalls' ? (
        /* Recalls Master View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recalls List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400">إشعارات الاستدعاء المعتمدة:</h3>
            <div className="space-y-2">
              {recalls.map(rec => {
                const isSelected = selectedRecall?.id === rec.id;
                const sev = getSeverity(rec);
                const isClass1 = sev === 'class_1_critical';

                return (
                  <div
                    key={rec.id}
                    onClick={() => setSelectedRecallId(rec.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-red-950/40 border-red-500 shadow-sm'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white">{getRecallRef(rec)}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isClass1
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-amber-600 text-white'
                      }`}>
                        {isClass1 ? 'فئة حرجة 1 (Class I)' : 'فئة 2 (Class II)'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-200 font-bold mt-1 line-clamp-1">
                      {getReason(rec)}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                      <span className="text-amber-400">تشغيلة: {getLots(rec).join(', ')}</span>
                      <span className="text-slate-400">{getDate(rec)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recall Details & Sweep Execution */}
          <div className="lg:col-span-2">
            {selectedRecall ? (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertOctagon className="w-5 h-5 text-red-500" />
                      <span className="font-mono text-sm font-bold text-white">{getRecallRef(selectedRecall)}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">الجهة المصدرة: {getIssuingAgency(selectedRecall)}</div>
                  </div>

                  <div className="font-mono text-xs">
                    <span className="text-slate-400">حالة المسح الشامل: </span>
                    <span className={`font-bold uppercase ${
                      selectedRecall.notificationStatus === 'reconciliation_complete' || selectedRecall.status === 'quarantine_enforced'
                        ? 'text-emerald-400'
                        : 'text-amber-400 animate-pulse'
                    }`}>
                      {selectedRecall.notificationStatus === 'reconciliation_complete' || selectedRecall.status === 'quarantine_enforced'
                        ? 'مكتمل ومحجور بالكامل (Sweep Enforced - I22)'
                        : 'جاري المسح الميداني والحظر (Quarantine In Progress)'}
                    </span>
                  </div>
                </div>

                {/* Tracking Metrics KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                    <div className="text-slate-400 text-[10px]">إجمالي الوحدات المستهدفة</div>
                    <div className="text-base font-extrabold text-white mt-1">
                      {selectedRecall.totalUnitsLocated || 140}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                    <div className="text-slate-400 text-[10px]">المحجور في المستودعات</div>
                    <div className="text-base font-extrabold text-red-400 mt-1">
                      {selectedRecall.totalUnitsQuarantined !== undefined ? selectedRecall.totalUnitsQuarantined : 120}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                    <div className="text-slate-400 text-[10px]">المتبقي للتأكيد بالأجنحة</div>
                    <div className="text-base font-extrabold text-amber-400 mt-1">
                      {Math.max(0, (selectedRecall.totalUnitsLocated || 140) - (selectedRecall.totalUnitsQuarantined || 120))}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                    <div className="text-slate-400 text-[10px]">الرصيد المتاح للصرف</div>
                    <div className="text-base font-extrabold text-red-500 mt-1">
                      0 (محظور تماماً)
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 space-y-1">
                    <div className="font-bold text-white">وصف الخطر السريري والتحذير الرقابي:</div>
                    <p className="leading-relaxed">{getReason(selectedRecall)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 font-mono">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <div className="text-slate-400 text-[11px]">رمز واسم الصنف المتأثر:</div>
                      <div className="font-bold text-amber-300">
                        {itemMap.get(getItemId(selectedRecall))?.nameAr || getItemId(selectedRecall)}
                      </div>
                      <div className="text-[10px] text-slate-400">{getItemId(selectedRecall)}</div>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <div className="text-slate-400 text-[11px]">أرقام التشغيلات الخاضعة للسحب:</div>
                      <div className="font-bold text-red-400">{getLots(selectedRecall).join(', ')}</div>
                    </div>
                  </div>

                  {/* Affected Locations Breakdown Table */}
                  {selectedRecall.affectedLocations && selectedRecall.affectedLocations.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="font-bold text-white text-xs flex items-center justify-between">
                        <span>مواقع تواجد التشغيلة وموقف الحظر بالأجنحة (Locations Status):</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {selectedRecall.affectedLocations.filter((l: any) => l.unitsQuarantined >= l.unitsFound).length} / {selectedRecall.affectedLocations.length} مواقع مؤمنة
                        </span>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-slate-950 text-slate-400 text-[10px] font-mono border-b border-slate-800">
                            <tr>
                              <th className="p-2.5">الموقع / القسم</th>
                              <th className="p-2.5 text-center">إشعار القسم</th>
                              <th className="p-2.5 text-center">الكمية الموجودة</th>
                              <th className="p-2.5 text-center">الكمية المعزولة</th>
                              <th className="p-2.5 text-center">الإجراء الميداني</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 font-mono">
                            {selectedRecall.affectedLocations.map((loc: any) => {
                              const isFullyQuarantined = loc.unitsQuarantined >= loc.unitsFound;
                              return (
                                <tr key={loc.locationId} className="hover:bg-slate-800/30">
                                  <td className="p-2.5 font-sans font-medium text-slate-200">
                                    {loc.locationName}
                                  </td>
                                  <td className="p-2.5 text-center">
                                    {loc.acknowledged ? (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                                        تم الإشعار
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 animate-pulse">
                                        بانتظار التأكيد
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-2.5 text-center text-white font-bold">
                                    {loc.unitsFound}
                                  </td>
                                  <td className="p-2.5 text-center text-red-400 font-bold">
                                    {loc.unitsQuarantined}
                                  </td>
                                  <td className="p-2.5 text-center font-sans">
                                    {isFullyQuarantined ? (
                                      <span className="text-emerald-400 text-[11px] font-bold inline-flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span>معزول ومحجور</span>
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          if (onAcknowledgeLocationRecall) {
                                            onAcknowledgeLocationRecall(selectedRecall.id, loc.locationId);
                                          } else {
                                            onTriggerRecallSweep(selectedRecall.id);
                                          }
                                        }}
                                        className="px-2 py-0.5 rounded bg-red-600/80 hover:bg-red-500 text-white text-[10px] font-bold cursor-pointer"
                                      >
                                        عزل وحجر فوري &larr;
                                      </button>
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

                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-red-400" />
                      <span>الإجراءات النظامية المترتبة على سحب التشغيلة (Scenario I22):</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                      <li>تصفير الرصيد المتاح للصرف (Available = 0) فورياً لكافة تشغيلات <strong className="text-red-300">{getLots(selectedRecall).join(', ')}</strong>.</li>
                      <li>تحويل الوحدات الفعلية إلى وعاء الحجر الفني الإجباري مع الحفاظ على فصل الأوعية التالفة ومنتهية الصلاحية دون خلط أو تكرار.</li>
                      <li>حظر اختيار هذه التشغيلة نهائياً في أوامر التجهيز والسحب (FEFO Picking Exclusion).</li>
                    </ul>
                  </div>

                  {/* Safety & Domain Isolation Notice */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <div className="font-bold text-amber-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>حدود النطاق وخصوصية الأقسام السريرية (Domain Boundaries):</span>
                    </div>
                    <p className="leading-relaxed text-slate-400">
                      • تعميم الاستدعاء بمفرده يُعد إشعاراً تنظيمياً؛ ولا يُعتبر المخزون محجوراً ميدانياً إلا بعد تنفيذ إجراء المسح الفعلي (Recall Sweep) وتأكيد عزله في غرف الحجر.<br />
                      • هذا الإجراء يقتصر حصراً على مستلزمات المستودع العام التمويني، ولا يتدخل في مخزون الصيدلية الدوائي، أو بنك الدم، أو كواشف المختبر المعزولة نظامياً.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-800">
                  <button
                    onClick={() => onTriggerRecallSweep(selectedRecall.id)}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>تطبيق المسح الشوكي الفوري لكافة المواقع (Trigger Recall Sweep - I22)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs">
                اختر تعميم استدعاء من القائمة لمعاينة التفاصيل.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Quarantined Balances Table & Release Workflow */
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-red-400" />
                <span>سجل المخزون الخاضع للحجر الفني الإلزامي (Quarantine Ledger)</span>
              </h3>
              <p className="text-xs text-slate-400">
                أرصدة معزولة تماماً عن عمليات الصرف والتجهيز لعدم اكتمال الفحص أو لوجود تعاميم استدعاء.
              </p>
            </div>
            <span className="text-xs font-mono text-red-400 bg-red-950 px-2.5 py-1 rounded-lg border border-red-800 font-bold">
              {quarantinedBalances.length} سجلات محجورة
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-[11px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">رمز واسم المستلزم</th>
                  <th className="p-3">الموقع التخزيني</th>
                  <th className="p-3">التشغيلة والصلاحية</th>
                  <th className="p-3 text-center text-red-400 font-bold">الكمية المحجورة</th>
                  <th className="p-3 text-center text-teal-400">الكمية المتاحة</th>
                  <th className="p-3 text-center">إجراء فك الحجر المعتمد (I23)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {quarantinedBalances.map(bal => {
                  const item = itemMap.get(bal.itemId);
                  const loc = locationMap.get(bal.locationId);

                  return (
                    <tr key={bal.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-sans">
                        <div className="font-bold text-white">{item?.nameAr || bal.itemId}</div>
                        <div className="text-[11px] text-amber-400 font-mono">{item?.code}</div>
                      </td>

                      <td className="p-3 font-sans">
                        <div className="font-bold text-slate-200">{loc?.facilityNameAr}</div>
                        <div className="text-[11px] text-slate-400">{loc?.warehouseNameAr} ({loc?.shelfBin})</div>
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-slate-100">{bal.lotNumber || 'غير مقيد'}</div>
                        <div className="text-[11px] text-slate-400">{bal.expiryDate}</div>
                      </td>

                      <td className="p-3 text-center font-bold text-red-400 text-sm">
                        {bal.quarantined}
                      </td>

                      <td className="p-3 text-center font-bold text-teal-400 text-sm">
                        {bal.availableForPicking}
                      </td>

                      <td className="p-3 text-center font-sans">
                        <button
                          onClick={() => setReleaseTargetBalance(bal)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs cursor-pointer transition-colors"
                        >
                          بروتوكول فك الحجر &larr;
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quarantine Release Modal (Scenario I23) */}
      {releaseTargetBalance && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Unlock className="w-5 h-5 text-amber-400" />
                <span>اعتماد فك الحجر الفني المشروط (Quarantine Release - I23)</span>
              </div>
              <button
                onClick={() => setReleaseTargetBalance(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              ⚠️ اشتراط نظامي: يُحظر فك الحجر دون تحديد المسؤول المعتمد، إرفاق مستند سلامة أو تقرير فحص مخبري، وتدوين المبرر السريري كاملاً في سجل التتبع الرقابي.
            </p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
              <div className="text-white font-bold">التشغيلة الخاضعة للإفراج: {releaseTargetBalance.lotNumber}</div>
              <div className="text-slate-400">الكمية المحجورة حالياً: {releaseTargetBalance.quarantined} وحدة</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">المسؤول المعتمد المصرح له بفك الحجر:</label>
                <input
                  type="text"
                  value={releaseAuthorizedBy}
                  onChange={e => setReleaseAuthorizedBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">المبرر الفني وتقرير الفحص السريري والمخبري:</label>
                <textarea
                  rows={3}
                  value={releaseRationale}
                  onChange={e => setReleaseRationale(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setReleaseTargetBalance(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  onReleaseQuarantine(releaseTargetBalance.id, releaseAuthorizedBy, releaseRationale);
                  setReleaseTargetBalance(null);
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                اعتماد فك الحجر وإعادة الرصيد للمتاح
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

