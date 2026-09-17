import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  RefreshCw,
  FileQuestion,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Barcode
} from 'lucide-react';
import {
  LabSpecimen,
  SpecimenRejectionPolicy,
  SpecimenRejectionReasonCode
} from '../../types/laboratoryOps';
import { MOCK_REJECTION_POLICIES } from '../../data/mockLaboratoryOpsData';

interface SpecimenRejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  specimen: LabSpecimen;
  onConfirmRejection: (
    specimenId: string,
    rejectionCode: SpecimenRejectionReasonCode,
    description: string,
    action: 'recollection_requested' | 'clinician_consulted' | 'test_cancelled'
  ) => void;
}

export const SpecimenRejectionModal: React.FC<SpecimenRejectionModalProps> = ({
  isOpen,
  onClose,
  specimen,
  onConfirmRejection
}) => {
  const [selectedPolicyCode, setSelectedPolicyCode] = useState<SpecimenRejectionReasonCode>('hemolyzed');
  const [customDescription, setCustomDescription] = useState(
    'عينة مصل منحل بشدة (Gross Hemolysis Index > 4) مما يمنع التحليل الموثوق للبوتاسيوم والتروبونين.'
  );
  const [followupAction, setFollowupAction] = useState<'recollection_requested' | 'clinician_consulted' | 'test_cancelled'>(
    'recollection_requested'
  );

  if (!isOpen) return null;

  const currentPolicy =
    MOCK_REJECTION_POLICIES.find(p => p.code === selectedPolicyCode) || MOCK_REJECTION_POLICIES[0];

  const handleExecute = () => {
    onConfirmRejection(specimen.id, selectedPolicyCode, customDescription, followupAction);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border-2 border-red-500 shadow-2xl max-w-2xl w-full p-6 space-y-5 text-right font-['Cairo',sans-serif]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-red-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-100 text-red-700">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                توثيق رفض العينة المخبرية (Specimen Rejection & Recollection Policy)
              </h3>
              <p className="text-xs text-red-700 mt-0.5">
                تطبيق سياسات الجودة لرفض العينات غير المطابقة للمعايير السريرية والتشغيلية.
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

        {/* Core Semantic Invariant Notice */}
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl space-y-1 text-xs text-red-950">
          <div className="flex items-center gap-2 font-bold text-red-800">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
            <span>محدد الحوكمة المفاهيمية الصارم (Critical Governance Invariant):</span>
          </div>
          <p className="leading-relaxed">
            <strong>رفض العينة (Specimen Rejected) ≠ إلغاء الطلب السريري (Order Cancelled).</strong> رفض العينة يسجل عدم صلاحية هذه الحاوية بعينها، بينما يظل الطلب الطبي الأصلي قائماً ويرتبط بطلب إعادة السحب (Recollection) دون فقدان سياق الطبيب.
          </p>
        </div>

        {/* Specimen Context Card */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-3 text-xs text-slate-700">
          <div>
            <span className="text-slate-400 block">المريض:</span>
            <strong className="text-slate-900">{specimen.patientName}</strong>
          </div>
          <div>
            <span className="text-slate-400 block">الرقم الطبي (MRN):</span>
            <strong className="text-slate-900 font-mono">{specimen.mrn}</strong>
          </div>
          <div>
            <span className="text-slate-400 block">باركود العينة:</span>
            <strong className="text-amber-700 font-mono">{specimen.specimenBarcode}</strong>
          </div>
        </div>

        {/* Configured Rejection Policies Dropdown */}
        <div className="space-y-1.5 text-xs">
          <label className="block font-bold text-slate-800">
            سبب الرفض المعتمد بالسياسة المخبرية (Configured Rejection Policy):
          </label>
          <select
            value={selectedPolicyCode}
            onChange={e => {
              const code = e.target.value as SpecimenRejectionReasonCode;
              setSelectedPolicyCode(code);
              const pol = MOCK_REJECTION_POLICIES.find(p => p.code === code);
              if (pol) {
                setCustomDescription(pol.description);
              }
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            {MOCK_REJECTION_POLICIES.map(policy => (
              <option key={policy.code} value={policy.code}>
                {policy.labelAr} — {policy.labelEn}
              </option>
            ))}
          </select>
          {currentPolicy && (
            <p className="text-[11px] text-slate-500 italic px-1">{currentPolicy.description}</p>
          )}
        </div>

        {/* Detailed Rejection Notes */}
        <div className="space-y-1 text-xs">
          <label className="block font-bold text-slate-800">التفاصيل الفنية لتقرير الرفض (Technical Rejection Note):</label>
          <textarea
            rows={3}
            value={customDescription}
            onChange={e => setCustomDescription(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 leading-relaxed"
          />
        </div>

        {/* Follow-up Action Selection */}
        <div className="space-y-2 text-xs">
          <span className="block font-bold text-slate-800">الإجراء العملياتي اللاحق للطلب الأصلي (Downstream Action):</span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setFollowupAction('recollection_requested')}
              className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                followupAction === 'recollection_requested'
                  ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-1.5 text-amber-700">
                <RefreshCw className="w-4 h-4" />
                <span className="text-xs">طلب إعادة سحب (Recollection)</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                إنشاء مهمة سحب بديلة مرتبطة تلقائياً بالطلب السريري ذاته.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setFollowupAction('clinician_consulted')}
              className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                followupAction === 'clinician_consulted'
                  ? 'bg-blue-50 border-blue-500 text-blue-950 font-bold shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-1.5 text-blue-700">
                <FileQuestion className="w-4 h-4" />
                <span className="text-xs">استيضاح سريري (Clarify)</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                إرسال استفسار توضيحي للطبيب المعالج قبل اتخاذ قرار إعادة السحب.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setFollowupAction('test_cancelled')}
              className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                followupAction === 'test_cancelled'
                  ? 'bg-red-50 border-red-500 text-red-950 font-bold shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-1.5 text-red-700">
                <XCircle className="w-4 h-4" />
                <span className="text-xs">إلغاء الفحص (Cancel Test)</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                إلغاء الفحص بناءً على طلب الطبيب أو عدم الحاجة إليه بعد التقييم.
              </p>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
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
            onClick={handleExecute}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>تأكيد رفض العينة وتنفيذ الإجراء</span>
          </button>
        </div>
      </div>
    </div>
  );
};
