import React, { useState } from 'react';
import {
  Truck,
  Package,
  Search,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Calendar,
  Layers,
  Sparkles,
  ArrowDownLeft,
  X,
  FileText,
  Clock,
  ThermometerSnowflake,
  Plus
} from 'lucide-react';
import {
  SyntheticPurchaseOrder,
  GoodsReceiptRecord,
  ItemMasterRecord,
  StorageLocation,
  PhysicalStockBalance
} from '../../types/supplyChainOps';

interface CentralGoodsReceivingViewProps {
  purchaseOrders: SyntheticPurchaseOrder[];
  goodsReceipts: GoodsReceiptRecord[];
  catalogItems: ItemMasterRecord[];
  locations: StorageLocation[];
  onAddGoodsReceipt: (record: GoodsReceiptRecord) => void;
  onUpdatePutaway: (receiptId: string, targetBinLocationId: string) => void;
  onOpenScenarioModal?: () => void;
}

export const CentralGoodsReceivingView: React.FC<CentralGoodsReceivingViewProps> = ({
  purchaseOrders,
  goodsReceipts,
  catalogItems,
  locations,
  onAddGoodsReceipt,
  onUpdatePutaway,
  onOpenScenarioModal
}) => {
  const [selectedPoNumber, setSelectedPoNumber] = useState<string>('PO-2026-MED-101');
  const [isReceivingModalOpen, setIsReceivingModalOpen] = useState<boolean>(false);
  const [isUnexpectedModalOpen, setIsUnexpectedModalOpen] = useState<boolean>(false);
  const [putawayTargetReceipt, setPutawayTargetReceipt] = useState<GoodsReceiptRecord | null>(null);
  const [selectedPutawayBin, setSelectedPutawayBin] = useState<string>('LOC-WH-MAIN-AISLE-A1');

  // Intake Form State
  const [selectedItemId, setSelectedItemId] = useState<string>('ITEM-MS-001');
  const [receivedQty, setReceivedQty] = useState<number>(50);
  const [lotNumber, setLotNumber] = useState<string>('LOT-BD-NEW-01');
  const [expiryDate, setExpiryDate] = useState<string>('2027-12-31');
  const [supplierDn, setSupplierDn] = useState<string>('DN-GULF-9941');
  const [packageCondition, setPackageCondition] = useState<'intact_sealed' | 'minor_outer_crease' | 'crushed_compromised' | 'wet_leaking'>('intact_sealed');
  const [tempStatus, setTempStatus] = useState<'normal_compliant' | 'cold_excursion_flagged' | 'not_applicable'>('normal_compliant');
  const [inspectionDecision, setInspectionDecision] = useState<'accepted' | 'quarantined' | 'received_uninspected'>('accepted');
  const [inspectionNotes, setInspectionNotes] = useState<string>('تم الفحص الظاهري واجتياز تدقيق سلامة الأغلفة والمعايير.');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Unexpected Item Form State
  const [unexpectedDescription, setUnexpectedDescription] = useState<string>('صناديق قفازات جراحية غير مدرجة ببوليصة الشحن');
  const [unexpectedQty, setUnexpectedQty] = useState<number>(20);

  const activePo = purchaseOrders.find(p => p.poNumber === selectedPoNumber);
  const itemMap = new Map<string, ItemMasterRecord>(catalogItems.map(i => [i.id, i]));
  const locationMap = new Map<string, StorageLocation>(locations.map(l => [l.id, l]));

  const handleSubmitIntake = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const item = itemMap.get(selectedItemId);
    if (!item) return;

    // Safety Assertion: If item is expiry tracked, lot & expiry are strictly mandatory (Scenario I07)
    // Validate discrete item fractional units (e.g. 1.5 catheters is invalid)
    if (!Number.isInteger(Number(receivedQty))) {
      setValidationError('⚠️ خطأ في وحدة القياس: الصنف الطبي غير قابل للتجزئة، يجب إدخال كمية عددية صحيحة (Discrete base units cannot be fractional - e.g. 1.5 catheters is an invalid state).');
      return;
    }

    if (item.isExpiryTracked && (!lotNumber.trim() || !expiryDate.trim())) {
      setValidationError('⚠️ خطأ تدقيق السلامة: هذا الصنف يتطلب إدخال رقم التشغيلة وتاريخ الصلاحية إجبارياً قبل الاستلام (سيناريو I07).');
      return;
    }

    // Safety Assertion: If package is damaged or cold excursion flagged, must be quarantined (Scenario I08, I09)
    let finalInspectionStatus = inspectionDecision;
    let finalAccepted = inspectionDecision === 'accepted' ? receivedQty : 0;
    let finalQuarantined = inspectionDecision === 'quarantined' ? receivedQty : 0;

    if (packageCondition === 'crushed_compromised' || packageCondition === 'wet_leaking') {
      finalInspectionStatus = 'quarantined';
      finalAccepted = 0;
      finalQuarantined = receivedQty;
    }

    if (tempStatus === 'cold_excursion_flagged') {
      finalInspectionStatus = 'quarantined';
      finalAccepted = 0;
      finalQuarantined = receivedQty;
    }

    const newRecord: GoodsReceiptRecord = {
      id: `RCV-${Date.now().toString().slice(-4)}`,
      receiptReference: `GRN-2026-${Date.now().toString().slice(-4)}`,
      poNumber: selectedPoNumber,
      supplierDeliveryNote: supplierDn,
      vendorName: activePo?.vendorName || 'المورد الطبي المعتمد',
      receivingLocationId: 'LOC-WH-MAIN-DOCK',
      receivedAt: '2026-09-20 10:00',
      receiverName: 'فهد العتيبي (أمين مستودع الاستلام)',
      receiverAssignment: 'Receiving Clerk',
      itemId: selectedItemId,
      receivedQty: Number(receivedQty),
      uom: item.packaging.baseUom,
      lotNumber: lotNumber.trim() || undefined,
      expiryDate: expiryDate.trim() || undefined,
      packageCondition,
      temperatureIndicatorStatus: tempStatus,
      inspectionStatus: finalInspectionStatus,
      acceptedQty: finalAccepted,
      quarantinedQty: finalQuarantined,
      rejectedQty: 0,
      inspectionNotes,
      putAwayStatus: finalInspectionStatus === 'accepted' ? 'staged_dock' : 'pending_putaway',
      assignedBinLocationId: finalInspectionStatus === 'quarantined' ? 'LOC-WH-MAIN-QUARANTINE' : 'LOC-WH-MAIN-AISLE-A1'
    };

    onAddGoodsReceipt(newRecord);
    setIsReceivingModalOpen(false);
  };

  const handleUnexpectedIntake = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: GoodsReceiptRecord = {
      id: `RCV-UNEXP-${Date.now().toString().slice(-4)}`,
      receiptReference: `GRN-UNEXP-${Date.now().toString().slice(-4)}`,
      poNumber: 'UNMANIFESTED-DOCK-RECEIPT',
      supplierDeliveryNote: 'DN-UNMANIFESTED',
      vendorName: 'شحنة واردة بدون بوليصة معتمدة',
      receivingLocationId: 'LOC-WH-MAIN-QUARANTINE',
      receivedAt: '2026-09-20 10:15',
      receiverName: 'فهد العتيبي',
      receiverAssignment: 'Receiving Inspector',
      itemId: 'ITEM-MS-004',
      receivedQty: Number(unexpectedQty),
      uom: 'box',
      lotNumber: 'LOT-UNEXP-HOLD',
      expiryDate: '2028-01-01',
      packageCondition: 'intact_sealed',
      inspectionStatus: 'quarantined', // Scenario I06: Quarantined automatically
      acceptedQty: 0,
      quarantinedQty: Number(unexpectedQty),
      rejectedQty: 0,
      inspectionNotes: `طرد غير مدرج بأمر الشراء: ${unexpectedDescription}. تم التحويل الفوري لحجر المواد غير المعنونة.`,
      putAwayStatus: 'pending_putaway',
      assignedBinLocationId: 'LOC-WH-MAIN-QUARANTINE',
      isUnexpectedItem: true
    };

    onAddGoodsReceipt(newRecord);
    setIsUnexpectedModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-400" />
            <span>رصيف الاستلام والتفتيش والتخزين المركزي (Central Receiving & QA)</span>
          </h2>
          <p className="text-xs text-slate-400">
            فحص الشحنات الواردة مقابل أوامر الشراء، مطابقة وحدات التعبئة، التحقق من الصلاحيات والحجر الوقائي، ثم إتمام التخزين بالرفوف.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsUnexpectedModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            title="اختبار السيناريو I06: استلام طرد غير مدرج بأمر الشراء"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>استلام طرد غير مدرج (سيناريو I06)</span>
          </button>

          <button
            onClick={() => setIsReceivingModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل استلام شحنة جديدة</span>
          </button>
        </div>
      </div>

      {/* PO Selector & Active PO Status */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-white">أمر الشراء المرجعي (Purchase Order):</span>
            <select
              value={selectedPoNumber}
              onChange={e => setSelectedPoNumber(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono font-bold cursor-pointer"
            >
              {purchaseOrders.map(po => (
                <option key={po.poNumber} value={po.poNumber}>
                  {po.poNumber} — {po.vendorName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">حالة أمر الشراء:</span>
            <span className={`px-2 py-0.5 rounded font-bold ${
              activePo?.status === 'partially_received'
                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                : 'bg-blue-950 text-blue-300 border border-blue-800'
            }`}>
              {activePo?.status === 'partially_received' ? 'استلام جزئي (Scenario I05)' : 'مفتوح بانتظار التوريد'}
            </span>
          </div>
        </div>

        {/* PO Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-[11px] font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">رمز ومواصفات الصنف</th>
                <th className="p-3 text-center">الكمية المطلوبة بأمر الشراء</th>
                <th className="p-3 text-center text-emerald-400">الكمية المستلمة فعلياً</th>
                <th className="p-3 text-center text-amber-400">الكمية المعلقة (Outstanding)</th>
                <th className="p-3 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {activePo?.lines.map(line => {
                const item = itemMap.get(line.itemId);
                return (
                  <tr key={line.lineId} className="hover:bg-slate-800/40">
                    <td className="p-3 font-sans">
                      <div className="font-bold text-white">{item?.nameAr || line.itemId}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{item?.code}</div>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-200">
                      {line.orderedQty} {line.uom}
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-400">
                      {line.receivedQtyTotal} {line.uom}
                    </td>
                    <td className="p-3 text-center font-bold text-amber-400">
                      {line.outstandingQty} {line.uom}
                    </td>
                    <td className="p-3 text-center font-sans">
                      {line.outstandingQty > 0 ? (
                        <button
                          onClick={() => {
                            setSelectedItemId(line.itemId);
                            setReceivedQty(line.outstandingQty);
                            setIsReceivingModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer"
                        >
                          استلام المتبقي
                        </button>
                      ) : (
                        <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>مكتمل</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dock Receipts & Inspection Log Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white">سجل الشحنات المستلمة على الرصيف وإجراءات التخزين (Put-Away)</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">{goodsReceipts.length} شحنات مقيدة</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-[11px] font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">رقم السند والإشعار</th>
                <th className="p-3">الصنف المستلم</th>
                <th className="p-3">الكمية والوحدة</th>
                <th className="p-3">التشغيلة والصلاحية</th>
                <th className="p-3">حالة الفحص والجودة</th>
                <th className="p-3">مرحلة التخزين (Put-Away)</th>
                <th className="p-3 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {goodsReceipts.map(rcv => {
                const item = itemMap.get(rcv.itemId);
                return (
                  <tr key={rcv.id} className="hover:bg-slate-800/40">
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-mono font-bold text-white">{rcv.receiptReference}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{rcv.supplierDeliveryNote}</div>
                      <div className="text-[10px] text-slate-500">{rcv.receivedAt}</div>
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-slate-100">{item?.nameAr || rcv.itemId}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{item?.code}</div>
                      {rcv.isUnexpectedItem && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                          طرد غير مدرج (Scenario I06)
                        </span>
                      )}
                    </td>

                    <td className="p-3 font-mono font-bold text-slate-200 whitespace-nowrap">
                      {rcv.receivedQty} {rcv.uom}
                    </td>

                    <td className="p-3 font-mono text-xs whitespace-nowrap">
                      <div>{rcv.lotNumber || 'بدون تشغيلة'}</div>
                      <div className="text-[11px] text-slate-400">{rcv.expiryDate || 'بدون صلاحية'}</div>
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rcv.inspectionStatus === 'accepted'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : rcv.inspectionStatus === 'quarantined'
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {rcv.inspectionStatus === 'accepted' && 'مقبول فحصاً (Accepted)'}
                        {rcv.inspectionStatus === 'quarantined' && 'محجور للتلف أو التعليق'}
                        {rcv.inspectionStatus === 'received_uninspected' && 'بانتظار الفحص (Pending QA)'}
                      </span>
                      {rcv.packageCondition === 'crushed_compromised' && (
                        <div className="text-[10px] text-red-400 mt-0.5 font-sans">
                          ⚠️ تغليف خارجي تالف (I08)
                        </div>
                      )}
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      {rcv.putAwayStatus === 'putaway_completed' ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تم التخزين بالرف</span>
                        </span>
                      ) : rcv.putAwayStatus === 'staged_dock' ? (
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>بالرصيف بانتظار الرف (I11)</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">قيد الفحص بالحجر</span>
                      )}
                    </td>

                    <td className="p-3 text-center whitespace-nowrap">
                      {rcv.inspectionStatus === 'accepted' && rcv.putAwayStatus === 'staged_dock' ? (
                        <button
                          onClick={() => setPutawayTargetReceipt(rcv)}
                          className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors cursor-pointer"
                        >
                          تخزين على الرف &larr;
                        </button>
                      ) : (
                        <span className="text-slate-500 text-xs">مستقر</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Intake Modal */}
      {isReceivingModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <ArrowDownLeft className="w-5 h-5 text-blue-400" />
                <span>تسجيل استلام وفحص شحنة على الرصيف (Dock Intake & QA)</span>
              </div>
              <button
                onClick={() => setIsReceivingModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {validationError && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs font-medium">
                {validationError}
              </div>
            )}

            <form onSubmit={handleSubmitIntake} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">الصنف المستلم:</label>
                <select
                  value={selectedItemId}
                  onChange={e => setSelectedItemId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-bold"
                >
                  {catalogItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.code} — {item.nameAr} ({item.packaging.baseUom})
                    </option>
                  ))}
                </select>
              </div>

              {/* Scenario I04: Packaging & UOM Conversion Context */}
              {itemMap.get(selectedItemId) && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between font-mono">
                  <span className="text-slate-400">
                    معامل التحويل المعتمد: 1 {itemMap.get(selectedItemId)?.packaging.issueUom} = {itemMap.get(selectedItemId)?.packaging.conversionFactor || 1} {itemMap.get(selectedItemId)?.packaging.baseUom}
                  </span>
                  <span className="text-teal-400 font-bold">
                    = {(Number(receivedQty) / (itemMap.get(selectedItemId)?.packaging.conversionFactor || 1)).toFixed(1)} {itemMap.get(selectedItemId)?.packaging.issueUom}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الكمية المستلمة:</label>
                  <input
                    type="number"
                    min="1"
                    value={receivedQty}
                    onChange={e => setReceivedQty(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">رقم إشعار التوريد (DN):</label>
                  <input
                    type="text"
                    value={supplierDn}
                    onChange={e => setSupplierDn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">رقم التشغيلة (Lot Number):</label>
                  <input
                    type="text"
                    value={lotNumber}
                    onChange={e => setLotNumber(e.target.value)}
                    placeholder="إلزامي للمستلزمات المعقمة"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">تاريخ الصلاحية (Expiry):</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={e => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono"
                  />
                </div>
              </div>

              {/* Physical Condition & Temperature */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">حالة التغليف الخارجي (I08):</label>
                  <select
                    value={packageCondition}
                    onChange={e => setPackageCondition(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-bold"
                  >
                    <option value="intact_sealed">سليم ومختوم بالكامل (Clean Sealed)</option>
                    <option value="minor_outer_crease">انثناء خارجي بسيط غير نافذ</option>
                    <option value="crushed_compromised">مدهوس أو تالف (يحول للحجر تلقائياً)</option>
                    <option value="wet_leaking">مبلل أو مسرب (يحول للحجر تلقائياً)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">مؤشر سلسلة التبريد (I09):</label>
                  <select
                    value={tempStatus}
                    onChange={e => setTempStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-bold"
                  >
                    <option value="normal_compliant">درجة الحرارة مطابقة وسليمة</option>
                    <option value="cold_excursion_flagged">انحراف حراري مؤشر (يحول للحجر)</option>
                    <option value="not_applicable">غير منطبق (صنف جاف بحرارة الغرفة)</option>
                  </select>
                </div>
              </div>

              {/* Decision */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">قرار التفتيش الأولي:</label>
                <select
                  value={inspectionDecision}
                  onChange={e => setInspectionDecision(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-bold"
                >
                  <option value="accepted">قبول فحصاً ونقل إلى رصيف التخزين (Accepted)</option>
                  <option value="received_uninspected">استلام معلق بانتظار فحص فني (Scenario I10)</option>
                  <option value="quarantined">تحويل فوري للحجر الفني (Quarantined)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReceivingModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer shadow-xs"
                >
                  تأكيد وحفظ الاستلام
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unexpected Item Intake Modal (Scenario I06) */}
      {isUnexpectedModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>استلام صنف غير مدرج بأمر الشراء (سيناريو I06)</span>
              </div>
              <button
                onClick={() => setIsUnexpectedModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-amber-200 bg-amber-950/60 p-3 rounded-xl border border-amber-800/80 leading-relaxed">
              ⚠️ ممارسة الأمان المعتمدة: الأصناف الإضافية أو غير المدرجة في بوليصة الشحن يتم إدخالها مباشرة إلى 
              <span className="font-bold text-white"> قفص الحجر للمواد غير المعنونة (Unmanifested Quarantine) </span> 
              ويُحظر إتاحتها للصرف بالأجنحة حتى اعتمادها من إدارة المشتريات.
            </p>

            <form onSubmit={handleUnexpectedIntake} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">وصف الصنف غير المدرج:</label>
                <input
                  type="text"
                  value={unexpectedDescription}
                  onChange={e => setUnexpectedDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">الكمية المستلمة (صناديق/وحدات):</label>
                <input
                  type="number"
                  min="1"
                  value={unexpectedQty}
                  onChange={e => setUnexpectedQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUnexpectedModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer shadow-xs"
                >
                  إيداع في حجر الرصيف (Quarantine)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Put-Away Confirmation Modal (Scenario I11) */}
      {putawayTargetReceipt && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <CheckCircle2 className="w-5 h-5 text-teal-400" />
                <span>إتمام التخزين على الرف (Put-Away Confirmation - I11)</span>
              </div>
              <button
                onClick={() => setPutawayTargetReceipt(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              تأكيد نقل الصنف من <span className="font-bold text-amber-300">رصيف الاستلام المبدئي</span> إلى الموقع التخزيني النهائي لإتاحته رسمياً في الرصيف للصرف والتجهيز:
            </p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1 font-mono">
              <div className="text-white font-bold">{putawayTargetReceipt.receiptReference}</div>
              <div className="text-slate-400">الكمية: {putawayTargetReceipt.acceptedQty} {putawayTargetReceipt.uom}</div>
              <div className="text-slate-400">التشغيلة: {putawayTargetReceipt.lotNumber}</div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1 text-xs">موقع الرف المستهدف (Destination Bin):</label>
              <select
                value={selectedPutawayBin}
                onChange={e => setSelectedPutawayBin(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-bold"
              >
                <option value="LOC-WH-MAIN-AISLE-A1">المستودع الرئيسي - Zone A - Rack 01 (Bin A-12)</option>
                <option value="LOC-WH-MAIN-AISLE-B3">المستودع الرئيسي - Zone B - Rack 03 (Bin B-04)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPutawayTargetReceipt(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdatePutaway(putawayTargetReceipt.id, selectedPutawayBin);
                  setPutawayTargetReceipt(null);
                }}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                تأكيد الوضع على الرف (Put-Away Completed)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
