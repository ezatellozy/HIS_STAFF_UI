import React, { useState, useEffect } from 'react';
import {
  X,
  Flame,
  Droplet,
  CheckCircle2,
  Clock,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Info,
  Layers,
  FileCheck,
  Ban,
  Split,
  BookOpen,
  UserCheck,
  Globe
} from 'lucide-react';
import {
  BloodProductUnit,
  ProductProcessingMethod,
  ProcessingLifecycleStatus,
  ExpiryVerificationStatus,
  SpecialProductAttribute,
  ProductProcessingRecord
} from '../../types/bloodBankOps';

export interface ProcessingSourceProfile {
  id: string;
  nameAr: string;
  nameEn: string;
  jurisdictionAr: string;
  jurisdictionTag: 'US_FDA_AABB' | 'UK_JPAC' | 'INSTITUTIONAL_SOP';
  citation: string;
  suggestedExpiry: string;
  descriptionAr: string;
}

export const SOURCE_PROFILES_BY_METHOD: Record<ProductProcessingMethod, ProcessingSourceProfile[]> = {
  thawing: [
    {
      id: 'uk_jpac_acute',
      nameAr: 'المملكة المتحدة UK / JPAC 7.5.1 (عوامل غير مستقرة - نزيف حاد)',
      nameEn: 'UK JPAC Section 7.5.1 v8 (Labile factors / Acute coagulopathy)',
      jurisdictionAr: 'المملكة المتحدة UK JPAC',
      jurisdictionTag: 'UK_JPAC',
      citation: 'UK JPAC Red Book Section 7.5.1 v8 (Acute coagulopathy / labile factors: 24h at 2-6°C or 4h at 20-24°C; not to refreeze)',
      suggestedExpiry: 'خلال 24 ساعة عند 2-6°C (أو 4 ساعات بدرجة 20-24°C)',
      descriptionAr: 'مخصص لنزيف الطوارئ واعتلال التخثر الحاد. JPAC لا تفرض 24 ساعة كقاعدة شاملة لكافة الاستطبابات بل تحدد الصلاحية وفق نوع المشتق ومستوى عوامل التخثر، ويُحظر إعادة التجميد.'
    },
    {
      id: 'us_fda_extended',
      nameAr: 'الولايات المتحدة US FDA / AABB (بلازما مذابة ممتدة الصلاحية - Thawed Plasma)',
      nameEn: 'US FDA 21 CFR 606.122 / AABB (Extended Thawed Plasma)',
      jurisdictionAr: 'الولايات المتحدة US FDA / AABB',
      jurisdictionTag: 'US_FDA_AABB',
      citation: 'US FDA 21 CFR 606.122 / AABB Standards (Extended Thawed Plasma: up to 5 days / 120h at 1-6°C for stable clotting factors)',
      suggestedExpiry: 'حتى 5 أيام (120 ساعة) عند 1-6°C',
      descriptionAr: 'معيار مخصص لتعويض عوامل التخثر المستقرة؛ ولا يُنصح باستخدامه لنقص العاملين الخامس والثامن الحاد.'
    },
    {
      id: 'institutional_ffp_sop',
      nameAr: 'بروتوكول بنك دم المستشفى الداخلي المعتمد (Institutional Validated SOP)',
      nameEn: 'Hospital Blood Bank Validated Policy',
      jurisdictionAr: 'سياسة المستشفى Institutional',
      jurisdictionTag: 'INSTITUTIONAL_SOP',
      citation: 'Hospital Blood Bank SOP-THAW-FFP-04 (Institutional Validated Policy: 6-24h post-thaw)',
      suggestedExpiry: 'خلال 6-24 ساعة حسب أمر الطبيب والعملية الجراحية',
      descriptionAr: 'سياسة المستشفى المعتمدة لعمليات القلب المفتوح وزراعة الأعضاء والنزيف الجراحي الحاد.'
    }
  ],
  irradiation: [
    {
      id: 'us_fda_28d',
      nameAr: 'الولايات المتحدة US FDA / AABB (معيار الـ 28 يوماً - 28-Day Rule)',
      nameEn: 'US FDA 21 CFR 606.122 / AABB Standards 35th Ed',
      jurisdictionAr: 'الولايات المتحدة US FDA / AABB',
      jurisdictionTag: 'US_FDA_AABB',
      citation: 'US FDA 21 CFR 606.122 / AABB Standards 35th Ed (28 days max post-irradiation or original expiry, whichever is sooner)',
      suggestedExpiry: '28 يوماً من تاريخ التشعيع أو تاريخ الصلاحية الأصلي أيهما أقرب',
      descriptionAr: 'معيار US FDA / AABB الأمريكي للوقاية من داء الطعم ضد المضيف المرتبط بنقل الدم (TA-GVHD).'
    },
    {
      id: 'uk_jpac_14d',
      nameAr: 'المملكة المتحدة UK / JPAC 7.1.2.4 & 7.3 (معيار الـ 14 يوماً البريطاني)',
      nameEn: 'UK JPAC Red Book Section 7.1.2.4 & 7.3 (14-day rule)',
      jurisdictionAr: 'المملكة المتحدة UK JPAC',
      jurisdictionTag: 'UK_JPAC',
      citation: 'UK JPAC Red Book Section 7.1.2.4 & 7.3 (Irradiate up to day 14; max 14 days post-irradiation; 24h for IUT/exchange)',
      suggestedExpiry: '14 يوماً من تاريخ التشعيع (أو 24 ساعة لنقل الدم الجنيني والوليدي)',
      descriptionAr: 'معيار JPAC البريطاني: يُسمح بالتشعيع حتى اليوم 14 من الجمع، وتُحفظ لمدة أقصاها 14 يوماً من التشعيع؛ وللأجنة والولدان خلال 24 ساعة.'
    },
    {
      id: 'institutional_rad_sop',
      nameAr: 'بروتوكول المعجل الإشعاعي بالمستشفى (Radiation Oncology SOP)',
      nameEn: 'Hospital Radiation Oncology SOP (25-50 Gy)',
      jurisdictionAr: 'سياسة المستشفى Institutional',
      jurisdictionTag: 'INSTITUTIONAL_SOP',
      citation: 'Hospital SOP-IRRAD-25GY (Dual verification of Rad-Sure radiation indicator; 25-50 Gy)',
      suggestedExpiry: 'وفق التاريخ المعتمد مع تحقق ملصق Rad-Sure',
      descriptionAr: 'جرعة مشعة محددة (25-50 Gy) مع توثيق التحقق اللوني الفيزيائي لشريط Rad-Sure.'
    }
  ],
  washing: [
    {
      id: 'open_system_24h',
      nameAr: 'نظام غسيل مفتوح / طرد مركزي يدوي (Open System Wash)',
      nameEn: 'Open System Manual Centrifugation (AABB / General)',
      jurisdictionAr: 'معيار النظام المفتوح AABB / General',
      jurisdictionTag: 'US_FDA_AABB',
      citation: 'AABB Standards / Hospital SOP-WASH-OPEN (Breached sterile barrier: expires 24h at 2-6°C)',
      suggestedExpiry: '24 ساعة كحد أقصى عند 2-6°C',
      descriptionAr: 'نظام يدوي مفتوح يكسر الحاجز المعقم؛ تنتهي صلاحيته خلال 24 ساعة ولا يُخزن طويلاً لتجنب النمو البكتيري.'
    },
    {
      id: 'closed_automated_sagm',
      nameAr: 'نظام غسيل آلي معقم مغلق مع محلول حافظ (Closed System with SAGM Additive)',
      nameEn: 'Closed Automated Processor with Additive Solution',
      jurisdictionAr: 'توصيف الجهاز المعتمد Validated Device SOP',
      jurisdictionTag: 'INSTITUTIONAL_SOP',
      citation: 'Validated Device SOP / Closed Automated Cell Processor with Additive Solution (SAGM: up to 7-14 days at 2-6°C)',
      suggestedExpiry: '7 إلى 14 يوماً عند 2-6°C وفق التحقق الفني للجهاز والمحلول',
      descriptionAr: 'غسيل آلي مغلق باستخدام وصلات معقمة ومحلول SAGM الحافظ يمنع التلوث الجرثومي دون الاقتصار على 24 ساعة.'
    },
    {
      id: 'iga_deficiency_urgent',
      nameAr: 'بروتوكول الحساسية المفرطة ونقص IgA (Anaphylaxis / Severe Allergy)',
      nameEn: 'Severe Allergy / Anti-IgA Clinical Protocol',
      jurisdictionAr: 'سياسة المستشفى السريرية Clinical SOP',
      jurisdictionTag: 'INSTITUTIONAL_SOP',
      citation: 'Clinical Transfusion Guideline (Wash with 1-2L saline; issue within 4-6 hours post-wash)',
      suggestedExpiry: 'خلال 4-6 ساعات بعد الغسيل والتأكد من إزالة بروتينات البلازما',
      descriptionAr: 'مخصص للمرضى ذوي الحساسية لبروتينات البلازما ونقص الغلوبولين المناعي IgA.'
    }
  ],
  cryo_pooling: [
    {
      id: 'uk_jpac_cryo_4h',
      nameAr: 'المملكة المتحدة UK / JPAC 7.5.4 v8 (مجمع 4 ساعات عند 20-24°C)',
      nameEn: 'UK JPAC Section 7.5.4 v8 (4h at 20-24°C)',
      jurisdictionAr: 'المملكة المتحدة UK JPAC',
      jurisdictionTag: 'UK_JPAC',
      citation: 'UK JPAC Red Book Section 7.5.4 v8 (Pooled Cryoprecipitate: 4h at 20-24°C post-thaw)',
      suggestedExpiry: '4 ساعات من وقت الإذابة والدمج عند 20-24°C',
      descriptionAr: 'يُحفظ في درجة حرارة الغرفة (20-24°C) ويُحظر وضعه في الثلاجة لتجنب ترسب الفيبرينوجين ثانية.'
    },
    {
      id: 'us_aabb_cryo_6h',
      nameAr: 'الولايات المتحدة US AABB Standards (مجمع مغلق 6 ساعات)',
      nameEn: 'US AABB Standards 35th Ed (6h at 20-24°C)',
      jurisdictionAr: 'الولايات المتحدة US AABB',
      jurisdictionTag: 'US_FDA_AABB',
      citation: 'US AABB Standards 35th Ed (Sterile pooled cryoprecipitate: 6 hours at 20-24°C)',
      suggestedExpiry: '6 ساعات من وقت الإذابة والدمج عند 20-24°C',
      descriptionAr: 'معيار AABB للمجمعات المجهزة باستخدام أجهزة الربط المعقم.'
    }
  ],
  pediatric_splitting: [
    {
      id: 'closed_docking_tscd',
      nameAr: 'ربط أنبوبي مغلق معقم TSCD-II (Closed System Docking)',
      nameEn: 'Sterile Tubing Welder (Closed System)',
      jurisdictionAr: 'نظام مغلق Closed Sterile System',
      jurisdictionTag: 'US_FDA_AABB',
      citation: 'AABB Standards 35th Ed / JPAC Section 7.3.1 (Sterile connection device maintains original unit expiry)',
      suggestedExpiry: 'تاريخ الصلاحية الأصلي للوحدة الأم دون إنقاص',
      descriptionAr: 'جهاز الربط المعقم يضمن سلامة الدائرة المغلقة بدون كسر التعقيم، محتفظاً بالصلاحية الكاملة.'
    },
    {
      id: 'open_docking_breach',
      nameAr: 'نظام مفتوح / تجزئة طارئة (Open System Aliquot)',
      nameEn: 'Open Aliquot System (Hospital Policy)',
      jurisdictionAr: 'سياسة المستشفى Institutional',
      jurisdictionTag: 'INSTITUTIONAL_SOP',
      citation: 'Hospital Open Aliquot Policy (Breached barrier: expires 24h at 2-6°C)',
      suggestedExpiry: '24 ساعة عند 2-6°C',
      descriptionAr: 'في حال استخدام إبرة نقل أو محقنة يدوية تفتح الدائرة المعقمة.'
    }
  ]
};

