import React, { useState } from 'react';
import {
  X,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Mic,
  FileCheck,
  History,
  ShieldAlert,
  Send,
  Sparkles,
  Lock
} from 'lucide-react';
import {
  RadiologyReport,
  ImagingStudy,
  RadiologistWorklistItem
} from '../../types/radiologyOps';

interface RadiologyReportComposerModalProps {
  study: ImagingStudy;
  worklistItem?: RadiologistWorklistItem;
  existingReport?: RadiologyReport;
  onSaveReport: (report: RadiologyReport, isFinal: boolean) => void;
  onTriggerCriticalFinding: (report: RadiologyReport) => void;
  onClose: () => void;
}

export const RadiologyReportComposerModal: React.FC<RadiologyReportComposerModalProps> = ({
  study,
  worklistItem,
  existingReport,
  onSaveReport,
  onTriggerCriticalFinding,
  onClose
}) => {
  const [clinicalIndication, setClinicalIndication] = useState(
    existingReport?.clinicalIndication || worklistItem?.clinicalIndication || 'اشتباه سكتة دماغية حادة - فحص أولي قبل العلاج'
  );
  const [comparisonContext, setComparisonContext] = useState(
    existingReport?.comparisonStudyContext || 'تمت المقارنة مع الفحص المقطعي السابق للمخ المؤرخ في 2025-11-20.'
  );
  const [technique, setTechnique] = useState(
    existingReport?.techniqueNarrative ||
      'تم إجراء فحص مقطعي حلزوني محوري متعدد المقاطع للرأس والمخ بدون حقن صبغة وريدية بسماكة مقاطع 5 مم ومقاطع دقيقة 1.25 مم وفق بروتوكول السكتة الدماغية القياسي.'
  );
  const [findings, setFindings] = useState(
    existingReport?.findingsNarrative ||
      `1. النسيج الدماغي والمخيخي:
- لا يوجد أي دليل على نزيف حاد داخل القحف (No Acute Intracranial Hemorrhage).
- فقدان طفيف في التمايز بين المادة البيضاء والرمادية في القشرة الجزيرية اليسرى (Early Insular Ribbon Sign).
- مؤشر ASPECTS يقدر بـ 8 من 10 في نطاق الشريان المخي الأوسط الأيسر (Left MCA territory).
- لا يوجد انحراف في خط المنتصف أو ضغط كتلي (No Midline Shift).

2. الجهاز البطيني وقاعدة الجمجمة:
- البطينات في موقع وحجم طبيعيين دون استسقاء دماغي.
- التراكيب العظمية للجمجمة سليمة وخالية من الكسور.`
  );
  const [impression, setImpression] = useState(
    existingReport?.impressionNarrative ||
      `1. لا يوجد نزيف حاد داخل المخ (No Hemorrhage) - المريض مؤهل لبروتوكول إذابة الجلطة سريرياً.
2. علامات مبكرة جداً لنقص تروية حاد في نطاق الشريان المخي الأوسط الأيسر بمؤشر ASPECTS = 8.`
  );
  const [recommendations, setRecommendations] = useState(
    existingReport?.recommendations ||
      'إجراء قسطرة شرايين المخ المقطعية العاجلة (CTA Brain & Neck) لاستكمال تقييم الانسداد الشرياني الكبير، ومتابعة بروتوكول مذيب الجلطات بالطوارئ فورياً.'
  );
  const [criticalFindingAlert, setCriticalFindingAlert] = useState(
    existingReport?.criticalFindingAlert ?? true
  );
  const [isDictating, setIsDictating] = useState(false);

  // Template Quick Loader
  const handleLoadTemplate = (type: 'stroke' | 'normal_cxr' | 'normal_brain') => {
    if (type === 'normal_cxr') {
      setTechnique('صورة شعاعية رقمية مفردة للصدر بوضعية أمامية خلفية بجهاز الأشعة الرقمي.');
      setFindings('الرئتان متمددتان بشكل سليم وخاليتان من الارتشاحات الحادة أو التكثفات. الظل القلبي الوعائي في الحدود الطبيعية. الحجاب الحاجز والزاويتان الضلعيتان الحجابيتان حادتان وسليمتان. الهيكل العظمي الصدري سليم.');
      setImpression('فحص الصدر الشعاعي طبيعي وسليم (Normal Chest Radiograph). لا يوجد احتقان أو ارتشاح رئوي.');
      setRecommendations('');
      setCriticalFindingAlert(false);
    } else if (type === 'normal_brain') {
      setTechnique('فحص رنين مغناطيسي للمخ متعدد المتتاليات (T1, T2, FLAIR, DWI/ADC) بدون حقن صبغة.');
      setFindings('كثافة وإشارة النسيج الدماغي ضمن الحدود الطبيعية المتوافقة مع العمر. لا توجد بؤر تقييد انتشار حادة (No acute diffusion restriction). البطينات في موقعها الطبيعي.');
      setImpression('فحص رنين مغناطيسي للمخ طبيعي وسليم (Unremarkable MRI Brain).');
      setRecommendations('');
      setCriticalFindingAlert(false);
    }
  };

  const handleSimulateDictation = () => {
    setIsDictating(true);
    setTimeout(() => {
      setFindings(prev => prev + '\n- ملاحظة إملائية مضافة عبر الميكروفون: الشرايين القاعدية خالية من التكلسات الكثيفة المشوهة.');
      setIsDictating(false);
    }, 1200);
  };

  const handleSave = (isFinal: boolean) => {
    const report: RadiologyReport = {
      id: existingReport?.id || `RAD-REP-2026-${Math.floor(500 + Math.random() * 500)}`,
      studyId: study.id,
      accessionNumber: study.accessionNumber,
      requestId: study.requestId,
      patientId: study.patientId,
      patientName: study.patientName,
      mrn: study.mrn,
      modality: study.modality,
      examTitleAr: study.studyDescriptionAr,
      examTitleEn: study.studyDescriptionEn,
      clinicalIndication,
      comparisonStudyContext: comparisonContext,
      techniqueNarrative: technique,
      findingsNarrative: findings,
      impressionNarrative: impression,
      recommendations: recommendations.trim() || undefined,
      hasSignificantRecommendation: recommendations.trim().length > 0,
      criticalFindingAlert,
      reportStatus: isFinal ? 'final' : 'preliminary',
      signedBy: 'د. طلال السعيد',
      signedRole: 'استشاري الأشعة التشخيصية',
      signedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      preliminarySignedBy: 'د. طلال السعيد',
      preliminarySignedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      versionNumber: existingReport ? existingReport.versionNumber + 1 : 1,
      addenda: existingReport?.addenda || [],
      orderingClinicianReviewed: false
    };

    onSaveReport(report, isFinal);

    if (criticalFindingAlert && isFinal) {
      onTriggerCriticalFinding(report);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span>محرر تقارير الأشعة التشخيصية (Radiology Report Composer)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-teal-500/20 text-teal-300">
                  {study.modality}
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                {study.patientName} • MRN: {study.mrn} • رقم الوصول: {study.accessionNumber}
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

        {/* Action / Template Strip */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold">نماذج سريعة (Templates):</span>
            <button
              onClick={() => handleLoadTemplate('normal_cxr')}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-teal-50 hover:text-teal-700 text-slate-700 font-medium transition-colors cursor-pointer"
            >
              صدر طبيعي (Normal CXR)
            </button>
            <button
              onClick={() => handleLoadTemplate('normal_brain')}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-teal-50 hover:text-teal-700 text-slate-700 font-medium transition-colors cursor-pointer"
            >
              مخ طبيعي (Normal Brain)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSimulateDictation}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 text-xs cursor-pointer ${
                isDictating
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{isDictating ? 'جاري الاستماع للتحويل الصوتي...' : 'إملاء صوتي (Mock Dictation)'}</span>
            </button>
          </div>
        </div>

        {/* Structured Report Form */}
        <div className="p-5 space-y-4 max-h-[62vh] overflow-y-auto text-xs">
          {/* Section 1: Clinical Indication & Priors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">المؤشر السريري وسياق الطلب (Indication):</label>
              <input
                type="text"
                value={clinicalIndication}
                onChange={e => setClinicalIndication(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">فحوصات المقارنة السابقة (Comparison):</label>
              <input
                type="text"
                value={comparisonContext}
                onChange={e => setComparisonContext(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 font-medium"
              />
            </div>
          </div>

          {/* Section 2: Technique Narrative */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">تقنية الفحص الشعاعي (Technique):</label>
            <textarea
              rows={2}
              value={technique}
              onChange={e => setTechnique(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-teal-500"
            />
          </div>

          {/* Section 3: Detailed Findings */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">الموجودات الشعاعية التفصيلية (Findings Narrative):</label>
            <textarea
              rows={6}
              value={findings}
              onChange={e => setFindings(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-teal-500 font-sans leading-relaxed"
            />
          </div>

          {/* Section 4: Impression Narrative */}
          <div className="space-y-1">
            <label className="font-bold text-slate-900 block text-xs">
              الخلاصة والتشخيص النهائي (Impression Narrative):
            </label>
            <textarea
              rows={3}
              value={impression}
              onChange={e => setImpression(e.target.value)}
              className="w-full p-2.5 rounded-xl border-2 border-teal-600/60 bg-teal-50/20 text-xs text-slate-900 font-semibold focus:outline-hidden focus:border-teal-600 leading-relaxed"
            />
          </div>

          {/* Section 5: Recommendations */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">
              التوصيات ومتابعة الفحوصات (Recommendations):
            </label>
            <input
              type="text"
              value={recommendations}
              onChange={e => setRecommendations(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-teal-500"
            />
          </div>

          {/* Critical Finding Alert Checkbox */}
          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/60 flex items-start gap-3">
            <input
              type="checkbox"
              id="critCheck"
              checked={criticalFindingAlert}
              onChange={e => setCriticalFindingAlert(e.target.checked)}
              className="w-4 h-4 text-rose-600 rounded border-rose-300 mt-0.5"
            />
            <label htmlFor="critCheck" className="text-xs text-rose-950 cursor-pointer">
              <strong className="block font-bold">
                تنبيه نتيجة حرجة / تتطلب إجراءً عاجلاً (Critical / Urgent Finding Alert)
              </strong>
              <span className="text-[11px] text-rose-800 leading-relaxed block mt-0.5">
                تفعيل هذا الخيار سيفتح نافذة إخطار وتوثيق التواصل مع الطبيب المعالج والتحقق بالقراءة المتبادلة (Read-back verification) وفق سياسة المستشفى.
              </span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            إلغاء والعودة
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave(false)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>اعتماد تقرير مبدئي (Preliminary)</span>
            </button>

            <button
              onClick={() => handleSave(true)}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>توقيع واعتماد التقرير النهائي (Sign & Release)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
