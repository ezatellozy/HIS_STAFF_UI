import React, { useState } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  Clock,
  ShieldAlert,
  FileText,
  UserCheck,
  Building,
  AlertTriangle,
  ArrowRight,
  Search,
  Filter,
  Layers,
  Info
} from 'lucide-react';
import { EmergencyExceptionRecord } from '../../types/pharmacyOps';

interface EmergencyExceptionsViewProps {
  exceptions: EmergencyExceptionRecord[];
  onApproveRetrospectiveReview: (id: string, notes: string) => void;
  onRequestClarification: (id: string, notes: string) => void;
}

export const EmergencyExceptionsView: React.FC<EmergencyExceptionsViewProps> = ({
  exceptions,
  onApproveRetrospectiveReview,
  onRequestClarification
}) => {
  const [selectedException, setSelectedException] = useState<EmergencyExceptionRecord | null>(
    exceptions[0] || null
  );
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed'>('all');
  const [reviewNotesInput, setReviewNotesInput] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'clarify'>('approve');

  const filteredExceptions = exceptions.filter(item => {
    if (statusFilter === 'pending') return item.retrospectiveStatus === 'pending_retrospective_review';
    if (statusFilter === 'reviewed') return item.retrospectiveStatus !== 'pending_retrospective_review';
    return true;
  });

  const handleOpenReview = (record: EmergencyExceptionRecord, action: 'approve' | 'clarify') => {
    setSelectedException(record);
    setActionType(action);
    setReviewNotesInput(record.reviewNotes || '');
    setShowReviewModal(true);
  };

  const handleExecuteReview = () => {
    if (!selectedException) return;
    if (actionType === 'approve') {
      onApproveRetrospectiveReview(
        selectedException.id,
        reviewNotesInput.trim() || 'تم التدقيق السريري اللاحق ومطابقة السجل مع بروتوكول الإنعاش المعتمد.'
      );
    } else {
      onRequestClarification(
        selectedException.id,
        reviewNotesInput.trim() || 'يلزم التحقق من تباين الكمية المصروفة مقابل المسجلة في سجل التمريض الإلكتروني eMAR.'
      );
    }
    setShowReviewModal(false);
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Top Protocol Header */}
      <div className="bg-gradient-to-r from-slate-900 to-rose-950 text-white rounded-xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold">استثناءات الطوارئ وسحب الأدوية الإسعافية (Emergency Exceptions & Overrides)</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-900/60 text-rose-300 border border-rose-700">
                P03 Clinical Safety Protocol
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              متابعة تجاوزات خزائن التوزيع الآلي (ADC Overrides) والأوامر الإسعافية غير المدققة مسبقاً والتدقيق الصيدلاني اللاحق
            </p>
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
              statusFilter === 'all'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            الكل ({exceptions.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
              statusFilter === 'pending'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            بانتظار التدقيق اللاحق ({exceptions.filter(e => e.retrospectiveStatus === 'pending_retrospective_review').length})
          </button>
          <button
            onClick={() => setStatusFilter('reviewed')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
              statusFilter === 'reviewed'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            مكتملة المراجعة ({exceptions.filter(e => e.retrospectiveStatus !== 'pending_retrospective_review').length})
          </button>
        </div>
      </div>

      {/* Semantic Distinction Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-950 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-900">
            فصل مسار سحب الدواء الطارئ عن إعطائه الفعلي للمريض (Access/Supply Event ≠ Administration Event):
          </p>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            مجرد سحب الدواء من خزانة التوزيع الآلي بحالة التجاوز الطارئ (ADC Override) يوثق واقعة الإتاحة والتوريد فقط، ولا يُستنتج منه أن الدواء أُعطي للمريض. يظل توثيق الإعطاء الفعلي خاضعاً لسجل التمريض الإلكتروني (eMAR) في نظام Axis 8 مع التحقق من تباين الجرعات غير المعطاة أو التالفة.
          </p>
        </div>
      </div>

      {/* Exceptions Grid & Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Exceptions List */}
        <div className="lg:col-span-7 space-y-3">
          {filteredExceptions.map(record => (
            <div
              key={record.id}
              onClick={() => setSelectedException(record)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedException?.id === record.id
                  ? 'bg-white border-rose-500 shadow-sm ring-1 ring-rose-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 text-xs">{record.exceptionReference}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      record.overrideType === 'adc_override_emergency'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    }`}
                  >
                    {record.overrideType === 'adc_override_emergency' ? 'تجاوز ADC آلي' : 'حقيبة إنعاش طوارئ'}
                  </span>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    record.retrospectiveStatus === 'pending_retrospective_review'
                      ? 'bg-amber-100 text-amber-800 animate-pulse'
                      : record.retrospectiveStatus === 'retrospectively_approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {record.retrospectiveStatus === 'pending_retrospective_review'
                    ? 'بانتظار التدقيق الصيدلاني اللاحق'
                    : record.retrospectiveStatus === 'retrospectively_approved'
                    ? 'معتمد لاحقاً'
                    : 'استيضاح / تباين موثق'}
                </span>
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-2 text-slate-700">
                <div>
                  <div className="text-[11px] text-slate-500">المريض:</div>
                  <div className="font-bold text-slate-900">{record.patientName}</div>
                  <div className="text-[10px] font-mono text-slate-500">{record.mrn} • {record.wardLocation}</div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-500">المستحضر المسحوب:</div>
                  <div className="font-bold text-teal-800">{record.genericName}</div>
                  <div className="text-[10px] text-slate-600 font-mono">{record.dose} • {record.route}</div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>الداعي: <strong className="text-slate-700">{record.emergencyReason}</strong></span>
                <span className="text-[10px] font-mono">{record.initiatedAt}</span>
              </div>
            </div>
          ))}

          {filteredExceptions.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
              لا توجد استثناءات طوارئ مطابقة لخيارات الفرز الحالية.
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-5">
          {selectedException ? (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-4 sticky top-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">تفاصيل الاستثناء ومراحل التوثيق</h4>
                  <div className="text-[11px] font-mono text-slate-500">{selectedException.exceptionReference}</div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                    selectedException.retrospectiveStatus === 'pending_retrospective_review'
                      ? 'bg-amber-100 text-amber-900'
                      : selectedException.retrospectiveStatus === 'retrospectively_approved'
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-rose-100 text-rose-900'
                  }`}
                >
                  {selectedException.retrospectiveStatus === 'pending_retrospective_review'
                    ? 'تدقيق لاحق مطلوب'
                    : selectedException.retrospectiveStatus === 'retrospectively_approved'
                    ? 'معتمد سريرياً'
                    : 'استيضاح معلق'}
                </span>
              </div>

              {/* Five Distinct Workflow Stages */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 text-xs block">مراحل توثيق الاستثناء (Five Workflow Stages):</span>
                <div className="space-y-1.5 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>1. بدء حالة الاستثناء (Exception Initiated)</span>
                    </div>
                    <span className="font-mono text-slate-500 text-[10px]">{selectedException.initiatedAt}</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>2. واقعة سحب / إتاحة الدواء (Medication Access Event)</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold">موثقة بالـ ADC</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>3. واقعة الإعطاء السريري (Administration Event)</span>
                    </div>
                    <span className="text-[10px] text-indigo-700 font-bold">
                      {selectedException.administrationLoggedStatus === 'documented_in_emar'
                        ? 'مسجلة في eMAR'
                        : 'غير مفترضة تلقائياً'}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>4. التدقيق الصيدلاني اللاحق (Retrospective Review)</span>
                    </div>
                    <span className="text-[10px] text-slate-600 font-mono">
                      {selectedException.reviewedAt || 'قيد الانتظار'}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${
                        selectedException.retrospectiveStatus === 'pending_retrospective_review'
                          ? 'text-slate-300'
                          : 'text-emerald-600'
                      }`} />
                      <span>5. إغلاق الاستثناء واعتماد التباين (Review Completion)</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600">
                      {selectedException.retrospectiveStatus === 'pending_retrospective_review' ? 'معلق' : 'مغلق'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actor & Clinical Context */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px]">المنفذ المبادر بالسحب الإسعافي:</span>
                  <strong className="text-slate-900">{selectedException.initiatingActor}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">السياق السريري:</span>
                  <p className="text-slate-800">{selectedException.emergencyReason}</p>
                </div>
                {selectedException.reviewNotes && (
                  <div>
                    <span className="text-slate-500 block text-[10px]">ملاحظات المراجعة الصيدلانية:</span>
                    <p className="text-slate-800 bg-white p-2 rounded border border-slate-200">
                      {selectedException.reviewNotes}
                    </p>
                  </div>
                )}
              </div>

              {/* Reviewer Actions */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-800 text-xs block">إجراءات الصيدلي الإكلينيكي المسؤول:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleOpenReview(selectedException, 'approve')}
                    className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>اعتماد التدقيق اللاحق</span>
                  </button>
                  <button
                    onClick={() => handleOpenReview(selectedException, 'clarify')}
                    className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>طلب توثيق تباين</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
              اختر واقعة استثناء من القائمة لاستعراض مراحل التوثيق وإجراء التدقيق اللاحق.
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedException && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h4 className="font-bold text-slate-900 text-sm">
                  {actionType === 'approve'
                    ? 'اعتماد التدقيق الصيدلاني اللاحق'
                    : 'طلب استيضاح وتوثيق تباين في الجرعة المسحوبة'}
                </h4>
              </div>
              <span className="font-mono text-xs text-slate-500">{selectedException.exceptionReference}</span>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-600">
                المريض: <strong className="text-slate-900">{selectedException.patientName}</strong> ({selectedException.mrn})
              </p>
              <p className="text-slate-600">
                الدواء المسحوب: <strong className="text-teal-800">{selectedException.genericName}</strong> ({selectedException.dose})
              </p>

              <div>
                <label className="font-bold text-slate-800 block mb-1">ملاحظة التدقيق الصيدلاني المرفقة بسجل الاستثناء:</label>
                <textarea
                  value={reviewNotesInput}
                  onChange={e => setReviewNotesInput(e.target.value)}
                  placeholder="أدخل ملخص مراجعة البروتوكول والتحقق من سجل التمريض وكمية الدواء المتبقية أو التالفة..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleExecuteReview}
                className={`px-5 py-2 rounded-xl font-bold text-xs text-white transition-colors cursor-pointer ${
                  actionType === 'approve'
                    ? 'bg-teal-600 hover:bg-teal-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                تأكيد وإغلاق التوثيق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
