import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileEdit, 
  Truck, 
  Building, 
  DollarSign, 
  FileText, 
  Package, 
  AlertCircle,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { 
  PurchaseOrder, 
  PurchaseOrderLine, 
  SupplierMaster,
  ProcurementBranchId
} from '../../types/procurementOps';

interface PurchaseOrderManagementProps {
  purchaseOrders: PurchaseOrder[];
  suppliers: SupplierMaster[];
  currentBranch: ProcurementBranchId;
  activeRole: string;
  onApprovePo: (poId: string) => void;
  onSimulateSendPo: (poId: string) => void;
  onRecordSupplierAck: (poId: string, confirmedDeliveryDate?: string, note?: string) => void;
  onAmendPo: (poId: string, updatedLines: { lineId: string; newQuantity: number; reason: string }[], amendmentReason: string) => void;
  onCreateClaimForPo: (poId: string, lineId: string, rejectedQty: number) => void;
}

export const PurchaseOrderManagementWorkspace: React.FC<PurchaseOrderManagementProps> = ({
  purchaseOrders,
  suppliers,
  currentBranch,
  activeRole,
  onApprovePo,
  onSimulateSendPo,
  onRecordSupplierAck,
  onAmendPo,
  onCreateClaimForPo
}) => {
  const [selectedPoId, setSelectedPoId] = useState<string>(purchaseOrders[0]?.id || '');
  const [filterDocStatus, setFilterDocStatus] = useState<string>('all');
  const [filterFulfillment, setFilterFulfillment] = useState<string>('all');

  // Supplier Acknowledgment Modal
  const [isAckModalOpen, setIsAckModalOpen] = useState<boolean>(false);
  const [ackDeliveryDate, setAckDeliveryDate] = useState<string>('2026-10-25');
  const [ackNote, setAckNote] = useState<string>('');

  // PO Amendment Modal (PROC25)
  const [isAmendModalOpen, setIsAmendModalOpen] = useState<boolean>(false);
  const [amendmentReason, setAmendmentReason] = useState<string>('');
  const [amendLinesData, setAmendLinesData] = useState<{ [lineId: string]: number }>({});
  const [amendError, setAmendError] = useState<string>('');

  const selectedPo = purchaseOrders.find(p => p.id === selectedPoId);

  const filteredPos = purchaseOrders.filter(po => {
    if (filterDocStatus !== 'all' && po.documentStatus !== filterDocStatus) return false;
    if (filterFulfillment !== 'all' && po.fulfillmentStatus !== filterFulfillment) return false;
    return true;
  });

  const handleOpenAckModal = () => {
    if (!selectedPo) return;
    setAckDeliveryDate(selectedPo.promisedDeliveryDate || '2026-10-25');
    setAckNote('');
    setIsAckModalOpen(true);
  };

  const handleExecuteAck = () => {
    if (!selectedPo) return;
    onRecordSupplierAck(selectedPo.id, ackDeliveryDate, ackNote);
    setIsAckModalOpen(false);
  };

  const handleOpenAmendModal = () => {
    if (!selectedPo) return;
    const initialMap: { [lineId: string]: number } = {};
    for (const l of selectedPo.lines) {
      initialMap[l.id] = l.orderedQuantity;
    }
    setAmendLinesData(initialMap);
    setAmendmentReason('');
    setAmendError('');
    setIsAmendModalOpen(true);
  };

  const handleExecuteAmend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPo) return;

    if (!amendmentReason.trim()) {
      setAmendError('يجب تدوين سبب ومسوغات التعديل (Amendment Reason).');
      return;
    }

    // Strict validation: cannot reduce below quantityReceivedAtDock
    for (const line of selectedPo.lines) {
      const newQty = amendLinesData[line.id] ?? line.orderedQuantity;
      if (newQty < line.quantityReceivedAtDock) {
        setAmendError(`لا يمكن تعديل كمية البند (${line.itemDescriptionAr}) إلى ${newQty} لأن الكمية المستلمة فعلياً برصيف المستودع تبلغ ${line.quantityReceivedAtDock}.`);
        return;
      }
    }

    const updates = selectedPo.lines.map(l => ({
      lineId: l.id,
      newQuantity: amendLinesData[l.id] ?? l.orderedQuantity,
      reason: amendmentReason
    }));

    onAmendPo(selectedPo.id, updates, amendmentReason);
    setIsAmendModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-600" />
            <span>أوامر الشراء ومتابعة التوريد (Purchase Orders & Follow-up)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            إصدار واعتماد أوامر الشراء، إرسالها تجريبياً للموردين، تسجيل تأكيد التوريد، ومتابعة الاستلام برصيف المستودع.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterDocStatus}
            onChange={(e) => setFilterDocStatus(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
          >
            <option value="all">كافة حالات الأمر (Doc Status)</option>
            <option value="draft">مسودة (Draft)</option>
            <option value="approved">معتمد (Approved)</option>
            <option value="under_amendment">قيد التعديل (Amended)</option>
          </select>

          <select
            value={filterFulfillment}
            onChange={(e) => setFilterFulfillment(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
          >
            <option value="all">كافة حالات التوريد (Fulfillment)</option>
            <option value="unfulfilled">لم يبدأ التوريد</option>
            <option value="partially_shipped">شحن جزئي من المورد</option>
            <option value="partially_received">استلام جزئي بالرصيف</option>
            <option value="fully_received">مكتمل الاستلام</option>
          </select>
        </div>
      </div>

      {/* Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: POs Worklist (5 cols) */}
        <div className="lg:col-span-5 space-y-2 max-h-[650px] overflow-y-auto pr-1">
          {filteredPos.map(po => {
            const isSelected = po.id === selectedPoId;
            return (
              <div
                key={po.id}
                onClick={() => setSelectedPoId(po.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/50 border-indigo-500 shadow-xs ring-1 ring-indigo-500/30'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900">{po.poNumber}</span>
                  <div className="flex items-center gap-1">
                    {/* Document Status */}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      po.documentStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      po.documentStatus === 'under_amendment' ? 'bg-purple-100 text-purple-800' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {po.documentStatus === 'approved' ? 'معتمد' :
                       po.documentStatus === 'under_amendment' ? 'معدل (V2)' : 'مسودة'}
                    </span>

                    {/* Transmission Status */}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      po.communicationStatus === 'acknowledged' ? 'bg-blue-100 text-blue-800' :
                      po.communicationStatus === 'simulated_sent' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {po.communicationStatus === 'acknowledged' ? 'مؤكد من المورد' :
                       po.communicationStatus === 'simulated_sent' ? 'تم الإرسال تجريبياً' : 'لم يُرسل'}
                    </span>
                  </div>
                </div>

                <div className="mt-1">
                  <h4 className="text-xs font-bold text-slate-800">{po.supplierNameAr}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{po.paymentTerms}</p>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-mono font-bold text-indigo-700">
                    {(po.totalAmountSar ?? 0).toLocaleString()} SAR
                  </span>
                  <span className="text-slate-600 font-medium">
                    {po.fulfillmentStatus === 'partially_received' ? 'استلام جزئي بالرصيف' :
                     po.fulfillmentStatus === 'partially_shipped' ? 'شحن جزئي' :
                     po.fulfillmentStatus === 'unfulfilled' ? 'بانتظار الشحن' : po.fulfillmentStatus}
                  </span>
                  <span>{po.createdAt.substring(0, 10)}</span>
                </div>
              </div>
            );
          })}

          {filteredPos.length === 0 && (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
              لا توجد أوامر شراء مطابقة لمعايير الفلترة.
            </div>
          )}
        </div>

        {/* Right Side: Selected PO Details (7 cols) */}
        <div className="lg:col-span-7">
          {selectedPo ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5">
              
              {/* Top Details & Badges */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-slate-900">{selectedPo.poNumber}</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      selectedPo.documentStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      selectedPo.documentStatus === 'under_amendment' ? 'bg-purple-100 text-purple-800' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {selectedPo.documentStatus === 'approved' ? 'أمر شراء معتمد' :
                       selectedPo.documentStatus === 'under_amendment' ? `تعديل رقم (${selectedPo.amendmentVersion})` :
                       'مسودة'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      selectedPo.communicationStatus === 'acknowledged' ? 'bg-blue-100 text-blue-800' :
                      selectedPo.communicationStatus === 'simulated_sent' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {selectedPo.communicationStatus === 'acknowledged' ? 'تم استلام تأكيد المورد' :
                       selectedPo.communicationStatus === 'simulated_sent' ? 'تم الإرسال تجريبياً (بانتظار التأكيد)' :
                       'لم يُرسل للمورد بعد'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-1">المورد: {selectedPo.supplierNameAr}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
                    <span>شروط الدفع: <strong className="text-slate-700">{selectedPo.paymentTerms}</strong></span>
                    <span>الموعد المتوقع: <strong className="text-slate-700">{selectedPo.promisedDeliveryDate || 'غير محدد'}</strong></span>
                    <span>موقع التسليم: <strong className="text-slate-700">{selectedPo.deliveryLocationNameAr}</strong></span>
                  </div>
                </div>

                {/* Financial Total Box */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-left shrink-0">
                  <span className="text-[10px] text-slate-400 font-semibold block">القيمة الإجمالية شاملة الضريبة</span>
                  <span className="font-mono text-lg font-bold text-indigo-700">
                    {(selectedPo.totalAmountSar ?? 0).toLocaleString()} SAR
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    الضريبة: {(selectedPo.vatAmountSar ?? 0).toLocaleString()} SAR (15%)
                  </span>
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                
                {/* Approve Button */}
                {selectedPo.documentStatus === 'draft' && (
                  <button
                    onClick={() => onApprovePo(selectedPo.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>اعتماد أمر الشراء (Approve PO)</span>
                  </button>
                )}

                {/* Simulated Send Button */}
                {selectedPo.documentStatus === 'approved' && selectedPo.communicationStatus === 'not_sent' && (
                  <button
                    onClick={() => onSimulateSendPo(selectedPo.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>إرسال تجريبي للمورد (Simulate Send)</span>
                  </button>
                )}

                {/* Record Supplier Acknowledgment */}
                {selectedPo.communicationStatus === 'simulated_sent' && (
                  <button
                    onClick={handleOpenAckModal}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <Clock className="w-4 h-4" />
                    <span>تسجيل تأكيد المورد وموعد التوريد (Ack)</span>
                  </button>
                )}

                {/* Amend PO Button */}
                <button
                  onClick={handleOpenAmendModal}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <FileEdit className="w-4 h-4" />
                  <span>تعديل أمر الشراء (Amend PO)</span>
                </button>
              </div>

              {/* Lines Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                  بنود أمر الشراء والكميات ({selectedPo.lines.length})
                </h4>

                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">الصنف والمواصفات</th>
                        <th className="p-2.5">الكمية المطلوبة</th>
                        <th className="p-2.5">المستلم بالرصيف</th>
                        <th className="p-2.5">المرفوض بالجودة</th>
                        <th className="p-2.5">سعر الوحدة</th>
                        <th className="p-2.5">الإجمالي</th>
                        <th className="p-2.5 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedPo.lines.map((line, idx) => (
                        <tr key={line.id} className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-mono text-slate-400">{idx + 1}</td>
                          <td className="p-2.5">
                            <div className="font-bold text-slate-900">{line.itemDescriptionAr}</div>
                            <div className="font-mono text-[10px] text-slate-400">{line.itemCode}</div>
                          </td>
                          <td className="p-2.5 font-mono font-bold text-slate-900">
                            {line.orderedQuantity} {line.orderedUom}
                          </td>
                          <td className="p-2.5 font-mono text-teal-700 font-bold">
                            {line.quantityReceivedAtDock}
                          </td>
                          <td className="p-2.5 font-mono text-red-600 font-bold">
                            {line.quantityRejectedAtDock > 0 ? (
                              <span className="bg-red-50 px-2 py-0.5 rounded border border-red-200">
                                {line.quantityRejectedAtDock}
                              </span>
                            ) : (
                              <span className="text-slate-400">0</span>
                            )}
                          </td>
                          <td className="p-2.5 font-mono text-slate-700">
                            {(line.unitPriceSar ?? 0).toLocaleString()} SAR
                          </td>
                          <td className="p-2.5 font-mono font-bold text-indigo-900">
                            {(line.totalPriceSar ?? 0).toLocaleString()} SAR
                          </td>
                          <td className="p-2.5 text-center">
                            {line.quantityRejectedAtDock > 0 && (
                              <button
                                onClick={() => onCreateClaimForPo(selectedPo.id, line.id, line.quantityRejectedAtDock)}
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold rounded border border-amber-200 cursor-pointer"
                              >
                                مطالبة مورد
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* READ-ONLY INVENTORY RECEIPT REFERENCE (Integration Boundary) */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-teal-600" />
                    <h4 className="text-xs font-bold text-slate-900">
                      بيانات الاستلام والتفريغ المخزني (Inventory Receipt Reference — Read Only)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono bg-teal-50 text-teal-800 px-2 py-0.5 rounded border border-teal-200">
                    READ-ONLY BOUNDARY
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  يتم توثيق الاستلام الفعلي للبضائع داخل قسم المستودعات عبر مذكرة الاستلام (GRN). تعرض إدارة المشتريات هذه البيانات للقراءة والمتابعة فقط دون تكرار أو تعديل على قيود المستودع.
                </p>

                {selectedPo.inventoryReceiptReference ? (
                  <div className="mt-2 p-3 bg-white rounded-lg border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-teal-800">
                          {selectedPo.inventoryReceiptReference}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-100 text-teal-800">
                          استلام رصيف المستودع المركزي
                        </span>
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        آخر تحديث للاستلام: {selectedPo.lastFulfillmentUpdate || '2026-09-20'}
                      </div>
                    </div>
                    <span className="font-mono text-slate-700 font-bold">
                      {selectedPo.lines.reduce((acc, l) => acc + l.quantityReceivedAtDock, 0)} وحدة مستلمة
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-400 text-xs text-center">
                    لم يتم تسجيل أي استلام مخزني في المستودع لأمر الشراء هذا حتى الآن (No Inventory receipt recorded).
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              اختر أمر شراء لعرض تفاصيل التوريد وبنوده.
            </div>
          )}
        </div>

      </div>

      {/* SUPPLIER ACKNOWLEDGMENT MODAL */}
      {isAckModalOpen && selectedPo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 text-right">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                تسجيل إشعار تأكيد المورد (Supplier Acknowledgment)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تأكيد المورد لاستلام أمر الشراء {selectedPo.poNumber} وتحديد تاريخ التوريد الملتزم به.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  تاريخ التوريد الملتزم به من المورد:
                </label>
                <input
                  type="date"
                  value={ackDeliveryDate}
                  onChange={(e) => setAckDeliveryDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  ملاحظات تأكيد المورد (رقم بوليصة الشحن، طريقة النقل):
                </label>
                <textarea
                  rows={2}
                  value={ackNote}
                  onChange={(e) => setAckNote(e.target.value)}
                  placeholder="ملاحظات المورد..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsAckModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleExecuteAck}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                حفظ تأكيد المورد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AMENDMENT DRAWER / MODAL (PROC25) */}
      {isAmendModalOpen && selectedPo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-right">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileEdit className="w-5 h-5 text-indigo-600" />
                <span>تعديل أمر الشراء رسمياً (PO Formal Amendment)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                أمر الشراء: {selectedPo.poNumber} - الإصدار الحالي: V{selectedPo.amendmentVersion || 1}
              </p>
            </div>

            {amendError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{amendError}</span>
              </div>
            )}

            <form onSubmit={handleExecuteAmend} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  سبب ومسوغات التعديل (Amendment Reason) <span className="text-red-500">*</span>:
                </label>
                <textarea
                  rows={2}
                  value={amendmentReason}
                  onChange={(e) => setAmendmentReason(e.target.value)}
                  placeholder="بيان سبب تعديل الكميات أو الشروط..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-2">تعديل كميات البنود:</span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedPo.lines.map(line => (
                    <div key={line.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-slate-900 block">{line.itemDescriptionAr}</span>
                        <span className="text-slate-500 text-[11px]">
                          المستلم بالرصيف: <strong>{line.quantityReceivedAtDock}</strong> (لا يمكن تخفيض الكمية دون ذلك)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-slate-600">الكمية الجديدة:</span>
                        <input
                          type="number"
                          min={line.quantityReceivedAtDock}
                          value={amendLinesData[line.id] ?? line.orderedQuantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || line.quantityReceivedAtDock;
                            setAmendLinesData(prev => ({ ...prev, [line.id]: val }));
                          }}
                          className="w-20 p-1.5 bg-white border border-slate-300 rounded text-center font-mono font-bold text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAmendModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  تأكيد التعديل وإصدار النسخة الجديدة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
