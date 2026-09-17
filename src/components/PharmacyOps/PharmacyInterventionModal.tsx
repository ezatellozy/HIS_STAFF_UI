import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  MessageSquare,
  Send,
  Phone,
  CheckCircle2,
  FileEdit,
  Info,
  Building2,
  UserCheck
} from 'lucide-react';
import { MedicationOrderContext, PharmacyIntervention } from '../../types/pharmacyOps';

interface PharmacyInterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: MedicationOrderContext | null;
  onSubmitIntervention: (intervention: Omit<PharmacyIntervention, 'id' | 'initiatedAt'>) => void;
}

export const PharmacyInterventionModal: React.FC<PharmacyInterventionModalProps> = ({
  isOpen,
  onClose,
  order,
  onSubmitIntervention
}) => {
  const [issueCategory, setIssueCategory] = useState<PharmacyIntervention['issueCategory']>('renal_dose_clarification');
  const [issueDescription, setIssueDescription] = useState(
    order?.alerts.find(a => a.category === 'renal_dose_adjustment')?.detailAr ||
    'الجرعة أو التكرار الموصوف يتطلب مراجعة سريرية وتعديلاً لتجنب المخاطر العلاجية.'
  );
  const [pharmacistRecommendation, setPharmacistRecommendation] = useState(
    'تعديل الفاصل الزمني للجرعة بما يتناسب مع المعطيات السريرية ووظائف المريض الحيوية.'
  );
  const [communicatedTo, setCommunicatedTo] = useState(order?.prescriberName || 'الطبيب المعالج');
  const [communicationChannel, setCommunicationChannel] = useState<PharmacyIntervention['communicationChannel']>('secure_clinical_chat');

  if (!isOpen || !order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitIntervention({
      orderId: order.id,
      patientName: order.patientName,
      mrn: order.mrn,
      medicationName: `${order.brandName} (${order.genericName}) ${order.orderedDose}`,
      issueCategory,
      issueDescription,
      pharmacistRecommendation,
      communicatedTo,
      communicationChannel,
      status: 'pending_prescriber',
      initiatedBy: 'د. ليلى عبد الحميد (صيدلي إكلينيكي)'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">توثيق طلب استيضاح / تدخل صيدلاني (Clinical Pharmacy Intervention)</h3>
              <p className="text-[11px] text-slate-300">
                تسجيل رسمي للملاحظة السريرية الموجهة للطبيب الواصف لضمان سلامة المريض
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Semantic Integrity Rule Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-bold">قاعدة سلامة العمليات: </span>
            <span>
              التدخل الصيدلاني هو سجل استيضاح مهني وتوصية سريرية؛ لا يقوم الصيدلي بتعديل أمر الطبيب الأصلي تلقائياً. أي تعديل في الجرعة أو المستحضر يجب أن يصدر من الطبيب المعالج في نظام الأوامر (Axis 6).
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Order Header Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900 text-xs">
                {order.brandName} ({order.genericName}) — {order.orderedDose} {order.route}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                المريض: {order.patientName} ({order.mrn}) • الموقع: {order.locationWardBed}
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded">
              {order.id}
            </span>
          </div>

          {/* Issue Category */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 block text-xs">تصنيف المشكلة السريرية (Clinical Issue Category):</label>
            <select
              value={issueCategory}
              onChange={e => setIssueCategory(e.target.value as PharmacyIntervention['issueCategory'])}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 outline-none"
            >
              <option value="renal_dose_clarification">تعديل الجرعة لوظائف الكلى المنخفضة (Renal Dose Adjustment)</option>
              <option value="dose_adjustment_needed">ملاءمة الجرعة للوزن أو الحالة المرضية (Dose Optimization)</option>
              <option value="drug_interaction_risk">خطر تداخل دوائي حرج (Drug-Drug Interaction)</option>
              <option value="therapeutic_duplication">تكرار علاجي غير مبرر (Therapeutic Duplication)</option>
              <option value="allergy_contraindication">تعارض مع حساسية موثقة (Allergy Contraindication)</option>
              <option value="stock_shortage_substitution">نقص المخزون واقتراح بديل علاجي (Stock Shortage / Alternative)</option>
              <option value="unclear_route_frequency">غموض في طريقة الإعطاء أو التكرار (Unclear Route / Frequency)</option>
              <option value="iv_compatibility_inquiry">توافق المحاليل الوريدية (IV Compatibility / Diluent)</option>
            </select>
          </div>

          {/* Issue Description */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 block text-xs">وصف الملاحظة السريرية (Clinical Observation / Problem Details):</label>
            <textarea
              value={issueDescription}
              onChange={e => setIssueDescription(e.target.value)}
              rows={3}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 outline-none leading-relaxed"
              placeholder="وضح بالتفصيل سبب التوقف أو الاستيضاح مع ذكر القياسات المخبرية ذات العلاقة..."
            />
          </div>

          {/* Pharmacist Recommendation */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 block text-xs">توصية الصيدلي المقترحة (Pharmacist Clinical Recommendation):</label>
            <textarea
              value={pharmacistRecommendation}
              onChange={e => setPharmacistRecommendation(e.target.value)}
              rows={2}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 outline-none leading-relaxed"
              placeholder="اقتراح الجرعة المعدلة أو البديل الدوائي والجدول الموصى به..."
            />
          </div>

          {/* Communicated To & Channel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block text-xs">الطبيب أو الفريق المخاطب:</label>
              <input
                type="text"
                value={communicatedTo}
                onChange={e => setCommunicatedTo(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block text-xs">قناة التواصل والتنسيق:</label>
              <select
                value={communicationChannel}
                onChange={e => setCommunicationChannel(e.target.value as PharmacyIntervention['communicationChannel'])}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="secure_clinical_chat">محادثة سريرية آمنة في النظام (Secure Chat)</option>
                <option value="phone_direct">اتصال هاتفي مباشر بالجناح (Direct Phone Call)</option>
                <option value="his_formal_clarification">طلب استيضاح إلكتروني رسمي (Formal Clarification)</option>
                <option value="in_person">مناقشة مباشرة أثناء المرور السريري (In-Person / Round)</option>
              </select>
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              سيتم تعليق صرف الطلب تلقائياً لحين رد الطبيب واعتماد الاستيضاح.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إرسال وتوثيق التدخل الصيدلاني</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
