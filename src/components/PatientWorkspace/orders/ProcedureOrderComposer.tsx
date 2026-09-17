import React, { useState } from 'react';
import { Stethoscope, ShieldCheck, AlertTriangle, Check, FileCheck } from 'lucide-react';
import { Patient } from '../../../types/his';
import {
  OrderPriority,
  ClinicalOrderItem,
  ProcedureOrderDetails,
  CDSSMockAlert
} from '../../../types/clinicalOrdersRequests';
import { PROCEDURE_CATALOG, ProcedureCatalogItem } from '../../../data/mockOrdersRequestsData';
import { SharedOrderShell } from './SharedOrderShell';
import { useHis } from '../../../context/HisContext';
import { ClinicalActionDialog } from '../common/ClinicalActionDialog';

interface ProcedureOrderComposerProps {
  patient: Patient;
  onClose: () => void;
  onSaveOrder: (newOrder: ClinicalOrderItem) => void;
}

export const ProcedureOrderComposer: React.FC<ProcedureOrderComposerProps> = ({
  patient,
  onClose,
  onSaveOrder
}) => {
  const { currentStaff, playChime } = useHis();

  const [priority, setPriority] = useState<OrderPriority>('urgent');
  const [clinicalIndication, setClinicalIndication] = useState('احتشاء حاد بعضلة القلب NSTEMI مع ارتفاع الإنزيمات');

  // Selected Procedure
  const [selectedProcId, setSelectedProcId] = useState<string>(PROCEDURE_CATALOG[0].id);
  const selectedProc = PROCEDURE_CATALOG.find(p => p.id === selectedProcId) || PROCEDURE_CATALOG[0];

  // Specific Procedure Fields
  const [anatomicalSite, setAnatomicalSite] = useState(selectedProc.site);
  const [sedationRequired, setSedationRequired] = useState(selectedProc.sedationType);
  const [consentVerified, setConsentVerified] = useState(false);
  const [npoVerified, setNpoVerified] = useState(true);
  const [bloodCrossmatched, setBloodCrossmatched] = useState(false);
  const [coagScreenChecked, setCoagScreenChecked] = useState(true);
  const [prerequisitesNote, setPrerequisitesNote] = useState('جاهزية طاقم التمريض ومستلزمات التعقيم السريري.');

  const handleProcChange = (procId: string) => {
    const p = PROCEDURE_CATALOG.find(item => item.id === procId);
    if (!p) return;
    setSelectedProcId(procId);
    setAnatomicalSite(p.site);
    setSedationRequired(p.sedationType);
    setConsentVerified(false);
    setNpoVerified(p.requirementsProfile.requiresNpo);
    setBloodCrossmatched(false);
    setCoagScreenChecked(p.requirementsProfile.requiresCoagulationScreen);
  };

  const [safetyDialog, setSafetyDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  const handleSubmit = () => {
    const profile = selectedProc.requirementsProfile;

    if (profile.requiresConsent && !consentVerified) {
      setSafetyDialog({
        isOpen: true,
        title: 'متطلب أمان سريري: الإقرار المستنير (Informed Consent)',
        message: 'يتطلب هذا الإجراء الجراحي/التداخلي تأكيد الحصول على الإقرار الطبي المستنير وتوقيعه قبل إرسال الأمر السريري.'
      });
      return;
    }

    if (profile.requiresNpo && !npoVerified) {
      setSafetyDialog({
        isOpen: true,
        title: 'متطلب أمان سريري: التحقق من صيام المريض (NPO)',
        message: `يرجى تأكيد حالة صيام المريض المطلوبة لهذا الإجراء (${profile.npoHoursRequired || 6} ساعات صيام NPO) لسلامة التخدير والعملية.`
      });
      return;
    }

    const procedureDetails: ProcedureOrderDetails = {
      catalogId: selectedProc.id,
      procedureNameAr: selectedProc.procedureNameAr,
      procedureNameEn: selectedProc.procedureNameEn,
      anatomicalSite,
      sedationType: sedationRequired,
      urgency: selectedProc.urgency,
      requirementsProfile: profile,
      prerequisitesMet: [
        profile.requiresConsent ? (consentVerified ? 'تم توقيع الإقرار المستنير' : 'الإقرار معلق') : 'لا يتطلب إقرار جراحي منفصل',
        profile.requiresNpo ? (npoVerified ? `صيام مؤكد (${profile.npoHoursRequired || 6} ساعات)` : 'صيام غير مكتمل') : 'صيام غير مطلوب',
        profile.requiresSedationOrAnesthesia ? `مستوى التخدير: ${sedationRequired}` : 'بدون تخدير',
        profile.requiresBloodCrossmatch ? (bloodCrossmatched ? 'تم حجز وحدات الدم' : 'انتظار مطابقة الدم') : undefined,
        prerequisitesNote
      ].filter(Boolean) as string[]
    };

    const newOrder: ClinicalOrderItem = {
      id: `ORD-PROC-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: patient.id,
      encounterId: 'ENC-2026-ER-091',
      encounterLocation: 'قسم الطوارئ والحالات الحرجة',
      category: 'procedure',
      orderTitleAr: `${selectedProc.procedureNameAr} (${anatomicalSite})`,
      orderTitleEn: `${selectedProc.procedureNameEn} [${selectedProc.id}]`,
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
          reason: 'تم إنشاء أمر الإجراء التداخلي'
        }
      ],
      procedureDetails,
      resultPipelineStage: 'ordered'
    };

    onSaveOrder(newOrder);
    playChime('success');
    onClose();
  };

  return (
    <SharedOrderShell
      patient={patient}
      titleAr="محرر أوامر الإجراءات التداخلية والسريرية (Clinical Procedure Composer)"
      titleEn="CPOE Interventional Procedure Composer"
      priority={priority}
      onPriorityChange={setPriority}
      clinicalIndication={clinicalIndication}
      onClinicalIndicationChange={setClinicalIndication}
      onCancel={onClose}
      onSubmit={handleSubmit}
      submitLabel="توقيع واعتماد أمر الإجراء (Sign Procedure Order)"
    >
      <div className="space-y-4 text-xs">
        
        {/* Procedure Selector */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <label className="block font-extrabold text-slate-900 text-xs">
            اختر الإجراء المطلوب من دليل الإجراءات السريرية (Clinical Procedure Directory): *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PROCEDURE_CATALOG.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleProcChange(p.id)}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                  selectedProcId === p.id
                    ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="font-extrabold text-slate-900 text-xs">{p.procedureNameAr}</div>
                  <div className="text-[11px] text-slate-500 font-sans">{p.procedureNameEn}</div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px]">
                  <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                    {p.id}
                  </span>
                  <span className="text-emerald-700 font-bold">{p.site}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block font-bold text-slate-700 mb-1">الموقع التشريحي الدقيق (Site): *</label>
            <input
              type="text"
              value={anatomicalSite}
              onChange={e => setAnatomicalSite(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">مستوى التهدئة والتخدير (Sedation): *</label>
            {selectedProc.requirementsProfile.requiresSedationOrAnesthesia ? (
              <select
                value={sedationRequired}
                onChange={e => setSedationRequired(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
              >
                <option value="none">بدون تخدير (None)</option>
                <option value="local">تخدير موضعي (Local Infiltration)</option>
                <option value="moderate_conscious">تهدئة واعية متوسطة (Moderate Conscious Sedation)</option>
                <option value="deep_sedation">تهدئة عميقة (Deep Sedation)</option>
                <option value="general">تخدير عام (General Anesthesia)</option>
              </select>
            ) : (
              <input
                type="text"
                readOnly
                value="بدون تخدير - إجراء سريري بسيط (No Sedation Required)"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 font-medium text-slate-600"
              />
            )}
          </div>
        </div>

        {/* Dynamic Requirements Profile Section */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
            <span>متطلبات واشتراطات الإجراء المعتمدة (Catalog Requirements Profile):</span>
            <span className="text-[10px] text-slate-500 font-mono">Profile ID: {selectedProc.id}</span>
          </div>

          {selectedProc.requirementsProfile.requiresConsent ? (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="consent-check"
                checked={consentVerified}
                onChange={e => setConsentVerified(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="consent-check" className="font-bold text-slate-800">
                تم توقيع الإقرار الطبي المستنير وشرح المضاعفات للمريض/ذويه (Informed Consent Signed) *
              </label>
            </div>
          ) : (
            <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>إجراء سريري/تمريضي روتيني لا يتطلب توقيع إقرار جراحي منفصل.</span>
            </div>
          )}

          {selectedProc.requirementsProfile.requiresNpo ? (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="npo-check"
                checked={npoVerified}
                onChange={e => setNpoVerified(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="npo-check" className="font-bold text-slate-800">
                تم التحقق من صيام المريض عن الطعام والشراب ({selectedProc.requirementsProfile.npoHoursRequired || 6} ساعات صيام NPO) *
              </label>
            </div>
          ) : (
            <div className="text-[11px] text-slate-600 bg-slate-100 p-2 rounded-lg flex items-center gap-2">
              <span>حالة الصيام (NPO): غير مطلوبة لهذا الإجراء.</span>
            </div>
          )}

          {selectedProc.requirementsProfile.requiresBloodCrossmatch && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="blood-check"
                checked={bloodCrossmatched}
                onChange={e => setBloodCrossmatched(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="blood-check" className="font-bold text-slate-800">
                تم طلب فحص فصيلة الدم وحجز وحدات الدم الاحتياطية (Blood Crossmatch & Reserve)
              </label>
            </div>
          )}

          {selectedProc.requirementsProfile.requiresCoagulationScreen && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="coag-check"
                checked={coagScreenChecked}
                onChange={e => setCoagScreenChecked(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="coag-check" className="font-bold text-slate-800">
                تم التحقق من تحاليل سيولة الدم والتخثر (PT/INR & Platelets Clearance)
              </label>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">ملاحظات التحضير والمتطلبات الخاصة:</label>
            <input
              type="text"
              value={prerequisitesNote}
              onChange={e => setPrerequisitesNote(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900"
            />
          </div>
        </div>
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
