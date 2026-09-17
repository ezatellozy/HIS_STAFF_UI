import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Truck,
  FileCheck2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  MapPin,
  CheckCheck,
  Building,
  UserCheck,
  ShieldCheck,
  Send,
  Sliders,
  ExternalLink,
  XCircle,
  RotateCcw,
  Activity,
  Calendar,
  AlertCircle
} from 'lucide-react';
import {
  InternalTransferEntity,
  InternalTransferStatus,
  TransportContextStatus,
  TransferPolicyProfile,
  TemporaryDiagnosticMovement
} from '../../types/patientAccessAdt';

interface TransferOpsViewProps {
  transfers: InternalTransferEntity[];
  diagnosticMovements?: TemporaryDiagnosticMovement[];
  onAcceptTransfer: (transferId: string) => void;
  onDispatchTransport: (transferId: string) => void;
  onCompleteTransfer: (transferId: string) => void;
  onCancelPendingTransfer?: (transferId: string, reason: string) => void;
  onCorrectCompletedTransfer?: (transferId: string, correctionReason: string, revertBed: boolean) => void;
  onStartDiagnosticMovement?: (movementId: string) => void;
  onReturnDiagnosticMovement?: (movementId: string) => void;
  onOpenPatientWorkspace: (mrn: string, encounterId?: string) => void;
}

