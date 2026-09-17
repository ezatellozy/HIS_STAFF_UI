import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  UserCheck,
  AlertTriangle,
  FileCheck2,
  PhoneCall,
  Send,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import {
  FollowUpCommunicationStatus,
  ResultCommunicationStatus,
  ResultReadBackStatus,
  ResultClinicalActionStatus,
  ResultFollowUpMetadata
} from '../../../types/clinicalIdentityVerification';

export interface ResultFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  resultId: string;
  resultTitle: string;
  domainName: string;
  orderingClinician?: string;
  attendingClinician?: string;
  currentStatus: FollowUpCommunicationStatus;
  urgency?: 'routine' | 'urgent' | 'critical_stat';
  onUpdateFollowUp: (metadata: ResultFollowUpMetadata) => void;
  staffName: string;
  staffRole: string;
}

export const ResultFollowUpModal: React.FC<ResultFollowUpModalProps> = ({
  isOpen,
  onClose,
  resultId,
  resultTitle,
  domainName,
  orderingClinician,
  attendingClinician,
  currentStatus = 'pending_communication',
  urgency = 'critical_stat',
  onUpdateFollowUp,
  staffName,
  staffRole
}) => {
  if (!isOpen) return null;

  // Independent Dimensions:
  const [commStatus, setCommStatus] = useState<ResultCommunicationStatus>(
    currentStatus === 'pending_communication' ? 'uncommunicated' : 'communicated'
  );

  const [readBackStatus, setReadBackStatus] = useState<ResultReadBackStatus>(
    currentStatus === 'communicated_readback_confirmed' ? 'readback_confirmed' : 'not_required'
  );

  const [actionStatus, setActionStatus] = useState<ResultClinicalActionStatus>(
    currentStatus === 'followup_completed'
      ? 'action_completed'
      : currentStatus === 'clinician_action_planned'
      ? 'action_planned'
      : currentStatus === 'no_followup_needed'
      ? 'no_action_needed'
      : 'action_pending'
  );

  const [responsibleTeam, setResponsibleTeam] = useState(attendingClinician || '');
  const [assignedRole, setAssignedRole] = useState(attendingClinician ? 'attending_physician' : '');
  const [communicationNote, setCommunicationNote] = useState('');
  const [actionPlan, setActionPlan] = useState('');

  const handleSave = () => {
    // Derive backward compatible followUpStatus without conflating orthogonal state dimensions
    const legacyStatus: FollowUpCommunicationStatus =
      actionStatus === 'action_completed'
        ? 'followup_completed'
        : actionStatus === 'action_planned'
        ? 'clinician_action_planned'
        : readBackStatus === 'readback_confirmed'
        ? 'communicated_readback_confirmed'
        : actionStatus === 'no_action_needed'
        ? 'no_followup_needed'
        : 'pending_communication';

    const record: ResultFollowUpMetadata = {
      resultId,
      resultTitle,
      orderingClinician,
      attendingClinician,
      responsibleClinicianOrTeam: responsibleTeam,
      assignedFollowUpRole: assignedRole,
      communicationStatus: commStatus,
      readBackStatus,
      actionFollowUpStatus: actionStatus,
      followUpStatus: legacyStatus,
      urgency: (urgency || 'routine') as 'routine' | 'urgent' | 'critical_stat',
      communicationNote: communicationNote.trim() || undefined,
      actionTakenNotes: actionPlan.trim() || undefined,
      completedBy: actionStatus === 'action_completed' ? staffName : undefined,
      completedAt: actionStatus === 'action_completed' ? new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : undefined
    };
    onUpdateFollowUp(record);
    onClose();
  };

  return (
    <div
      id="result-followup-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
      dir="rtl"
    >
      <div
        id="result-followup-card"
        className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-teal-950 text-white p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-white">
                حلقة المتابعة وإسناد مسؤولية النتيجة السريرية
              </h3>
              <span className="text-xs text-teal-200/80 font-medium">
                Independent Result Follow-Up Dimensions (Prototype Mock Only)
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[72vh]">
          {/* Target Result Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-500 text-[11px]">التقرير / الفحص:</span>
              <span className="font-mono text-[10px] text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded font-bold">
                {domainName.toUpperCase()} • {resultId}
              </span>
            </div>
            <h4 className="font-black text-slate-900 text-sm">{resultTitle}</h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
              <div>الطبيب الطالب: <strong className="text-slate-800">{orderingClinician || <span className="text-slate-400 font-normal italic">غير محدد في النظام (Missing)</span>}</strong></div>
              <div>الطبيب المعالج المسجل: <strong className="text-slate-800">{attendingClinician || <span className="text-slate-400 font-normal italic">غير محدد في النظام (Missing)</span>}</strong></div>
            </div>
          </div>

          {/* Clinical Policy Notice: Independent Dimensions */}
          <div className="p-3 rounded-2xl bg-teal-50/80 border border-teal-200 text-teal-950 space-y-1 text-[11px]">
            <div className="flex items-center justify-between">
              <strong className="font-black text-teal-900">مبدأ استقلالية أبعاد دورة حياة النتائج (Decoupled State Integrity):</strong>
              <span className="text-[10px] bg-teal-200/80 text-teal-900 px-2 py-0.5 rounded font-bold">
                محاكاة تشغيلية تجريبية
              </span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-teal-900 leading-relaxed text-[11px] pt-1">
              <li>حالة إنتاج النتيجة (أولية / نهائية / معدلة) وحالة المراجعة/الإقرار مستقلتان على التقرير نفسه.</li>
              <li>فتح النتيجة أو قراءتها لا يُغيّر حالتها السريرية تلقائياً.</li>
              <li>تأكيد القراءة الشفهية (Read-Back) يوثق التواصل لكنه <strong>لا يُنهي المتابعة السريرية تلقائياً</strong>.</li>
            </ul>
          </div>

          {/* Dimension 1: Communication Status */}
          <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <label className="font-bold text-slate-800 block text-xs">
              1. حالة التواصل والإبلاغ (Communication Status):
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCommStatus('uncommunicated')}
                className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                  commStatus === 'uncommunicated'
                    ? 'bg-amber-50 border-amber-500 text-amber-950 ring-1 ring-amber-400 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>لم يتم الإبلاغ بعد (Uncommunicated)</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">النتيجة معلنة ولكن لم يتم التواصل مع الفريق</span>
              </button>

              <button
                type="button"
                onClick={() => setCommStatus('communicated')}
                className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                  commStatus === 'communicated'
                    ? 'bg-teal-50 border-teal-500 text-teal-950 ring-1 ring-teal-400 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs">
                  <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
                  <span>تم التواصل والإبلاغ (Communicated)</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">تم إبلاغ الطبيب/الفريق بالنتيجة هاتفياً أو حضورياً</span>
              </button>
            </div>
          </div>

          {/* Dimension 2: Read-Back Status */}
          <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 block text-xs">
                2. حالة إعادة القراءة والمطابقة الشفهية (Read-Back Status):
              </label>
              <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded font-bold">
                لا تغلق المتابعة تلقائياً
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setReadBackStatus('not_required')}
                className={`p-2 rounded-xl border text-right transition-all cursor-pointer ${
                  readBackStatus === 'not_required'
                    ? 'bg-slate-200 border-slate-500 text-slate-900 ring-1 ring-slate-400 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs block">غير مطلوب</span>
                <span className="text-[10px] text-slate-500">للنتائج الروتينية</span>
              </button>

              <button
                type="button"
                onClick={() => setReadBackStatus('pending_readback')}
                className={`p-2 rounded-xl border text-right transition-all cursor-pointer ${
                  readBackStatus === 'pending_readback'
                    ? 'bg-amber-50 border-amber-500 text-amber-950 ring-1 ring-amber-400 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs block">بانتظار التأكيد</span>
                <span className="text-[10px] text-slate-500">تم الإبلاغ دون رد</span>
              </button>

              <button
                type="button"
                onClick={() => setReadBackStatus('readback_confirmed')}
                className={`p-2 rounded-xl border text-right transition-all cursor-pointer ${
                  readBackStatus === 'readback_confirmed'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-1 ring-indigo-400 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs block">تم تأكيد Read-Back</span>
                <span className="text-[10px] text-slate-500">أعاد القراءة لفظياً</span>
              </button>
            </div>
          </div>

          {/* Dimension 3: Clinical Action / Follow-Up Status */}
          <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <label className="font-bold text-slate-800 block text-xs">
              3. حالة التدخل والمتابعة السريرية (Clinical Action / Follow-Up Status):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setActionStatus('action_pending')}
                className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                  actionStatus === 'action_pending'
                    ? 'bg-amber-50 border-amber-500 text-amber-950 ring-1 ring-amber-400 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs block text-amber-800">بانتظار الإجراء</span>
                <span className="text-[10px] text-slate-500">Action Pending</span>
              </button>

              <button
                type="button"
                onClick={() => setActionStatus('action_planned')}
                className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                  actionStatus === 'action_planned'
                    ? 'bg-blue-50 border-blue-500 text-blue-950 ring-1 ring-blue-400 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs block text-blue-800">تم تخطيط الإجراء</span>
                <span className="text-[10px] text-slate-500">Action Planned</span>
              </button>

              <button
                type="button"
                onClick={() => setActionStatus('action_completed')}
                className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                  actionStatus === 'action_completed'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-400 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs block text-emerald-800">اكتملت المتابعة</span>
                <span className="text-[10px] text-slate-500">Loop Closed</span>
              </button>

              <button
                type="button"
                onClick={() => setActionStatus('no_action_needed')}
                className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                  actionStatus === 'no_action_needed'
                    ? 'bg-slate-100 border-slate-500 text-slate-800 ring-1 ring-slate-400 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs block text-slate-800">لا يلزم إجراء</span>
                <span className="text-[10px] text-slate-500">No Action Req</span>
              </button>
            </div>
          </div>

          {/* Dimension 4: Responsible Clinician & Team */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div>
              <label className="font-bold text-slate-700 block mb-1 text-xs">
                4. الطبيب أو الفريق المسؤول (Responsible Clinician/Team):
              </label>
              <input
                type="text"
                value={responsibleTeam}
                onChange={e => setResponsibleTeam(e.target.value)}
                placeholder="اسم الطبيب أو الفريق المسؤول عن المتابعة"
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1 text-xs">
                الدور الوظيفي المسؤول (Assigned Role):
              </label>
              <select
                value={assignedRole}
                onChange={e => setAssignedRole(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:ring-2 focus:ring-teal-500"
              >
                <option value="attending_physician">الطبيب المعالج الرئيسي (Attending Consultant)</option>
                <option value="ordering_clinician">الطبيب الطالب للفحص (Ordering Clinician)</option>
                <option value="covering_physician">طبيب التغطية المناوب (On-Call / Covering Physician)</option>
                <option value="critical_care_fellow">أخصائي الرعاية المركزة (Critical Care Fellow)</option>
                <option value="primary_nurse">الممرض السريري المسؤول (Primary Bedside RN)</option>
              </select>
            </div>
          </div>

          {/* Communication Details */}
          <div>
            <label className="font-bold text-slate-700 block mb-1 text-xs">
              ملاحظة التواصل والقراءة (Communication / Read-Back Note):
            </label>
            <textarea
              rows={2}
              value={communicationNote}
              onChange={e => setCommunicationNote(e.target.value)}
              placeholder="مثال: تم إبلاغ د. شريف هاتفياً بالقيمة الحرجة للتروبونين، وتمت إعادة القراءة وتأكيد استلام النتيجة..."
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Action Taken / Plan */}
          <div>
            <label className="font-bold text-slate-700 block mb-1 text-xs">
              خطة العمل السريري / الإجراء المتخذ (Clinical Action Plan):
            </label>
            <textarea
              rows={2}
              value={actionPlan}
              onChange={e => setActionPlan(e.target.value)}
              placeholder="مثال: البدء ببروتوكول متلازمة الشريان التاجي الحادة، طلب تخطيط قلب متسلسل، وتجهيز غرفة القسطرة..."
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            المسجل الحالي: <strong>{staffName}</strong> ({staffRole})
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-black bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>تثبيت حلقة المتابعة السريرية (Mock Action)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
