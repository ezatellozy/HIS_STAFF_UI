import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Send,
  FileCheck,
  UserCheck
} from 'lucide-react';
import { Patient } from '../../../types/his';
import { useHis } from '../../../context/HisContext';
import { ClinicalNoteRecord } from '../../../types/clinicalNotesDocumentation';
import { ClinicalActionDialog } from '../common/ClinicalActionDialog';

interface DocumentationFormsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onSaveNote: (note: ClinicalNoteRecord) => void;
  initialForm?: 'admission' | 'consent' | 'discharge';
}

export const DocumentationFormsModal: React.FC<DocumentationFormsModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSaveNote,
  initialForm = 'admission'
}) => {
  const { currentStaff, playChime } = useHis();

  const [activeFormType, setActiveFormType] = useState<'admission' | 'consent' | 'discharge'>(initialForm);

  // Admission assessment state
  const [admissionChiefReason, setAdmissionChiefReason] = useState(
    'ألم حاد بالصدر متوافق مع متلازمة الشريان التاجي الحادة (Acute Coronary Syndrome) يستدعي تنويماً ورعاية حرجة.'
  );
  const [admissionPhysicalFindings, setAdmissionPhysicalFindings] = useState(
    'الوعي كامل (GCS 15). فحص القلب والأوعية: أصوات القلب واضحة ومنتظمة بدون لغط، فحص الصدر خالي من الأصوات المضافة، البطن لينة، النبض الطرفي متناظر.'
  );
  const [admissionInitialPlan, setAdmissionInitialPlan] = useState(
    '1. قبول المريض في وحدة الرعاية الإكليلية (CCU).\n2. بروتوكول متلازمة الشريان التاجي ومضادات التخثر.\n3. جدولة قسطرة شرايين قلبية تداخلية عاجلة.'
  );

  // Consent form state
  const [consentProcedureName, setConsentProcedureName] = useState(
    'قسطرة الشرايين التاجية التداخلية ورأب الأوعية وتركيب دعامات دوائية (Coronary Angiography & PCI)'
  );
  const [consentRisksExplained, setConsentRisksExplained] = useState(
    'تم شرح المخاطر المحتملة ومنها: النزف في موضع المدخل الشرياني، حساسية صبغة التباين، اضطرابات نظم القلب، والمضاعفات النادرة. كما تم شرح فوائد الإجراء وبدائله.'
  );
  const [consentWitnessName, setWitnessName] = useState('أ. سمير الأحمدي (مرافق المريض / ابنه)');

  // Discharge summary state
  const [dischargeSummaryCourse, setDischargeSummaryCourse] = useState(
    'تم قبول المريض بحالة ألم صدري حاد، أُجريت له قسطرة قلبية ناجحة مع تركيب دعامة دوائية للشريان الأمامي النازل (LAD). استقرت المؤشرات الحيوية وزال الألم تماماً والإنزيمات في تراجع.'
  );
  const [dischargeMedicationsPlan, setDischargeMedicationsPlan] = useState(
    '1. أسبرين 100 مجم يومياً.\n2. تيكاجريلور 90 مجم مرتين يومياً (لمدة 12 شهراً).\n3. أتورفاستاتين 80 مجم مساءً.\n4. بيسوبرولول 2.5 مجم يومياً.'
  );
  const [dischargeFollowupDate, setDischargeFollowupDate] = useState('خلال 7 أيام في عيادة أمراض القلب التخصصية');

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  if (!isOpen) return null;

  const handleSaveFormAsNote = () => {
    const timestamp = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    let createdNote: ClinicalNoteRecord;

    if (activeFormType === 'admission') {
      createdNote = {
        id: `NOTE-ADM-${Date.now()}`,
        patientId: patient.id,
        encounterId: 'ENC-2026-ER-091',
        encounterType: 'emergency',
        category: 'admission_note',
        templateId: 'tpl-admission-comprehensive',
        structureType: 'admission',
        titleAr: 'نموذج تقييم الدخول والتنويم الشامل',
        titleEn: 'Adult Inpatient Admission Assessment Form',
        content: `[سبب التنويم والشكوى الرئيسية]:\n${admissionChiefReason}\n\n[المشاهدات والفحص عند الدخول]:\n${admissionPhysicalFindings}\n\n[خطة الرعاية والتنويم]:\n${admissionInitialPlan}`,
        state: 'final_signed',
        author: {
          id: currentStaff.id,
          name: currentStaff.name,
          role: currentStaff.title || 'طبيب سريري معالج',
          roleLabelAr: currentStaff.title || 'طبيب معالج',
          specialty: currentStaff.department || 'الطب الباطني',
          department: currentStaff.department || 'قسم الباطنية والقلب'
        },
        createdAt: timestamp,
        documentedAt: timestamp,
        signedAt: timestamp,
        signedBy: `${currentStaff.name} (${currentStaff.licenseNo || '2026-REG-991'})`,
        coSignRequirement: 'none',
        version: 1,
        versionHistory: [],
        addenda: [],
        tags: ['Admission Assessment', 'Documentation Form', 'Signed']
      };
    } else if (activeFormType === 'consent') {
      createdNote = {
        id: `NOTE-CONSENT-${Date.now()}`,
        patientId: patient.id,
        encounterId: 'ENC-2026-ER-091',
        encounterType: 'emergency',
        category: 'clinical_form',
        templateId: 'tpl-informed-consent',
        structureType: 'operative',
        titleAr: 'إقرار وتفويض الإجراء الطبي المستنير (Informed Consent)',
        titleEn: 'Procedural & Surgical Informed Consent Record',
        content: `[الإجراء الطبي المعني]:\n${consentProcedureName}\n\n[شرح المخاطر والمنافع والبدائل]:\n${consentRisksExplained}\n\n[إقرار المريض والشاهد]:\nأقر المريض (${patient.fullNameAr || patient.name}) بأنه فهم كافة تفاصيل الإجراء ومخاطره ووافق طواعية.\nالشاهد / الممثل القانوني: ${consentWitnessName}\nالموثق المعتمد: ${currentStaff.name}`,
        state: 'final_signed',
        author: {
          id: currentStaff.id,
          name: currentStaff.name,
          role: currentStaff.title || 'طبيب سريري معالج',
          roleLabelAr: currentStaff.title || 'طبيب معالج',
          specialty: currentStaff.department || 'أمراض القلب',
          department: currentStaff.department || 'قسم القلب والقسطرة'
        },
        createdAt: timestamp,
        documentedAt: timestamp,
        signedAt: timestamp,
        signedBy: `${currentStaff.name} (${currentStaff.licenseNo || '2026-REG-991'})`,
        coSignRequirement: 'none',
        version: 1,
        versionHistory: [],
        addenda: [],
        tags: ['Informed Consent', 'Legal/Clinical Form', 'Signed']
      };
    } else {
      createdNote = {
        id: `NOTE-DISCH-${Date.now()}`,
        patientId: patient.id,
        encounterId: 'ENC-2026-ER-091',
        encounterType: 'emergency',
        category: 'discharge_summary',
        templateId: 'tpl-discharge-summary-formal',
        structureType: 'discharge',
        titleAr: 'تقرير ملخص الخروج الطبي المعتمد (Discharge Summary)',
        titleEn: 'Inpatient Clinical Discharge Summary',
        content: `[مسار الحالة أثناء التنويم]:\n${dischargeSummaryCourse}\n\n[خطة الأدوية المعتمدة بعد الخروج]:\n${dischargeMedicationsPlan}\n\n[مواعيد المتابعة والإنذار المبكر]:\n${dischargeFollowupDate}`,
        state: 'final_signed',
        author: {
          id: currentStaff.id,
          name: currentStaff.name,
          role: currentStaff.title || 'طبيب سريري معالج',
          roleLabelAr: currentStaff.title || 'طبيب معالج',
          specialty: currentStaff.department || 'الطب الباطني',
          department: currentStaff.department || 'قسم الباطنية'
        },
        createdAt: timestamp,
        documentedAt: timestamp,
        signedAt: timestamp,
        signedBy: `${currentStaff.name} (${currentStaff.licenseNo || '2026-REG-991'})`,
        coSignRequirement: 'none',
        version: 1,
        versionHistory: [],
        addenda: [],
        tags: ['Discharge Summary', 'Documentation Form', 'Signed']
      };
    }

    onSaveNote(createdNote);
    playChime('success');
    setConfirmDialog({
      isOpen: true,
      title: 'اعتماد وتوثيق النموذج السريري',
      message: `تم اعتماد ${createdNote.titleAr} بنجاح وإدراجه رسمياً في سجل الوثائق والملاحظات السريرية (Axis 5) للمريض (${patient.fullNameAr || patient.name}).`
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-xs">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">
                النماذج السريرية المعتمدة للتوثيق (Documentation Forms)
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                نماذج التوثيق الرسمية المعيارية المدمجة في المحور الخامس (Axis 5 — Notes & Documentation)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Patient Context & Form Tab Selector */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveFormType('admission')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeFormType === 'admission'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>تقييم الدخول والتنويم (Admission Form)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFormType('consent')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeFormType === 'consent'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>إقرار وتفويض الإجراء (Informed Consent)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFormType('discharge')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeFormType === 'discharge'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>ملخص الخروج الطبي (Discharge Summary)</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            المريض: <strong className="text-slate-800">{patient.fullNameAr}</strong> ({patient.mrn})
          </div>
        </div>

        {/* Form Body (Scrollable) */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Smart Provenance Badge */}
          <div className="bg-teal-50 border border-teal-200 p-2.5 rounded-xl flex items-center justify-between text-[11px] text-teal-900">
            <div className="flex items-center gap-1.5 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>تكامل التوثيق السريري الرسمي مع ملف المريض وسجلات الاعتماد (CBAHI / JCI)</span>
            </div>
            <span className="font-semibold">الموثق: {currentStaff.name} ({currentStaff.title})</span>
          </div>

          {/* 1. Admission Assessment Form */}
          {activeFormType === 'admission' && (
            <div className="space-y-3.5">
              <h4 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2">
                التقييم الشامل لدخول التنويم (Adult Inpatient Admission Form)
              </h4>

              <div>
                <label className="block font-bold text-slate-700 mb-1">سبب التنويم والشكوى الرئيسية:</label>
                <textarea
                  rows={3}
                  value={admissionChiefReason}
                  onChange={e => setAdmissionChiefReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المشاهدات والفحص السريري الأولي:</label>
                <textarea
                  rows={3}
                  value={admissionPhysicalFindings}
                  onChange={e => setAdmissionPhysicalFindings(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">خطة التنويم المبدئية والرعاية:</label>
                <textarea
                  rows={3}
                  value={admissionInitialPlan}
                  onChange={e => setAdmissionInitialPlan(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                />
              </div>
            </div>
          )}

          {/* 2. Informed Consent Form */}
          {activeFormType === 'consent' && (
            <div className="space-y-3.5">
              <h4 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2">
                إقرار وتفويض التدخل الجراحي / التداخلي (Informed Procedural Consent)
              </h4>

              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الإجراء الطبي / الجراحي المشروح:</label>
                <input
                  type="text"
                  value={consentProcedureName}
                  onChange={e => setConsentProcedureName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تفاصيل المخاطر والمنافع والبدائل المشروحة:</label>
                <textarea
                  rows={3}
                  value={consentRisksExplained}
                  onChange={e => setConsentRisksExplained(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الشاهد أو المرافق / الممثل القانوني:</label>
                <input
                  type="text"
                  value={consentWitnessName}
                  onChange={e => setWitnessName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-[11px] leading-relaxed">
                أقر أنا المريض المذكور أعلاه (أو ولي أمري القانوني) بأن الطبيب المعالج قد أوضح لي باللغة المناسبة طبيعة الإجراء المقترح ومخاطره المحتملة والبدائل المتاحة، وقد أتيحت لي الفرصة الكاملة لطرح الأسئلة وتمت الإجابة عليها باستفاضة، وأوافق طواعية على إجراء هذا التدخل الطبي.
              </div>
            </div>
          )}

          {/* 3. Discharge Summary Form */}
          {activeFormType === 'discharge' && (
            <div className="space-y-3.5">
              <h4 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2">
                تقرير وملخص الخروج الطبي المعتمد (Inpatient Discharge Summary)
              </h4>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المسار السريري والتدخلات أثناء التنويم:</label>
                <textarea
                  rows={3}
                  value={dischargeSummaryCourse}
                  onChange={e => setDischargeSummaryCourse(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">خطة الأدوية والتوصيات بعد الخروج:</label>
                <textarea
                  rows={3}
                  value={dischargeMedicationsPlan}
                  onChange={e => setDischargeMedicationsPlan(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">موعد المراجعة والعيادة الخارجية:</label>
                <input
                  type="text"
                  value={dischargeFollowupDate}
                  onChange={e => setDischargeFollowupDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 font-bold rounded-xl transition-colors cursor-pointer"
          >
            إلغاء وإغلاق
          </button>

          <button
            type="button"
            onClick={handleSaveFormAsNote}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>اعتماد وتوثيق النموذج في السجل السريري</span>
          </button>
        </div>
      </div>

      <ClinicalActionDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          onClose();
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        severity="info"
      />
    </div>
  );
};
