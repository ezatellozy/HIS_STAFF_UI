import React, { useState, useEffect } from 'react';
import { Pill, ShieldCheck, AlertTriangle, Sparkles, Clock, Check, Info } from 'lucide-react';
import { Patient } from '../../../types/his';
import {
  OrderPriority,
  ClinicalOrderItem,
  MedicationOrderDetails,
  CDSSMockAlert
} from '../../../types/clinicalOrdersRequests';
import { MEDICATION_CATALOG, MedicationCatalogItem } from '../../../data/mockOrdersRequestsData';
import { SharedOrderShell } from './SharedOrderShell';
import { useHis } from '../../../context/HisContext';
import { ClinicalActionDialog } from '../common/ClinicalActionDialog';

interface MedicationOrderComposerProps {
  patient: Patient;
  onClose: () => void;
  onSaveOrder: (newOrder: ClinicalOrderItem) => void;
}

export const MedicationOrderComposer: React.FC<MedicationOrderComposerProps> = ({
  patient,
  onClose,
  onSaveOrder
}) => {
  const { currentStaff, playChime } = useHis();

  // Shared Shell States
  const [priority, setPriority] = useState<OrderPriority>('urgent');
  const [clinicalIndication, setClinicalIndication] = useState('احتشاء حاد بعضلة القلب NSTEMI');
  const [safetyDialog, setSafetyDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  // Selected Medication
  const [selectedMedId, setSelectedMedId] = useState<string>(MEDICATION_CATALOG[1].id); // default Enoxaparin
  const selectedMed = MEDICATION_CATALOG.find(m => m.id === selectedMedId) || MEDICATION_CATALOG[0];

  // Specific Order Fields
  const [dosageForm, setDosageForm] = useState(selectedMed.dosageForms[0]);
  const [strength, setStrength] = useState(selectedMed.strengths[0]);
  const [doseAmount, setDoseAmount] = useState<number>(selectedMed.suggestedDoses[1] || selectedMed.suggestedDoses[0] || 60);
  const [doseUnit, setDoseUnit] = useState(selectedMed.doseUnits[0]);
  const [route, setRoute] = useState(selectedMed.allowedRoutes[0]);
  const [frequency, setFrequency] = useState(selectedMed.allowedFrequencies[0]);
  const [durationDays, setDurationDays] = useState(5);
  const [isPrn, setIsPrn] = useState(false);
  const [prnReason, setPrnReason] = useState('');
  const [continuousRate, setContinuousRate] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('مراقبة علامات النزف والصفائح الدموية.');

  // CDSS Alerts
  const [alerts, setAlerts] = useState<CDSSMockAlert[]>([]);

  // Update fields when medication changes
  useEffect(() => {
    setDosageForm(selectedMed.dosageForms[0]);
    setStrength(selectedMed.strengths[0]);
    setDoseAmount(selectedMed.suggestedDoses[0] || 10);
    setDoseUnit(selectedMed.doseUnits[0]);
    setRoute(selectedMed.allowedRoutes[0]);
    setFrequency(selectedMed.allowedFrequencies[0]);

    // Check mock CDSS rules
    const newAlerts: CDSSMockAlert[] = [];

    if (selectedMed.requiresRenalCheck) {
      newAlerts.push({
        id: 'cdss-renal',
        type: 'renal_hepatic_concern',
        severity: 'informational',
        titleAr: 'التحقق من وظائف الكلى (Renal Function Safe)',
        titleEn: 'eGFR Verification',
        messageAr: 'وظائف كلى المريض الحالية (eGFR 72 mL/min) طبيعية وتسمح بالجرعة القياسية الكاملة.',
        messageEn: 'Safe for standard therapeutic dosing.',
        canOverride: true,
        isOverridden: true,
        overrideReason: 'تم التحقق من التحاليل'
      });
    }

    if (selectedMed.id === 'med-ntg-inf') {
      newAlerts.push({
        id: 'cdss-pde5',
        type: 'contraindication',
        severity: 'high_severity_blocking',
        titleAr: 'تنبيه موانع الاستعمال - مثبطات PDE5',
        titleEn: 'Absolute Contraindication Check',
        messageAr: 'تأكد من عدم استخدام المريض لأدوية الضعف الجنسي (Sildenafil/Tadalafil) خلال آخر 48 ساعة لمنع هبوط الضغط المميت.',
        messageEn: 'Verify no PDE5 inhibitor use in prior 48 hours.',
        canOverride: true,
        isOverridden: false
      });
      setContinuousRate('10 mcg/min');
      setSpecialInstructions('معايرة بمقدار 5 mcg/min كل 5-10 دقائق، خفض التسريب فوراً إذا قل الضغط عن 100 mmHg.');
    } else {
      setContinuousRate('');
    }

    setAlerts(newAlerts);
  }, [selectedMedId]);

  const handleOverrideAlert = (alertId: string, reason: string) => {
    setAlerts(prev =>
      prev.map(a =>
        a.id === alertId
          ? {
              ...a,
              isOverridden: true,
              overrideReason: reason,
              overriddenBy: currentStaff.name,
              overriddenAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
            }
          : a
      )
    );
    playChime('chime');
  };

  const handleSubmit = () => {
    // Check if any high severity blocking alert is not overridden
    const blocking = alerts.find(a => a.severity === 'high_severity_blocking' && !a.isOverridden);
    if (blocking) {
      setSafetyDialog({
        isOpen: true,
        title: 'تنبيه أمان دوائي إلزامي حرج (CDSS Blocking Alert)',
        message: `يرجى مراجعة وتجاوز تنبيه الأمان الدوائي الإلزامي أولاً بتقديم المبرر السريري المعتمد: "${blocking.titleAr}"`
      });
      return;
    }

    const medDetails: MedicationOrderDetails = {
      catalogId: selectedMed.id,
      genericName: selectedMed.genericName,
      brandName: selectedMed.brandName,
      dosageForm,
      strength,
      doseAmount,
      doseUnit,
      route,
      frequency,
      durationDays,
      startDate: new Date().toISOString().split('T')[0],
      isPrn,
      prnReason: isPrn ? prnReason : undefined,
      continuousRate: continuousRate || undefined,
      isHighAlert: selectedMed.isHighAlert,
      verificationPolicy: selectedMed.requiresDualSignoff ? 'dual_nurse_signoff' : 'pharmacist_pre_review',
      specialInstructions
    };

    const newOrder: ClinicalOrderItem = {
      id: `ORD-MED-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: patient.id,
      encounterId: 'ENC-2026-ER-091',
      encounterLocation: 'قسم الطوارئ والحالات الحرجة',
      category: 'medication',
      orderTitleAr: `${selectedMed.genericName} ${doseAmount} ${doseUnit} (${route})`,
      orderTitleEn: `${selectedMed.genericName} ${doseAmount} ${doseUnit} ${route} ${frequency}`,
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
          reason: 'تم الاعتماد والتوقيع الإلكتروني'
        }
      ],
      medicationDetails: medDetails,
      cdssAlerts: alerts
    };

    onSaveOrder(newOrder);
    playChime('success');
    onClose();
  };

  return (
    <SharedOrderShell
      patient={patient}
      titleAr="محرر أوامر الأدوية والعلاجات المتقدم (Medication Order Composer)"
      titleEn="CPOE Inpatient Medication Composer"
      priority={priority}
      onPriorityChange={setPriority}
      clinicalIndication={clinicalIndication}
      onClinicalIndicationChange={setClinicalIndication}
      cdssAlerts={alerts}
      onOverrideAlert={handleOverrideAlert}
      onCancel={onClose}
      onSubmit={handleSubmit}
      submitLabel="توقيع واعتماد وصفة الدواء (Sign Medication Order)"
    >
      <div className="space-y-4 text-xs">
        
        {/* Drug Selection from Catalog */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <label className="block font-extrabold text-slate-900 text-xs">
            اختر الدواء من الدليل الدوائي والمستحضرات المعتمدة (Formulary Catalog): *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {MEDICATION_CATALOG.map(drug => (
              <button
                key={drug.id}
                type="button"
                onClick={() => setSelectedMedId(drug.id)}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                  selectedMedId === drug.id
                    ? 'bg-teal-50 border-teal-500 shadow-xs ring-1 ring-teal-500'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="font-extrabold text-slate-900 text-xs">{drug.genericName}</div>
                  <div className="text-[11px] text-slate-500">{drug.brandName}</div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                    {drug.category.split('/')[0]}
                  </span>
                  {drug.isHighAlert && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold">
                      عالي الخطورة
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* High-Alert Drug Warning Box if applicable */}
        {selectedMed.isHighAlert && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <strong>دواء عالي الخطورة (CBAHI High-Alert Medication):</strong> يتطلب هذا المستحضر مراجعة صيدلانية مسبقة وتدقيقاً تمريضياً مزدوجاً (Dual Nurse Signoff) قبل إعطاء الجرعة للمريض في السجل الإلكتروني (eMAR).
              {selectedMed.blackBoxWarningAr && (
                <div className="text-[11px] text-red-700 mt-1 font-medium">
                  {selectedMed.blackBoxWarningAr}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Dosing Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200">
          
          {/* Dose Amount & Unit */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">الجرعة المحددة: *</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={doseAmount}
                onChange={e => setDoseAmount(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
              />
              <select
                value={doseUnit}
                onChange={e => setDoseUnit(e.target.value)}
                className="p-2.5 rounded-xl border border-slate-300 font-bold bg-slate-50 text-slate-700"
              >
                {selectedMed.doseUnits.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            
            {/* Quick Dose Buttons */}
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              {selectedMed.suggestedDoses.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDoseAmount(d)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                    doseAmount === d
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {d} {selectedMed.doseUnits[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Route (Strictly Dynamic from catalog) */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              مسار الإعطاء (Route): *
            </label>
            <select
              value={route}
              onChange={e => setRoute(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
            >
              {selectedMed.allowedRoutes.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400 mt-1 block">
              مقيد بالمسارات المصرح بها للدواء فقط
            </span>
          </div>

          {/* Frequency */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              التكرار والجدول الزمني: *
            </label>
            <select
              value={frequency}
              onChange={e => setFrequency(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
            >
              {selectedMed.allowedFrequencies.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              مدة العلاج بالأيام:
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={durationDays}
              onChange={e => setDurationDays(parseInt(e.target.value) || 1)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
            />
          </div>
        </div>

        {/* Titration / Continuous Infusion Rate if Continuous */}
        {selectedMed.id === 'med-ntg-inf' && (
          <div className="bg-teal-50/60 p-3 rounded-xl border border-teal-200 space-y-2">
            <label className="block font-bold text-teal-900 text-xs">
              بروتوكول المعايرة الوريدية المستمرة (Continuous Infusion Titration):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 block mb-1">معدل التسريب الأولي:</span>
                <input
                  type="text"
                  value={continuousRate}
                  onChange={e => setContinuousRate(e.target.value)}
                  placeholder="10 mcg/min"
                  className="w-full p-2 rounded-lg border border-teal-300 bg-white font-bold text-slate-900"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-1">حدود المعايرة والهدف السريري:</span>
                <input
                  type="text"
                  readOnly
                  value="معايرة 5 mcg/min كل 5 دقائق - الحفاظ على الضغط > 100 mmHg"
                  className="w-full p-2 rounded-lg border border-slate-200 bg-slate-100 font-medium text-slate-700"
                />
              </div>
            </div>
          </div>
        )}

        {/* PRN Checkbox and Reason */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="prn-toggle"
              checked={isPrn}
              onChange={e => setIsPrn(e.target.checked)}
              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="prn-toggle" className="font-bold text-slate-800">
              إعطاء عند اللزوم (PRN - As Needed)
            </label>
          </div>

          {isPrn && (
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                value={prnReason}
                onChange={e => setPrnReason(e.target.value)}
                placeholder="حدد السبب الإلزامي للإعطاء عند اللزوم (مثال: عند تجدد ألم الصدر > 4/10)"
                className="w-full p-2 rounded-lg border border-slate-300 font-medium text-slate-900"
              />
            </div>
          )}
        </div>

        {/* Special Instructions */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            تعليمات خاصة للتمريض والصيدلة السريرية (Administration Instructions):
          </label>
          <textarea
            rows={2}
            value={specialInstructions}
            onChange={e => setSpecialInstructions(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-800"
          />
        </div>
      </div>

      <ClinicalActionDialog
        isOpen={safetyDialog.isOpen}
        onClose={() => setSafetyDialog(prev => ({ ...prev, isOpen: false }))}
        title={safetyDialog.title}
        message={safetyDialog.message}
        severity="error"
      />
    </SharedOrderShell>
  );
};
