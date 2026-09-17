import React, { useState } from 'react';
import {
  History,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Clock,
  UserCheck,
  FileEdit,
  AlertOctagon,
  FilePlus,
  Send,
  HelpCircle
} from 'lucide-react';
import { LabReportItem, ResultAmendment } from '../../../types/clinicalResults';

interface ResultAmendmentModalProps {
  report: LabReportItem;
  userRole?: 'consumer' | 'source';
  onClose: () => void;
  onApplyAction?: (actionType: string, payload: any) => void;
}

export const ResultAmendmentModal: React.FC<ResultAmendmentModalProps> = ({
  report,
  userRole = 'consumer',
  onClose,
  onApplyAction
}) => {
  const [activeAuthority, setActiveAuthority] = useState<'consumer' | 'source'>(userRole);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Source action inputs
  const [amendReason, setAmendReason] = useState('');
  const [addendumText, setAddendumText] = useState('');
  const [activeTab, setActiveTab] = useState<'audit_trail' | 'source_actions' | 'consumer_actions'>('audit_trail');

  const amendments = report.amendments || [];

  const handleExecuteSourceAction = (actionName: string) => {
    setActionSuccessMessage(`تم تنفيذ الإجراء المصرح به بنجاح: ${actionName}`);
    setTimeout(() => setActionSuccessMessage(null), 3000);
    if (onApplyAction) {
      onApplyAction(actionName, { reason: amendReason, addendum: addendumText });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-purple-300">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  مركز تدقيق وتعديل النتائج السريرية (Result Amendment & Authority)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/40">
                  Governance Matrix
                </span>
              </div>
              <p className="text-xs text-purple-200/80 mt-0.5">
                {report.panelNameAr} • التمييز الصريح بين صلاحيات مستهلك النتيجة ومصدرها المصرح
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Authority Role Switcher Bar */}
        <div className="bg-purple-50/70 border-b border-purple-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-purple-950">صلاحية المستخدم الحالية:</span>
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-purple-200 shadow-2xs">
              <button
                onClick={() => {
                  setActiveAuthority('consumer');
                  setActiveTab('consumer_actions');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeAuthority === 'consumer'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                مستهلك النتيجة (Result Consumer)
              </button>
              <button
                onClick={() => {
                  setActiveAuthority('source');
                  setActiveTab('source_actions');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeAuthority === 'source'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                مصدر النتيجة المصرح (Authorized Diagnostic Source)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-purple-800 font-medium">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>
              {activeAuthority === 'consumer'
                ? 'فريق الرعاية السريرية المعالج (Review / Acknowledge / Follow-up)'
                : 'المختبر / أخصائي الباثولوجي المصرح (Amend / Correct / Append)'}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0">
          <button
            onClick={() => setActiveTab('audit_trail')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'audit_trail'
                ? 'border-purple-600 text-purple-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            سجل التعديلات والتدقيق ({amendments.length})
          </button>
          <button
            onClick={() => setActiveTab('consumer_actions')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'consumer_actions'
                ? 'border-purple-600 text-purple-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            إجراءات مستهلك النتيجة (Consumer Actions)
          </button>
          <button
            onClick={() => setActiveTab('source_actions')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'source_actions'
                ? 'border-purple-600 text-purple-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            إجراءات المصدر التشخيصي (Diagnostic Source Authority)
          </button>
        </div>

        {actionSuccessMessage && (
          <div className="m-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs grow">
          {/* TAB 1: AUDIT TRAIL */}
          {activeTab === 'audit_trail' && (
            <div className="space-y-4">
              {amendments.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
                  التقرير في نسخته الأولية المعتمدة (Final). لا توجد تعديلات مسجلة سابقاً.
                </div>
              ) : (
                amendments.map(amd => (
                  <div key={amd.id} className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">
                        الإصدار #{amd.version} (Amended Version)
                      </span>
                      <span className="font-mono text-slate-500 text-[11px] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{amd.amendedAt}</span>
                      </span>
                    </div>

                    <div className="text-purple-950 font-medium text-[11px] bg-white p-2.5 rounded-xl border border-purple-100">
                      <strong>السبب السريري / التقني للتعديل:</strong> {amd.reason}
                    </div>

                    <div className="text-slate-600 text-[11px]">
                      المسؤول عن التعديل: <strong className="text-slate-900">{amd.amendedBy}</strong> (مصدر مصرح)
                    </div>

                    {/* Changed fields */}
                    {amd.changedFields && amd.changedFields.length > 0 && (
                      <div className="border border-purple-200 rounded-xl overflow-hidden bg-white">
                        <div className="bg-purple-100/60 px-3 py-1.5 font-bold text-[10px] text-purple-900">
                          الحقول والقيم التي تم تعديلها:
                        </div>
                        <div className="divide-y divide-purple-100">
                          {amd.changedFields.map((field, fIdx) => (
                            <div key={fIdx} className="p-2.5 flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-800">{field.fieldName}</span>
                              <div className="flex items-center gap-2 font-mono">
                                <span className="text-rose-700 line-through bg-rose-50 px-1.5 py-0.5 rounded">
                                  {field.oldValue}
                                </span>
                                <ArrowRight className="w-3 h-3 text-slate-400" />
                                <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                                  {field.newValue}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: RESULT CONSUMER ACTIONS */}
          {activeTab === 'consumer_actions' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-950 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs text-blue-900">
                  <UserCheck className="w-4 h-4 text-blue-700" />
                  <span>صلاحيات مستهلك النتيجة السريرية (Clinician / Care Team Consumer)</span>
                </div>
                <p className="text-[11px] text-blue-800">
                  بصفتك مستهلكاً تشخيصياً، لا تملك سلطة تغيير أرقام التحليل، ولكن تملك صلاحية مراجعة النتائج، إقرارها، أو طلب متابعة وإعادة سحب من المختبر.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
                  <span className="font-bold text-slate-900 block">1. المراجعة السريرية (Review)</span>
                  <p className="text-[11px] text-slate-500">
                    توثيق اطلاع الطبيب المعالج على النتيجة ودمجها في الخطة العلاجية.
                  </p>
                  <button
                    onClick={() => handleExecuteSourceAction('Review Clinically Logged')}
                    className="w-full py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    تسجيل المراجعة (Review)
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
                  <span className="font-bold text-slate-900 block">2. الإقرار الرسمي (Acknowledge)</span>
                  <p className="text-[11px] text-slate-500">
                    إقرار استلام النتيجة الحرجة أو العادية وإغلاق نافذة التنبيه الزمني SLA.
                  </p>
                  <button
                    onClick={() => handleExecuteSourceAction('Acknowledge Complete')}
                    className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    إقرار الاستلام (Acknowledge)
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
                  <span className="font-bold text-slate-900 block">3. طلب متابعة (Follow-up)</span>
                  <p className="text-[11px] text-slate-500">
                    طلب إعادة سحب عينة جديدة أو توضيح شفهي من رئيس قسم المختبر.
                  </p>
                  <button
                    onClick={() => handleExecuteSourceAction('Lab Recollect / Follow-up Requested')}
                    className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    طلب إعادة سحب / متابعة
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUTHORIZED RESULT SOURCE ACTIONS */}
          {activeTab === 'source_actions' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs text-purple-900">
                  <ShieldCheck className="w-4 h-4 text-purple-700" />
                  <span>صلاحيات المصدر التشخيصي المصرح (Authorized Diagnostic Source Authority)</span>
                </div>
                <p className="text-[11px] text-purple-800">
                  صلاحيات مخصصة حصرياً لأخصائيي المختبر، استشاريي الباثولوجي، واستشاريي الأشعة لتعديل النتائج، تصحيح الأخطاء، أو إلغاء التقارير المدخلة بالخطأ مع الاحتفاظ بسجل التدقيق الكامل.
                </p>
              </div>

              {activeAuthority !== 'source' ? (
                <div className="p-6 text-center border-2 border-dashed border-amber-300 bg-amber-50/50 rounded-2xl space-y-2">
                  <AlertTriangle className="w-6 h-6 text-amber-600 mx-auto" />
                  <strong className="text-amber-900 block text-xs">
                    تنبيه: أنت تتصفح حالياً بصفة مستهلك نتيجة (Result Consumer)
                  </strong>
                  <p className="text-[11px] text-amber-800 max-w-md mx-auto">
                    لا يمكن إجراء تعديلات أو تصحيحات مخبرية إلا من خلال هوية مصدر تشخيصي مصرح (Authorized Result Source). يمكنك تجربة الدور عبر المفتاح بالأعلى.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Action 1: Amend / Correct */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                    <strong className="text-xs text-slate-900 block">
                      تعديل النتيجة أو تصحيح خطأ إدخال (Amend / Correct Result)
                    </strong>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        سبب التعديل والتوثيق السريري (Mandatory Reason):
                      </label>
                      <input
                        type="text"
                        value={amendReason}
                        onChange={e => setAmendReason(e.target.value)}
                        placeholder="مثال: تم إعادة التحليل على جهاز ثانٍ للتأكد من خلو العينة من التحلل الدموي..."
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleExecuteSourceAction(`Amend Result (${amendReason || 'Standard verification'})`)}
                        className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        إصدار نسخة معدلة (Issue Amended Version)
                      </button>
                      <button
                        onClick={() => handleExecuteSourceAction('Correct Typo / Observation Error')}
                        className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        تصحيح خطأ إدخال (Correct Error)
                      </button>
                    </div>
                  </div>

                  {/* Action 2: Addendum & Entered In Error */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                      <strong className="text-xs text-slate-900 block flex items-center gap-1.5">
                        <FilePlus className="w-4 h-4 text-teal-600" />
                        <span>إضافة ملحق تشخيصي (Append Addendum)</span>
                      </strong>
                      <p className="text-[11px] text-slate-500">
                        إرفاق ملحق توضيحي دون تغيير القيم الأصلية للتقرير.
                      </p>
                      <button
                        onClick={() => handleExecuteSourceAction('Addendum Appended')}
                        className="w-full py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        إضافة ملحق تشخيصي (Addendum)
                      </button>
                    </div>

                    <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-2">
                      <strong className="text-xs text-rose-950 block flex items-center gap-1.5">
                        <AlertOctagon className="w-4 h-4 text-rose-700" />
                        <span>تصنيف كمدخل بالخطأ (Entered in Error)</span>
                      </strong>
                      <p className="text-[11px] text-rose-800">
                        إبطال التقرير مع الاحتفاظ بنسخته وأسباب الإلغاء في سجل التدقيق القانوني.
                      </p>
                      <button
                        onClick={() => handleExecuteSourceAction('Marked as Entered in Error with Audit')}
                        className="w-full py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        تصنيف كمدخل بالخطأ (Mark Error)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
          <span className="text-[11px] text-slate-500">
            تخضع جميع التعديلات لرقابة الحوكمة السريرية ومعايير التدقيق الطبي ISO 15189
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
