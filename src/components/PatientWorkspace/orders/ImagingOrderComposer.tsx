import React, { useState, useEffect } from 'react';
import { Camera, AlertTriangle, ShieldCheck, Clock, Check, Info, ShieldAlert, Cpu } from 'lucide-react';
import { Patient } from '../../../types/his';
import {
  OrderPriority,
  ClinicalOrderItem,
  ImagingOrderDetails,
  CDSSMockAlert
} from '../../../types/clinicalOrdersRequests';
import { IMAGING_CATALOG, ImagingCatalogItem } from '../../../data/mockOrdersRequestsData';
import { SharedOrderShell } from './SharedOrderShell';
import { useHis } from '../../../context/HisContext';
import { ClinicalActionDialog } from '../common/ClinicalActionDialog';

interface RequiredSafetyCheck {
  id: string;
  type:
    | 'pregnancy_screening'
    | 'renal_assessment'
    | 'contrast_allergy'
    | 'mri_safety'
    | 'implant_device_screening'
    | 'sedation_prep';
  titleAr: string;
  titleEn: string;
  badge: string;
  descriptionAr: string;
  isMandatory: boolean;
}

interface ImagingOrderComposerProps {
  patient: Patient;
  onClose: () => void;
  onSaveOrder: (newOrder: ClinicalOrderItem) => void;
}

