import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Send, 
  Search, 
  CheckSquare, 
  Square, 
  Building, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Users, 
  FileCheck,
  CheckCircle2,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { 
  PurchaseRequisition, 
  PurchaseRequisitionLine, 
  SourcingEvent, 
  ProcurementMethod, 
  SupplierMaster,
  SupplierCategory
} from '../../types/procurementOps';

interface ProcurementIntakeSourcingProps {
  requisitions: PurchaseRequisition[];
  sourcingEvents: SourcingEvent[];
  suppliers: SupplierMaster[];
  onConsolidateSourcing: (
    selectedLines: { sourceRequisitionId: string; sourceRequisitionLineId: string; allocateQuantity: number }[],
    sourcingTitleAr: string,
    sourcingTitleEn: string,
    method: ProcurementMethod,
    category: SupplierCategory,
    submissionDeadline: string,
    isEmergency?: boolean,
    emergencyJustification?: string
  ) => void;
  onInviteSupplier: (sourcingEventId: string, supplierId: string) => void;
  onSimulateSendInvitation: (sourcingEventId: string, supplierId: string) => void;
  onNavigateToEvaluation: (sourcingEventId: string) => void;
}

export const ProcurementIntakeSourcingView: React.FC<ProcurementIntakeSourcingProps> = ({
  requisitions,
  sourcingEvents,
  suppliers,
  onConsolidateSourcing,
  onInviteSupplier,
  onSimulateSendInvitation,
  onNavigateToEvaluation
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'consolidation' | 'sourcing_events'>('consolidation');
  
  // Consolidation Workbench Selection
  const [selectedLinesMap, setSelectedLinesMap] = useState<{ [key: string]: { prId: string; lineId: string; quantity: number } }>({});
  const [isConsolidationModalOpen, setIsConsolidationModalOpen] = useState<boolean>(false);
  const [eventTitleAr, setEventTitleAr] = useState<string>('');
  const [eventMethod, setEventMethod] = useState<ProcurementMethod>('rfq');
  const [eventCategory, setEventCategory] = useState<SupplierCategory>('medical_surgical_consumables');
  const [eventDeadline, setEventDeadline] = useState<string>('2026-10-15');
  const [isEmergency, setIsEmergency] = useState<boolean>(false);
  const [emergencyReason, setEmergencyReason] = useState<string>('');

  // Sourcing Events Detail
  const [selectedEventId, setSelectedEventId] = useState<string>(sourcingEvents[0]?.id || '');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [selectedSupplierToInvite, setSelectedSupplierToInvite] = useState<string>(suppliers[0]?.id || '');

  // Flatten available approved unsourced PR lines
  const availableApprovedPrLines: { pr: PurchaseRequisition; line: PurchaseRequisitionLine }[] = [];
  for (const pr of requisitions) {
    if (pr.status === 'approved' || pr.status === 'partially_sourced') {
      for (const line of pr.lines) {
        if (line.remainingUnsourcedQuantity > 0) {
          availableApprovedPrLines.push({ pr, line });
        }
      }
    }
  }

  const toggleSelectLine = (prId: string, line: PurchaseRequisitionLine) => {
    setSelectedLinesMap(prev => {
      const next = { ...prev };
      if (next[line.id]) {
        delete next[line.id];
      } else {
        next[line.id] = {
          prId,
          lineId: line.id,
          quantity: line.remainingUnsourcedQuantity
        };
      }
      return next;
    });
  };

  const updateAllocatedQuantity = (lineId: string, qty: number, maxQty: number) => {
    const validQty = Math.max(1, Math.min(qty, maxQty));
    setSelectedLinesMap(prev => {
      if (!prev[lineId]) return prev;
      return {
        ...prev,
        [lineId]: { ...prev[lineId], quantity: validQty }
      };
    });
  };

  const handleOpenConsolidationModal = () => {
    const keys = Object.keys(selectedLinesMap);
    if (keys.length === 0) {
      alert('يرجى اختيار بند واحد على الأقل من البنود المعتمدة لتجميع الاحتياج.');
      return;
    }
    setEventTitleAr(`منافسة توريد مجمعة - ${keys.length} بنود طبية معتمدة`);
    setIsConsolidationModalOpen(true);
  };

  const handleExecuteConsolidation = (e: React.FormEvent) => {
    e.preventDefault();
    const candidateList = (Object.values(selectedLinesMap) as { prId: string; lineId: string; quantity: number }[]).map(item => ({
      sourceRequisitionId: item.prId,
      sourceRequisitionLineId: item.lineId,
      allocateQuantity: item.quantity
    }));

    onConsolidateSourcing(
      candidateList,
      eventTitleAr,
      'Consolidated Healthcare Sourcing Event',
      eventMethod,
      eventCategory,
      eventDeadline,
      isEmergency,
      emergencyReason
    );

    setSelectedLinesMap({});
    setIsConsolidationModalOpen(false);
    setActiveSubTab('sourcing_events');
  };

  const handleExecuteInvite = () => {
    if (!selectedEventId || !selectedSupplierToInvite) return;
    onInviteSupplier(selectedEventId, selectedSupplierToInvite);
    setIsInviteModalOpen(false);
  };

  const selectedEvent = sourcingEvents.find(s => s.id === selectedEventId);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Sub-Navigation Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <span>تجميع الاحتياج وإدارة المنافسات (Intake & Sourcing)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            تجميع البنود المعتمدة من عدة أقسام سريرية في منافسة واحدة، دعوة الموردين، وإصدار طلبات العروض (RFQ/ITB).
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveSubTab('consolidation')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'consolidation'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            تجميع الاحتياج ({availableApprovedPrLines.length} بند متاح)
          </button>
          <button
            onClick={() => setActiveSubTab('sourcing_events')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'sourcing_events'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            المنافسات الجارية ({sourcingEvents.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: DEMAND CONSOLIDATION WORKBENCH */}
      {activeSubTab === 'consolidation' && (
        <div className="space-y-4">
          
          {/* Action Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">البنود المحددة للتجميع:</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-100 text-indigo-800">
                {Object.keys(selectedLinesMap).length} بند
              </span>
            </div>

            <button
              onClick={handleOpenConsolidationModal}
              disabled={Object.keys(selectedLinesMap).length === 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                Object.keys(selectedLinesMap).length > 0
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>تجميع وطرح في منافسة جديدة (Consolidate to RFQ)</span>
            </button>
          </div>

          {/* Table of Approved Unsourced Lines */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3 w-12 text-center">اختيار</th>
                    <th className="p-3">رقم طلب الشراء</th>
                    <th className="p-3">القسم الطالب</th>
                    <th className="p-3">الصنف والمواصفات</th>
                    <th className="p-3">الوحدة</th>
                    <th className="p-3">الكمية المعتمدة</th>
                    <th className="p-3">المتبقي للطرح</th>
                    <th className="p-3">الكمية للتجميع</th>
                    <th className="p-3">تاريخ التسليم المطلوب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {availableApprovedPrLines.map(({ pr, line }) => {
                    const isSelected = !!selectedLinesMap[line.id];
                    return (
                      <tr key={line.id} className={isSelected ? 'bg-indigo-50/40' : 'hover:bg-slate-50/50'}>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => toggleSelectLine(pr.id, line)}
                            className="text-indigo-600 focus:outline-none cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300" />
                            )}
                          </button>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-800">{pr.requisitionNumber}</td>
                        <td className="p-3 text-slate-700 font-medium">{pr.requestingDepartmentNameAr}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{line.itemDescriptionAr}</div>
                          <div className="font-mono text-[10px] text-slate-400">{line.itemCode}</div>
                        </td>
                        <td className="p-3 text-slate-600">{line.requestedUom}</td>
                        <td className="p-3 font-mono text-slate-700">{line.approvedQuantity}</td>
                        <td className="p-3 font-mono font-bold text-indigo-700">{line.remainingUnsourcedQuantity}</td>
                        <td className="p-3">
                          {isSelected ? (
                            <input
                              type="number"
                              min="1"
                              max={line.remainingUnsourcedQuantity}
                              value={selectedLinesMap[line.id]?.quantity || line.remainingUnsourcedQuantity}
                              onChange={(e) => updateAllocatedQuantity(line.id, parseInt(e.target.value) || 1, line.remainingUnsourcedQuantity)}
                              className="w-20 p-1 bg-white border border-indigo-300 rounded text-center font-mono font-bold text-xs"
                            />
                          ) : (
                            <span className="text-slate-400 font-mono">-</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-600">{line.requiredDeliveryDate}</td>
                      </tr>
                    );
                  })}
                  {availableApprovedPrLines.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400 text-xs">
                        لا توجد بنود طلبات معتمدة بانتظار الطرح حالياً. كافة البنود تم طرحها أو أنها غير معتمدة.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: SOURCING EVENTS LIST & DETAIL */}
      {activeSubTab === 'sourcing_events' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Sourcing Events List (5 cols) */}
          <div className="lg:col-span-5 space-y-2">
            {sourcingEvents.map(evt => {
              const isSelected = evt.id === selectedEventId;
              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEventId(evt.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/50 border-indigo-500 shadow-xs ring-1 ring-indigo-500/30'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900">{evt.sourcingNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      evt.status === 'under_evaluation' ? 'bg-purple-100 text-purple-800' :
                      evt.status === 'published_awaiting_bids' ? 'bg-blue-100 text-blue-800' :
                      evt.status === 'awarded' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {evt.status === 'under_evaluation' ? 'قيد التقييم' :
                       evt.status === 'published_awaiting_bids' ? 'بانتظار العروض' :
                       evt.status === 'awarded' ? 'تمت الترسية' : evt.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 mt-1">{evt.titleAr}</h4>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="uppercase font-semibold text-indigo-600">{evt.method}</span>
                    <span>{evt.lines.length} بنود</span>
                    <span>{evt.invitedSuppliers.length} موردين مدعوين</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sourcing Event Detail & Supplier Invitations (7 cols) */}
          <div className="lg:col-span-7">
            {selectedEvent ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5">
                
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-900">{selectedEvent.sourcingNumber}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {selectedEvent.method === 'rfq' ? 'طلب عروض أسعار (RFQ)' :
                         selectedEvent.method === 'formal_tender' ? 'منافسة عامة (Tender)' :
                         selectedEvent.method === 'emergency_single_source' ? 'شراء طارئ استثنائي' : selectedEvent.method}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{selectedEvent.titleAr}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      المشتري المسؤول: <strong className="text-slate-700">{selectedEvent.responsibleBuyerNameAr}</strong> | آخر موعد لاستلام العروض: <strong className="text-slate-700">{selectedEvent.submissionDeadline}</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigateToEvaluation(selectedEvent.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
                  >
                    <span>تقييم العروض والترسية</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Sourcing Lines */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                    بنود المنافسة المجمعة ({selectedEvent.lines.length})
                  </h4>
                  <div className="border border-slate-200 rounded-lg overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">#</th>
                          <th className="p-2.5">الصنف والمواصفات</th>
                          <th className="p-2.5">الكمية المستهدفة</th>
                          <th className="p-2.5">الوحدة</th>
                          <th className="p-2.5">الطلب المصدر</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedEvent.lines.map((l, idx) => (
                          <tr key={l.id}>
                            <td className="p-2.5 font-mono text-slate-400">{idx + 1}</td>
                            <td className="p-2.5">
                              <div className="font-bold text-slate-900">{l.descriptionAr}</div>
                              <div className="font-mono text-[10px] text-slate-400">{l.itemCode}</div>
                            </td>
                            <td className="p-2.5 font-mono font-bold text-slate-900">{l.targetQuantity}</td>
                            <td className="p-2.5 text-slate-600">{l.targetUom}</td>
                            <td className="p-2.5 font-mono text-slate-500">{l.sourceRequisitionId}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Invited Suppliers Tracker */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      الموردون المدعوون وتأكيد الاستلام ({selectedEvent.invitedSuppliers.length})
                    </h4>
                    <button
                      onClick={() => setIsInviteModalOpen(true)}
                      className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>دعوة مورد جديد</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {selectedEvent.invitedSuppliers.map(inv => {
                      const sup = suppliers.find(s => s.id === inv.supplierId);
                      return (
                        <div key={inv.supplierId} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{sup?.legalNameAr || inv.supplierId}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                inv.invitationStatus === 'quotation_received' ? 'bg-emerald-100 text-emerald-800' :
                                inv.invitationStatus === 'acknowledged' ? 'bg-blue-100 text-blue-800' :
                                inv.invitationStatus === 'simulated_sent' ? 'bg-amber-100 text-amber-800' :
                                'bg-slate-200 text-slate-700'
                              }`}>
                                {inv.invitationStatus === 'quotation_received' ? 'تم استلام العرض' :
                                 inv.invitationStatus === 'acknowledged' ? 'أكد استلام الدعوة' :
                                 inv.invitationStatus === 'simulated_sent' ? 'تم الإرسال (غير مؤكد)' :
                                 inv.invitationStatus}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              تاريخ الدعوة: {inv.invitedAt} | طريقة الإرسال: {inv.transmissionMethod}
                            </div>
                          </div>

                          {inv.invitationStatus === 'prepared' && (
                            <button
                              onClick={() => onSimulateSendInvitation(selectedEvent.id, inv.supplierId)}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                            >
                              إرسال تجريبي للدعوة
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {selectedEvent.invitedSuppliers.length === 0 && (
                      <div className="p-4 text-center text-slate-400 text-xs bg-slate-50 rounded-lg border border-slate-100">
                        لم تتم دعوة أي موردين لهذه المنافسة بعد.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
                اختر منافسة لعرض تفاصيلها ودعوة الموردين.
              </div>
            )}
          </div>

        </div>
      )}

      {/* CONSOLIDATION MODAL */}
      {isConsolidationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-right">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                طرح البنود في منافسة جديدة (Consolidate into Sourcing Event)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تحديد طريقة الشراء والموعد النهائي لتقديم العروض.
              </p>
            </div>

            <form onSubmit={handleExecuteConsolidation} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">عنوان المنافسة:</label>
                <input
                  type="text"
                  value={eventTitleAr}
                  onChange={(e) => setEventTitleAr(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">طريقة الشراء:</label>
                  <select
                    value={eventMethod}
                    onChange={(e) => {
                      const m = e.target.value as ProcurementMethod;
                      setEventMethod(m);
                      setIsEmergency(m === 'emergency_single_source');
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="rfq">طلب عروض أسعار (RFQ - 3 Quotes)</option>
                    <option value="formal_tender">منافسة عامة (Formal Tender)</option>
                    <option value="direct_purchase">شراء مباشر (Direct Purchase)</option>
                    <option value="emergency_single_source">شراء طارئ استثنائي (Emergency Exception)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">موعد إغلاق العروض:</label>
                  <input
                    type="date"
                    value={eventDeadline}
                    onChange={(e) => setEventDeadline(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              {/* Emergency Justification (PROC18) */}
              {isEmergency && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-2">
                  <div className="flex items-center gap-1.5 text-red-800 font-bold">
                    <ShieldAlert className="w-4 h-4" />
                    <span>مسوغات الشراء الاستثنائي الطارئ (Emergency Single Source):</span>
                  </div>
                  <textarea
                    rows={2}
                    value={emergencyReason}
                    onChange={(e) => setEmergencyReason(e.target.value)}
                    placeholder="تدوين أسباب الاستثناء السريري أو الوكيل الوحيد المعتمد..."
                    className="w-full p-2 bg-white border border-red-200 rounded text-xs"
                    required
                  />
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsConsolidationModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  إنشاء المنافسة وطرحها
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVITE SUPPLIER MODAL */}
      {isInviteModalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 text-right">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">دعوة مورد للمنافسة</h3>
              <p className="text-xs text-slate-500 mt-0.5">{selectedEvent.titleAr}</p>
            </div>

            <div className="space-y-3 text-xs">
              <label className="font-bold text-slate-700 block">اختر المورد من سجل الموردين:</label>
              <select
                value={selectedSupplierToInvite}
                onChange={(e) => setSelectedSupplierToInvite(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.legalNameAr} ({s.qualificationStatus})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                onClick={handleExecuteInvite}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-xs cursor-pointer"
              >
                إضافة وإرسال دعوة
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
