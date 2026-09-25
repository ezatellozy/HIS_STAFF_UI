import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  ShieldAlert,
  Droplet,
  User,
  CheckCircle2,
  Clock,
  FlaskConical,
  FileCheck,
  Check,
  Activity,
  Radio,
  FileText
} from 'lucide-react';
import {
  BloodProductUnit,
  EmergencyReleasePolicyOption,
  EmergencyReleasePolicyProfile
} from '../../types/bloodBankOps';

interface EmergencyReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableEmergencyUnits: BloodProductUnit[];
  onConfirmEmergencyRelease: (
    details: {
      patientIdentifier: string;
      clinicalJustification: string;
      authorizingConsultant: string;
      preReleaseSampleDrawn: boolean;
      selectedUnitIds: string[];
      destinationLocation: string;
      policyOption: EmergencyReleasePolicyOption;
      initiateRetrospectiveTesting: boolean;
    }
  ) => void;
}

export const EmergencyReleaseModal: React.FC<EmergencyReleaseModalProps> = ({
  isOpen,
  onClose,
  availableEmergencyUnits,
  onConfirmEmergencyRelease
}) => {
  if (!isOpen) return null;

  const [patientIdentifier, setPatientIdentifier] = useState('مجهول الهوية #12 (مصاب حادث سيارة) - MRN-99103');
  const [destinationLocation, setDestinationLocation] = useState('طوارئ الحوادث ER - غرفة الإنعاش Resus-1');
  const [clinicalJustification, setClinicalJustification] = useState('صدمة نزفية غير مستقرة وهبوط حاد بالضغط - نزيف داخلي مهدد للحياة يستوجب إعطاء دم فوري قبل اكتمال التطابق');
  const [authorizingConsultant, setAuthorizingConsultant] = useState('د. فيصل الشمري (استشاري طب الطوارئ والحوادث)');
  const [preReleaseSampleDrawn, setPreReleaseSampleDrawn] = useState(true);
  const [policyOption, setPolicyOption] = useState<EmergencyReleasePolicyOption>('o_negative_universal');
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>(
    availableEmergencyUnits.slice(0, 2).map(u => u.id)
  );

  const POLICY_PROFILES: EmergencyReleasePolicyProfile[] = [
    {
      id: 'o_negative_universal',
      nameAr: 'وحدات O سالب عامة (Universal O-Negative)',
      nameEn: 'O-Negative Universal Protocol',
      descriptionAr: 'البروتوكول المعياري الأول لجميع المصابين مجهولي الهوية والإناث في سن الإنجاب.',
      clinicalCriteriaAr: 'إلزامي للإناث دون سن 50 ولجميع المرضى في حال عدم ثبوت جنس المريض أو فصيلته.',
      requiresConsultantSignoff: true
    },
    {
      id: 'o_positive_conserved_protocol',
      nameAr: 'وحدات O موجب مرشدة (Conserved O-Positive)',
      nameEn: 'O-Positive Resource Conservation',
      descriptionAr: 'بروتوكول ترشيد مخزون O-سالب، مخصص للذكور البالغين والإناث بعد سن الإنجاب.',
      clinicalCriteriaAr: 'مسموح للذكور البالغين لتقليل استنزاف الاحتياطي الحرج من O سالب عند الكوارث.',
      requiresConsultantSignoff: true
    },
    {
      id: 'type_specific_uncrossmatched',
      nameAr: 'فصيلة مطابقة دون انتظار التوافق (Type-Specific Uncrossmatched)',
      nameEn: 'Type-Specific Uncrossmatched',
      descriptionAr: 'صرف وحدات متطابقة الفصيلة ABO/Rh إذا سبق توثيق فصيلتين مستقلتين للمريض.',
      clinicalCriteriaAr: 'يتطلب عينة سريعة مؤكدة الفصيلة أو وجود سجل فصيلة تاريخي موثق مرتين.',
      requiresConsultantSignoff: true
    }
  ];

  const toggleUnit = (id: string) => {
    if (selectedUnitIds.includes(id)) {
      setSelectedUnitIds(selectedUnitIds.filter(uId => uId !== id));
    } else {
      setSelectedUnitIds([...selectedUnitIds, id]);
    }
  };

  const handleConfirm = () => {
    if (selectedUnitIds.length === 0) return;
    onConfirmEmergencyRelease({
      patientIdentifier,
      clinicalJustification,
      authorizingConsultant,
      preReleaseSampleDrawn,
      selectedUnitIds,
      destinationLocation,
      policyOption,
      initiateRetrospectiveTesting: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-rose-900 text-white px-6 py-4 flex items-center justify-between border-b border-rose-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-700/60 text-white border border-rose-500/50">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">صرف طارئ لمشتقات الدم غير المتوافقة مسبقاً (Emergency Uncrossmatched Release)</h3>
              <p className="text-xs text-rose-200 mt-0.5">
                إجراء استثنائي للحالات المهددة للحياة مع إلزامية الفحص الرجعي المتوازي (GAP-02)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-rose-300 hover:text-white hover:bg-rose-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Policy Warning Banner */}
          <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>إشعار سياسة السلامة والمخاطر السريرية (AABB Standards):</span>
            </div>
            <p className="text-[11px] leading-relaxed text-rose-800">
              يتم إصدار وحدات الدم قبل إتمام فحص التوافق المصلي بناءً على تفويض الاستشاري المعالج. يلتزم بنك الدم نظامياً بالبدء الفوري في الفحص الرجعي المتوازي (Retrospective Crossmatch)، وإطلاق إنذار طارئ للفريق الطبي المعالج فوراً في حال اكتشاف أي عدم توافق مصلي.
            </p>
          </div>

          {/* Emergency Release Policy Profile Selection */}
          <div className="space-y-2">
            <label className="block text-slate-800 font-bold">
              سياسة الصرف الطارئ المعتمدة (Emergency Policy Profile):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {POLICY_PROFILES.map(prof => {
                const isSelected = policyOption === prof.id;
                return (
                  <div
                    key={prof.id}
                    onClick={() => setPolicyOption(prof.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all text-right space-y-1 ${
                      isSelected
                        ? 'border-rose-600 bg-rose-50/70 shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{prof.nameAr}</span>
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-rose-600 bg-rose-600' : 'border-slate-300'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-600 leading-tight">{prof.descriptionAr}</p>
                    <div className="text-[9px] text-rose-800 font-medium pt-1 border-t border-slate-200/60">
                      {prof.clinicalCriteriaAr}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                المريض / المعرف الطارئ المؤقت (GAP-06: Emergency Patient ID):
              </label>
              <input
                type="text"
                value={patientIdentifier}
                onChange={e => setPatientIdentifier(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">الموقع الإسعافي المستلم:</label>
              <input
                type="text"
                value={destinationLocation}
                onChange={e => setDestinationLocation(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">المبرر السريري وتبرير الصرف الفوري:</label>
            <textarea
              rows={2}
              value={clinicalJustification}
              onChange={e => setClinicalJustification(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">الطبيب الاستشاري المفوض والمصادق:</label>
            <input
              type="text"
              value={authorizingConsultant}
              onChange={e => setAuthorizingConsultant(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Mandatory Pre-release sample & Retrospective Testing Linkage (GAP-02) */}
          <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-amber-700 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 block text-xs">
                    تم سحب عينة دم قبل بدء الصرف (Pre-transfusion Sample Drawn):
                  </span>
                  <span className="text-[11px] text-slate-600">
                    شرط نظامي إلزامي لإدراج الحالة في طابور الفحص الرجعي المتوازي (GAP-02)
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preReleaseSampleDrawn}
                onChange={e => setPreReleaseSampleDrawn(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
              />
            </div>

            <div className="p-2.5 bg-white/80 rounded-lg border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                تأكيد الصرف سيقوم تلقائياً بإنشاء مهمة <strong className="font-mono">Retrospective Compatibility Task</strong> في سجل الفحوصات بانتظار استكمال النتيجة وإبلاغ الطوارئ.
              </span>
            </div>
          </div>

          {/* Emergency Units Selection */}
          <div className="space-y-2">
            <span className="font-bold text-slate-900 text-xs block">
              الوحدات المتاحة للصرف الفوري:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {availableEmergencyUnits.map(unit => {
                const isSelected = selectedUnitIds.includes(unit.id);
                return (
                  <div
                    key={unit.id}
                    onClick={() => toggleUnit(unit.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-rose-600 bg-rose-50/60'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-mono font-bold text-slate-900 text-xs">{unit.unitNumber}</div>
                      <div className="text-[11px] text-red-700 font-bold mt-0.5">
                        فصيلة: {unit.bloodGroup.displayAr} ({unit.volumeMl} mL)
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{unit.storageLocation}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                      isSelected ? 'bg-rose-600 border-rose-600 text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            سيتم توثيق هذا الإفراج كـ "Emergency Uncrossmatched Release" مع تتبع الفحص الرجعي.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              إلغاء
            </button>
            <button
              disabled={selectedUnitIds.length === 0 || !preReleaseSampleDrawn}
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تأكيد الصرف الطارئ وبدء الفحص الرجعي ({selectedUnitIds.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
