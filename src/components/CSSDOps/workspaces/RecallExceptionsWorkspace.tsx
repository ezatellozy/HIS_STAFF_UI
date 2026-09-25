import React, { useState } from 'react';
import {
  AlertOctagon,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Eye,
  FileText,
  Activity,
  UserCheck,
  Check
} from 'lucide-react';
import {
  CSSDOpsState,
  CSSDRecallCase,
  CSSDQualityException
} from '../../../types/cssdOps';

interface RecallExceptionsWorkspaceProps {
  state: CSSDOpsState;
  onUpdateRecallCase: (recall: CSSDRecallCase) => void;
  onUpdateQualityException: (exc: CSSDQualityException) => void;
  onAddAuditLog: (action: string, entityId: string, description: string) => void;
}

export const RecallExceptionsWorkspace: React.FC<RecallExceptionsWorkspaceProps> = ({
  state,
  onUpdateRecallCase,
  onUpdateQualityException,
  onAddAuditLog
}) => {
  const [selectedRecallId, setSelectedRecallId] = useState<string>(
    state.recallCases[0]?.id || ''
  );
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);

  const selectedRecall = state.recallCases.find(r => r.id === selectedRecallId);

  // 1. Resolve Quality Exception
  const handleResolveException = (exc: CSSDQualityException) => {
    const updated: CSSDQualityException = {
      ...exc,
      status: 'resolved',
      resolvedAt: new Date().toLocaleTimeString('ar-EG'),
      resolutionAction: 'تم التحقيق الميداني واستكمال النقص / التخلص الآمن وتوثيقه بسجل الجودة'
    };
    onUpdateQualityException(updated);
    setFeedback({
      type: 'success',
      msg: `تم إغلاق ومعالجة الاستثناء (${exc.id}) بنجاح`
    });
    onAddAuditLog('EXCEPTION_RESOLVED', exc.id, `إغلاق استثناء الجودة ${exc.descriptionAr}`);
  };

  // 2. Quarantine & Enforce Recall Retrieval
  const handleEnforceRecallQuarantine = () => {
    if (!selectedRecall) return;

    const updated: CSSDRecallCase = {
      ...selectedRecall,
      status: 'retrieval_complete',
      locatedInStorageCount: selectedRecall.affectedPackageIds.length,
      returnedReprocessedCount: selectedRecall.affectedPackageIds.length,
      notes: `${selectedRecall.notes} • تم سحب جميع العبوات وعزلها بنجاح`
    };

    onUpdateRecallCase(updated);
    setFeedback({
      type: 'success',
      msg: `تم سحب وحجز جميع العبوات المشتبه بها في استدعاء (${selectedRecall.id}) وإعادتها لمسار إعادة المعالجة الكاملة`
    });
    onAddAuditLog('RECALL_RETRIEVAL_COMPLETED', selectedRecall.id, 'اكتمال سحب العبوات المشتبه بها وتطبيق خطة إعادة التعقيم');
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: IPC & SFDA Recall Protocols */}
      <div className="bg-red-50/80 border border-red-300 rounded-xl p-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <strong className="text-red-950 block font-bold text-sm">
              بروتوكول الاستدعاء الطبي وإدارة الاستثناءات الحرجة (Infection Prevention & Device Recall)
            </strong>
            <span className="text-red-800 text-[11px]">
              عند فشل المؤشر البيولوجي أو عطل المعقم: سحب فوري للشحنة بالكامل • تحديد مواقع العبوات (المستودع / العمليات / المريض) • إشعار فوري لمكافحة العدوى وإعادة المعالجة من الصفر.
            </span>
          </div>
        </div>
        <span className="bg-red-200 text-red-950 px-2.5 py-1 rounded-lg text-xs font-mono font-bold shrink-0">
          مسار طوارئ مكافحة العدوى (IPC Alert)
        </span>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
            feedback.type === 'error'
              ? 'bg-red-100 border-red-300 text-red-900'
              : 'bg-emerald-100 border-emerald-300 text-emerald-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'error' ? (
              <XCircle className="w-4 h-4 text-red-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
            <span className="font-bold">{feedback.msg}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-bold underline cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Main Grid: Recall Cases & Active Exceptions List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Active Exceptions List */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
          <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>استثناءات الجودة وموانع الأمان ({state.qualityExceptions.length})</span>
            </h3>
            <span className="text-[10px] text-slate-500">سجل عدم المطابقة</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {state.qualityExceptions.map(exc => (
              <div key={exc.id} className="p-3.5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-black text-slate-900">{exc.id}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      exc.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : exc.severity === 'critical_safety_block'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {exc.status === 'resolved' ? 'تمت المعالجة' : 'مفتوح - إجراء مطلوب'}
                  </span>
                </div>

                <div className="font-bold text-xs text-slate-800 mb-1">{exc.descriptionAr}</div>

                <div className="text-[11px] text-slate-500 mb-2">
                  المرجع: <strong className="font-mono text-slate-700">{exc.sourceReference}</strong> • الكاشف: {exc.detectedBy}
                </div>

                {exc.status !== 'resolved' && (
                  <button
                    onClick={() => handleResolveException(exc)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-1 rounded text-xs font-bold border border-slate-300 cursor-pointer transition-colors"
                  >
                    معالجة وإغلاق الاستثناء ✓
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recall Incident Investigation & Retrieval Execution */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
          {selectedRecall ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{selectedRecall.titleAr}</h3>
                    <span className="text-xs font-mono bg-red-100 text-red-800 px-2 py-0.5 rounded">
                      {selectedRecall.id}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    رقم الدورة المشتبه بها: {selectedRecall.suspectSterilizerCycleId} • فُتح بواسطة:{' '}
                    {selectedRecall.openedBy}
                  </span>
                </div>

                {selectedRecall.status !== 'retrieval_complete' && (
                  <button
                    onClick={handleEnforceRecallQuarantine}
                    className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>تأكيد سحب العبوات والحجز الفوري</span>
                  </button>
                )}
              </div>

              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                {/* Trigger & Threat Analysis */}
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs space-y-1">
                  <strong className="text-red-900 block font-bold">سبب الاستدعاء والاشتباه السريري:</strong>
                  <p className="text-red-800 text-[11px] leading-relaxed">{selectedRecall.triggerReason}</p>
                </div>

                {/* Patient Exposure & Location Trace Matrix */}
                <div className="border border-slate-200 rounded-xl p-3.5 space-y-3 bg-slate-50/40">
                  <h4 className="font-bold text-xs text-slate-900">
                    مصفوفة حصر وتتبع العبوات المتأثرة (Package Location & Patient Exposure Analysis)
                  </h4>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                      <span className="text-[10px] text-slate-400 block">إجمالي العبوات المتأثرة</span>
                      <strong className="text-slate-900 font-mono text-sm">
                        {selectedRecall.affectedPackageIds.length}
                      </strong>
                    </div>

                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                      <span className="text-[10px] text-slate-400 block">الموجودة بالمستودع</span>
                      <strong className="text-emerald-700 font-mono text-sm">
                        {selectedRecall.locatedInStorageCount}
                      </strong>
                    </div>

                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                      <span className="text-[10px] text-slate-400 block">الموزعة على العمليات</span>
                      <strong className="text-amber-700 font-mono text-sm">
                        {selectedRecall.distributedToOrCount}
                      </strong>
                    </div>

                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                      <span className="text-[10px] text-slate-400 block">المستخدمة على مرضى</span>
                      <strong className="text-red-700 font-mono text-sm">
                        {selectedRecall.usedInPatientCount} (صفر - أمان تام)
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Corrective Action & Reprocessing Loop Plan */}
                <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 bg-slate-50/40 text-xs">
                  <strong className="font-bold text-slate-900 block">
                    خطة المعالجة التصحيحية وإعادة التعقيم (Corrective Action & Reprocessing Plan):
                  </strong>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    {selectedRecall.reprocessingPlanAr}
                  </p>
                  <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-200 pt-2">
                    الملاحظات: {selectedRecall.notes}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
              اختر حالة استدعاء للمتابعة
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
