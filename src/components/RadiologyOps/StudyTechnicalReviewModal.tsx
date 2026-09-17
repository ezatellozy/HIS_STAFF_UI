import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ShieldCheck,
  Send,
  Eye,
  FileText
} from 'lucide-react';
import {
  ImagingStudy
} from '../../types/radiologyOps';

interface StudyTechnicalReviewModalProps {
  study: ImagingStudy;
  onApproveQc: (studyId: string, qcStatus: ImagingStudy['technicalQc']['status'], comments: string) => void;
  onClose: () => void;
}

export const StudyTechnicalReviewModal: React.FC<StudyTechnicalReviewModalProps> = ({
  study,
  onApproveQc,
  onClose
}) => {
  const [qcStatus, setQcStatus] = useState<ImagingStudy['technicalQc']['status']>(study.technicalQc.status);
  const [qcComments, setQcComments] = useState<string>(study.technicalQc.technicalComments || 'تم فحص جودة المقاطع، خالية من التشوهات الحرجة ومطابقة لمعايير التشخيص.');

  const handleSave = () => {
    onApproveQc(study.id, qcStatus, qcComments);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">
                مراجعة الجودة الفنية للدراسة الشعاعية (Study Technical QC)
              </h3>
              <p className="text-[11px] text-slate-300">
                دراسة: {study.accessionNumber} • {study.patientName} • {study.modality}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Study Slices Summary */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-500 text-[11px] block">عدد المتتاليات (Series):</span>
            <strong className="text-slate-900 font-mono">{study.seriesCount} متتاليات</strong>
          </div>
          <div>
            <span className="text-slate-500 text-[11px] block">إجمالي الصور (Instances):</span>
            <strong className="text-slate-900 font-mono">{study.totalInstancesCount} صورة</strong>
          </div>
          <div>
            <span className="text-slate-500 text-[11px] block">الأخصائي المنفذ:</span>
            <strong className="text-slate-900 truncate block">{study.performingTechnologist}</strong>
          </div>
          <div>
            <span className="text-slate-500 text-[11px] block">وقت الفحص:</span>
            <strong className="text-slate-900 font-mono">{study.studyTime}</strong>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Status Selection */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 block">قرار الجودة الفنية (Technical QC Decision):</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setQcStatus('satisfactory')}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer space-y-1 ${
                  qcStatus === 'satisfactory'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>مطابق ومكتمل (Satisfactory)</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  كافة المقاطع واضحة ومستوفية للمعايير التشخيصية بالكامل.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setQcStatus('suboptimal_accepted')}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer space-y-1 ${
                  qcStatus === 'suboptimal_accepted'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 ring-1 ring-amber-500'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>مقبول تشخيصياً مع ملاحظات</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  تشويش طفيف لكن الصور كافية للتشخيص دون الحاجة لإعادة تعريض المريض.
                </div>
              </button>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 block">
              ملاحظات المراجعة الفنية (Technical Audit Comments):
            </label>
            <textarea
              rows={3}
              value={qcComments}
              onChange={e => setQcComments(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:border-teal-500"
            />
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
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>اعتماد الجودة وتحويل الدراسة لطابور قراءة طبيب الأشعة</span>
          </button>
        </div>
      </div>
    </div>
  );
};
