import React, { useState } from 'react';
import {
  Inbox,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Truck,
  Sparkles,
  ArrowRight,
  Filter,
  Plus,
  RefreshCw,
  Clock,
  Check,
  Eye
} from 'lucide-react';
import {
  CSSDOpsState,
  ContaminatedReturnRecord,
  CSSDReusableSetInstance
} from '../../../types/cssdOps';
import { reconcileContaminatedReceipt } from '../../../utils/cssdWorkflowEngine';

interface DirtyReceiptDeconWorkspaceProps {
  state: CSSDOpsState;
  onUpdateReturnRecord: (record: ContaminatedReturnRecord) => void;
  onUpdateSetInstance: (set: CSSDReusableSetInstance) => void;
  onAddAuditLog: (action: string, entityId: string, description: string) => void;
}

export const DirtyReceiptDeconWorkspace: React.FC<DirtyReceiptDeconWorkspaceProps> = ({
  state,
  onUpdateReturnRecord,
  onUpdateSetInstance,
  onAddAuditLog
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    state.contaminatedReturns[0]?.id || ''
  );
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'discrepancy' | 'quarantine'>('all');
  const [reconcileFeedback, setReconcileFeedback] = useState<{
    type: 'success' | 'warning' | 'error';
    msg: string;
  } | null>(null);

  const selectedRecord = state.contaminatedReturns.find(r => r.id === selectedRecordId);

  const filteredRecords = state.contaminatedReturns.filter(r => {
    if (activeFilter === 'pending') return r.receiptStatus === 'returned_pending_receipt';
    if (activeFilter === 'discrepancy') return r.receiptStatus === 'received_with_discrepancy';
    if (activeFilter === 'quarantine') return r.receiptStatus === 'rejected_quarantine';
    return true;
  });

  const handleVerifyReceipt = (record: ContaminatedReturnRecord) => {
    // Find associated set instance
    const associatedSetId = record.setInstanceIds[0];
    const setInstance = state.setInstances.find(s => s.id === associatedSetId) || {
      id: associatedSetId || 'SET-INST-DEFAULT',
      setDefinitionId: 'SET-DEF-CABG-01',
      setNameAr: 'طقم جراحي مخصص',
      setNameEn: 'Special Surgical Tray',
      serialNumber: 'SN-UNKNOWN',
      currentZoningArea: 'dirty_decontamination',
      pointOfUseStatus: 'at_cssd',
      decontaminationStatus: 'pending_precleaning',
      inspectionStatus: 'pending_inspection',
      assemblyStatus: 'pending_assembly',
      packagingStatus: 'not_packaged',
      missingComponentsList: [],
      damagedComponentsList: [],
      substitutedComponentsList: []
    };

    const result = reconcileContaminatedReceipt(record, setInstance);

    if (!result.isValid) {
      setReconcileFeedback({
        type: 'error',
        msg: result.blockReasonAr || 'فشل التحقق من الاستلام'
      });
      onAddAuditLog('RECEIPT_HARD_BLOCK', record.id, result.blockReasonAr || 'حظر استلام لوجود مانع أمان قاطع');
      return;
    }

    if (result.updatedEntity) {
      onUpdateSetInstance(result.updatedEntity);
    }

    const updatedRecord: ContaminatedReturnRecord = {
      ...record,
      receiptStatus: record.returnedCount < record.expectedCount ? 'received_with_discrepancy' : 'received_complete'
    };
    onUpdateReturnRecord(updatedRecord);

    if (record.returnedCount < record.expectedCount) {
      setReconcileFeedback({
        type: 'warning',
        msg: result.blockReasonAr || 'تم الاستلام مع توثيق عجز في الأدوات'
      });
      onAddAuditLog('RECEIPT_DISCREPANCY_LOGGED', record.id, `استلام مع نقص: المتوقع ${record.expectedCount} والمستلم ${record.returnedCount}`);
    } else {
      setReconcileFeedback({
        type: 'success',
        msg: 'تم استلام الطقم ومطابقة العدد بالكامل ونقله لمرحلة التطهير الأولي بنجاح'
      });
      onAddAuditLog('RECEIPT_CONFIRMED_MATCH', record.id, `مطابقة واستلام كامل لحاوية العوادم (${record.returnedCount}/${record.expectedCount})`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Dirty Zone Decontamination Protocol */}
      <div className="bg-red-50/70 border border-red-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
          <div>
            <strong className="text-red-900 block font-bold">
              بروتوكول منطقة التطهير القذرة (Dirty Decontamination Receiving Area)
            </strong>
            <span className="text-red-700 text-[11px]">
              يجب ارتداء واقي الوجه والقفازات الثقيلة والمريلة المقاومة للسوائل • مطابقة العدد وحظر الأدوات أحادية الاستخدام قاطعاً
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="bg-red-200/80 text-red-900 font-bold px-2 py-0.5 rounded text-[10px] font-mono">
            ضغط سلبي فعال (Negative Pressure Zone)
          </span>
        </div>
      </div>

      {reconcileFeedback && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
            reconcileFeedback.type === 'error'
              ? 'bg-red-100 border-red-300 text-red-900'
              : reconcileFeedback.type === 'warning'
              ? 'bg-amber-100 border-amber-300 text-amber-900'
              : 'bg-emerald-100 border-emerald-300 text-emerald-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {reconcileFeedback.type === 'error' ? (
              <XCircle className="w-4 h-4 text-red-600" />
            ) : reconcileFeedback.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
            <span className="font-bold">{reconcileFeedback.msg}</span>
          </div>
          <button
            onClick={() => setReconcileFeedback(null)}
            className="text-xs font-bold underline cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Main Two-Column Layout: Inbound Return Manifests List & Detail Reconciliation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Returns Queue */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
          <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Inbox className="w-4 h-4 text-red-600" />
              <h3 className="font-bold text-xs text-slate-800">
                شحنات العائدات الملوثة الواردة ({filteredRecords.length})
              </h3>
            </div>
            <div className="flex items-center gap-1 text-[11px]">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  activeFilter === 'all' ? 'bg-red-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setActiveFilter('discrepancy')}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  activeFilter === 'discrepancy' ? 'bg-amber-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                بها عجز
              </button>
              <button
                onClick={() => setActiveFilter('quarantine')}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  activeFilter === 'quarantine' ? 'bg-red-800 text-white font-bold' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                محجوزة
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredRecords.map(rec => {
              const isSelected = rec.id === selectedRecordId;
              return (
                <div
                  key={rec.id}
                  onClick={() => {
                    setSelectedRecordId(rec.id);
                    setReconcileFeedback(null);
                  }}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isSelected ? 'bg-red-50/80 border-r-4 border-r-red-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-black text-slate-900">{rec.id}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        rec.receiptStatus === 'received_complete'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rec.receiptStatus === 'received_with_discrepancy'
                          ? 'bg-amber-100 text-amber-800'
                          : rec.receiptStatus === 'rejected_quarantine'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {rec.receiptStatus === 'received_complete'
                        ? 'مكتمل ومطابق'
                        : rec.receiptStatus === 'received_with_discrepancy'
                        ? 'مستلم بوجود عجز'
                        : rec.receiptStatus === 'rejected_quarantine'
                        ? 'محجوز / مرفوض'
                        : 'بانتظار الفرز'}
                    </span>
                  </div>

                  <div className="font-bold text-xs text-slate-800 mb-1">{rec.originDepartment}</div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-2">
                      {rec.orCaseReference && (
                        <span className="font-mono bg-blue-50 text-blue-700 px-1 rounded text-[10px]">
                          {rec.orCaseReference}
                        </span>
                      )}
                      <span>العدد: {rec.returnedCount} / {rec.expectedCount}</span>
                    </div>
                    <span>{rec.returnTimestamp.split(' ')[1]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Reconciliation & Decon Handoff Workbench */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
          {selectedRecord ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">
                      بيان استلام ومطابقة الحاوية: {selectedRecord.id}
                    </h3>
                    <span className="text-xs font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                      {selectedRecord.transportContainerId}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    وارد من {selectedRecord.originDepartment} • وقت الوصول: {selectedRecord.returnTimestamp}
                  </span>
                </div>

                <button
                  onClick={() => handleVerifyReceipt(selectedRecord)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>اعتماد الاستلام ونقل للتطهير</span>
                </button>
              </div>

              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                {/* Reference Read-only Patient & OR Metadata */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50/80 rounded-lg border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">حالة العمليات المرتبطة (OR Case)</span>
                    <strong className="text-slate-800 font-mono">
                      {selectedRecord.orCaseReference || 'غير محدد (طوارئ / عيادة)'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">المريض المعني (Read-Only Trace)</span>
                    <strong className="text-slate-800">
                      {selectedRecord.patientNameSynthetic || 'حالة غير مسجلة'} ({selectedRecord.patientMrnReference || 'N/A'})
                    </strong>
                  </div>
                </div>

                {/* Point-of-use Pre-treatment Audit */}
                <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 text-xs space-y-1">
                  <div className="font-bold text-blue-900 flex items-center justify-between">
                    <span>المعالجة الأولية عند نقطة الاستخدام (Point-of-Use Pre-treatment)</span>
                    <span className="font-mono text-[10px] bg-blue-200/80 text-blue-900 px-2 py-0.5 rounded">
                      {selectedRecord.pointOfUsePretreatment === 'enzymatic_foam_applied'
                        ? 'رغوة إنزيمية مطبقة (Enzymatic Foam Applied)'
                        : 'جافة غير معالجة (Dry Untreated)'}
                    </span>
                  </div>
                  <p className="text-blue-700 text-[11px] leading-relaxed">
                    منع جفاف الدم والإفرازات العضوية داخل غرف العمليات أمر حاسم لنجاح دورة الغسيل اللاحقة والتطهير الحراري A0.
                  </p>
                </div>

                {/* Count Verification & Discrepancies Grid */}
                <div className="border border-slate-200 rounded-lg p-3 space-y-3">
                  <h4 className="font-bold text-xs text-slate-800 flex items-center justify-between">
                    <span>نتائج فحص ومطابقة محتويات الطقم (Count Reconciliation)</span>
                    <span className="text-xs">
                      المستلم: <strong className="text-red-700">{selectedRecord.returnedCount}</strong> من أصل{' '}
                      <strong className="text-slate-700">{selectedRecord.expectedCount}</strong>
                    </span>
                  </h4>

                  {selectedRecord.discrepancyDetails?.singleUseFound &&
                    selectedRecord.discrepancyDetails.singleUseFound.length > 0 && (
                      <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-xs space-y-1">
                        <div className="font-black text-red-900 flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span>تنبيه أمان صارم: تم العثور على أداة استخدام أحادي (Single-Use Device)!</span>
                        </div>
                        <p className="text-red-800 text-[11px]">
                          {selectedRecord.discrepancyDetails.singleUseFound.join(' • ')}
                        </p>
                        <span className="text-[10px] bg-red-200 text-red-900 px-1.5 py-0.5 rounded font-bold inline-block">
                          SFDA Safety Rule: يحظر تماماً تعقيم الأجهزة أحادية الاستخدام وتوجّه للإتلاف
                        </span>
                      </div>
                    )}

                  {selectedRecord.discrepancyDetails?.missingItems &&
                    selectedRecord.discrepancyDetails.missingItems.length > 0 && (
                      <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs space-y-1">
                        <div className="font-bold text-amber-900 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span>أدوات مفقودة بعجز مسجل (Missing Items):</span>
                        </div>
                        <ul className="list-disc list-inside text-amber-800 text-[11px]">
                          {selectedRecord.discrepancyDetails.missingItems.map((itm, idx) => (
                            <li key={idx}>{itm}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {selectedRecord.returnedCount === selectedRecord.expectedCount && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>جميع الأدوات الجراحية مطابقة بنسبة 100% ولا توجد أي أدوات حادة أو خطرة غير مصرح بها.</span>
                    </div>
                  )}
                </div>

                {/* Notes & Auditor Sign-off */}
                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-bold block text-slate-800 mb-1">ملاحظات فني الاستلام:</span>
                  <p className="text-[11px] text-slate-600">{selectedRecord.exceptionNotes || 'لا توجد ملاحظات إضافية.'}</p>
                  <div className="mt-2 text-[10px] text-slate-400">
                    مستلم الشحنة: <strong className="text-slate-600">{selectedRecord.receivingStaff}</strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
              اختر شحنة عوادم لعرض تفاصيل المطابقة
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
