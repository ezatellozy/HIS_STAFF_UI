import React, { useState } from 'react';
import {
  X,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Building2,
  Bed,
  Siren,
  Activity,
  Scissors,
  FileText,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useHis } from '../../context/HisContext';
import { CareTransitionRequest, TransitionStatus } from '../../types/clinicalWorkspace';
import { Patient } from '../../types/his';

interface CareTransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  currentLocationLabel?: string;
}

export const CareTransitionModal: React.FC<CareTransitionModalProps> = ({
  isOpen,
  onClose,
  patient,
  currentLocationLabel = 'الموقع الحالي غير محدد'
}) => {
  const {
    careTransitions,
    addCareTransition,
    updateTransitionStatus,
    wardBeds,
    icuBeds,
    currentStaff,
    playChime
  } = useHis();

  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [toLocation, setToLocation] = useState('ICU - العناية المركزة للقلب CCU');
  const [priority, setPriority] = useState<'stat' | 'urgent' | 'routine'>('urgent');
  const [reason, setReason] = useState('');
  const [receivingPhysician, setReceivingPhysician] = useState('د. خالد عبد العزيز (استشاري العناية)');
  const [situation, setSituation] = useState(`مريض: ${patient.fullNameAr} (${patient.age} سنة)`);
  const [background, setBackground] = useState(`التشخيص: ${(patient.chronicConditions || patient.chronicDiseases || []).join('، ') || 'متابعة سريرية حادة'}`);
  const [assessment, setAssessment] = useState('استقرار مبدئي مع حاجة لمتابعة مستمرة');
  const [recommendation, setRecommendation] = useState('تجهيز السرير واستلام الحالة السريرية فوراً');

  if (!isOpen) return null;

  const patientTransitions = careTransitions.filter(t => t.patientId === patient.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      alert('يرجى تحديد سبب طلب النقل السريري');
      return;
    }

    addCareTransition({
      patientId: patient.id,
      patientName: patient.fullNameAr,
      mrn: patient.mrn,
      fromLocation: currentLocationLabel,
      toLocation,
      reason,
      priority,
      requestedBy: currentStaff.name,
      receivingPhysician,
      sbarHandoff: {
        situation,
        background,
        assessment,
        recommendation
      }
    });

    playChime('call');
    setActiveTab('history');
  };

  const getStatusBadge = (status: TransitionStatus) => {
    switch (status) {
      case 'requested':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3" /> تم الطلب (Requested)
          </span>
        );
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <Clock className="w-3 h-3" /> قيد مراجعة القسم المستلم (Pending)
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
            <CheckCircle2 className="w-3 h-3" /> تم القبول الطبي (Accepted)
          </span>
        );
      case 'bed_assigned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800 border border-cyan-300">
            <Bed className="w-3 h-3" /> تم تخصيص السرير (Bed Assigned)
          </span>
        );
      case 'ready_for_transport':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
            <UserCheck className="w-3 h-3" /> جاهز للنقل الآمن (Ready)
          </span>
        );
      case 'transferred':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <ShieldCheck className="w-3 h-3" /> تم الاستلام والاكتمال (Transferred)
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">منظومة الانتقال السريري الآمن (Care Transitions & Handoff)</h3>
                <span className="px-2 py-0.5 rounded bg-teal-950 text-teal-300 text-xs font-mono font-bold border border-teal-800">
                  {patient.mrn}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                إدارة طلبات النقل، التحويل بين الأقسام، اعتماد الأسِرّة وتسليم SBAR
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient Reference Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">المريض:</span>
            <strong className="text-slate-900 font-bold">{patient.fullNameAr}</strong>
            <span className="text-slate-400">({patient.age} سنة • {patient.gender === 'male' ? 'ذكر' : 'أنثى'})</span>
          </div>
          <div className="flex items-center gap-2 text-teal-800 font-medium">
            <span>الموقع الحالي:</span>
            <span className="px-2 py-0.5 bg-teal-50 border border-teal-200 rounded font-semibold text-teal-900">
              {currentLocationLabel}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-200 bg-white">
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'create'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            طلب انتقال سريري جديد (New Request)
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>سجل الطلبات والتحويلات</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[10px]">
              {patientTransitions.length}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 text-slate-800 text-xs">
          {activeTab === 'create' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    الوجهة والقسم المطلوب الانتقال إليه:
                  </label>
                  <select
                    value={toLocation}
                    onChange={e => setToLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  >
                    <option value="ICU - العناية المركزة للقلب CCU">ICU - العناية المركزة للقلب (CCU)</option>
                    <option value="ICU - العناية المركزة الجراحية SICU">ICU - العناية المركزة الجراحية (SICU)</option>
                    <option value="IPD - جناح الباطنة 3A (Ward 3A)">IPD - جناح الباطنة 3A (Ward 3A)</option>
                    <option value="IPD - جناح الجراحة 3B (Ward 3B)">IPD - جناح الجراحة 3B (Ward 3B)</option>
                    <option value="OR - غرف العمليات الجراحية (Operating Theatre)">OR - مسرح العمليات الجراحية (OR Theatre)</option>
                    <option value="PACU - وحدة الإفاقة بعد التخدير">PACU - وحدة الإفاقة بعد التخدير</option>
                    <option value="خروج طبي للمنزل (Discharge Home)">خروج طبي للمنزل (Discharge Home)</option>
                    <option value="تحويل لمستشفى تخصصي مرجعي (External Transfer)">تحويل لمستشفى تخصصي مرجعي (External)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">أولوية النقل السريري:</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPriority('stat')}
                      className={`p-2 rounded-xl text-center font-bold border transition-all ${
                        priority === 'stat'
                          ? 'bg-red-600 text-white border-red-700 shadow-xs'
                          : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                      }`}
                    >
                      عاجل STAT
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriority('urgent')}
                      className={`p-2 rounded-xl text-center font-bold border transition-all ${
                        priority === 'urgent'
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      طارئ Urgent
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriority('routine')}
                      className={`p-2 rounded-xl text-center font-bold border transition-all ${
                        priority === 'routine'
                          ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      اعتيادي Routine
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  السبب والمبرر السريري للنقل (Clinical Justification):
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="مثال: استقرار الحالة بعد الإنعاش والحاجة لمراقبة ضغط دم شرياني وتجهيز سرير عناية حثيثة..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              {/* SBAR Structured Handoff Block */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-teal-600" />
                    تسليم الحالة بطريقة SBAR المعتمدة عالمياً (Inter-Departmental Handoff):
                  </span>
                  <span className="text-[10px] text-slate-500">معايير أمان المرضى CBAHI / JCI</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                      S - الوضع الراهن (Situation):
                    </label>
                    <input
                      type="text"
                      value={situation}
                      onChange={e => setSituation(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                      B - الخلفية المرضية (Background):
                    </label>
                    <input
                      type="text"
                      value={background}
                      onChange={e => setBackground(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                      A - التقييم السريري (Assessment):
                    </label>
                    <input
                      type="text"
                      value={assessment}
                      onChange={e => setAssessment(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                      R - التوصيات والمطلوب (Recommendation):
                    </label>
                    <input
                      type="text"
                      value={recommendation}
                      onChange={e => setRecommendation(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال طلب الانتقال السريري</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {patientTransitions.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <ArrowRightLeft className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>لا توجد طلبات انتقال مسجلة لهذا المريض حتى الآن.</p>
                </div>
              ) : (
                patientTransitions.map(trans => (
                  <div key={trans.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-teal-800">{trans.id}</span>
                        <span className="text-slate-400">• {trans.requestedAt}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            trans.priority === 'stat'
                              ? 'bg-red-100 text-red-800'
                              : trans.priority === 'urgent'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {trans.priority.toUpperCase()}
                        </span>
                      </div>
                      <div>{getStatusBadge(trans.status)}</div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                      <span>من: <strong className="text-slate-900">{trans.fromLocation}</strong></span>
                      <ArrowRightLeft className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>إلى: <strong className="text-teal-900">{trans.toLocation}</strong></span>
                    </div>

                    <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                      <strong>السبب:</strong> {trans.reason}
                    </p>

                    {trans.sbarHandoff && (
                      <div className="text-[11px] grid grid-cols-2 gap-2 bg-slate-100/70 p-2.5 rounded-lg border border-slate-200">
                        <div><strong>S:</strong> {trans.sbarHandoff.situation}</div>
                        <div><strong>B:</strong> {trans.sbarHandoff.background}</div>
                        <div><strong>A:</strong> {trans.sbarHandoff.assessment}</div>
                        <div><strong>R:</strong> {trans.sbarHandoff.recommendation}</div>
                      </div>
                    )}

                    {/* Progression Workflow Controls */}
                    <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="text-slate-500 text-[11px]">
                        طالب النقل: {trans.requestedBy}
                        {trans.assignedBedNumber && (
                          <span className="mr-2 text-teal-700 font-bold">
                            السرير المخصص: {trans.assignedBedNumber}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {trans.status === 'requested' && (
                          <button
                            onClick={() => updateTransitionStatus(trans.id, 'accepted', { receivingPhysician: currentStaff.name })}
                            className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors"
                          >
                            قبول الحالة (Accept)
                          </button>
                        )}
                        {trans.status === 'accepted' && (
                          <button
                            onClick={() => updateTransitionStatus(trans.id, 'bed_assigned', { assignedBedNumber: 'Bed-302-B' })}
                            className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold transition-colors"
                          >
                            تخصيص السرير (Assign Bed)
                          </button>
                        )}
                        {trans.status === 'bed_assigned' && (
                          <button
                            onClick={() => updateTransitionStatus(trans.id, 'ready_for_transport')}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors"
                          >
                            تأكيد الجاهزية للنقل (Ready)
                          </button>
                        )}
                        {trans.status === 'ready_for_transport' && (
                          <button
                            onClick={() => updateTransitionStatus(trans.id, 'transferred')}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-2xs"
                          >
                            إتمام الاستلام بالنظام (Complete Transfer)
                          </button>
                        )}
                        {trans.status === 'transferred' && (
                          <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> تم النقل والاستلام السريري
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
