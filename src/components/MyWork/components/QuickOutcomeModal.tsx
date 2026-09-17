import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  FileCheck,
  Send,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { WorkItemRecord } from '../../../types/clinicalWorkItems';

interface QuickOutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: WorkItemRecord | null;
  onConfirm: (outcomeData: { disposition: string; outcomeNote: string; docTitle?: string }) => void;
  onOpenPatient?: (item: WorkItemRecord) => void;
}

export const QuickOutcomeModal: React.FC<QuickOutcomeModalProps> = ({
  isOpen,
  onClose,
  item,
  onConfirm,
  onOpenPatient
}) => {
  if (!isOpen || !item) return null;

  const [disposition, setDisposition] = useState('تمت المعاينة والتوثيق السريري');
  const [outcomeNote, setOutcomeNote] = useState('');
  const [docTitle, setDocTitle] = useState('');

  const defaultDispositions = () => {
    switch (item.type) {
      case 'consultation_review':
        return [
          'تمت المعاينة وتوثيق تقرير الاستشارة والتوصيات',
          'تم الفحص والموافقة على التدخل الجراحي العاجل',
          'تمت التوصية بالعلاج المحافظ دون تدخل جراحي',
          'تحويل الاستشارة لتخصص دقيق آخر'
        ];
      case 'admission_review':
        return [
          'تم قبول التنويم وتأكيد حجز السرير بالعناية',
          'رفض طلب التنويم لعدم توفر معايير العناية والتوصية بالمتابعة بالجناح',
          'قبول مشروط بعد استقرار المؤشرات الحيوية'
        ];
      case 'critical_result_followup':
        return [
          'تم الاطلاع والاعتماد الفوري وإبلاغ الطبيب المعالج والتدخل السريري',
          'تمت مراجعة النتيجة وتكرار التحليل للتأكيد',
          'تم اعتماد النتيجة وتعديل جرعات الأدوية بناءً عليها'
        ];
      case 'medication_reconciliation':
        return [
          'تمت مطابقة الأدوية بنجاح واعتماد القائمة الموحدة',
          'تمت المطابقة مع رصد عدم تطابق وتصحيح الجرعة مع الطبيب',
          'تم إيقاف الأدوية المتعارضة واعتماد البدائل'
        ];
      case 'handover_receipt':
        return [
          'تم استلام المريض بجانب السرير ومطابقة الخطة العلاجية والمضخات',
          'تم الاستلام مع رصد ملاحظات تحتاج متابعة دقيقة'
        ];
      default:
        return [
          'تم إكمال الإجراء التشغيلي بنجاح',
          'تم الإغلاق مع التوثيق في السجل الطبي'
        ];
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      disposition,
      outcomeNote: outcomeNote || 'تم إغلاق الإجراء التشغيلي بعد اكتمال المراجعة السريرية اللازمة.',
      docTitle
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-['Cairo',sans-serif] animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden text-xs">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-black">إغلاق وإكمال الإجراء التشغيلي (Complete Work Item)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          {/* Item Context */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <div className="text-slate-500 font-mono text-[10px]">Work Item ID: {item.id}</div>
            <div className="font-extrabold text-slate-800">{item.title}</div>
            {item.patient && (
              <div className="text-slate-600 text-[11px]">
                المريض: <strong className="text-slate-900">{item.patient.nameAr}</strong> ({item.patient.mrn})
              </div>
            )}
          </div>

          {/* Disposition Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              القرار / النتيجة التشغيلية (Disposition Outcome):
            </label>
            <select
              value={disposition}
              onChange={e => setDisposition(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-300 font-bold text-slate-800 focus:ring-1 focus:ring-teal-500"
            >
              {defaultDispositions().map((disp, idx) => (
                <option key={idx} value={disp}>
                  {disp}
                </option>
              ))}
            </select>
          </div>

          {/* Resulting Clinical Record Reference (Operational link to pre-existing clinical note) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-700 text-xs">
                مرجع السجل السريري الموثق (Clinical Record Reference):
              </label>
              <span className="text-[10px] text-slate-400 font-medium">اختياري (Optional)</span>
            </div>
            <input
              type="text"
              value={docTitle}
              onChange={e => setDocTitle(e.target.value)}
              placeholder="مثال: مذكرة استشارة رقم NOTE-9104، أو تقرير الأشعة المعتمد..."
              className="w-full p-2 rounded-xl border border-slate-300 font-semibold text-slate-800 text-xs focus:ring-1 focus:ring-teal-500"
            />
            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
              هذا الحقل يشير إلى سجل أو مذكرة سريرية موثقة مسبقاً في ملف المريض. إدخال هذا المرجع لا ينشئ أو يوقع أو يعتمد أي توثيق سريري (Work Item Completion ≠ Clinical Source Completion).
            </p>
          </div>

          {/* Quick Deep-link to Patient Workspace for Legal Documentation */}
          {item.patient && onOpenPatient && (
            <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-200 flex items-center justify-between gap-2 text-xs">
              <div className="text-[11px] text-teal-900 leading-tight">
                هل تحتاج إلى تدوين أو اعتماد المذكرة السريرية في السجل القانوني أولاً؟
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPatient(item);
                }}
                className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] shrink-0 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3 h-3" />
                <span>فتح ملف المريض للتوثيق</span>
              </button>
            </div>
          )}

          {/* Notes / Clinical Summary */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 text-xs">
              ملخص الملاحظات والتوصيات التشغيلية (Queue Update Summary):
            </label>
            <textarea
              rows={3}
              value={outcomeNote}
              onChange={e => setOutcomeNote(e.target.value)}
              placeholder="اكتب ملاحظات موجزة حول الإجراء الذي تم اتخاذه..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs focus:ring-1 focus:ring-teal-500 resize-none"
            />
          </div>

          <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              * تنبيه تشغيلي: يقتصر هذا الإجراء على إغلاق وتحديث تذكرة العمل التشغيلية في قائمة مهامي (Queue Work Item)، ولا يُنشئ أي مدخل في السجل السريري القانوني للمريض.
            </span>
          </div>

          {/* Modal Footer */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تأكيد الإنجاز والأرشفة التشغيلية</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