export const ImagingOrderComposer: React.FC<ImagingOrderComposerProps> = ({
  patient,
  onClose,
  onSaveOrder
}) => {
  const { currentStaff, playChime } = useHis();

  const [priority, setPriority] = useState<OrderPriority>('urgent');
  const [clinicalIndication, setClinicalIndication] = useState('ألم صدري حاد - استبعاد توسع المنصف واحتشاء الرئة');

  // Selected Study & Protocol
  const [selectedImagingId, setSelectedImagingId] = useState<string>(IMAGING_CATALOG[0].id);
  const selectedStudy = IMAGING_CATALOG.find(s => s.id === selectedImagingId) || IMAGING_CATALOG[0];
  const [selectedProtocolId, setSelectedProtocolId] = useState<string>('default');

  // Specific imaging fields
  const [modality, setModality] = useState(selectedStudy.modality);
  const [bodyRegion, setBodyRegion] = useState(selectedStudy.bodyRegion);
  const [laterality, setLaterality] = useState<'left' | 'right' | 'bilateral' | 'not_applicable'>('not_applicable');
  const [contrastType, setContrastType] = useState(selectedStudy.defaultContrast);
  const [clinicalQuestion, setClinicalQuestion] = useState('Evaluate for pulmonary congestion, cardiomegaly, or pneumothorax.');

  // Generic Safety Confirmation States
  const [pregnancyChecked, setPregnancyChecked] = useState(false);
  const [mriZoneCleared, setMriZoneCleared] = useState(false);
  const [implantScreenCleared, setImplantScreenCleared] = useState(false);
  const [sedationPrepConfirmed, setSedationPrepConfirmed] = useState(false);

  // Generic Transport Requirements Profile
  const [transportMode, setTransportMode] = useState<'walk' | 'wheelchair' | 'stretcher_with_monitor'>('wheelchair');

  // CDSS Alerts
  const [alerts, setAlerts] = useState<CDSSMockAlert[]>([]);
  const [safetyDialog, setSafetyDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  // =============================================================
  // GENERIC IMAGING SAFETY EVALUATION (Context / Policy Driven)
  // Selected Catalog Item + Modality + Protocol + Contrast + Patient Context + Configured Policy
  // =============================================================
  const evaluateSafetyChecks = (): RequiredSafetyCheck[] => {
    const checks: RequiredSafetyCheck[] = [];
    const cfg = selectedStudy.safetyPolicyConfig || {};

    // 1. Pregnancy status/screening: Driven by configured policy & patient clinical context
    // (Never bound to ionizing radiation only, nor hardcoded sex/age heuristic in global core)
    const policyRequiresPregnancy =
      Boolean(cfg.requiresPregnancyScreening) ||
      Boolean(selectedStudy.requiresPregnancyScreen);

    if (policyRequiresPregnancy) {
      checks.push({
        id: 'check-pregnancy',
        type: 'pregnancy_screening',
        titleAr: 'التحقق من حالة وسياق الحمل (Pregnancy Status / Screening Verification)',
        titleEn: 'Clinical Pregnancy Status Screening',
        badge: 'سياسة الأمان السريري المعتمدة',
        descriptionAr: 'التحقق من حالة وسياق الحمل واستبعاد موانع الفحص السريري أو توثيق سلبية الفحص المخبري (Beta-hCG) وفق سياسة الأمان المعتمدة.',
        isMandatory: true
      });
    }

    // 2. Renal function assessment: Evaluated when contrast is active or required by policy
    // (Applicable to any contrast agent/type - not restricted to iodinated only)
    const isContrastActive =
      contrastType === 'iv_contrast' ||
      contrastType === 'oral_and_iv' ||
      Boolean(cfg.requiresRenalAssessment) ||
      Boolean(selectedStudy.requiresRenalSafetyCheck);

    if (isContrastActive) {
      checks.push({
        id: 'check-renal',
        type: 'renal_assessment',
        titleAr: 'تقييم وظائف الكلى لوسائط التباين والصبغات (Renal Function / eGFR Assessment)',
        titleEn: 'Contrast Clearance / Renal Risk Assessment',
        badge: 'سياسة وسائط التباين المعتمدة',
        descriptionAr: 'قراءة الكرياتينين ومعدل الترشيح الكبيبي الحالية: eGFR = 72 mL/min/1.73m² (ضمن النطاق الآمن لإعطاء وسائط التباين وفق السياسة السريرية).',
        isMandatory: true
      });

      // 3. Contrast reaction / allergy context
      checks.push({
        id: 'check-contrast-allergy',
        type: 'contrast_allergy',
        titleAr: 'سوابق التحسس لوسائط التباين (Contrast Reaction / Allergy Context)',
        titleEn: 'Contrast Adverse Reaction History',
        badge: 'فحص التحسس الدوائي والصبغي',
        descriptionAr: 'التحقق من خلو الملف السريري للمريض من سوابق التحسس المفرط لمركبات التباين ومضادات الاستطباب.',
        isMandatory: false
      });
    }

    // 4. MRI Safety (Zone IV Clearance)
    if (modality === 'MRI' || cfg.requiresMriSafetyZoneClearance) {
      checks.push({
        id: 'check-mri-safety',
        type: 'mri_safety',
        titleAr: 'فحص أمان بيئة الرنين المغناطيسي (MRI Zone IV Safety Clearance)',
        titleEn: 'MRI Environmental Safety Checklist',
        badge: 'إلزامي لمجال 1.5T / 3.0T',
        descriptionAr: 'إزالة كاملة للأجسام الممغنطة الخارجية والتأكد من توافق الملابس والمعدات مع بيئة الرنين المغناطيسي.',
        isMandatory: true
      });
    }

    // 5. Implant / Medical Device Screening
    if (modality === 'MRI' || cfg.requiresImplantDeviceScreening) {
      checks.push({
        id: 'check-implant-device',
        type: 'implant_device_screening',
        titleAr: 'استقصاء الأجهزة الطبية والمزروعات (Implant & Device Safety Screening)',
        titleEn: 'Implanted Device Screening',
        badge: 'سلامة الأجهزة المزروعة',
        descriptionAr: 'التحقق من عدم وجود منظم ضربات قلب غير متوافق، أو مشابك أوعية معدنية قديمة أو شظايا مغناطيسية.',
        isMandatory: true
      });
    }

    // 6. Sedation & Preparation
    if (cfg.requiresSedationPrep) {
      checks.push({
        id: 'check-sedation',
        type: 'sedation_prep',
        titleAr: 'اشتراطات الصيام والتهدئة (Sedation & NPO Preparation)',
        titleEn: 'Sedation / Fasting Guidelines',
        badge: 'تحضير تخدير سريري',
        descriptionAr: 'تأكيد ساعات الصيام الموصى بها وموافقة طبيب التخدير عند الحاجة للتهدئة الوريدية أثناء الفحص.',
        isMandatory: true
      });
    }

    // 7. Other Configured Policy Requirements
    if (cfg.otherSafetyRequirements && cfg.otherSafetyRequirements.length > 0) {
      cfg.otherSafetyRequirements.forEach((reqText, idx) => {
        checks.push({
          id: `check-other-${idx}`,
          type: 'sedation_prep',
          titleAr: `اشتراط أمان سريري إضافي: ${reqText}`,
          titleEn: `Configured Safety Rule #${idx + 1}`,
          badge: 'متطلب سياسة محدد',
          descriptionAr: reqText,
          isMandatory: true
        });
      });
    }

    return checks;
  };

  const requiredSafetyChecks = evaluateSafetyChecks();

  useEffect(() => {
    setModality(selectedStudy.modality);
    setBodyRegion(selectedStudy.bodyRegion);
    setContrastType(selectedStudy.defaultContrast);
    setSelectedProtocolId('default');

    const newAlerts: CDSSMockAlert[] = [];
    const isContrastActive =
      selectedStudy.defaultContrast === 'iv_contrast' ||
      selectedStudy.defaultContrast === 'oral_and_iv' ||
      Boolean(selectedStudy.safetyPolicyConfig?.requiresRenalAssessment);

    if (isContrastActive) {
      newAlerts.push({
        id: 'cdss-contrast-nephro',
        type: 'renal_hepatic_concern',
        severity: 'informational',
        titleAr: 'التحقق من سلامة الكلى للصبغة الوريدية (eGFR Clearance Check)',
        titleEn: 'Contrast Nephropathy Risk Verification',
        messageAr: 'قراءة الكرياتينين الحديثة للمريض (eGFR: 72 mL/min) آمنة وتسمح بإعطاء الصبغة الوريدية بأمان وفق سياسة الفحص.',
        messageEn: 'eGFR > 60 mL/min - safe for iodinated contrast administration.',
        canOverride: true,
        isOverridden: true,
        overrideReason: 'وظائف الكلى مستقرة ومفحوصة حديثاً'
      });
    }

    if (selectedStudy.modality === 'MRI' || selectedStudy.safetyPolicyConfig?.requiresMriSafetyZoneClearance) {
      newAlerts.push({
        id: 'cdss-mri-safety',
        type: 'contraindication',
        severity: 'informational',
        titleAr: 'بروتوكول أمان الرنين المغناطيسي Zone IV (MRI Safety Protocol)',
        titleEn: 'MRI Zone IV Protocol Active',
        messageAr: 'يجب استكمال فحص أمان الرنين وخلو المريض من المعادن والأجهزة غير المتوافقة قبل الدخول للمجال المغناطيسي.',
        messageEn: 'Complete MRI safety checklist prior to Zone IV entry.',
        canOverride: true,
        isOverridden: true,
        overrideReason: 'تم تطبيق بروتوكول الأمان'
      });
    }

    setAlerts(newAlerts);
  }, [selectedImagingId]);

  const handleSubmit = () => {
    // Validate mandatory checks if applicable
    const pregCheck = requiredSafetyChecks.find(c => c.type === 'pregnancy_screening');
    if (pregCheck && !pregnancyChecked) {
      setSafetyDialog({
        isOpen: true,
        title: 'متطلب أمان سريري: التحقق من حالة وموانع الحمل',
        message: 'تتطلب سياسة الأمان السريري المعتمدة لهذا الإجراء الإشعاعي/التشخيصي تأكيد التحقق من حالة الحمل وموانعه قبل إرسال الأمر.'
      });
      return;
    }

    const mriCheck = requiredSafetyChecks.find(c => c.type === 'mri_safety');
    if (mriCheck && !mriZoneCleared) {
      setSafetyDialog({
        isOpen: true,
        title: 'متطلب أمان الرنين المغناطيسي: خلو المعادن (MRI Zone IV)',
        message: 'يتطلب بروتوكول الرنين المغناطيسي تأكيد خلو المريض ومرافقيه من المعادن والأجسام الممغنطة (MRI Zone IV Clearance) لسلامة المريض.'
      });
      return;
    }

    const implantCheck = requiredSafetyChecks.find(c => c.type === 'implant_device_screening');
    if (implantCheck && !implantScreenCleared) {
      setSafetyDialog({
        isOpen: true,
        title: 'متطلب أمان الرنين المغناطيسي: فحص الأجهزة الطبية المزروعة',
        message: 'يتطلب بروتوكول الرنين المغناطيسي فحص واعتماد توافق الأجهزة الطبية المزروعة أو الشرائح (Implant & Device Screening).'
      });
      return;
    }

    const imagingDetails: ImagingOrderDetails = {
      catalogId: selectedStudy.id,
      studyNameAr: selectedStudy.studyNameAr,
      studyNameEn: selectedStudy.studyNameEn,
      modality,
      bodyRegion,
      laterality,
      contrastType,
      clinicalQuestion,
      pregnancyCheckRequired: Boolean(pregCheck),
      pregnancyStatusConfirmed: pregCheck ? (pregnancyChecked ? 'negative' : 'not_applicable') : undefined,
      renalSafetyChecked: Boolean(requiredSafetyChecks.find(c => c.type === 'renal_assessment')),
      transportMode
    };

    const newOrder: ClinicalOrderItem = {
      id: `ORD-IMG-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: patient.id,
      encounterId: 'ENC-2026-ER-091',
      encounterLocation: 'قسم الطوارئ والحالات الحرجة',
      category: 'imaging',
      orderTitleAr: `${selectedStudy.studyNameAr} (${modality})`,
      orderTitleEn: `${selectedStudy.studyNameEn} [${selectedStudy.id}]`,
      priority,
      clinicalIndication,
      orderedBy: {
        id: currentStaff.id,
        name: currentStaff.name,
        role: currentStaff.title || 'طبيب معالج',
        specialty: currentStaff.department || 'الطب السريري'
      },
      orderedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      status: 'active',
      statusHistory: [
        {
          status: 'active',
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          changedBy: currentStaff.name,
          reason: 'تم طلب الفحص الإشعاعي وفق البروتوكول وسياسة الأمان'
        }
      ],
      imagingDetails,
      resultPipelineStage: 'ordered',
      cdssAlerts: alerts
    };

    onSaveOrder(newOrder);
    playChime('chime');
    onClose();
  };

  return (
    <SharedOrderShell
      titleAr="محرر طلبات الأشعة والتصوير التشخيصي (Diagnostic Imaging Composer)"
      titleEn="Order Diagnostic Imaging / Modality Request"
      icon={<Camera className="w-5 h-5 text-purple-600" />}
      patient={patient}
      priority={priority}
      onPriorityChange={setPriority}
      clinicalIndication={clinicalIndication}
      onClinicalIndicationChange={setClinicalIndication}
      onClose={onClose}
      onSubmit={handleSubmit}
      alerts={alerts}
    >
      <div className="space-y-4 text-xs">
        
        {/* Study Selector from Catalog */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-bold text-slate-800">
              اختر الفحص من دليل التصوير الطبي (Catalog Studies): *
            </label>
            <span className="text-[11px] text-purple-700 font-mono">
              Generic Context-Driven Model
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {IMAGING_CATALOG.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedImagingId(item.id)}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                  selectedImagingId === item.id
                    ? 'border-purple-600 bg-purple-50/80 ring-2 ring-purple-400/30'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-bold text-slate-900 text-xs">{item.studyNameAr}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                    {item.modality}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 flex items-center justify-between w-full">
                  <span className="font-mono">{item.id}</span>
                  <span className="text-slate-600">{item.bodyRegion}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200">
          
          {/* Contrast Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">استخدام الصبغة (Contrast Protocol): *</label>
            <select
              value={contrastType}
              onChange={e => setContrastType(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
            >
              <option value="none">بدون صبغة (Non-contrast)</option>
              <option value="iv_contrast">صبغة وريدية (IV Contrast)</option>
              <option value="oral_only">صبغة بالفم (Oral Contrast)</option>
              <option value="oral_and_iv">صبغة مزدوجة (Oral & IV)</option>
            </select>
          </div>

          {/* Laterality */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">الجهة والجانب (Laterality):</label>
            <select
              value={laterality}
              onChange={e => setLaterality(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
            >
              <option value="not_applicable">غير محدد / فحص مركزي (Central)</option>
              <option value="bilateral">الجهتان معاً (Bilateral)</option>
              <option value="right">الجانب الأيمن (Right)</option>
              <option value="left">الجانب الأيسر (Left)</option>
            </select>
          </div>

          {/* Transport Requirements Profile */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">ملف متطلبات النقل السريري: *</label>
            <select
              value={transportMode}
              onChange={e => setTransportMode(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
            >
              <option value="wheelchair">نقل بكرسي متحرك ومرافق (Wheelchair)</option>
              <option value="stretcher_with_monitor">نقالة مجهزة بمونيتور مراقبة وممرض (Stretcher with Monitor)</option>
              <option value="walk">المريض قادر على المشي ذاتياً (Ambulatory)</option>
            </select>
          </div>
        </div>

        {/* Protocol Specific Option if Available */}
        {selectedStudy.protocolOptions && selectedStudy.protocolOptions.length > 0 && (
          <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-200">
            <label className="block font-bold text-purple-900 mb-1.5">
              خيارات البروتوكول السريري المتقدم المتاح للفحص (Specialized Protocol Options):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedStudy.protocolOptions.map(proto => (
                <button
                  key={proto.id}
                  type="button"
                  onClick={() => {
                    setSelectedProtocolId(proto.id);
                    setContrastType(proto.defaultContrast);
                  }}
                  className={`p-2.5 rounded-lg border text-right cursor-pointer transition-all ${
                    selectedProtocolId === proto.id
                      ? 'bg-white border-purple-600 font-bold text-purple-900 shadow-xs ring-1 ring-purple-400'
                      : 'bg-purple-100/40 border-purple-200 text-slate-700 hover:bg-white'
                  }`}
                >
                  <div className="text-xs">{proto.nameAr}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{proto.nameEn}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Clinical Question for Radiologist */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            السؤال السريري المحدد لطبيب الأشعة (Specific Clinical Question for Radiologist): *
          </label>
          <textarea
            rows={2}
            required
            value={clinicalQuestion}
            onChange={e => setClinicalQuestion(e.target.value)}
            placeholder="ما السؤال السريري المحدد الذي ترغب في أن يجيب عليه تقرير الأشعة؟"
            className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 leading-relaxed"
          />
        </div>

        {/* ============================================================= */}
        {/* CONTEXT & POLICY DRIVEN IMAGING SAFETY PANEL */}
        {/* Shows ONLY fields required for the specific item & context */}
        {/* ============================================================= */}
        {requiredSafetyChecks.length === 0 ? (
          <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <strong>بروتوكول قياسي آمن:</strong> الفحص المحدد ({selectedStudy.studyNameAr} - {modality}) لا يتطلب اشتراطات أمان إشعاعي إضافية أو صبغة وريدية أو مسح رنين مغناطيسي وفق السياسة السريرية المعتمدة.
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>اشتراطات الأمان السريري الموجهة بالسياق (Context & Policy-Driven Safety Checks):</span>
              </div>
              <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold font-mono">
                {requiredSafetyChecks.length} متطلبات مفعلة بالسياسة
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Check 1: Pregnancy Screening Field (ONLY rendered if in requiredSafetyChecks) */}
              {requiredSafetyChecks.some(c => c.type === 'pregnancy_screening') && (
                <div className="p-2.5 bg-white rounded-lg border border-amber-200 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="preg-check-box"
                    checked={pregnancyChecked}
                    onChange={e => setPregnancyChecked(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 mt-0.5 cursor-pointer"
                  />
                  <div className="flex-1">
                    <label htmlFor="preg-check-box" className="font-bold text-slate-900 text-xs cursor-pointer block">
                      تأكيد حالة وسياق الحمل وفق السياسة السريرية المعتمدة (Pregnancy Status / Screening) *
                    </label>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      تم التحقق من حالة الحمل أو سلبية الفحص المخبري (Beta-hCG) الحديث للمريض واستبعاد موانع الإجراء وفق السياسة المعتمدة.
                    </p>
                  </div>
                </div>
              )}

              {/* Check 2: Renal Assessment Field (ONLY rendered if in requiredSafetyChecks) */}
              {requiredSafetyChecks.some(c => c.type === 'renal_assessment') && (
                <div className="p-2.5 bg-white rounded-lg border border-blue-200 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">
                        تقييم وظائف الكلى لوسائط التباين والصبغات (Renal Function / eGFR Assessment)
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">
                        eGFR: 72 mL/min (آمن)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      معدل الترشيح الكبيبي للمريض أعلى من 45 mL/min، متوافق مع إرشادات الأمان لإعطاء وسائط التباين المعتمدة سريرياً.
                    </p>
                  </div>
                </div>
              )}

              {/* Check 3: Contrast Allergy Screening Field (ONLY rendered if in requiredSafetyChecks) */}
              {requiredSafetyChecks.some(c => c.type === 'contrast_allergy') && (
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold text-slate-900 text-xs">
                      سوابق التحسس لوسائط التباين والصبغات (Contrast Reaction / Allergy Context)
                    </span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      تمت مراجعة سجل التحسس السريري للمريض: لا توجد حساسية موثقة لمركبات التباين أو الصبغات الوريدية.
                    </p>
                  </div>
                </div>
              )}

              {/* Check 4: MRI Environmental Zone IV Clearance (ONLY rendered if in requiredSafetyChecks) */}
              {requiredSafetyChecks.some(c => c.type === 'mri_safety') && (
                <div className="p-2.5 bg-white rounded-lg border border-purple-200 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="mri-zone-box"
                    checked={mriZoneCleared}
                    onChange={e => setMriZoneCleared(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 mt-0.5 cursor-pointer"
                  />
                  <div className="flex-1">
                    <label htmlFor="mri-zone-box" className="font-bold text-purple-950 text-xs cursor-pointer block">
                      إقرار أمان غرفة الرنين المغناطيسي Zone IV (MRI Safety Clearance) *
                    </label>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      تم التأكد من نزع كافة المتعلقات والمواد المغناطيسية والمعدات غير المتوافقة مع المجال المغناطيسي.
                    </p>
                  </div>
                </div>
              )}

              {/* Check 5: Implant & Device Screening (ONLY rendered if in requiredSafetyChecks) */}
              {requiredSafetyChecks.some(c => c.type === 'implant_device_screening') && (
                <div className="p-2.5 bg-white rounded-lg border border-purple-200 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="implant-box"
                    checked={implantScreenCleared}
                    onChange={e => setImplantScreenCleared(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 mt-0.5 cursor-pointer"
                  />
                  <div className="flex-1">
                    <label htmlFor="implant-box" className="font-bold text-purple-950 text-xs cursor-pointer block">
                      استقصاء الأجهزة الطبية المزروعة (Implanted Devices Screening) *
                    </label>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      تم التحقق من عدم وجود منظم ضربات قلب غير متوافق (Non-MR Conditional Pacemaker)، أو قواقع أذن أو مشابك أم دم غير آمنة.
                    </p>
                  </div>
                </div>
              )}

              {/* Check 6: Sedation & Preparation (ONLY rendered if in requiredSafetyChecks) */}
              {requiredSafetyChecks.some(c => c.type === 'sedation_prep') && (
                <div className="p-2.5 bg-white rounded-lg border border-amber-200 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="sedation-box"
                    checked={sedationPrepConfirmed}
                    onChange={e => setSedationPrepConfirmed(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 mt-0.5 cursor-pointer"
                  />
                  <div className="flex-1">
                    <label htmlFor="sedation-box" className="font-bold text-amber-950 text-xs cursor-pointer block">
                      تأكيد اشتراطات الصيام والتهدئة التخديرية (Sedation / Fasting Requirements) *
                    </label>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      تم التأكد من التزام المريض بساعات الصيام وتنسيق التخدير عند الحاجة.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ClinicalActionDialog
        isOpen={safetyDialog.isOpen}
        onClose={() => setSafetyDialog(prev => ({ ...prev, isOpen: false }))}
        title={safetyDialog.title}
        message={safetyDialog.message}
        severity="warning"
      />
    </SharedOrderShell>
  );
};
