import React, { useState } from 'react';
import {
  PackageCheck,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  Sparkles,
  Calendar,
  Lock,
  ArrowRight,
  Send,
  X,
  UserCheck
} from 'lucide-react';
import {
  DepartmentalRequisition,
  PhysicalStockBalance,
  ItemMasterRecord,
  StorageLocation,
  StockReservation
} from '../../types/supplyChainOps';
import { getEffectiveDate } from '../../utils/mockClock';

interface PickingDispatchWorkspaceProps {
  requisitions: DepartmentalRequisition[];
  stockBalances: PhysicalStockBalance[];
  catalogItems: ItemMasterRecord[];
  locations: StorageLocation[];
  stockReservations?: StockReservation[];
  onCompletePick: (reqId: string) => void;
  onDispatchToCourier: (reqId: string, courierName: string) => void;
  onAcknowledgeWardDelivery: (reqId: string, acknowledgedBy: string) => void;
  onOpenScenarioModal?: () => void;
}

export const PickingDispatchWorkspace: React.FC<PickingDispatchWorkspaceProps> = ({
  requisitions,
  stockBalances,
  catalogItems,
  locations,
  stockReservations = [],
  onCompletePick,
  onDispatchToCourier,
  onAcknowledgeWardDelivery,
  onOpenScenarioModal
}) => {
  const [selectedReqId, setSelectedReqId] = useState<string>(requisitions[0]?.id || '');
  const [courierName, setCourierName] = useState<string>('ماجد القحطاني (سائق التوصيل الداخلي)');
  const [wardSignee, setWardSignee] = useState<string>('م. تهاني الشهراني (تمريض الجناح)');
  const [isCourierModalOpen, setIsCourierModalOpen] = useState(false);
  const [isAcknowledgeModalOpen, setIsAcknowledgeModalOpen] = useState(false);

  const activeReq = requisitions.find(r => r.id === selectedReqId) || requisitions[0];
  const itemMap = new Map<string, ItemMasterRecord>(catalogItems.map(i => [i.id, i]));
  const locationMap = new Map<string, StorageLocation>(locations.map(l => [l.id, l]));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-amber-400" />
            <span>تجهيز الطلبات، الصرف وقاعدة FEFO (Picking, Packing & FEFO Dispatch)</span>
          </h2>
          <p className="text-xs text-slate-400">
            سحب المستلزمات من الرفوف مع تطبيق إلزامي لقاعدة الصرف الأقرب انتهاءً (FEFO)، والتعبئة في حاويات النقل الداخلي والتسليم للأجنحة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 px-3 py-1.5 rounded-xl border border-amber-800">
            قاعدة FEFO: مفعلة نظامياً
          </span>
        </div>
      </div>

      {/* Main Grid: Requisition Queue + Active Pick Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Requisitions in Queue */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400">طابور طلبات التجهيز والصرف النشطة:</h3>

          <div className="space-y-2">
            {requisitions.map(req => {
              const isSelected = req.id === selectedReqId;
              const isUrgent = req.priority === 'urgent' || req.priority === 'stat';

              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedReqId(req.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-500 shadow-sm'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white">
                      {req.requisitionNumber}
                    </span>
                    {isUrgent ? (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-600 text-white animate-pulse">
                        عاجل / STAT
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-700 text-slate-300">
                        روتيني
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-200 font-bold mt-1">
                    {req.requestingDepartment}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
                    <span className="text-slate-400 font-mono">{req.lines.length} أسطر مواد</span>
                    <span className={`font-bold font-mono px-1.5 py-0.5 rounded text-[10px] ${
                      req.fulfillmentStatus === 'picking'
                        ? 'bg-amber-900/60 text-amber-200'
                        : req.fulfillmentStatus === 'dispatched'
                        ? 'bg-blue-900/60 text-blue-200'
                        : 'bg-teal-900/60 text-teal-200'
                    }`}>
                      {req.fulfillmentStatus === 'picking' && 'قيد التجهيز (I15)'}
                      {req.fulfillmentStatus === 'dispatched' && 'مع الناقل (I16)'}
                      {req.fulfillmentStatus === 'delivered' && 'مكتمل التسليم'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Pick Sheet with FEFO Recommendation */}
        <div className="lg:col-span-2 space-y-4">
          {activeReq ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-sm">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-amber-400">{activeReq.requisitionNumber}</span>
                    <span className="text-xs text-slate-400">📍 {activeReq.requestingDepartment}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{activeReq.clinicalPurpose}</p>
                </div>

                <div className="text-left font-mono text-xs">
                  <div className="text-slate-400">حالة التجهيز:</div>
                  <div className="font-bold text-white">
                    {activeReq.fulfillmentStatus === 'picking' && 'مجهز بالرصيف بانتظار الصرف (I15)'}
                    {activeReq.fulfillmentStatus === 'dispatched' && 'تم الصرف مع الناقل بانتظار استلام الجناح (I16)'}
                    {activeReq.fulfillmentStatus === 'delivered' && 'تم استلام وتوقيع الجناح'}
                  </div>
                </div>
              </div>

              {/* Lines to Pick with FEFO Batch Guidance (Scenario I21) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span>قائمة السحب الإرشادي والتوجيه الآلي للدفعات الأقرب انتهاءً (FEFO Directed):</span>
                  </h4>
                </div>

                {activeReq.lines.map((line, idx) => {
                  const item = itemMap.get(line.itemId);
                  // Find strictly eligible lots for this item according to FEFO rules
                  const itemLots = stockBalances.filter(b => {
                    if (b.itemId !== line.itemId) return false;
                    if (b.availableForPicking <= 0) return false;
                    if (b.quarantined > 0) return false;
                    if ((b.damaged || 0) > 0 || (b.pendingDisposal || 0) > 0) return false;
                    if (b.locationId.includes('QUARANTINE') || b.locationId.includes('DOCK')) return false;
                    const loc = locationMap.get(b.locationId);
                    if (loc && (loc.isQuarantineArea || loc.isStagingArea)) return false;
                    if (b.expiryDate) {
                      const expTime = new Date(b.expiryDate).getTime();
                      const systemTime = getEffectiveDate().getTime();
                      if (expTime <= systemTime) return false;
                    }
                    return true;
                  });
                  const fefoLot = itemLots.sort((a, b) => {
                    if (!a.expiryDate) return 1;
                    if (!b.expiryDate) return -1;
                    return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
                  })[0];

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono text-xs font-bold text-amber-400">{item?.code}</span>
                          <div className="text-sm font-bold text-white mt-0.5">{item?.nameAr}</div>
                        </div>
                        <div className="text-left font-mono">
                          <span className="text-xs text-slate-400">الكمية المطلوبة:</span>
                          <div className="text-base font-bold text-teal-300">
                            {line.requestedQty} {line.uom}
                          </div>
                        </div>
                      </div>

                      {/* FEFO Lot Box (Scenario I21) */}
                      {fefoLot && (
                        <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-600/40 text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-300 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span>التشغيلة الموصى بسحبها أولاً (قاعدة FEFO):</span>
                            </span>
                            <span className="font-mono font-bold text-amber-400 bg-amber-900/60 px-2 py-0.5 rounded border border-amber-800">
                              {fefoLot.lotNumber}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                            <span>تاريخ الانتهاء: <strong className="text-white">{fefoLot.expiryDate}</strong></span>
                            <span>الرصيد المتاح بالسلة: <strong className="text-teal-300">{fefoLot.availableForPicking}</strong></span>
                          </div>
                        </div>
                      )}

                      {/* Explicit Reservation Ownership Display */}
                      {(() => {
                        const ownedRes = stockReservations.find(
                          r => r.requisitionId === activeReq.id && r.requisitionLineId === line.lineId
                        );
                        if (!ownedRes) return null;
                        return (
                          <div className="p-2.5 rounded-lg bg-teal-950/40 border border-teal-600/40 text-xs flex items-center justify-between font-mono">
                            <span className="text-teal-300 font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                              <span>حجز مخصص ومملوك لهذا الطلب:</span>
                            </span>
                            <span className="text-white bg-teal-900/60 px-2 py-0.5 rounded text-[11px]">
                              {ownedRes.reservedQty} وحدة ({ownedRes.sourceLocationId})
                            </span>
                          </div>
                        );
                      })()}

                      {/* Exclusion of Quarantined Lots Notice (Scenario I13) */}
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                        <Lock className="w-3 h-3 text-red-400" />
                        <span>ملاحظة أمان: التشغيلات المحجورة أو غير المطابقة محجوبة كلياً من خيارات السحب.</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Ribbon: Picked $\rightarrow$ Dispatched $\rightarrow$ Acknowledged */}
              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                {(activeReq.fulfillmentStatus === 'allocated' ||
                  (activeReq.approvalStatus === 'approved' &&
                    activeReq.fulfillmentStatus !== 'dispatched' &&
                    activeReq.fulfillmentStatus !== 'delivered' &&
                    activeReq.lines.some(l => (l.pickedQty || 0) < l.requestedQty))) && (
                  <button
                    onClick={() => onCompletePick(activeReq.id)}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>تأكيد سحب الأصناف للرصيف (Picked - I15)</span>
                  </button>
                )}

                {activeReq.fulfillmentStatus === 'picking' && (
                  <button
                    onClick={() => setIsCourierModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Truck className="w-4 h-4" />
                    <span>صرف وتسليم للناقل الداخلي (Hand to Courier - I16)</span>
                  </button>
                )}

                {activeReq.fulfillmentStatus === 'dispatched' && (
                  <button
                    onClick={() => setIsAcknowledgeModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأكيد استلام وتوقيع الجناح (Ward Receipt)</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs">
              الرجاء اختيار طلب من القائمة لعرض تفاصيل التجهيز.
            </div>
          )}
        </div>
      </div>

      {/* Hand to Courier Modal (Scenario I16) */}
      {isCourierModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Truck className="w-5 h-5 text-blue-400" />
                <span>تسليم الشحنة للناقل الداخلي (Scenario I16)</span>
              </div>
              <button
                onClick={() => setIsCourierModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              عند الصرف للناقل، يتم تحويل حالة الطلب إلى <strong className="text-blue-400">"تم الصرف - مع السائق"</strong> ولا تُسجل ككمية مستقرة في رصيد الجناح حتى يتم التوقيع الفعلي من الممرض المستلم.
            </p>

            <div>
              <label className="block text-slate-300 font-bold mb-1 text-xs">اسم الناقل أو السائق المعتمد:</label>
              <input
                type="text"
                value={courierName}
                onChange={e => setCourierName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-bold text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCourierModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  onDispatchToCourier(activeReq.id, courierName);
                  setIsCourierModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                تأكيد الصرف والشحن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ward Acknowledgment Modal */}
      {isAcknowledgeModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>إثبات استلام وتوقيع الجناح (Ward Acknowledgment)</span>
              </div>
              <button
                onClick={() => setIsAcknowledgeModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              إقرار مسؤول التمريض باستلام الطرود ومطابقة سلامتها وإدخالها رسمياً في غرفة الإمداد النظيفة للقسم:
            </p>

            <div>
              <label className="block text-slate-300 font-bold mb-1 text-xs">اسم الممرض أو الموظف المستلم بالجناح:</label>
              <input
                type="text"
                value={wardSignee}
                onChange={e => setWardSignee(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-bold text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAcknowledgeModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  onAcknowledgeWardDelivery(activeReq.id, wardSignee);
                  setIsAcknowledgeModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                تأكيد الاستلام وإغلاق الطلب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
