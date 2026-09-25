import React, { useState } from 'react';
import {
  Truck,
  Building2,
  ArrowRightLeft,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  FileSpreadsheet,
  X,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  InterLocationTransfer,
  TransferOrderLine,
  ItemMasterRecord,
  StorageLocation,
  BranchFacilityId
} from '../../types/supplyChainOps';

interface InterLocationTransfersViewProps {
  transfers: InterLocationTransfer[];
  catalogItems: ItemMasterRecord[];
  locations: StorageLocation[];
  onAddTransfer: (transfer: InterLocationTransfer) => void;
  onDispatchTransfer: (transferId: string, carrierRef: string, driver: string) => void;
  onReceiveTransfer: (transferId: string, receivedQty: number, damagedMissingQty: number, notes: string) => void;
  onOpenScenarioModal?: () => void;
}

export const InterLocationTransfersView: React.FC<InterLocationTransfersViewProps> = ({
  transfers,
  catalogItems,
  locations,
  onAddTransfer,
  onDispatchTransfer,
  onReceiveTransfer,
  onOpenScenarioModal
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [receivingTransfer, setReceivingTransfer] = useState<InterLocationTransfer | null>(null);
  const [dispatchingTransfer, setDispatchingTransfer] = useState<InterLocationTransfer | null>(null);

  // Form states
  const [sourceLocationId, setSourceLocationId] = useState('LOC-WH-MAIN-AISLE-B3');
  const [destLocationId, setDestLocationId] = useState('LOC-BRANCH-SUBURBAN-STORE');
  const [selectedItemId, setSelectedItemId] = useState('ITEM-MS-007');
  const [reqQty, setReqQty] = useState(50);

  // Receiving state
  const [actualReceivedQty, setActualReceivedQty] = useState(48);
  const [damagedQty, setDamagedQty] = useState(2);
  const [discrepancyNote, setDiscrepancyNote] = useState('تم توثيق تلف عبوتين نتيجة سقوط الصندوق أثناء التفريغ (سيناريو I19).');

  // Dispatch state
  const [carrierRef, setCarrierRef] = useState('MED-SHUTTLE-TRUCK-05');
  const [driverName, setDriverName] = useState('منصور الغامدي');

  const itemMap = new Map<string, ItemMasterRecord>(catalogItems.map(i => [i.id, i]));
  const locationMap = new Map<string, StorageLocation>(locations.map(l => [l.id, l]));

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTrf: InterLocationTransfer = {
      id: `TRF-${Date.now().toString().slice(-4)}`,
      transferNumber: `TRF-TRANS-${Date.now().toString().slice(-4)}`,
      sourceLocationId,
      sourceBranch: 'main_hospital',
      destinationLocationId: destLocationId,
      destinationBranch: 'suburban_clinic_branch',
      status: 'approved',
      priority: 'routine',
      lines: [
        {
          lineId: `TRFL-${Date.now()}`,
          itemId: selectedItemId,
          requestedQty: Number(reqQty),
          dispatchedQty: 0,
          receivedQty: 0,
          damagedMissingQty: 0,
          uom: 'each'
        }
      ],
      notes: 'طلب نقل مخزون روتيني بين المستودع الرئيسي والفرع الإقليمي.'
    };

    onAddTransfer(newTrf);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-400" />
            <span>نقل المخزون بين الفروع والمستودعات (Inter-Location Transfers)</span>
          </h2>
          <p className="text-xs text-slate-400">
            أوامر التحويل اللوجستي بين المستشفى الرئيسي والمجمعات الخارجية مع عزل تام للشحنات العابرة أثناء الطريق وتوثيق الفروقات.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء أمر تحويل جديد</span>
          </button>
        </div>
      </div>

      {/* Transfers Master Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 space-y-4 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-[11px] font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5">رقم أمر التحويل</th>
                <th className="p-3.5">موقع المصدر (Source)</th>
                <th className="p-3.5">الموقع المستلم (Destination)</th>
                <th className="p-3.5">الصنف والكميات (مطلوب / مشحون / مستلم)</th>
                <th className="p-3.5">حالة الشحنة</th>
                <th className="p-3.5">بيانات الناقل والملاحظات</th>
                <th className="p-3.5 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {transfers.map(trf => {
                const srcLoc = locationMap.get(trf.sourceLocationId);
                const destLoc = locationMap.get(trf.destinationLocationId);
                const line = trf.lines[0];
                const item = line ? itemMap.get(line.itemId) : null;

                const isInTransit = trf.status === 'in_transit';
                const isDiscrepancy = trf.status === 'partially_received' && trf.unresolvedVarianceCount;

                return (
                  <tr key={trf.id} className="hover:bg-slate-800/40">
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-bold text-white text-xs">{trf.transferNumber}</div>
                      <div className="text-[10px] text-slate-400 font-sans mt-0.5">أولوية {trf.priority}</div>
                    </td>

                    <td className="p-3.5 font-sans">
                      <div className="font-bold text-slate-200">{srcLoc?.facilityNameAr}</div>
                      <div className="text-[11px] text-slate-400">{srcLoc?.warehouseNameAr}</div>
                    </td>

                    <td className="p-3.5 font-sans">
                      <div className="font-bold text-slate-200">{destLoc?.facilityNameAr}</div>
                      <div className="text-[11px] text-slate-400">{destLoc?.warehouseNameAr}</div>
                    </td>

                    <td className="p-3.5 font-sans">
                      <div className="font-bold text-white">{item?.nameAr}</div>
                      <div className="font-mono text-slate-300 text-[11px]">
                        طلب: {line?.requestedQty} | شحن: {line?.dispatchedQty} | استلام: {line?.receivedQty}
                      </div>
                      {isDiscrepancy && (
                        <div className="text-[10px] text-red-400 font-bold mt-0.5">
                          ⚠️ فارغ غير محلول: {trf.unresolvedVarianceCount} وحدات مفقودة/تالفة (I19)
                        </div>
                      )}
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-sans ${
                        isInTransit
                          ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                          : trf.status === 'fully_received'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : trf.status === 'partially_received'
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                      }`}>
                        {isInTransit && 'في الطريق (In Transit - I18)'}
                        {trf.status === 'fully_received' && 'مكتمل الاستلام بالفرع'}
                        {trf.status === 'partially_received' && 'استلام جزئي مع تلف (I19)'}
                        {trf.status === 'approved' && 'معتمد بانتظار الشحن (I17)'}
                      </span>
                    </td>

                    <td className="p-3.5 font-sans text-xs">
                      {trf.carrierReference ? (
                        <div className="space-y-0.5 font-mono text-[11px]">
                          <div>الشاحنة: {trf.carrierReference}</div>
                          <div className="text-slate-400">السائق: {trf.driverName}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500">بانتظار تعيين الناقل</span>
                      )}
                    </td>

                    <td className="p-3.5 text-center font-sans whitespace-nowrap">
                      {trf.status === 'approved' && (
                        <button
                          onClick={() => setDispatchingTransfer(trf)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer transition-colors"
                        >
                          شحن عبر الناقل &larr;
                        </button>
                      )}

                      {isInTransit && (
                        <button
                          onClick={() => {
                            setReceivingTransfer(trf);
                            setActualReceivedQty(line ? line.dispatchedQty : 0);
                            setDamagedQty(0);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition-colors"
                        >
                          استلام بالفرع &larr;
                        </button>
                      )}

                      {trf.status === 'partially_received' && (
                        <span className="text-[11px] text-red-400 font-bold">بانتظار التسوية</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Transfer Modal (Scenario I17 $\rightarrow$ I18) */}
      {dispatchingTransfer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Truck className="w-5 h-5 text-indigo-400" />
                <span>شحن وتسيير النقل بين الفروع (Scenario I18)</span>
              </div>
              <button
                onClick={() => setDispatchingTransfer(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              عند تسيير الشحنة، تتحول حالة المخزون إلى <strong className="text-amber-400">"في الطريق (In Transit)"</strong> بحيث تُعزل تماماً ولا تظهر كرصيد متاح في أي من الفرعين لحين وصول الشاحنة.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">رقم/رمز شاحنة النقل المعتمدة:</label>
                <input
                  type="text"
                  value={carrierRef}
                  onChange={e => setCarrierRef(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم السائق المسؤول:</label>
                <input
                  type="text"
                  value={driverName}
                  onChange={e => setDriverName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDispatchingTransfer(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  onDispatchTransfer(dispatchingTransfer.id, carrierRef, driverName);
                  setDispatchingTransfer(null);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                تأكيد الشحن وتغيير الحالة إلى In-Transit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receiving with Discrepancy Option Modal (Scenario I19) */}
      {receivingTransfer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>استلام الشحنة في فرع المقصد وتوثيق الفروقات (Scenario I19)</span>
              </div>
              <button
                onClick={() => setReceivingTransfer(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              إثبات تفريغ الشحنة في مستودع الفرع. في حال وجود تلف أو نقص (مثل استلام 48 وتلف 2)، سيقوم النظام بقيد الرصيد السليم وتثبيت الفارق التالف في محضر رسمي:
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">الكمية المستلمة سليمة:</label>
                <input
                  type="number"
                  min="0"
                  value={actualReceivedQty}
                  onChange={e => setActualReceivedQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1 text-red-400">الكمية التالفة/المفقودة:</label>
                <input
                  type="number"
                  min="0"
                  value={damagedQty}
                  onChange={e => setDamagedQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-red-300 font-mono font-bold"
                />
              </div>
            </div>

            {damagedQty > 0 && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-red-400">بيان سبب الفارق والتلف (Discrepancy Justification):</label>
                <textarea
                  rows={2}
                  value={discrepancyNote}
                  onChange={e => setDiscrepancyNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-red-900/80 text-slate-100 text-xs"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setReceivingTransfer(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  onReceiveTransfer(receivingTransfer.id, actualReceivedQty, damagedQty, discrepancyNote);
                  setReceivingTransfer(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                تأكيد الاستلام وقيد الفروقات (I19)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Transfer Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Plus className="w-5 h-5 text-indigo-400" />
                <span>إنشاء أمر تحويل جديد بين الفروع (New Transfer)</span>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">مستودع المصدر:</label>
                <select
                  value={sourceLocationId}
                  onChange={e => setSourceLocationId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-bold"
                >
                  <option value="LOC-WH-MAIN-AISLE-B3">المستشفى الرئيسي - المستودع العام (Zone B)</option>
                  <option value="LOC-WH-MAIN-AISLE-A1">المستشفى الرئيسي - المستودع العام (Zone A)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">الفرع المستلم المستهدف:</label>
                <select
                  value={destLocationId}
                  onChange={e => setDestLocationId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-bold"
                >
                  <option value="LOC-BRANCH-SUBURBAN-STORE">فرع مجمع عيادات الضواحي (Suburban Outpatient)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">المستلزم المطلوب نقله:</label>
                <select
                  value={selectedItemId}
                  onChange={e => setSelectedItemId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-bold"
                >
                  {catalogItems.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.code} — {i.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">الكمية المطلوبة:</label>
                <input
                  type="number"
                  min="1"
                  value={reqQty}
                  onChange={e => setReqQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer shadow-xs"
                >
                  حفظ واعتماد أمر النقل (I17)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
