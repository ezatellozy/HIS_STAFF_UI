import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  PhoneCall,
  CheckCircle2,
  ShieldAlert,
  Send,
  UserCheck,
  Clock,
  FileCheck
} from 'lucide-react';
import {
  CriticalFindingCommunication,
  RadiologyReport
} from '../../types/radiologyOps';

interface CriticalFindingsModalProps {
  report: RadiologyReport;
  onSaveCommunication: (comm: CriticalFindingCommunication) => void;
  onClose: () => void;
}

export const CriticalFindingsModal: React.FC<CriticalFindingsModalProps> = ({
  report,
  onSaveCommunication,
  onClose
}) => {
  const [severity, setSeverity] = useState<CriticalFindingCommunication['findingSeverity']>('critical_panic');
  const [description, setDescription] = useState(
    report.impressionNarrative || 'علامات مبكرة لنقص تروية حاد في الشريان المخي الأوسط دون نزيف حاد.'
  );
  const [recipientType, setRecipientType] = useState<CriticalFindingCommunication['recipientType']>('receiving_clinician');
  const [clinicianName, setClinicianName] = useState('د. سامح عبد الرازق');
  const [clinicianRole, setClinicianRole] = useState('استشاري طب الطوارئ المعالج');
  const [department, setDepartment] = useState('طوارئ الحوادث (Trauma Bay 03)');
  const [channel, setChannel] = useState<CriticalFindingCommunication['communicationChannel']>('direct_phone');
  const [readBackVerified, setReadBackVerified] = useState(true);
  const [readBackStatement, setReadBackStatement] = useState(
    'أكد الطبيب المستلم نصياً: عدم وجود نزيف دماغي حاد، ASPECTS = 8، والبدء الفوري في إجراءات إذابة الجلطة.'
  );

  const handleSave = () => {
    const comm: CriticalFindingCommunication = {
      id: `crit-${Date.now()}`,
      reportId: report.id,
      accessionNumber: report.accessionNumber,
      patientName: report.patientName,
      mrn: report.mrn,
      findingSeverity: severity,
      findingDescription: description,
      recipientType,
      communicatedToClinicianName: clinicianName,
      communicatedToClinicianRole: clinicianRole,
      clinicianDepartment: department,
      communicationChannel: channel,
      readBackVerified,
      readBackStatement: readBackVerified ? readBackStatement : undefined,
      communicatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      communicatedByRadiologist: report.signedBy,
      acknowledgementStatus: 'acknowledged'
    };

    onSaveCommunication(comm);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-rose-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold">
                توثيق إخطار النتائج الحرجة والمهمة (Configured Finding Communication Policy)
              </h3>
              <p className="text-[11px] text-rose-200">
                {report.patientName} • MRN: {report.mrn} • رقم التقرير: {report.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-rose-300 hover:text-white hover:bg-rose-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Policy Principle Banner */}
        <div className="bg-amber-50 border-b border-amber-200 p-3 text-[11px] text-amber-900 leading-relaxed">
          <strong>مبدأ السياسة السريرية: </strong>
          إرسال الإشعار أو قراءته ≠ مراجعة التقرير السريري ≠ إقرار استلام النتيجة الحرجة ≠ اكتمال الإخطار المغلق. متطلبات وسيلة التواصل والمستلم وقراءة التأكيد خاضعة لسياسة المنشأة المعتمدة وليست فرضاً عالمياً موحداً لكافة الحالات.
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs max-h-[65vh] overflow-y-auto">
          {/* Finding Severity */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 block">درجة خطورة النتيجة (Finding Severity):</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSeverity('critical_panic')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                  severity === 'critical_panic'
                    ? 'border-rose-600 bg-rose-50 text-rose-900 ring-1 ring-rose-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                حرجة فورية (Critical / Red)
              </button>
              <button
                type="button"
                onClick={() => setSeverity('urgent_action_required')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                  severity === 'urgent_action_required'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 ring-1 ring-amber-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                إجراء عاجل (Urgent / Orange)
              </button>
              <button
                type="button"
                onClick={() => setSeverity('unexpected_significant')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                  severity === 'unexpected_significant'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                غير متوقعة ومهمة (Unexpected)
              </button>
            </div>
          </div>

          {/* Recipient Type Selector */}
          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">فئة المستلم المحدد (Configured Recipient):</label>
            <select
              value={recipientType}
              onChange={e => setRecipientType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 font-medium"
            >
              <option value="receiving_clinician">طبيب مستلم / مناوب (Receiving Clinician)</option>
              <option value="responsible_clinician">الطبيب المسؤول المعالج (Responsible / Ordering Clinician)</option>
              <option value="receiving_team">فريق الرعاية الطبية المستلم (Receiving Care Team)</option>
              <option value="configured_recipient">مستلم معتمد حسب السياسة (Configured Recipient)</option>
            </select>
          </div>

          {/* Finding Description */}
          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">وصف النتيجة الحرجة المبلغ عنها:</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-medium"
            />
          </div>

          {/* Clinician Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">اسم المستلم:</label>
              <input
                type="text"
                value={clinicianName}
                onChange={e => setClinicianName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">الصفة والقسم السريري:</label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 font-medium"
              />
            </div>
          </div>

          {/* Channel */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">قناة الاتصال المعتمدة بالسياسة:</label>
            <select
              value={channel}
              onChange={e => setChannel(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 font-medium"
            >
              <option value="direct_phone">اتصال هاتفي مباشر (Direct Phone Call)</option>
              <option value="in_person_direct">تواصل مباشر وجهاً لوجه (In-Person Direct Handover)</option>
              <option value="secure_his_chat">محادثة سريرية آمنة عبر نظام HIS (Secure Clinical Chat)</option>
              <option value="team_communication">تواصل مباشر مع فريق الرعاية (Direct Team Communication)</option>
              <option value="escalation_paging">نداء طارئ بيجر / تصعيد (Urgent Escalation Paging)</option>
            </select>
          </div>

          {/* Read-Back Verification */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="readBack"
                checked={readBackVerified}
                onChange={e => setReadBackVerified(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-slate-300"
              />
              <label htmlFor="readBack" className="font-bold text-slate-900 cursor-pointer">
                تمت القراءة المتبادلة وتأكيد الفهم الدقيق (Closed-Loop Read-Back Verified)
              </label>
            </div>

            {readBackVerified && (
              <div className="pt-1">
                <label className="text-[11px] text-slate-600 font-medium block mb-1">
                  نص تأكيد القراءة المتبادلة من الطبيب المستلم:
                </label>
                <input
                  type="text"
                  value={readBackStatement}
                  onChange={e => setReadBackStatement(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            إلغاء
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>حفظ وتوثيق الإخطار في السجل الطبي القانوني</span>
          </button>
        </div>
      </div>
    </div>
  );
};
