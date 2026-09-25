import React, { useState } from 'react';
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Search,
  Filter,
  Layers,
  Thermometer,
  Calendar,
  Building,
  UserCheck,
  CheckSquare,
  FileCheck,
  Info
} from 'lucide-react';
import { PharmacyReceivingRecord } from '../../types/pharmacyOps';

interface InventoryReceivingViewProps {
  receivingRecords: PharmacyReceivingRecord[];
  onUpdateInspectionStatus: (
    recordId: string,
    newStatus: PharmacyReceivingRecord['inspectionStatus'],
    acceptedQty: number,
    quarantinedQty: number,
    notes: string
  ) => void;
}

export const InventoryReceivingView: React.FC<InventoryReceivingViewProps> = ({
  receivingRecords,
  onUpdateInspectionStatus
}) => {
  const [selectedRecord, setSelectedRecord] = useState<PharmacyReceivingRecord | null>(
    receivingRecords[0] || null
  );
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'quarantined'>('all');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState<PharmacyReceivingRecord['inspectionStatus']>('accepted');

  const filteredRecords = receivingRecords.filter(item => {
    if (statusFilter === 'pending') return item.inspectionStatus === 'pending_inspection';
    if (statusFilter === 'accepted') return item.inspectionStatus === 'accepted';
    if (statusFilter === 'quarantined') return item.inspectionStatus === 'quarantined' || item.inspectionStatus === 'rejected';
    return true;
  });

  const handleOpenInspection = (record: PharmacyReceivingRecord, status: PharmacyReceivingRecord['inspectionStatus']) => {
    setSelectedRecord(record);
    setTargetStatus(status);
    setInspectionNotes(record.inspectionNotes || '');
    setShowInspectionModal(true);
  };

  const handleExecuteInspection = () => {
    if (!selectedRecord) return;
    const accepted = targetStatus === 'accepted' ? selectedRecord.quantityReceived : 0;
    const quarantined = targetStatus !== 'accepted' ? selectedRecord.quantityReceived : 0;

    onUpdateInspectionStatus(
      selectedRecord.id,
      targetStatus,
      accepted,
      quarantined,
      inspectionNotes.trim() || 'تم استكمال الفحص الظاهري وقراءة مسجلات الحرارة ومطابقة شهادة التحليل.'
    );
    setShowInspectionModal(false);
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-teal-950 text-white rounded-xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold">استلام المخزون الدوائي والتفتيش الفني (Pharmacy Inventory Receiving & Stock Context)</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-900/60 text-teal-300 border border-teal-700">
                P14 Receiving Workflow
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              توثيق استلام الشحنات الدوائية، فحص سلامة التبريد والتشغيلات، والحجر الفني قبل الإتاحة للصرف
            </p>
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
              statusFilter === 'all'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            الكل ({receivingRecords.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
              statusFilter === 'pending'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            بانتظار التفتيش ({receivingRecords.filter(r => r.inspectionStatus === 'pending_inspection').length})
          </button>
          <button
            onClick={() => setStatusFilter('accepted')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
              statusFilter === 'accepted'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            مقبول ومتاح ({receivingRecords.filter(r => r.inspectionStatus === 'accepted').length})
          </button>
          <button
            onClick={() => setStatusFilter('quarantined')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
              statusFilter === 'quarantined'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            محجور / مرفوض ({receivingRecords.filter(r => r.inspectionStatus === 'quarantined' || r.inspectionStatus === 'rejected').length})
          </button>
        </div>
      </div>

      {/* Semantic Distinction Notice */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-950 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-sky-900">
            قاعدة سلامة المخزون: الاستلام الفيزيائي لا يعني تلقائياً إتاحة الدواء للصرف (Receiving ≠ Available for Dispense):
          </p>
          <p className="text-[11px] text-sky-800 leading-relaxed">
            الشحنات المستلمة تمر بمراحل محددة: <strong>مستلمة (Received)</strong> ← <strong>بانتظار التفتيش وسلسلة التبريد (Pending Inspection)</strong> ← ثم إما <strong>مقبولة (Accepted)</strong> أو <strong>محجورة (Quarantined)</strong> أو <strong>مرفوضة (Rejected)</strong>. تظل الكمية الفيزيائية مفصولة تماماً عن الكمية المتاحة للصرف إلى حين صدور قرار القبول الفني الصيدلاني.
          </p>
        </div>
      </div>

      {/* Records Table and Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Table List */}
        <div className="lg:col-span-7 space-y-3">
          {filteredRecords.map(record => (
            <div
              key={record.id}
              onClick={() => setSelectedRecord(record)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedRecord?.id === record.id
                  ? 'bg-white border-teal-500 shadow-sm ring-1 ring-teal-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 text-xs">{record.receiptReference}</span>
                  <span className="font-mono text-[10px] text-slate-500">{record.poReference}</span>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    record.inspectionStatus === 'accepted'
                      ? 'bg-emerald-100 text-emerald-800'
                      : record.inspectionStatus === 'pending_inspection'
                      ? 'bg-amber-100 text-amber-800 animate-pulse'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {record.inspectionStatus === 'accepted'
                    ? 'مقبول ومتاح للصرف'
                    : record.inspectionStatus === 'pending_inspection'
                    ? 'بانتظار التفتيش الفني'
                    : record.inspectionStatus === 'quarantined'
                    ? 'محجور للتحقق'
                    : 'مرفوض'}
                </span>
              </div>

              <div className="mt-2.5">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span>{record.medicationProduct.brandName}</span>
                  <span className="text-slate-500 font-normal font-mono">({record.medicationProduct.genericName})</span>
                  {record.medicationProduct.isTallMan && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-mono text-[9px] font-bold">
                      ISMP Tall-Man
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-teal-800 font-medium mt-0.5">
                  {record.quantityReceived} {record.packageUnit} • رقم التشغيلة: <span className="font-mono font-bold">{record.lotNumber}</span> • الصلاحية: {record.expiryDate}
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="truncate max-w-[260px]">المورد: {record.supplierName}</span>
                <span className="font-mono text-[10px]">{record.receivedAt}</span>
              </div>
            </div>
          ))}

          {filteredRecords.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
              لا توجد شحنات مستلمة مطابقة لخيارات الفرز الحالية.
            </div>
          )}
        </div>

        {/* Selected Record Detail Panel */}
        <div className="lg:col-span-5">
          {selectedRecord ? (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-4 sticky top-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">تفاصيل سند الاستلام والتفتيش</h4>
                  <div className="text-[11px] font-mono text-slate-500">
                    {selectedRecord.receiptReference} • {selectedRecord.poReference}
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                    selectedRecord.inspectionStatus === 'accepted'
                      ? 'bg-emerald-100 text-emerald-900'
                      : selectedRecord.inspectionStatus === 'pending_inspection'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-rose-100 text-rose-900'
                  }`}
                >
                  {selectedRecord.inspectionStatus === 'accepted'
                    ? 'مقبول'
                    : selectedRecord.inspectionStatus === 'pending_inspection'
                    ? 'بانتظار الفحص'
                    : 'محجور'}
                </span>
              </div>

              {/* Quantities Breakdown (Distinguishing physical vs available vs quarantined) */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 text-xs block">
                  مصفوفة الكميات المستلمة (Stock Quantities Distinction):
                </span>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">إجمالي الكمية الفيزيائية</span>
                    <strong className="text-sm font-bold text-slate-900">
                      {selectedRecord.stockQuantities.physical} {selectedRecord.packageUnit}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] text-emerald-700 block">المتاح الفعلي للصرف</span>
                    <strong className="text-sm font-bold text-emerald-800">
                      {selectedRecord.stockQuantities.availableForDispense} {selectedRecord.packageUnit}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-[10px] text-amber-700 block">المحجور تحت التفتيش</span>
                    <strong className="text-sm font-bold text-amber-800">
                      {selectedRecord.stockQuantities.quarantined} {selectedRecord.packageUnit}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200">
                    <span className="text-[10px] text-indigo-700 block">المحجوز لأوامر معتمدة</span>
                    <strong className="text-sm font-bold text-indigo-800">
                      {selectedRecord.stockQuantities.reserved} {selectedRecord.packageUnit}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Inspection Info & Cold Chain */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px]">المورد ومصدر التوريد:</span>
                  <strong className="text-slate-900">{selectedRecord.supplierName}</strong>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                  <div>
                    <span className="text-slate-500 block text-[10px]">موقع الاستلام والتفتيش:</span>
                    <span className="text-slate-800 font-medium">{selectedRecord.receivingLocation}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">شروط التخزين المطلوبة:</span>
                    <span className="text-slate-800 font-medium">{selectedRecord.storageCondition}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                  <div>
                    <span className="text-slate-500 block text-[10px]">المستلم الموثق:</span>
                    <span className="text-slate-800 font-medium">{selectedRecord.receivingActor}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">تاريخ ووقت الاستلام:</span>
                    <span className="text-slate-800 font-mono">{selectedRecord.receivedAt}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">ملاحظات التفتيش الفني:</span>
                  <p className="text-slate-800 bg-white p-2 rounded border border-slate-200">
                    {selectedRecord.inspectionNotes}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">الإجراء المترتب (Disposition Action):</span>
                  <p className="text-teal-900 font-bold bg-teal-50/80 p-1.5 rounded border border-teal-200">
                    {selectedRecord.dispositionAction}
                  </p>
                </div>
              </div>

              {/* Inspection Actions */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-800 text-xs block">إجراءات التفتيش والاعتماد الفني:</span>
                {(() => {
                  const isColdChainBreached = selectedRecord.inspectionNotes?.includes('اختراق') || selectedRecord.inspectionNotes?.includes('تجاوز') || selectedRecord.inspectionNotes?.includes('14.8');
                  const isPackagingDamaged = selectedRecord.inspectionNotes?.includes('تهتك') || selectedRecord.inspectionNotes?.includes('كسور') || selectedRecord.inspectionNotes?.includes('تلف');
                  const isMissingLotOrExpiry = !selectedRecord.lotNumber || selectedRecord.lotNumber === 'MISSING' || !selectedRecord.expiryDate;
                  const isBlockedFromRelease = isColdChainBreached || isPackagingDamaged || isMissingLotOrExpiry;

                  return (
                    <div className="space-y-2">
                      {isBlockedFromRelease && (
                        <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-900 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <span>
                            <strong>حظر الإتاحة للصرف:</strong> {isColdChainBreached ? 'رصد اختراق لسلسلة التبريد' : isPackagingDamaged ? 'رصد تلف في العبوات' : 'نقص رقم التشغيلة أو الصلاحية'}. الإجراء النظامي الإلزامي هو الحجر الفني لمنع تسرب الدواء للصرف.
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => !isBlockedFromRelease && handleOpenInspection(selectedRecord, 'accepted')}
                          disabled={isBlockedFromRelease}
                          className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                            isBlockedFromRelease
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer'
                          }`}
                          title={isBlockedFromRelease ? 'محظور الإتاحة للصرف نظراً لوجود مانع أمان فني' : 'قبول الشحنة وإتاحتها للصرف'}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>قبول وإتاحة للصرف</span>
                        </button>
                        <button
                          onClick={() => handleOpenInspection(selectedRecord, 'quarantined')}
                          className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>حجر فني للشحنة</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
              اختر سجلاً من القائمة لاستعراض تفاصيل التفتيش الفني وتحديث حالة المخزون.
            </div>
          )}
        </div>
      </div>

      {/* Inspection Modal */}
      {showInspectionModal && selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-teal-600" />
                <h4 className="font-bold text-slate-900 text-sm">
                  {targetStatus === 'accepted' ? 'قبول الشحنة وإتاحتها للصرف' : 'حجر الشحنة الدوائية وتوثيق الأسباب'}
                </h4>
              </div>
              <span className="font-mono text-xs text-slate-500">{selectedRecord.receiptReference}</span>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-600">
                المستحضر: <strong className="text-slate-900">{selectedRecord.medicationProduct.brandName}</strong> ({selectedRecord.medicationProduct.genericName})
              </p>
              <p className="text-slate-600">
                الكمية: <strong className="text-teal-800">{selectedRecord.quantityReceived} {selectedRecord.packageUnit}</strong> • التشغيلة: {selectedRecord.lotNumber}
              </p>

              {targetStatus === 'quarantined' && (
                <div className="space-y-1.5 pt-1">
                  <span className="font-bold text-slate-800 block">أسباب الحجر الفني السريع:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'اختراق سلسلة التبريد وتجاوز درجات الحرارة أثناء النقل',
                      'تهتك العبوة الخارجية أو اشتباه تلف الختم الأمني',
                      'غياب رقم التشغيلة أو عدم وضوح تاريخ انتهاء الصلاحية',
                      'عدم تطابق كمية الاستلام الفيزيائي مع إذن التوريد'
                    ].map((reason, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setInspectionNotes(prev => prev ? `${prev} | ${reason}` : reason)}
                        className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded text-[10px] font-medium transition-colors text-right cursor-pointer"
                      >
                        + {reason}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  تقرير الفحص الفني ومطابقة سلسلة التبريد (Inspection Documentation):
                </label>
                <textarea
                  value={inspectionNotes}
                  onChange={e => setInspectionNotes(e.target.value)}
                  placeholder="أدخل ملاحظات فحص الحاويات، درجات حرارة النقل، وشهادة التحليل المخبرية المعتمدة..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowInspectionModal(false)}
                className="px-4 py-2 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleExecuteInspection}
                className={`px-5 py-2 rounded-xl font-bold text-xs text-white transition-colors cursor-pointer ${
                  targetStatus === 'accepted' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                تأكيد قرار التفتيش
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