export const TransferOpsView: React.FC<TransferOpsViewProps> = ({
  transfers,
  diagnosticMovements = [],
  onAcceptTransfer,
  onDispatchTransport,
  onCompleteTransfer,
  onCancelPendingTransfer,
  onCorrectCompletedTransfer,
  onStartDiagnosticMovement,
  onReturnDiagnosticMovement,
  onOpenPatientWorkspace
}) => {
  const [activeTab, setActiveTab] = useState<'transfers' | 'diagnostic'>('transfers');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [transferPolicy, setTransferPolicy] = useState<TransferPolicyProfile>('icu_step_down');

  // Cancel Pending Modal State
  const [cancellingTransfer, setCancellingTransfer] = useState<InternalTransferEntity | null>(null);
  const [cancellationReason, setCancellationReason] = useState<string>('استقرار الحالة السريرية للمريض وعدم الحاجة للنقل العاجل');

  // Correct Completed Transfer Modal State
  const [correctingTransfer, setCorrectingTransfer] = useState<InternalTransferEntity | null>(null);
  const [correctionReason, setCorrectionReason] = useState<string>('تسجيل حركة نقل بالخطأ لمريض آخر (Erroneous bed assignment)');
  const [revertBedAllocation, setRevertBedAllocation] = useState<boolean>(true);

  const filteredTransfers = transfers.filter(t => {
    if (filterUrgency !== 'all' && t.urgency !== filterUrgency) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  const getStatusBadge = (t: InternalTransferEntity) => {
    if (t.isEnteredInError) {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-300 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          حركة خاطئة تم تصحيحها (Corrected Error)
        </span>
      );
    }

    switch (t.status) {
      case 'requested':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">طلب نقل جديد (Requested)</span>;
      case 'accepted':
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-300">تم قبول النقل بالقسم المستقبل</span>;
      case 'ready_for_transport':
        return <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold border border-indigo-300">جاهز للتحرك والنقل</span>;
      case 'in_transit':
        return <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold border border-purple-300 animate-pulse">في الطريق (In Transit)</span>;
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">اكتمل النقل واستقر المريض</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300">طلب ملغى سريرياً (Cancelled)</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs">{t.status}</span>;
    }
  };

  const handleConfirmCancel = () => {
    if (!cancellingTransfer || !onCancelPendingTransfer) return;
    onCancelPendingTransfer(cancellingTransfer.id, cancellationReason);
    setCancellingTransfer(null);
  };

  const handleConfirmCorrection = () => {
    if (!correctingTransfer || !onCorrectCompletedTransfer) return;
    onCorrectCompletedTransfer(correctingTransfer.id, correctionReason, revertBedAllocation);
    setCorrectingTransfer(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Conceptual Invariant */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-slate-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-indigo-300" />
            <span>الفصل العملياتي: إلغاء طلب قيد الانتظار ≠ تصحيح حركة منقولة بالخطأ | حركة تشخيصية مؤقتة</span>
          </div>
          <h2 className="text-xl font-black text-white">إدارة النقل الداخلي للمرضى وتنسيق التحويلات البينية</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            <strong>إلغاء طلب النقل قيد الانتظار:</strong> إجراء سريري قبل بدء النقل، يبقى المريض بسريره الأصلي ولا ينشئ سجل حركة خاطئ.<br />
            <strong>تصحيح الحركة الخاطئة (Correction):</strong> معالجة تدقيقية لحركة مكتملة سُجلت سهواً أو لسرير غير مقصود وفق معايير IHE PAM.<br />
            <strong>الحركة التشخيصية المؤقتة (Diagnostic Movement):</strong> انتقال مؤقت للأشعة أو القسطرة مع سياسة الاحتفاظ بالسرير (Bed Retention).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('transfers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'transfers'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            طلبات النقل الداخلي ({transfers.filter(t => t.status !== 'cancelled').length})
          </button>
          <button
            onClick={() => setActiveTab('diagnostic')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'diagnostic'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            الحركات التشخيصية للأشعة ({diagnosticMovements.length})
          </button>
        </div>
      </div>

      {activeTab === 'transfers' ? (
        <>
          {/* Configured Transfer Policy Strip */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800">سياسة النقل الداخلي المهيأة للمنشأة (Configured Transfer Policy Profile):</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
              {[
                {
                  id: 'icu_step_down' as TransferPolicyProfile,
                  title: '1. نقل حرج / عناية مركزة (ICU Step-Down)',
                  desc: 'يشترط قبول مسبق + حجز سرير مؤكد + تسليم SBAR رسمي موقع + مرافق تمريضي مخصص.'
                },
                {
                  id: 'same_unit_bed_move' as TransferPolicyProfile,
                  title: '2. تغيير سرير داخل نفس القسم (Same-Unit Bed Move)',
                  desc: 'إعادة تخصيص سرير داخلي مباشر دون اشتراط استدعاء نقالة أو تسليم SBAR خارجي.'
                },
                {
                  id: 'clinical_escort' as TransferPolicyProfile,
                  title: '3. مرافقة سريرية مباشرة (Clinical Escort)',
                  desc: 'نقل مباشر برفقة الفريق الطبي المعالج بدون انتظار جدولة فريق نقالات مركزي.'
                }
              ].map(pol => (
                <button
                  key={pol.id}
                  onClick={() => setTransferPolicy(pol.id)}
                  className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                    transferPolicy === pol.id
                      ? 'bg-indigo-50/80 border-indigo-400 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-100/70'
                  }`}
                >
                  <strong className="block text-[11px] font-black">{pol.title}</strong>
                  <p className="text-[10px] text-slate-500 mt-1 leading-snug">{pol.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-3.5 rounded-2xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">تصفية حسب الحالة:</span>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
              >
                <option value="all">كافة الحالات</option>
                <option value="requested">طلبات جديدة قيد المراجعة</option>
                <option value="accepted">تم قبولها بالقسم</option>
                <option value="in_transit">في الطريق (In Transit)</option>
                <option value="completed">مكتملة</option>
                <option value="cancelled">ملغاة قبل التحرك</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">درجة الاستعجال:</span>
              <select
                value={filterUrgency}
                onChange={e => setFilterUrgency(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
              >
                <option value="all">كافة الدرجات</option>
                <option value="stat">نقل حرج فوري (STAT)</option>
                <option value="urgent">عاجل (Urgent)</option>
                <option value="routine">اعتيادي (Routine)</option>
              </select>
            </div>
          </div>

          {/* Transfers List */}
          <div className="space-y-3">
            {filteredTransfers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                لا توجد طلبات نقل داخلي تطابق التصفية
              </div>
            ) : (
              filteredTransfers.map(trf => {
                const isStat = trf.urgency === 'stat';
                const isCompleted = trf.status === 'completed';
                const isCancelled = trf.status === 'cancelled';
                const isPendingMove = trf.status === 'requested' || trf.status === 'accepted' || trf.status === 'ready_for_transport';

                return (
                  <div
                    key={trf.id}
                    className={`bg-white rounded-2xl border transition-all p-5 shadow-sm space-y-4 ${
                      trf.isEnteredInError
                        ? 'border-rose-300 bg-rose-50/15'
                        : isCancelled
                        ? 'border-slate-300 bg-slate-50/70 opacity-75'
                        : isStat
                        ? 'border-red-300 bg-red-50/20'
                        : isCompleted
                        ? 'border-emerald-200 bg-emerald-50/10'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Top Info */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          {trf.transferNumber}
                        </span>
                        <h4 className="text-base font-black text-slate-900">{trf.patientNameAr}</h4>
                        <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold">
                          {trf.mrn}
                        </span>

                        {getStatusBadge(trf)}

                        {isStat && !isCancelled && (
                          <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-black text-xs border border-red-300 flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 text-red-600" />
                            نقل حرج فوري (STAT)
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-400">
                        وقت الطلب: {trf.requestedAt}
                      </div>
                    </div>

                    {/* Cancellation or Correction Info Banner */}
                    {isCancelled && trf.cancellationReason && (
                      <div className="p-3 bg-slate-100 rounded-xl border border-slate-300 text-slate-800 text-xs flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-slate-600 shrink-0" />
                        <div>
                          <strong>تم إلغاء طلب النقل قبل التحرك:</strong> {trf.cancellationReason}
                          <span className="block text-[11px] text-slate-500 mt-0.5">
                            تم الإلغاء بواسطة: {trf.cancelledBy || 'المنسق الطبي'} • بقي المريض في سريره الأصلي دون أي حركة خاطئة.
                          </span>
                        </div>
                      </div>
                    )}

                    {trf.isEnteredInError && trf.correctionReason && (
                      <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <div>
                          <strong className="text-rose-950">حركة سابقة سُجلت بالخطأ وتم تصحيحها (IHE PAM Correction):</strong> {trf.correctionReason}
                          <span className="block text-[11px] text-rose-700 mt-0.5">
                            المُصحح: {trf.correctedBy || 'رئيس السجلات الطبية'} في {trf.correctedAt} • تم استرجاع تخصيص السرير الأصلي.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Transfer Origin -> Destination Routing Card */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                      {/* From & To (7 cols) */}
                      <div className="md:col-span-7 space-y-3">
                        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <div className="flex-1 space-y-1">
                            <span className="text-[11px] text-slate-400 font-bold block">من القسم الحالي (Source):</span>
                            <div className="font-bold text-slate-800">{trf.sourceUnit}</div>
                            <div className="text-slate-500 font-mono text-[11px]">{trf.sourceBed}</div>
                          </div>

                          <div className="p-2 rounded-full bg-slate-200 text-slate-600 shrink-0">
                            <ArrowRightLeft className="w-4 h-4 rtl:rotate-180" />
                          </div>

                          <div className="flex-1 space-y-1">
                            <span className="text-[11px] text-blue-500 font-bold block">إلى القسم المستهدف (Destination):</span>
                            <div className="font-bold text-blue-900">{trf.destinationUnit}</div>
                            <div className="text-blue-700 font-mono text-[11px]">{trf.destinationBed || 'بانتظار تأكيد السرير'}</div>
                          </div>
                        </div>

                        {/* Clinical Reason */}
                        <div>
                          <span className="text-slate-400 block text-[11px]">سبب ومبرر النقل الطبي:</span>
                          <p className="text-slate-800 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-0.5">
                            {trf.reason}
                          </p>
                        </div>

                        {trf.transportTeamNotes && (
                          <div className="text-[11px] text-indigo-800 bg-indigo-50 p-2 rounded-lg border border-indigo-200 flex items-center gap-2">
                            <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span>ملاحظات النقل: {trf.transportTeamNotes}</span>
                          </div>
                        )}
                      </div>

                      {/* Coordination & Actions (5 cols) */}
                      <div className="md:col-span-5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-bold">تسليم التمريض (Handover):</span>
                            <span className="font-bold text-slate-800">
                              {trf.handoverStatus === 'received_acknowledged' ? (
                                <span className="text-emerald-700 flex items-center gap-1">
                                  <CheckCheck className="w-3.5 h-3.5" /> تم التسليم وتأكيد الاستلام
                                </span>
                              ) : (
                                <span className="text-amber-700 flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" /> بانتظار الإقرار السريري
                                </span>
                              )}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-bold">حالة فريق النقل الداخلي:</span>
                            <span className="font-bold text-slate-800">
                              {trf.transportStatus === 'in_transit' ? 'جاري التحرك بالنقالة' : trf.transportStatus === 'requested' ? 'تم استدعاء النقّال' : 'مخطط له'}
                            </span>
                          </div>
                        </div>

                        {/* Transfer Workflow Actions */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-200 flex-wrap">
                          {trf.status === 'requested' && (
                            <button
                              onClick={() => onAcceptTransfer(trf.id)}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm cursor-pointer"
                            >
                              قبول النقل
                            </button>
                          )}

                          {(trf.status === 'accepted' || trf.status === 'ready_for_transport') && (
                            <button
                              onClick={() => onDispatchTransport(trf.id)}
                              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-sm cursor-pointer flex items-center gap-1.5"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>تحريك فريق النقل (In Transit)</span>
                            </button>
                          )}

                          {trf.status === 'in_transit' && (
                            <button
                              onClick={() => onCompleteTransfer(trf.id)}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer flex items-center gap-1.5"
                            >
                              <CheckCheck className="w-4 h-4" />
                              <span>تأكيد وصول المريض للسرير</span>
                            </button>
                          )}

                          {/* Action 1: Cancel Pending Request (Only for uncompleted transfers) */}
                          {isPendingMove && onCancelPendingTransfer && (
                            <button
                              onClick={() => {
                                setCancellingTransfer(trf);
                                setCancellationReason('استقرار الحالة السريرية للمريض وتراجع الطبيب عن أمر النقل');
                              }}
                              className="px-2.5 py-1.5 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs cursor-pointer flex items-center gap-1"
                              title="إلغاء طلب النقل قيد الانتظار قبل التحرك"
                            >
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>إلغاء الطلب</span>
                            </button>
                          )}

                          {/* Action 2: Correct Completed Transfer (Only for completed transfers that are not already corrected) */}
                          {isCompleted && !trf.isEnteredInError && onCorrectCompletedTransfer && (
                            <button
                              onClick={() => {
                                setCorrectingTransfer(trf);
                                setCorrectionReason('تسجيل حركة نقل بالخطأ للمريض / لم يغادر سريره الأصلي فعلياً');
                                setRevertBedAllocation(true);
                              }}
                              className="px-2.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs cursor-pointer flex items-center gap-1"
                              title="تصحيح حركة مسجلة بالخطأ واسترجاع السرير"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                              <span>تصحيح خطأ حركة</span>
                            </button>
                          )}

                          <button
                            onClick={() => onOpenPatientWorkspace(trf.mrn, trf.currentEncounterId)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer"
                          >
                            السجل السريري
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        /* Diagnostic Movements Tab */
        <div className="space-y-4">
          <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200 text-indigo-950 flex items-start gap-3 text-xs">
            <Activity className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-sm font-bold text-indigo-900">
                سياسة الاحتفاظ بالسرير في الحركات التشخيصية المؤقتة (Bed Retention Invariant)
              </strong>
              <p className="mt-1 leading-relaxed text-indigo-800">
                عند ذهاب المريض المنوم إلى قسم الأشعة التشخيصية (MRI, CT) أو وحدة القسطرة القلبية أو المناظير، فإن السرير التنويمي الأصلي
                <strong> يظل محجوزاً وثابتاً للمريض </strong> (Bed Retention: Retain Bed)، ولا يتم تحريره أو طرحه في قائمة الأسرة المتاحة، لأن الحركة تشخيصية عابرة وليست تفريغاً أو نقلاً دائماً.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {diagnosticMovements.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                لا توجد حركات تشخيصية مسجلة حالياً
              </div>
            ) : (
              diagnosticMovements.map(diag => {
                const isDeparted = diag.status === 'departed' || diag.status === 'arrived_at_destination';
                const isReturned = diag.status === 'returned';

                return (
                  <div
                    key={diag.id}
                    className={`bg-white rounded-2xl border p-5 shadow-sm space-y-3 ${
                      isReturned
                        ? 'border-emerald-200 bg-emerald-50/15'
                        : isDeparted
                        ? 'border-indigo-300 bg-indigo-50/15'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                          {diag.id}
                        </span>
                        <strong className="text-base text-slate-900">{diag.patientNameAr}</strong>
                        <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">
                          {diag.mrn}
                        </span>
                        {isReturned ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                            عاد للسرير التنويمي
                          </span>
                        ) : isDeparted ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold border border-indigo-300 animate-pulse">
                            في قسم التشخيص / الأشعة
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                            مجدول للتحرك
                          </span>
                        )}
                      </div>

                      <span className="text-xs text-slate-400">
                        السرير المحجوز: <strong className="text-slate-700">{diag.inpatientUnit} - {diag.inpatientBed}</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[11px]">الوجهة التشخيصية:</span>
                        <strong className="text-slate-800">{diag.diagnosticDestination}</strong>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[11px]">سبب الفحص التشخيصي:</span>
                        <p className="text-slate-700">{diag.reason}</p>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[11px]">سياسة السرير التنويمي:</span>
                        <span className="text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          حفظ السرير محجوزاً (Retain Bed Invariant)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="text-xs text-slate-500 flex items-center gap-3">
                        {diag.departedAt && <span>وقت المغادرة للأشعة: <strong className="font-mono text-slate-700">{diag.departedAt}</strong></span>}
                        {diag.returnedAt && <span>وقت العودة للسرير: <strong className="font-mono text-emerald-700">{diag.returnedAt}</strong></span>}
                      </div>

                      <div className="flex items-center gap-2">
                        {diag.status === 'scheduled' && onStartDiagnosticMovement && (
                          <button
                            onClick={() => onStartDiagnosticMovement(diag.id)}
                            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>تسجيل المغادرة للأشعة</span>
                          </button>
                        )}

                        {isDeparted && onReturnDiagnosticMovement && (
                          <button
                            onClick={() => onReturnDiagnosticMovement(diag.id)}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>تسجيل عودة المريض للسرير</span>
                          </button>
                        )}

                        <button
                          onClick={() => onOpenPatientWorkspace(diag.mrn, diag.currentEncounterId)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                        >
                          السجل السريري
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MODAL: Pending Transfer Cancellation */}
      {cancellingTransfer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-rose-600" />
                  إلغاء طلب النقل الداخلي قيد الانتظار (Cancel Pending Transfer)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  إلغاء الطلب قبل تحرك المريض أو استلامه بالقسم المستهدف.
                </p>
              </div>
              <button
                onClick={() => setCancellingTransfer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-bold block">بيانات المريض ومسار الطلب:</span>
                <div className="font-bold text-slate-800">
                  {cancellingTransfer.patientNameAr} ({cancellingTransfer.mrn})
                </div>
                <div className="text-slate-600 text-[11px]">
                  من: {cancellingTransfer.sourceUnit} ({cancellingTransfer.sourceBed}) ⟵ إلى: {cancellingTransfer.destinationUnit}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">سبب ومبرر إلغاء الطلب السريري *</label>
                <select
                  value={cancellationReason}
                  onChange={e => setCancellationReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl mb-2 font-medium"
                >
                  <option value="استقرار الحالة السريرية للمريض وعدم الحاجة للنقل العاجل">استقرار الحالة السريرية للمريض وعدم الحاجة للنقل العاجل</option>
                  <option value="تراجع الطبيب المعالج عن أمر النقل بعد إعادة التقييم">تراجع الطبيب المعالج عن أمر النقل بعد إعادة التقييم</option>
                  <option value="رفض المريض أو أسرته الانتقال إلى الجناح المستهدف">رفض المريض أو أسرته الانتقال إلى الجناح المستهدف</option>
                  <option value="عدم توفر متطلبات العزل الطبي المطلوبة بالقسم المستقبل">عدم توفر متطلبات العزل الطبي المطلوبة بالقسم المستقبل</option>
                  <option value="أسباب إدارية وتنظيمية داخل المنشأة">أسباب إدارية وتنظيمية داخل المنشأة</option>
                </select>
                <textarea
                  rows={2}
                  value={cancellationReason}
                  onChange={e => setCancellationReason(e.target.value)}
                  placeholder="يمكنك تعديل أو تخصيص نص مبرر الإلغاء..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 text-[11px] space-y-1">
                <strong>أثر الإلغاء العملياتي:</strong>
                <p>• المريض يبقى في سريره الأصلي الحالي دون أي تغيير في موقعه.</p>
                <p>• لا ينشئ هذا الإجراء حركة سريرية خاطئة، بل يلغي الطلب المفتوح بصورة نظامية.</p>
                <p>• يتم إخطار طاقم التمريض بالقسمين بإلغاء التنسيق.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setCancellingTransfer(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                تراجع
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                تأكيد إلغاء طلب النقل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Erroneous Movement Correction */}
      {correctingTransfer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-2 border-amber-500 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="border-b border-amber-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-amber-600" />
                  تصحيح حركة نقل مكتملة سُجلت بالخطأ (Erroneous Movement Correction)
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  معايير IHE PAM للتعامل مع الإدخال الخاطئ لحركة المريض (Entered in Error).
                </p>
              </div>
              <button
                onClick={() => setCorrectingTransfer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1 text-amber-950">
                <span className="text-amber-800 font-bold block">الحركة المسجلة بالخطأ المطلوب تصحيحها:</span>
                <div className="font-bold text-slate-900">
                  {correctingTransfer.patientNameAr} ({correctingTransfer.mrn})
                </div>
                <div className="text-[11px] font-mono">
                  تم تسجيله منقولاً إلى: {correctingTransfer.destinationUnit} ({correctingTransfer.destinationBed})
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">مبرر تصحيح الحركة وتوثيق الخطأ الإداري *</label>
                <textarea
                  rows={2}
                  value={correctionReason}
                  onChange={e => setCorrectionReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={revertBedAllocation}
                    onChange={e => setRevertBedAllocation(e.target.checked)}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span>إعادة تسجيل موقع المريض في الزيارة إلى السرير الأصلي ({correctingTransfer.sourceUnit} - {correctingTransfer.sourceBed})</span>
                </label>
                <p className="text-[11px] text-slate-500 mt-1 mr-5">
                  سيتم تحديث سجل الحركة وتصحيح تخصيص الأسرة في لوحة إدارة السعة التنويمية.
                </p>
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 text-[11px] space-y-1">
                <strong>حوكمة السجلات الطبية (HIM Audit Invariant):</strong>
                <p>• لا يتم حذف سجل الحركة القديم، بل يتم وسمه كـ (Entered in Error) مع ربط حدث التصحيح.</p>
                <p>• يوثق اسم الموظف والتوقيت الدقيق لضمان الامتثال لمتطلبات التدقيق السريري.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setCorrectingTransfer(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmCorrection}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                اعتماد وتثبيت تصحيح الحركة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
