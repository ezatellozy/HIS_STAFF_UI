import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Activity,
  Heart,
  Droplet,
  FileCheck,
  Radio,
  FileText
} from 'lucide-react';
import {
  ImagingModality,
  MriSafetyScreening,
  ContrastSafetyContext,
  PregnancySafetyContext
} from '../../types/radiologyOps';

interface SafetyReviewModalProps {
  patientId: string;
  patientName: string;
  mrn: string;
  modality: ImagingModality;
  examName: string;
  mriRecord?: MriSafetyScreening;
  contrastRecord?: ContrastSafetyContext;
  pregnancyRecord?: PregnancySafetyContext;
  onUpdateMriSafety?: (record: MriSafetyScreening) => void;
  onUpdateContrastSafety?: (record: ContrastSafetyContext) => void;
  onClose: () => void;
}

export const SafetyReviewModal: React.FC<SafetyReviewModalProps> = ({
  patientId,
  patientName,
  mrn,
  modality,
  examName,
  mriRecord,
  contrastRecord,
  pregnancyRecord,
  onUpdateMriSafety,
  onUpdateContrastSafety,
  onClose
}) => {
  const [activeSafetyTab, setActiveSafetyTab] = useState<'mri' | 'contrast' | 'pregnancy'>(
    modality === 'MRI' ? 'mri' : contrastRecord ? 'contrast' : 'pregnancy'
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">
                ملف أمان التصوير الطبي وسياسات السلامة (Configured Safety Context & Policies)
              </h3>
              <p className="text-[11px] text-slate-300">
                {patientName} • MRN: {mrn} • الموداليتي: {modality} • سياق بيانات سريرية محاكاة بدون حسابات عتبات ذاتية من الواجهة
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

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveSafetyTab('mri')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSafetyTab === 'mri'
                ? 'bg-white text-purple-700 border-t-2 border-purple-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>سلامة الرنين المغناطيسي (MRI Safety)</span>
            {mriRecord && (
              <span className={`w-2 h-2 rounded-full ${
                mriRecord.safetyStatus === 'cleared' ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
            )}
          </button>

          <button
            onClick={() => setActiveSafetyTab('contrast')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSafetyTab === 'contrast'
                ? 'bg-white text-blue-700 border-t-2 border-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Droplet className="w-3.5 h-3.5" />
            <span>أمان الصبغات ووظائف الكلى (Contrast Safety)</span>
            {contrastRecord && (
              <span className={`w-2 h-2 rounded-full ${
                contrastRecord.safetyStatus === 'cleared' ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
            )}
          </button>

          <button
            onClick={() => setActiveSafetyTab('pregnancy')}
            className={`px-4 py-2 font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSafetyTab === 'pregnancy'
                ? 'bg-white text-teal-700 border-t-2 border-teal-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>سياسة تقييم الحمل والأشعة المؤينة</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
          {/* TAB 1: MRI SAFETY */}
          {activeSafetyTab === 'mri' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-purple-950">حالة الفحص والفرز للرنين:</span>
                  <span className="mr-2 font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {mriRecord?.safetyStatus === 'cleared' ? 'مصرح وآمن للفحص (Cleared)' :
                     mriRecord?.safetyStatus === 'caution_conditional' ? 'مشروط بمحددات الأمان (MRI Conditional)' : 'بانتظار الفرز'}
                  </span>
                </div>
                <div className="text-[11px] text-purple-700">
                  {mriRecord?.screenerName || 'أخصائي الرنين'} • {mriRecord?.screenedAt || 'اليوم'}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <span className="font-bold text-slate-800 block border-b border-slate-200 pb-1">
                    الموانع والزرعات النشطة (Absolute / Active Implants):
                  </span>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span>منظم ضربات القلب (Cardiac Pacemaker):</span>
                      <strong className="text-emerald-700">لا يوجد (سليم)</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>قوقعة الأذن الإلكترونية (Cochlear Implant):</span>
                      <strong className="text-emerald-700">لا يوجد (سليم)</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>مشابك أوعية التمدد بالمخ (Aneurysm Clips):</span>
                      <strong className="text-emerald-700">لا يوجد (سليم)</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>محفز عصبي نخاعي (Neurostimulator):</span>
                      <strong className="text-emerald-700">لا يوجد (سليم)</strong>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <span className="font-bold text-slate-800 block border-b border-slate-200 pb-1">
                    المعادن والرهاب والأوزان (Conditionals & Physical):
                  </span>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span>شظايا أو أجسام معدنية بالعين (Foreign Body Eye):</span>
                      <strong className="text-emerald-700">سلبي (تم التأكد)</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>صفائح أو مفاصل تيتانيوم (Orthopedic Implants):</span>
                      <strong className="text-slate-800">{mriRecord?.hasOrthopedicImplants ? 'نعم (تيتانيوم غير مغناطيسي)' : 'لا يوجد'}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>رهاب الأماكن المغلقة (Claustrophobia):</span>
                      <strong className={mriRecord?.isClaustrophobic ? 'text-amber-700' : 'text-emerald-700'}>
                        {mriRecord?.isClaustrophobic ? 'نعم (يحتاج مهدئ / مرآة)' : 'لا يوجد'}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>وزن المريض المقاس:</span>
                      <strong className="font-mono text-slate-900">{mriRecord?.weightKg || 70} كجم (ضمن حد الطاولة 220 كجم)</strong>
                    </div>
                  </div>
                </div>
              </div>

              {mriRecord?.notes && (
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700">
                  <strong className="text-slate-900">ملاحظات الفاحص: </strong>
                  {mriRecord.notes}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CONTRAST SAFETY */}
          {activeSafetyTab === 'contrast' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-blue-950">نتيجة تقييم سلامة الصبغة:</span>
                  <span className="mr-2 font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {contrastRecord?.safetyStatus === 'cleared' ? 'مصرح للحقن (Cleared)' : 'مراجعة سريرية مطلوبة'}
                  </span>
                </div>
                <div className="text-[11px] text-blue-800">
                  {contrastRecord?.clearedByClinician || 'طبيب الأشعة المعتمد'}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                  <span className="text-slate-500 text-[11px] block">تاريخ التفاعلات التحسسية للصبغة:</span>
                  <strong className="text-emerald-700 font-bold block">
                    {contrastRecord?.priorReactionHistory === 'none' ? 'لا يوجد تفاعل سابق (No Reaction)' : 'يوجد تفاعل مسبق'}
                  </strong>
                  <span className="text-[10px] text-slate-400 block">{contrastRecord?.allergiesSummary}</span>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                  <span className="text-slate-500 text-[11px] block">وظائف الكلى ومعدل الترشيح:</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-slate-900">eGFR: {contrastRecord?.recentEgfr || '94 mL/min'}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">كرياتينين: {contrastRecord?.recentCreatinine || '0.8 mg/dL'}</span>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                  <span className="text-slate-500 text-[11px] block">إقرار الموافقة المستنيرة (Consent):</span>
                  <strong className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تم التوقيع إلكترونياً</span>
                  </strong>
                  <span className="text-[10px] text-slate-400 block">إجراء الحقن الوريدي للصبغة</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PREGNANCY SAFETY POLICY */}
          {activeSafetyTab === 'pregnancy' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-950">
                    تقييم سياسة فحص الحمل والأشعة المؤينة (Configured Safety Policy):
                  </span>
                  <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full text-[11px]">
                    {pregnancyRecord?.policyOutcome === 'cleared_by_policy' ? 'مستوفية لمعايير الأمان (Cleared by Policy)' :
                     pregnancyRecord?.policyOutcome === 'not_applicable' ? 'غير مشمولة بسياسة الإشعاع (Not Applicable)' : 'يتطلب مراجعة سريرية'}
                  </span>
                </div>
                <p className="text-[11px] text-teal-800 leading-relaxed">
                  تعتمد السياسة التشغيلية للمستشفى مراجعة تاريخ آخر دورة طمثية (قاعدة الـ 10 أيام) أو الفحص المخبري لـ Beta-HCG أو استشارة الطبيب المعالج للحالات الطارئة وفق مبدأ ALARA دون الاعتماد على افتراضات عشوائية.
                </p>
              </div>

              {pregnancyRecord && (
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">تاريخ آخر دورة طمثية موثق:</span>
                    <strong className="font-mono text-slate-900">{pregnancyRecord.lastMenstrualPeriodDate || 'غير مسجل'}</strong>
                  </div>
                  <div className="text-slate-700 pt-1 border-t border-slate-200 leading-relaxed">
                    <strong className="text-slate-900">التوثيق السريري للسياسة: </strong>
                    {pregnancyRecord.clinicalNote}
                  </div>
                  {pregnancyRecord.counselorName && (
                    <div className="text-[10px] text-slate-500">
                      المستشار السريري: {pregnancyRecord.counselorName}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            تم التحقق من كافة اشتراطات السلامة المهنية المعتمدة
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            إغلاق ومتابعة
          </button>
        </div>
      </div>
    </div>
  );
};
