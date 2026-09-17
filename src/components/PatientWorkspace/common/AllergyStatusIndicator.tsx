import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  HelpCircle,
  Clock,
  UserCheck,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import {
  PatientAllergyViewModel,
  AllergyDocumentationStatus
} from '../../../types/clinicalIdentityVerification';
import { DetailedAllergyRecord } from '../../../types/clinicalHistoryProblems';

export interface AllergyStatusIndicatorProps {
  allergies?: DetailedAllergyRecord[];
  allergiesList?: string[];
  lastAssessedDate?: string;
  lastAssessedBy?: string;
  onOpenDetailedManagement?: () => void;
  compact?: boolean;
}

export const AllergyStatusIndicator: React.FC<AllergyStatusIndicatorProps> = ({
  allergies = [],
  allergiesList,
  lastAssessedDate = '2026-09-12',
  lastAssessedBy = 'د. خالد العمري (استشاري باطنة)',
  onOpenDetailedManagement,
  compact = false
}) => {
  const [showDetailsDropdown, setShowDetailsDropdown] = useState(false);

  // Derive explicit documentation status:
  // 1. If explicit items exist: active_allergies_present
  // 2. If allergies array is empty or specifically says NKDA: no_known_allergies
  // 3. If explicit 'unassessed' flag or string present: unassessed_unavailable
  let documentationStatus: AllergyDocumentationStatus = 'no_known_allergies';

  const stringAllergies = allergiesList || [];
  const isExplicitUnknown =
    stringAllergies.some(a => a.includes('غير متوفر') || a.includes('مجهول') || a.includes('لم يتم التقييم')) ||
    (allergies.length === 0 && stringAllergies.length === 0);

  const hasDocumentedNegative =
    stringAllergies.some(a => a.includes('NKDA') || a.includes('لا توجد حساسية معروفة') || a.includes('لا يوجد'));

  if (allergies.length > 0) {
    documentationStatus = 'active_allergies_present';
  } else if (hasDocumentedNegative) {
    documentationStatus = 'no_known_allergies';
  } else if (isExplicitUnknown) {
    documentationStatus = 'unassessed_unavailable';
  } else {
    documentationStatus = 'no_known_allergies';
  }

  // Visual presentations for the 3 distinct clinical states
  return (
    <div className="relative inline-block text-xs" dir="rtl">
      {documentationStatus === 'active_allergies_present' && (
        <button
          type="button"
          onClick={() => setShowDetailsDropdown(!showDetailsDropdown)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-600 text-red-200 font-bold transition-all shadow-xs cursor-pointer"
          title="حساسية دوائية/غذائية مؤكدة - انقر لعرض التفاصيل وتفريق الشدة عن الأهمية السريرية"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse shrink-0" />
          <span>حساسية مسجلة ({allergies.length}):</span>
          <strong className="text-white underline">
            {allergies.map(a => a.substanceNameAr).join('، ')}
          </strong>
          {showDetailsDropdown ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
        </button>
      )}

      {documentationStatus === 'no_known_allergies' && (
        <button
          type="button"
          onClick={() => setShowDetailsDropdown(!showDetailsDropdown)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold transition-all cursor-pointer"
          title="تم الفحص السريري ونفي الحساسية بنجاح (No Known Allergies)"
        >
          <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-white font-bold">لا توجد حساسية معروفة مسجلة (NKDA)</span>
          <span className="text-[10px] text-emerald-400 font-mono">✓ فحص منفي مؤكد</span>
          {showDetailsDropdown ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
        </button>
      )}

      {documentationStatus === 'unassessed_unavailable' && (
        <button
          type="button"
          onClick={() => setShowDetailsDropdown(!showDetailsDropdown)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-600 text-amber-200 font-bold transition-all shadow-xs animate-pulse cursor-pointer"
          title="تنبيه سلامة: لم يتم توثيق الحساسية بعد - يختلف تماماً عن نفي الحساسية"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>تنبيه سلامة: معلومات الحساسية غير مسجلة / غير متاحة بعد (Unassessed)</span>
          <span className="text-[10px] bg-amber-900/80 text-amber-200 px-1.5 py-0.5 rounded font-mono">
            يتطلب تقييم عاجل
          </span>
          {showDetailsDropdown ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
        </button>
      )}

      {/* Popover / Dropdown with Clinical Source Distinction and Criticality vs Severity */}
      {showDetailsDropdown && (
        <div className="absolute top-full mt-2 right-0 z-40 w-80 sm:w-96 bg-white text-slate-800 rounded-2xl border border-slate-200 shadow-2xl p-4 text-xs space-y-3 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <strong className="font-black text-slate-900">
                سجل الحساسيات السريرية (Allergy/Intolerance Record)
              </strong>
            </div>
            <button
              onClick={() => setShowDetailsDropdown(false)}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Explicit note on Source Distinction: Allergy ≠ Diagnosis */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-800 block mb-0.5">مبدأ الفصل السريري (Clinical Separation):</span>
            معلومات الحساسية مستقاة من سجل الحساسيات المعتمد كنموذج عرض مستقل، وليست مشتقة عرضاً من قائمة التشخيصات أو المشاكل المزمنة.
          </div>

          {/* Content based on status */}
          {documentationStatus === 'active_allergies_present' ? (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {allergies.map(item => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-rose-200 bg-rose-50/50 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <strong className="font-extrabold text-rose-950">{item.substanceNameAr}</strong>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                      {item.category}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-700">
                    <span>التظاهر: <strong>{item.reactionManifestationAr}</strong></span>
                  </div>

                  {/* Four Separately Represented Dimensions */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-rose-200/60 text-[10px]">
                    <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block">الأهمية السريرية (Criticality):</span>
                      <strong className="text-amber-800 font-bold">
                        {item.criticality === 'high' || item.severity === 'severe_anaphylaxis'
                          ? 'أولوية قصوى (High Risk)'
                          : item.criticality === 'low'
                          ? 'منخفضة الخطورة (Low Risk)'
                          : 'متوسطة الأثر (Moderate Risk)'}
                      </strong>
                    </div>

                    <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block">شدة التفاعل (Reaction Severity):</span>
                      <strong className="text-rose-700 font-bold">
                        {item.severity === 'severe_anaphylaxis'
                          ? 'شديدة / صدمة حساسية'
                          : item.severity === 'moderate'
                          ? 'متوسطة الشدة'
                          : 'طفيفة'}
                      </strong>
                    </div>

                    <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block">الحالة السريرية (Clinical Status):</span>
                      <strong className="text-teal-800 font-bold">
                        {item.clinicalStatus === 'resolved'
                          ? 'متعافي / منتهي (Resolved)'
                          : item.clinicalStatus === 'inactive'
                          ? 'غير نشط (Inactive)'
                          : 'نشط سريرياً (Active)'}
                      </strong>
                    </div>

                    <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block">حالة التحقق (Verification Status):</span>
                      <strong className="text-indigo-800 font-bold">
                        {item.verificationStatus === 'confirmed'
                          ? 'مؤكد باختبار / استشاري (Confirmed)'
                          : item.verificationStatus === 'refuted'
                          ? 'منفي بعد الفحص (Refuted)'
                          : item.verificationStatus === 'patient_reported'
                          ? 'إفادة المريض (Patient-reported)'
                          : 'مشتبه به (Suspected)'}
                      </strong>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                    <span>تاريخ التوثيق: {item.identifiedDate}</span>
                    <span>الموثق: {item.recordedBy}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : documentationStatus === 'no_known_allergies' ? (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
              <strong className="font-bold block text-xs">تم التقييم السريري الشامل: لا توجد حساسية معروفة (NKDA)</strong>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                قام الفريق السريري بسؤال المريض واستعراض السجل الدوائي السابق، وتم نفي وجود حساسية معروفة تجاه أي مواد أو أغذية أو أدوية.
              </p>
              <div className="text-[10px] text-emerald-700 pt-1 font-mono">
                تاريخ التوثيق: {lastAssessedDate} • بواسطة: {lastAssessedBy}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
              <strong className="font-bold block text-xs">حالة غير مقيمة (Allergy Status Unknown / Unassessed)</strong>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                لم يتم إكمال استقصاء الحساسيات بعد (مثل دخول طوارئ حاد أو مريض فاقد للوعي). يحظر التعامل مع هذه الحالة على أنها خالية من الحساسية.
              </p>
            </div>
          )}

          {onOpenDetailedManagement && (
            <button
              type="button"
              onClick={() => {
                setShowDetailsDropdown(false);
                onOpenDetailedManagement();
              }}
              className="w-full py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-xs transition-colors cursor-pointer text-center"
            >
              الانتقال إلى محور السوابق والتقييم السريري (Axis 3) لإدارة الحساسيات
            </button>
          )}
        </div>
      )}
    </div>
  );
};
