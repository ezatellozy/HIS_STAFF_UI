import React, { useState } from 'react';
import {
  X,
  PhoneCall,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  UserCheck,
  Clock,
  Send,
  Building2,
  AlertCircle
} from 'lucide-react';
import { LabAccession, CriticalResultCommunication } from '../../types/laboratoryOps';

interface CriticalResultCommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  accession: LabAccession;
  onSaveCommunication: (accessionId: string, comm: CriticalResultCommunication) => void;
}

export const CriticalResultCommunicationModal: React.FC<CriticalResultCommunicationModalProps> = ({
  isOpen,
  onClose,
  accession,
  onSaveCommunication
}) => {
  const [callerName, setCallerName] = useState('أخصائي الكيمياء: م. عاصم النجار');
  const [communicatedTo, setCommunicatedTo] = useState('ممرض الطوارئ: رائد الفهد');
  const [communicatedToRole, setCommunicatedToRole] = useState('Staff Nurse - ER Acute Care Team');
  const [readBackConfirmed, setReadBackConfirmed] = useState(true);
  const [communicationNote, setCommunicationNote] = useState(
    'تم إبلاغ الطوارئ هاتفياً بنتيجة البوتاسيوم الحرجة (6.8 mmol/L) والتروبونين الإيجابي (142.5 ng/L). تم التأكيد على إعادة قراءة القيم من قبل الممرض (Read-back completed).'
  );
  const [escalationStatus, setEscalationStatus] = useState<'acknowledged' | 'escalated'>('acknowledged');

  if (!isOpen) return null;

  const criticalTests = accession.tests.filter(
    t => t.flag === 'critical_high' || t.flag === 'critical_low'
  );

  const handleSave = () => {
    const comm: CriticalResultCommunication = {
      isCritical: true,
      requiredPolicy: 'read_back_required',
      identifiedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      communicatedTo,
      communicatedToRole,
      communicatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      callerStaffName: callerName,
      readBackConfirmed,
      acknowledgementStatus: escalationStatus,
      communicationNote
    };

    onSaveCommunication(accession.id, comm);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border-2 border-red-600 shadow-2xl max-w-2xl w-full p-6 space-y-5 text-right font-['Cairo',sans-serif]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-100 text-red-700 animate-pulse">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                توثيق إبلاغ القيمة المخبرية الحرجة (Critical Value Closed-Loop Communication)
              </h3>
              <p className="text-xs text-red-700 mt-0.5">
                متطلب سلامة المرضى: إبلاغ فوري مباشر مع قراءة متبادلة (Read-Back) وتوثيق استلام الفريق المعالج.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Policy Invariant Banner */}
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1 text-xs text-red-950">
          <div className="flex items-center gap-2 font-bold text-red-800">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
            <span>سياسة المنشأة الصارمة للقيمة الحرجة:</span>
          </div>
          <p className="leading-relaxed">
            <strong>«قراءة الإشعار الإلكتروني لا تعني الإقرار بالقيمة الحرجة»</strong> (Notification read ≠ Critical acknowledged). يجب الاتصال الهاتفي وتأكيد إعادة قراءة القيمة المسجلة بصوت واضح من قبل متلقي البلاغ.
          </p>
        </div>

        {/* Critical Values Summary */}
        <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs border-b border-slate-700 pb-2">
            <span className="font-bold text-red-400">القيم الحرجة المكتشفة التي تتطلب الإبلاغ:</span>
            <span className="font-mono text-slate-400">{accession.accessionNumber}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {criticalTests.map(t => (
              <div key={t.id} className="p-2 bg-slate-800 rounded-lg border border-red-500/40">
                <div className="text-xs font-bold text-slate-200">{t.testNameAr}</div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-lg font-mono font-black text-red-400">
                    {t.numericValue ?? t.textValue} {t.unit}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">المرجع: {t.referenceRangeText}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">المبلّغ من المختبر (Reporting Staff):</label>
            <input
              type="text"
              value={callerName}
              onChange={e => setCallerName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">المستلم في القسم المعالج (Receiving Caregiver):</label>
            <input
              type="text"
              value={communicatedTo}
              onChange={e => setCommunicatedTo(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">الصفة السريرية للمستلم (Role):</label>
            <input
              type="text"
              value={communicatedToRole}
              onChange={e => setCommunicatedToRole(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">حالة الاستجابة (Resolution):</label>
            <select
              value={escalationStatus}
              onChange={e => setEscalationStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
            >
              <option value="acknowledged">تم الإقرار والإبلاغ بنجاح (Acknowledged)</option>
              <option value="escalated">تعذر الوصول وتم التصعيد الإداري (Escalated to Supervisor/On-call)</option>
            </select>
          </div>
        </div>

        {/* Read-back Mandatory Checkbox */}
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl">
          <label className="flex items-center gap-2 text-xs font-bold text-teal-900 cursor-pointer">
            <input
              type="checkbox"
              checked={readBackConfirmed}
              onChange={e => setReadBackConfirmed(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
            />
            <span className="flex items-center gap-1">
              <UserCheck className="w-4 h-4 text-teal-700" />
              <span>تمت القراءة المتبادلة الشفوية بنجاح وتطابقت النتيجة المسجلة (Read-Back Confirmed)</span>
            </span>
          </label>
        </div>

        {/* Notes */}
        <div className="space-y-1 text-xs">
          <label className="block font-bold text-slate-700">ملاحظات التوثيق السريري:</label>
          <textarea
            rows={2}
            value={communicationNote}
            onChange={e => setCommunicationNote(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!readBackConfirmed}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>حفظ وتوثيق بلاغ القيمة الحرجة نهائياً</span>
          </button>
        </div>
      </div>
    </div>
  );
};