interface ProductPreparationModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: BloodProductUnit | null;
  allUnits?: BloodProductUnit[];
  onSavePreparation: (data: {
    sourceUnitId: string;
    method: ProductProcessingMethod;
    lifecycleStatus: ProcessingLifecycleStatus;
    responsibleActor: string;
    deviceIdentifier: string;
    resultingIdentity: string;
    resultingVolumeMl: number;
    expirySourceCitation: string;
    postModExpiryDate: string;
    expiryVerificationStatus: ExpiryVerificationStatus;
    quarantineReason?: string;
    childUnitsData?: Array<{ id: string; unitNumber: string; volumeMl: number; label: string }>;
    contributingUnitIds?: string[];
    poolIdentifier?: string;
    newAttributes: SpecialProductAttribute[];
  }) => void;
}

export const ProductPreparationModal: React.FC<ProductPreparationModalProps> = ({
  isOpen,
  onClose,
  unit,
  allUnits = [],
  onSavePreparation
}) => {
  if (!isOpen || !unit) return null;

  // Processing method selection
  const [selectedMethod, setSelectedMethod] = useState<ProductProcessingMethod>(() => {
    if (unit.componentType === 'cryoprecipitate') return 'cryo_pooling';
    if (unit.componentType === 'fresh_frozen_plasma') return 'thawing';
    if (unit.componentType === 'platelets_apheresis' || unit.componentType === 'platelets_pooled') return 'irradiation';
    return 'irradiation';
  });

  // Responsible actor and device
  const [responsibleActor, setResponsibleActor] = useState('أخصائي مختبر بدر العتيبي (فني معالجة المشتقات)');
  const [deviceIdentifier, setDeviceIdentifier] = useState('جهاز تشعيع الدم IRRAD-01 (جرعة 25 Gy معتمدة)');

  // Target lifecycle transition
  const [lifecycleStatus, setLifecycleStatus] = useState<ProcessingLifecycleStatus>('quality_verification_pending');

  // Expiry citation and post-mod expiry
  const initialProfiles = SOURCE_PROFILES_BY_METHOD[selectedMethod] || [];
  const [selectedProfileId, setSelectedProfileId] = useState<string>(initialProfiles[0]?.id || '');
  const [expiryCitation, setExpiryCitation] = useState(initialProfiles[0]?.citation || '');
  const [postModExpiryDate, setPostModExpiryDate] = useState(initialProfiles[0]?.suggestedExpiry || unit.expiryDate || '');
  const [expiryVerificationStatus, setExpiryVerificationStatus] = useState<ExpiryVerificationStatus>(
    unit.expiryDate ? 'pending_verification' : 'unverified_missing_date'
  );

  // Quarantine / rejection reason if flagged
  const [quarantineReason, setQuarantineReason] = useState('');

  // Pediatric splitting config
  const [splitCount, setSplitCount] = useState<number>(3);
  const [splitVolumePerAliquot, setSplitVolumePerAliquot] = useState<number>(70);

  // Pooling config
  const [contributingUnitIds, setContributingUnitIds] = useState<string[]>([
    unit.id,
    'DIN-CRYO-02',
    'DIN-CRYO-03',
    'DIN-CRYO-04',
    'DIN-CRYO-05'
  ]);
  const [poolIdentifier, setPoolIdentifier] = useState('POOL-CRYO-2026-081');

  // Update default citations, profile & device when method changes
  useEffect(() => {
    const profiles = SOURCE_PROFILES_BY_METHOD[selectedMethod] || [];
    const firstProf = profiles[0];
    if (firstProf) {
      setSelectedProfileId(firstProf.id);
      setExpiryCitation(firstProf.citation);
      setPostModExpiryDate(
        selectedMethod === 'pediatric_splitting' || selectedMethod === 'irradiation'
          ? (unit.expiryDate || firstProf.suggestedExpiry)
          : firstProf.suggestedExpiry
      );
    }

    if (selectedMethod === 'irradiation') {
      setDeviceIdentifier('جهاز تشعيع الدم IRRAD-01 (جرعة 25 Gy معتمدة)');
    } else if (selectedMethod === 'thawing') {
      setDeviceIdentifier('حمام إذابة البلازما المائي THAW-02 عند 37°C');
    } else if (selectedMethod === 'cryo_pooling') {
      setDeviceIdentifier('محطة دمج الراسب البرودي المعقمة POOL-ST-01');
    } else if (selectedMethod === 'washing') {
      setDeviceIdentifier('جهاز غسيل الكريات الآلي COBE 2991 مع محلول ملحي معقم');
    } else if (selectedMethod === 'pediatric_splitting') {
      setDeviceIdentifier('جهاز الربط الأنبوبي المعقم TSCD-II (Sterile Tubing Welder)');
    }
  }, [selectedMethod, unit]);

  const handleSelectProfile = (profileId: string) => {
    setSelectedProfileId(profileId);
    const profiles = SOURCE_PROFILES_BY_METHOD[selectedMethod] || [];
    const prof = profiles.find(p => p.id === profileId);
    if (prof) {
      setExpiryCitation(prof.citation);
      setPostModExpiryDate(
        (selectedMethod === 'pediatric_splitting' || selectedMethod === 'irradiation') && unit.expiryDate
          ? unit.expiryDate
          : prof.suggestedExpiry
      );
    }
  };

  const handleSubmit = () => {
    // Determine attributes
    const newAttributes: SpecialProductAttribute[] = [...unit.specialAttributes];
    if (selectedMethod === 'irradiation' && !newAttributes.includes('irradiated')) newAttributes.push('irradiated');
    if (selectedMethod === 'washing' && !newAttributes.includes('washed')) newAttributes.push('washed');
    if (selectedMethod === 'pediatric_splitting' && !newAttributes.includes('pediatric_split')) newAttributes.push('pediatric_split');
    if (selectedMethod === 'cryo_pooling' && !newAttributes.includes('pooled')) newAttributes.push('pooled');

    // Resulting identity
    let resultingIdentity = unit.componentNameAr;
    let resultingVolume = unit.volumeMl;

    let childUnitsData = undefined;
    if (selectedMethod === 'pediatric_splitting') {
      resultingIdentity = `${unit.componentNameAr} - مجزأة (${splitCount} حصص)`;
      resultingVolume = splitVolumePerAliquot;
      childUnitsData = Array.from({ length: splitCount }).map((_, idx) => ({
        id: `${unit.id}-P${idx + 1}`,
        unitNumber: `${unit.unitNumber} / P${idx + 1}`,
        volumeMl: splitVolumePerAliquot,
        label: `Aliquot P${idx + 1}`
      }));
    } else if (selectedMethod === 'cryo_pooling') {
      resultingIdentity = `راسب برودي مدمج (${contributingUnitIds.length} وحدات)`;
      resultingVolume = contributingUnitIds.length * 35;
    } else if (selectedMethod === 'thawing') {
      resultingIdentity = `${unit.componentNameAr} (مذابة - Thawed)`;
    } else if (selectedMethod === 'washing') {
      resultingIdentity = `${unit.componentNameAr} (مغسولة - Washed)`;
    } else if (selectedMethod === 'irradiation') {
      resultingIdentity = `${unit.componentNameAr} (مشععة - Irradiated)`;
    }

    onSavePreparation({
      sourceUnitId: unit.id,
      method: selectedMethod,
      lifecycleStatus,
      responsibleActor,
      deviceIdentifier,
      resultingIdentity,
      resultingVolumeMl: resultingVolume,
      expirySourceCitation: expiryCitation,
      postModExpiryDate,
      expiryVerificationStatus: lifecycleStatus === 'rejected_quarantined' ? 'discrepant' : expiryVerificationStatus,
      quarantineReason: lifecycleStatus === 'rejected_quarantined' ? quarantineReason : undefined,
      childUnitsData,
      contributingUnitIds: selectedMethod === 'cryo_pooling' ? contributingUnitIds : undefined,
      poolIdentifier: selectedMethod === 'cryo_pooling' ? poolIdentifier : undefined,
      newAttributes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">تجهيز ومعالجة مشتقات الدم (Component Processing & Modification)</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700/50">
                  إمكانية تشغيلية اختيارية لمعالجة المشتقات بالمستشفى
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                فصل المعالجة عن الصلاحية وإلزامية التحقق السريري دون اعتماد تلقائي للجاهزية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Source Unit Context & Missing Expiry Check */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            !unit.expiryDate || unit.expiryVerificationStatus === 'unverified_missing_date'
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900 text-xs">{unit.unitNumber}</span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white border border-slate-200 font-bold text-slate-700">
                  {unit.id}
                </span>
                <span className="text-xs font-bold text-slate-800">({unit.bloodGroup.displayAr})</span>
              </div>
              <div className="text-xs text-slate-700 font-medium">
                {unit.componentNameAr} • الحجم: {unit.volumeMl} mL • الموقع: {unit.storageLocation}
              </div>
              <div className="text-[11px] text-slate-600 flex items-center gap-2">
                <span>تاريخ الصلاحية الأصلي المعتمد:</span>
                {unit.expiryDate ? (
                  <strong className="font-mono text-slate-900">{unit.expiryDate}</strong>
                ) : (
                  <span className="font-bold text-rose-700 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    غير محدد (Missing Expiry - يحظر الصرف ويتطلب التحقق المخبري)
                  </span>
                )}
              </div>
            </div>

            <div className="text-left">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                unit.status === 'quarantined'
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-slate-200 text-slate-800 border-slate-300'
              }`}>
                الحالة الحالية: {unit.status}
              </span>
            </div>
          </div>

          {/* Quarantined Unit Warning */}
          {unit.status === 'quarantined' && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-950 space-y-1">
              <div className="font-bold text-xs flex items-center gap-1.5 text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>حظر أمان للحجر الصحي (Quarantine Restriction):</span>
              </div>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                هذه الوحدة محجورة حالياً لأسباب رقابية أو مخبرية. بدء المعالجة أو التجهيز لا يرفع قيد الحجر الصحي بأي شكل، وستظل الوحدة وجميع الحصص المشتقة منها في حالة <strong>حجر صحي (quarantined)</strong> دون إمكانية صرفها.
              </p>
            </div>
          )}

          {/* Warning Banner: Scope & Verification Constraint */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
            <div className="font-bold text-xs flex items-center gap-1.5 text-amber-950">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>ضوابط السلامة والتحقق من الصلاحية والمعالجة:</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              لا يتم تغيير حالة الوحدة تلقائياً إلى <strong>جاهز للصرف (Ready for Issue)</strong> أو <strong>متاح (Available)</strong>.
              المعالجة تُنشئ سجلاً توثيقياً لمسار المشتق، ويبقى المشتق خاضعاً لمصادقة ضبط الجودة والمطابقة السريرية قبل أي صرف.
            </p>
          </div>

          {/* Processing Method Selection */}
          <div className="space-y-2">
            <label className="font-bold text-slate-900 text-xs block">
              1. اختيار طريقة المعالجة السريرية (Processing Method):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedMethod('irradiation')}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                  selectedMethod === 'irradiation'
                    ? 'border-amber-600 bg-amber-50/60 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>تشعيع المشتق (Irradiation)</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                  تعطيل الخلايا اللمفاوية للوقاية من TA-GvHD لمرضى الأورام ونقص المناعة
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('thawing')}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                  selectedMethod === 'thawing'
                    ? 'border-amber-600 bg-amber-50/60 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-red-600" />
                  <span>إذابة البلازما (FFP Thawing)</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                  إذابة سريعة عند 37°C؛ الصلاحية 24 ساعة عند 2-6°C وفق JPAC 7.5.1
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('cryo_pooling')}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                  selectedMethod === 'cryo_pooling'
                    ? 'border-amber-600 bg-amber-50/60 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>دمج الراسب البرودي (Cryo Pooling)</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                  دمج 5 وحدات راسب معقم لتعويض الفيبرينوجين؛ صلاحية 4 ساعات بعد الإذابة
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('washing')}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                  selectedMethod === 'washing'
                    ? 'border-amber-600 bg-amber-50/60 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Droplet className="w-4 h-4 text-blue-600" />
                  <span>غسيل الكريات (Washing)</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                  إزالة بروتينات البلازما لمرضى الحساسية الشديدة ونقص IgA المفرط
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('pediatric_splitting')}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                  selectedMethod === 'pediatric_splitting'
                    ? 'border-amber-600 bg-amber-50/60 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Split className="w-4 h-4 text-purple-600" />
                  <span>تجزئة وحدات الأطفال (Splitting)</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                  ربط أنبوبي معقم مغلق إلى حصص صغيرة للأطفال والخُدج دون فتح النظام
                </p>
              </button>
            </div>
          </div>

          {/* Conditional Method-Specific Configuration */}
          {selectedMethod === 'pediatric_splitting' && (
            <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl space-y-3">
              <span className="font-bold text-purple-900 text-xs block">
                تكوين تجزئة وحدات الأطفال وتتبع الحصص الناتجة (Child Units Tracking):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">عدد الحصص المقسمة:</label>
                  <select
                    value={splitCount}
                    onChange={e => setSplitCount(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                  >
                    <option value={2}>حصتان (2 Aliquots)</option>
                    <option value={3}>3 حصص (3 Aliquots)</option>
                    <option value={4}>4 حصص (4 Aliquots)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الحجم لكل حصة (mL):</label>
                  <input
                    type="number"
                    value={splitVolumePerAliquot}
                    onChange={e => setSplitVolumePerAliquot(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                  />
                </div>
              </div>
              <div className="text-[11px] text-purple-800 bg-white p-2.5 rounded-lg border border-purple-200">
                <strong>معرفات الحصص الناتجة التابعة للوحدة الأم ({unit.id}):</strong>
                <div className="flex flex-wrap gap-2 mt-1 font-mono text-[10px]">
                  {Array.from({ length: splitCount }).map((_, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-300">
                      {unit.id}-P{i + 1} ({splitVolumePerAliquot} mL)
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedMethod === 'cryo_pooling' && (
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3">
              <span className="font-bold text-indigo-900 text-xs block">
                توثيق الوحدات المدمجة للراسب البرودي (Contributing Units & Pool ID):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">معرف المجمع الموحد (Pool Identifier):</label>
                  <input
                    type="text"
                    value={poolIdentifier}
                    onChange={e => setPoolIdentifier(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs font-mono font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الحجم الإجمالي المقدر للمجمع:</label>
                  <input
                    type="text"
                    readOnly
                    value={`${contributingUnitIds.length * 35} mL (من ${contributingUnitIds.length} وحدات)`}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold bg-slate-100 text-slate-700"
                  />
                </div>
              </div>
              <div className="text-[11px] text-indigo-800 bg-white p-2.5 rounded-lg border border-indigo-200">
                <strong>أرقام الوحدات المساهمة في الدمج:</strong>
                <div className="flex flex-wrap gap-2 mt-1 font-mono text-[10px]">
                  {contributingUnitIds.map((uid, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 border border-indigo-300">
                      #{idx + 1}: {uid}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actor & Device Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                الفني المسؤول عن المعالجة (Responsible Technologist):
              </label>
              <input
                type="text"
                value={responsibleActor}
                onChange={e => setResponsibleActor(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                الجهاز المعياري المستخدم (Device Identifier):
              </label>
              <input
                type="text"
                value={deviceIdentifier}
                onChange={e => setDeviceIdentifier(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Expiry After Modification & Standards Citation */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-slate-600" />
                <span>الصلاحية بعد المعالجة وتحديد الملف المعياري الرقابي (Regulatory Source Profile):</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Jurisdiction & Indication Specific</span>
            </div>

            {/* Selectable Source Profiles List */}
            <div className="space-y-1.5">
              <label className="block text-slate-700 font-bold text-[11px]">
                اختر الملف الرقابي المعتمد بحسب الاختصاص والاستطباب السريري:
              </label>
              <div className="grid grid-cols-1 gap-2">
                {(SOURCE_PROFILES_BY_METHOD[selectedMethod] || []).map(prof => (
                  <button
                    key={prof.id}
                    type="button"
                    onClick={() => handleSelectProfile(prof.id)}
                    className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      selectedProfileId === prof.id
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-2xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">{prof.nameAr}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          prof.jurisdictionTag === 'US_FDA_AABB'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : prof.jurisdictionTag === 'UK_JPAC'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {prof.jurisdictionAr}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">{prof.descriptionAr}</p>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-slate-900 bg-white/80 px-2 py-1 rounded border border-slate-200 shrink-0 self-start sm:self-center">
                      {prof.suggestedExpiry}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-700 font-bold text-[11px]">
                المرجع الرقابي وإصدار المعيار المعتمد (Regulatory Standard Citation):
              </label>
              <input
                type="text"
                value={expiryCitation}
                onChange={e => setExpiryCitation(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold text-[11px] mb-1">
                  تاريخ الصلاحية الجديد الموثق بعد التعديل:
                </label>
                <input
                  type="text"
                  value={postModExpiryDate}
                  onChange={e => setPostModExpiryDate(e.target.value)}
                  placeholder="مثال: 2026-09-21 10:30 ص"
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs font-bold bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-[11px] mb-1">
                  حالة التحقق من الصلاحية (Expiry Verification Status):
                </label>
                <select
                  value={expiryVerificationStatus}
                  onChange={e => setExpiryVerificationStatus(e.target.value as ExpiryVerificationStatus)}
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs font-bold bg-white text-slate-900"
                >
                  <option value="verified">موثق ومطابق للملصق (Verified)</option>
                  <option value="pending_verification">قيد التحقق المخبري (Pending Verification)</option>
                  <option value="unverified_missing_date">غير محدد / غياب تاريخ الصلاحية الأصلي (Unverified Missing)</option>
                  <option value="discrepant">تناقض في تاريخ الصلاحية / عزل فوري (Discrepant)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lifecycle Status Transition Selector */}
          <div className="space-y-2">
            <label className="font-bold text-slate-900 text-xs block">
              2. تحديد المرحلة الحالية لدورة المعالجة (Lifecycle Status Transition):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLifecycleStatus('processing_recorded')}
                className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                  lifecycleStatus === 'processing_recorded'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="text-xs">تسجيل المعالجة فقط</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Processing Recorded</div>
              </button>

              <button
                type="button"
                onClick={() => setLifecycleStatus('quality_verification_pending')}
                className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                  lifecycleStatus === 'quality_verification_pending'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="text-xs">بانتظار التحقق من الجودة</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Quality Verification Pending</div>
              </button>

              <button
                type="button"
                onClick={() => setLifecycleStatus('verified')}
                className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                  lifecycleStatus === 'verified'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="text-xs">تم التحقق والمصادقة</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Verified & Dual Sign-off</div>
              </button>

              <button
                type="button"
                onClick={() => setLifecycleStatus('rejected_quarantined')}
                className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer col-span-1 sm:col-span-3 ${
                  lifecycleStatus === 'rejected_quarantined'
                    ? 'border-rose-600 bg-rose-50 text-rose-900 font-bold shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="text-xs text-rose-700 flex items-center gap-1.5">
                  <Ban className="w-4 h-4" />
                  <span>رفض المشتق وحجره لوجود خلل أو تلف (Rejected / Quarantined)</span>
                </div>
                <div className="text-[10px] text-rose-600 mt-0.5">
                  عزل الوحدة فوراً في ثلاجة الحجر مع حظر الصرف وتوثيق السبب الرقابي
                </div>
              </button>
            </div>
          </div>

          {/* If Quarantined / Rejected */}
          {lifecycleStatus === 'rejected_quarantined' && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
              <label className="block font-bold text-rose-950 text-xs">
                سبب الرفض والعزل في ثلاجة الحجر (Quarantine Reason):
              </label>
              <textarea
                value={quarantineReason}
                onChange={e => setQuarantineReason(e.target.value)}
                placeholder="مثال: تسريب في خط اللحام المعقم، أو ارتفاع درجة الحرارة أثناء الإذابة فوق 37.5°C، أو عدم اكتمال جرعة التشعيع..."
                rows={2}
                className="w-full p-2 rounded-lg border border-rose-300 text-xs bg-white text-rose-950 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            {lifecycleStatus === 'verified' ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                المشتق سيصبح مؤهلاً للخطوات التالية، ولن يتم اعتباره جاهزاً للصرف تلقائياً.
              </span>
            ) : lifecycleStatus === 'rejected_quarantined' ? (
              <span className="text-rose-700 font-bold flex items-center gap-1">
                <Ban className="w-3.5 h-3.5" />
                سيتم عزل المشتق فوراً في منطقة الحجر وحظره نهائياً من الصرف.
              </span>
            ) : (
              <span>المشتق سيبقى قيد التحقق المخبري حتى استكمال المصادقة الثنائية.</span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleSubmit}
              className={`px-5 py-2 rounded-xl text-white font-bold text-xs transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer ${
                lifecycleStatus === 'rejected_quarantined'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>
                {lifecycleStatus === 'rejected_quarantined' ? 'تأكيد الرفض والحجر' : 'حفظ وتوثيق المعالجة'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
