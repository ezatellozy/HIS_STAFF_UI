import React, { useState } from 'react';
import {
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  UserCheck,
  Clock,
  Sparkles,
  ArrowRight,
  Info,
  Check,
  ShieldCheck,
  Layers,
  ArrowUpDown,
  BookOpen,
  ClipboardList,
  Stethoscope,
  Send,
  RotateCcw
} from 'lucide-react';
import {
  MedicationReconciliationRecord,
  ReconciliationItem,
  ReconciliationDecision,
  ReconciliationTransitionType,
  MedicationReconciliationPolicy
} from '../../../types/clinicalMedicationsMar';
import { StaffUser } from '../../../types/his';
import { MOCK_RECONCILIATION_POLICIES } from '../../../data/mockClinicalMedicationsData';

interface MedicationReconciliationViewProps {
  initialReconciliation: MedicationReconciliationRecord;
  currentStaff: StaffUser;
  onSaveReconciliation: (rec: MedicationReconciliationRecord) => void;
}

export const MedicationReconciliationView: React.FC<MedicationReconciliationViewProps> = ({
  initialReconciliation,
  currentStaff,
  onSaveReconciliation
}) => {
  const [reconciliation, setReconciliation] = useState<MedicationReconciliationRecord>(
    initialReconciliation
  );

  // Active simulated role for verifying multi-role governance: 'pharmacist' | 'attending'
  const [simulatedRole, setSimulatedRole] = useState<'pharmacist' | 'attending'>('pharmacist');

  // Interactive Transition-specific Checklist state
  const currentPolicy: MedicationReconciliationPolicy =
    reconciliation.policy || MOCK_RECONCILIATION_POLICIES[reconciliation.transitionType] || MOCK_RECONCILIATION_POLICIES.admission;

  const [checklistState, setChecklistState] = useState({
    homeMedVerified: true,
    transferOrdersDiscontinued: false,
    postDischargePlanCreated: false,
    interactionsScreened: true
  });

  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Handle Transition switching (Admission vs Internal Transfer vs Discharge)
  const handleSwitchTransition = (type: ReconciliationTransitionType) => {
    const targetPolicy = MOCK_RECONCILIATION_POLICIES[type];
    const updated: MedicationReconciliationRecord = {
      ...reconciliation,
      transitionType: type,
      policy: targetPolicy,
      policyName: targetPolicy.policyName,
      status: 'in_progress',
      documentedBy: undefined,
      documentedAt: undefined,
      completedBy: undefined,
      completedAt: undefined
    };
    setReconciliation(updated);
    setSuccessBanner(`تم تفعيل سياسة التوفيق لمرحلة الانتقال: ${type === 'admission' ? 'التنويم' : type === 'internal_transfer' ? 'النقل الداخلي (ICU to Ward)' : 'الخروج والتسريح'}`);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const handleDecisionChange = (index: number, newDecision: ReconciliationDecision) => {
    const updatedItems = [...reconciliation.items];
    updatedItems[index] = {
      ...updatedItems[index],
      decision: newDecision
    };

    setReconciliation(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const handleRationaleChange = (index: number, newRationale: string) => {
    const updatedItems = [...reconciliation.items];
    updatedItems[index] = {
      ...updatedItems[index],
      clinicalRationale: newRationale
    };

    setReconciliation(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  // Pharmacist Documentation sign-off
  const handleDocumentPharmacist = () => {
    const updated: MedicationReconciliationRecord = {
      ...reconciliation,
      status: 'in_progress',
      documentedBy: 'د. شريف عبد الفتاح (صيدلي إكلينيكي أول - BCPS)',
      documentedAt: 'اليوم، الآن'
    };
    setReconciliation(updated);
    setSuccessBanner('تم تسجيل التوثيق السريري بواسطة الصيدلي السريري بنجاح، بانتظار اعتماد الطبيب المشرف (Cosign).');
    setTimeout(() => setSuccessBanner(null), 4000);
    onSaveReconciliation(updated);
  };

  // Attending Physician / Final Sign-Off
  const handleCompleteSignOff = () => {
    const completed: MedicationReconciliationRecord = {
      ...reconciliation,
      status: 'completed',
      completedBy: simulatedRole === 'attending'
        ? 'د. خالد عبد العزيز (استشاري أمراض القلب المشرف)'
        : `${currentStaff.name} (${currentStaff.role.toUpperCase()})`,
      completedAt: 'اليوم، الآن'
    };
    setReconciliation(completed);
    setSuccessBanner('تم الاعتماد النهائي للتوفيق الدوائي السريري بنجاح وفق السياسة المعتمدة.');
    setTimeout(() => setSuccessBanner(null), 4000);
    onSaveReconciliation(completed);
  };

  const isCompleted = reconciliation.status === 'completed';
  const hasPharmacistDocumented = !!reconciliation.documentedBy;

  return (
    <div className="space-y-6" id="medication-reconciliation-workspace">
      {/* 1. Policy & Transition Switcher Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-extrabold text-base text-slate-900">
                  التوفيق الدوائي السريري (Clinical Medication Reconciliation)
                </h4>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-900 border border-teal-200">
                  Transition Policy-Driven
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {isCompleted ? 'معتمد COMPLETED' : 'قيد المراجعة IN PROGRESS'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                مطابقة أدوية المريض بين المراحل الانتقالية وفق سياسات الحوكمة السريرية المحددة لكل مرحلة
              </p>
            </div>
          </div>

          {/* Transition Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 px-2">مرحلة الانتقال:</span>
            <button
              onClick={() => handleSwitchTransition('admission')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                reconciliation.transitionType === 'admission'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              دخول / تنويم (Admission)
            </button>
            <button
              onClick={() => handleSwitchTransition('internal_transfer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                reconciliation.transitionType === 'internal_transfer'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              نقل داخلي (Transfer)
            </button>
            <button
              onClick={() => handleSwitchTransition('discharge')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                reconciliation.transitionType === 'discharge'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              خروج / تسريح (Discharge)
            </button>
          </div>
        </div>

        {/* Policy Details Strip */}
        <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <strong className="text-teal-950 font-extrabold">
                {currentPolicy.policyName} ({currentPolicy.policyId})
              </strong>
            </div>
            <p className="text-[11px] text-teal-800 leading-relaxed">
              {currentPolicy.policyDescriptionAr}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-white border border-teal-200 text-[11px] text-slate-700">
              نموذج الاعتماد: <strong className="text-teal-900">{currentPolicy.approvalModelLabelAr}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-teal-200 text-[11px] text-slate-700">
              الأدوار المصرحة: <strong className="text-teal-900">{currentPolicy.documentationRoles.join(' • ')}</strong>
            </span>
          </div>
        </div>

        {/* Transition-Specific Checklist Banner */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-teal-600" />
              <span>قائمة التحقق الإلزامية للمرحلة السريرية (Transition-Specific Checklist):</span>
            </div>
            <span className="text-[10px] text-slate-500 font-normal">
              يجب استيفاء الشروط قبل الاعتماد النهائي
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px]">
            {/* Checklist Item 1: Home med verification */}
            <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
              checklistState.homeMedVerified ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-slate-200 text-slate-700'
            }`}>
              <input
                type="checkbox"
                checked={checklistState.homeMedVerified}
                onChange={e => setChecklistState(prev => ({ ...prev, homeMedVerified: e.target.checked }))}
                className="accent-teal-600 rounded"
              />
              <span className="font-medium">التحقق من أدوية المنزل الأصلية</span>
            </label>

            {/* Checklist Item 2: Transfer order discontinuation */}
            <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
              checklistState.transferOrdersDiscontinued ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-slate-200 text-slate-700'
            }`}>
              <input
                type="checkbox"
                checked={checklistState.transferOrdersDiscontinued}
                onChange={e => setChecklistState(prev => ({ ...prev, transferOrdersDiscontinued: e.target.checked }))}
                className="accent-teal-600 rounded"
              />
              <span className="font-medium">مراجعة وإيقاف أدوية المرحلة السابقة (ICU/Ward)</span>
            </label>

            {/* Checklist Item 3: Post-discharge medication plan */}
            <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
              checklistState.postDischargePlanCreated ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-slate-200 text-slate-700'
            }`}>
              <input
                type="checkbox"
                checked={checklistState.postDischargePlanCreated}
                onChange={e => setChecklistState(prev => ({ ...prev, postDischargePlanCreated: e.target.checked }))}
                className="accent-teal-600 rounded"
              />
              <span className="font-medium">توليد خطة أدوية الخروج وإرشادات المريض</span>
            </label>

            {/* Checklist Item 4: Drug Interactions */}
            <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
              checklistState.interactionsScreened ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-slate-200 text-slate-700'
            }`}>
              <input
                type="checkbox"
                checked={checklistState.interactionsScreened}
                onChange={e => setChecklistState(prev => ({ ...prev, interactionsScreened: e.target.checked }))}
                className="accent-teal-600 rounded"
              />
              <span className="font-medium">فحص التفاعلات الدوائية والتكرار العلاجي</span>
            </label>
          </div>
        </div>

        {/* Multi-Role Signature & Approval Section */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">هوية المستخدم في المحاكاة:</span>
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setSimulatedRole('pharmacist')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  simulatedRole === 'pharmacist'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                صيدلي إكلينيكي (Pharmacist)
              </button>
              <button
                onClick={() => setSimulatedRole('attending')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  simulatedRole === 'attending'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                طبيب استشاري معالج (Attending Physician)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Pharmacist Documentation status */}
            {hasPharmacistDocumented ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>توثيق الصيدلي: {reconciliation.documentedBy} ({reconciliation.documentedAt})</span>
              </div>
            ) : (
              <button
                onClick={handleDocumentPharmacist}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>توثيق الصيدلي السريري (Pharmacist Document)</span>
              </button>
            )}

            {/* Final Sign-Off Status */}
            {isCompleted ? (
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>الاعتماد النهائي (Co-Sign): {reconciliation.completedBy} ({reconciliation.completedAt})</span>
              </div>
            ) : (
              <button
                onClick={handleCompleteSignOff}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                <span>اعتماد الطبيب المشرف (Attending Co-Sign)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {successBanner && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* 2. Comparison Grid (Home Meds vs Current Encounter Regimen) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <strong className="text-xs text-slate-800">
            جدول مطابقة الأدوية والقرارات السريرية ({reconciliation.items.length} أدوية مسجلة)
          </strong>
          <span className="text-[11px] text-slate-500 font-mono">
            Encounter: {reconciliation.encounterId}
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {reconciliation.items.map((item, idx) => {
            return (
              <div key={item.id} className="p-4 hover:bg-slate-50/60 transition-colors space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  {/* Medication Info */}
                  <div className="space-y-1 max-w-sm">
                    <strong className="text-slate-900 text-sm font-extrabold block">
                      {item.sourceMedicationName}
                    </strong>

                    <div className="text-[11px] text-slate-600 font-mono">
                      الجرعة الأصلية: <strong className="text-slate-800">{item.sourceDose}</strong> • {item.sourceRoute} • {item.sourceFrequency}
                    </div>

                    <div className="text-[11px] text-slate-500">
                      دواعي الاستعمال: {item.sourceIndication}
                    </div>

                    <span className="text-[10px] text-slate-400 block">
                      المصدر الموثق: {item.sourceOrigin === 'patient_reported' ? 'إفادة المريض' : item.sourceOrigin === 'pharmacy_dispense_history' ? 'سجل صرف الصيدلية' : 'تقرير الخروج السابق'}
                    </span>
                  </div>

                  {/* Decision Selector */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 block">
                      القرار السريري المعتمد:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleDecisionChange(idx, 'continue')}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                          item.decision === 'continue'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        استمرار (Continue)
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDecisionChange(idx, 'modify')}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                          item.decision === 'modify'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        تعديل (Modify)
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDecisionChange(idx, 'hold')}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                          item.decision === 'hold'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        تعليق مؤقت (Hold)
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDecisionChange(idx, 'discontinue')}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                          item.decision === 'discontinue'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        إيقاف (Discontinue)
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDecisionChange(idx, 'needs_clarification')}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                          item.decision === 'needs_clarification'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        توضيح (Clarify)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inpatient Match and Clinical Rationale */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-semibold">
                      المكافئ في خطة التنويم الحالية:
                    </span>
                    {item.encounterMedicationEquivalent ? (
                      <span className="font-mono font-bold text-blue-700">
                        {item.encounterMedicationEquivalent}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">لا يوجد مكافئ منوم مباشر (معلق أو متوقف)</span>
                    )}
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-semibold mb-1">
                      المبرر السريري للقرار (Clinical Rationale):
                    </span>
                    <input
                      type="text"
                      value={item.clinicalRationale}
                      onChange={e => handleRationaleChange(idx, e.target.value)}
                      className="w-full bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
