import React from 'react';
import {
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Phone,
  User,
  Building2,
  FileEdit,
  Info
} from 'lucide-react';
import { PharmacyIntervention } from '../../types/pharmacyOps';

interface InterventionsListViewProps {
  interventions: PharmacyIntervention[];
  onResolveIntervention: (id: string, responseNote: string, action: 'source_order_modified' | 'override_reconfirmed') => void;
}

export const InterventionsListView: React.FC<InterventionsListViewProps> = ({
  interventions,
  onResolveIntervention
}) => {
  return (
    <div className="space-y-4 text-xs">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-amber-950 text-white rounded-xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold">سجل الاستيضاحات والتدخلات الصيدلانية (Clinical Pharmacy Interventions)</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-900/60 text-amber-300 border border-amber-700">
                Intervention ≠ Order Change
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              توثيق الملاحظات والتوصيات الموجهة للأطباء بخصوص تعديل الجرعات، التداخلات، وملاءمة الكلى والكبد
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-300">
          إجمالي التدخلات المسجلة: <strong className="text-white font-mono text-sm">{interventions.length}</strong>
        </div>
      </div>

      {/* Semantic Rule Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          التدخل الصيدلاني هو وثيقة مهنية تدعم جودة الرعاية؛ اعتماد أو رفض التدخل يوثق هنا، ولكن أي تعديل في تفاصيل الوصفة الدوائية يتم في نظام الأوامر السريرية (Axis 6) بمعرفة الطبيب المصرح له.
        </p>
      </div>

      {/* Interventions Cards */}
      <div className="space-y-3">
        {interventions.map(item => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 hover:border-amber-500 rounded-xl p-4 transition-all shadow-2xs space-y-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {item.id}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{item.medicationName}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  المريض: <strong>{item.patientName}</strong> ({item.mrn}) • كود الطلب: <span className="font-mono">{item.orderId}</span>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                item.status === 'accepted_by_prescriber'
                  ? 'bg-emerald-100 text-emerald-800'
                  : item.status === 'rejected_by_prescriber'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {item.status === 'accepted_by_prescriber'
                  ? 'تمت موافقة الطبيب وتعديل الطلب'
                  : item.status === 'rejected_by_prescriber'
                  ? 'رُفض من قبل الطبيب المعالج'
                  : 'بانتظار رد الطبيب (Pending)'}
              </span>
            </div>

            {/* Problem & Recommendation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-200/80 text-rose-950">
                <span className="font-bold block mb-1">وصف الملاحظة السريرية:</span>
                <p className="text-[11px] leading-relaxed">{item.issueDescription}</p>
              </div>

              <div className="p-3 rounded-lg bg-teal-50/70 border border-teal-200/80 text-teal-950">
                <span className="font-bold block mb-1">توصية الصيدلي المقترحة:</span>
                <p className="text-[11px] leading-relaxed">{item.pharmacistRecommendation}</p>
              </div>
            </div>

            {/* Prescriber Response if Resolved */}
            {item.prescriberResponseNote && (
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                <span className="font-bold block text-slate-900">رد الطبيب المعالج:</span>
                <p>{item.prescriberResponseNote}</p>
              </div>
            )}

            {/* Metadata & Resolution Action */}
            <div className="flex flex-wrap items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500 gap-2">
              <div className="flex items-center gap-3">
                <span>المخاطب: <strong>{item.communicatedTo}</strong></span>
                <span>•</span>
                <span>القناة: {item.communicationChannel === 'secure_clinical_chat' ? 'محادثة آمنة' : 'هاتف مباشر'}</span>
                <span>•</span>
                <span>الموثق: {item.initiatedBy}</span>
              </div>

              {item.status === 'pending_prescriber' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      onResolveIntervention(
                        item.id,
                        'تم التنسيق هاتفياً وموافقة الطبيب المعالج على تعديل الجرعة في ملف المريض.',
                        'source_order_modified'
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>محاكاة موافقة الطبيب (Simulate Approval)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
