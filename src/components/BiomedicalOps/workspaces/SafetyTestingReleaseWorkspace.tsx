import React, { useState } from 'react';
import {
  ShieldCheck,
  Zap,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  User,
  Building,
  RotateCcw,
  Sparkles,
  XCircle,
  HelpCircle,
  Play
} from 'lucide-react';
import {
  BiomedicalWorkOrder,
  MedicalEquipmentAsset,
  BiomedicalOpsState,
  ElectricalSafetyTestRecord,
  CalibrationRecord
} from '../../../types/biomedicalOps';
import {
  evaluateElectricalSafetyTestValues,
  evaluateReturnToServiceEligibility,
  executeReturnToService
} from '../../../utils/biomedicalWorkflowEngine';

interface SafetyTestingReleaseWorkspaceProps {
  state: BiomedicalOpsState;
  onUpdateWorkOrder: (wo: BiomedicalWorkOrder) => void;
  onUpdateAsset: (asset: MedicalEquipmentAsset) => void;
  onAddAuditLog: (action: string, entityId: string, description: string) => void;
}

export const SafetyTestingReleaseWorkspace: React.FC<SafetyTestingReleaseWorkspaceProps> = ({
  state,
  onUpdateWorkOrder,
  onUpdateAsset,
  onAddAuditLog
}) => {
  // Pending work orders needing test or release
  const pendingOrders = state.workOrders.filter(
    w => w.status === 'testing_pending' || (w.status === 'in_progress' && !w.returnToServiceApproved)
  );

  const [selectedWoId, setSelectedWoId] = useState<string>(pendingOrders[0]?.id || '');
  const activeWo = state.workOrders.find(w => w.id === selectedWoId);
  const activeAsset = activeWo ? state.assets.find(a => a.id === activeWo.assetId) : null;

  // Electrical Safety Test Form
  const [earthResistance, setEarthResistance] = useState<number>(0.092);
  const [insulationResistance, setInsulationResistance] = useState<number>(115.0);
  const [chassisLeakage, setChassisLeakage] = useState<number>(38.5);
  const [patientLeakage, setPatientLeakage] = useState<number>(14.2);
  const [detachableCord, setDetachableCord] = useState<boolean>(false);
  const [testDeviceRef, setTestDeviceRef] = useState<string>('Fluke ESA620 S/N 847291');

  // Approver inputs
  const [approverName, setApproverName] = useState<string>('م. خالد السعدون (مدير الهندسة السريرية)');
  const [custodianName, setCustodianName] = useState<string>('م. فهد الزهراني (مشرف تمريض القسم)');
  const [releaseError, setReleaseError] = useState<string | null>(null);
  const [releaseSuccess, setReleaseSuccess] = useState<boolean>(false);

  // Compute live safety validation using explicit profile
  const activeProfile = state.testProfiles.find(p => p.testProfileId === activeAsset?.safetyTestProfileId);
  const hasAppliedPart = Boolean(activeProfile?.appliedPartType && activeProfile.appliedPartType !== 'None');
  const safetyEval = evaluateElectricalSafetyTestValues(
    activeProfile,
    earthResistance,
    insulationResistance,
    chassisLeakage,
    hasAppliedPart ? patientLeakage : undefined,
    detachableCord
  );

  // Handle Save Test
  const handleSaveSafetyTest = () => {
    if (!activeWo || safetyEval.testProfileStatus === 'TEST_PROFILE_NOT_VERIFIED') return;

    const testRecord: ElectricalSafetyTestRecord = {
      id: `ST-${Date.now()}`,
      testDate: new Date().toISOString().split('T')[0],
      testedBy: activeWo.assignedEngineer || 'مهندس الأجهزة الطبية',
      testStandardReference: activeProfile?.applicableStandardReference || 'Workflow informed by IEC 62353',
      testProfileId: activeProfile?.testProfileId || 'TEST_PROFILE_NOT_VERIFIED',
      testDeviceRef,
      earthResistanceOhms: earthResistance,
      earthResistancePass: safetyEval.earthResistancePass,
      insulationResistanceMOhms: insulationResistance,
      insulationResistancePass: safetyEval.insulationResistancePass,
      chassisLeakageCurrentMicroAmps: chassisLeakage,
      chassisLeakagePass: safetyEval.chassisLeakagePass,
      patientAppliedPartLeakageMicroAmps: hasAppliedPart ? patientLeakage : undefined,
      overallSafetyPass: safetyEval.overallPass,
      notes: `فحص بناءً على ملف الأمان ${activeProfile?.testProfileId || 'Unknown'}`
    };

    const updatedWo: BiomedicalWorkOrder = {
      ...activeWo,
      safetyTestRecord: testRecord
    };

    onUpdateWorkOrder(updatedWo);
    onAddAuditLog(
      'SAFETY_TEST_RECORDED',
      activeWo.id,
      `تسجيل نتائج فحص السلامة الكهربائية لأمر العمل ${activeWo.workOrderNumber} (الحالة: ${safetyEval.overallPass ? 'ناجح' : 'راسب'}).`
    );
  };

  // Handle Return to Service Decision
  const handleApproveRelease = () => {
    if (!activeAsset || !activeWo) return;

    setReleaseError(null);
    setReleaseSuccess(false);

    const res = executeReturnToService(activeAsset, activeWo, approverName, custodianName);

    if (!res.success || !res.updatedAsset || !res.updatedWorkOrder) {
      setReleaseError(res.error || 'فشل الإفراج السريري');
      return;
    }

    onUpdateAsset(res.updatedAsset);
    onUpdateWorkOrder(res.updatedWorkOrder);
    setReleaseSuccess(true);

    onAddAuditLog(
      'RETURN_TO_SERVICE_APPROVED',
      activeAsset.id,
      `الموافقة على تحرير وإعادة الأصل الطبي ${activeAsset.assetTag} (${activeAsset.nameAr}) للخدمة السريرية بعد اجتياز فحص السلامة وتوقيع استلام العهدة.`
    );
  };

  // Eligibility Check
  const eligibility = activeAsset && activeWo ? evaluateReturnToServiceEligibility(activeAsset, activeWo) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <h2 className="text-base font-bold text-slate-900">
          بوابة فحص الأمان المترولوجي والتحرير السريري (Safety Testing & Return-to-Service Gate)
        </h2>
        <p className="text-xs text-slate-500">
          منظومة التحقق قبل تسليم الأجهزة بعد الصيانة — سير العمل مستنير بمفاهيم فحص IEC 62353 واشتراطات ملف الأصل المعتمد
        </p>
      </div>

      {pendingOrders.length === 0 ? (
        <div className="bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200 text-xs">
          <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2 stroke-1" />
          <p className="font-bold text-slate-800 text-sm">كافة الأجهزة تم فحصها وإجازتها سريرياً</p>
          <p className="text-slate-500 mt-1">لا توجد أوامر صيانة بانتظار فحص الأمان الكهربائي أو قرار التحرير حالياً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Select Pending Order */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs text-slate-700">أوامر بانتظار الفحص والتحرير ({pendingOrders.length}):</h3>
            <div className="space-y-2">
              {pendingOrders.map(wo => {
                const isSelected = wo.id === selectedWoId;
                const hasSafetyTest = Boolean(wo.safetyTestRecord?.overallSafetyPass);
                return (
                  <div
                    key={wo.id}
                    onClick={() => {
                      setSelectedWoId(wo.id);
                      setReleaseError(null);
                      setReleaseSuccess(false);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs space-y-1.5 ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/40 ring-2 ring-teal-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {wo.workOrderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          hasSafetyTest ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {hasSafetyTest ? 'فحص الأمان مكتمل' : 'بانتظار فحص IEC'}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 leading-snug">{wo.assetName}</h4>
                    <span className="font-mono text-[11px] text-teal-700 block">{wo.assetTag} • {wo.departmentName}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (2 Cols): Active Testing & Gating Console */}
          {activeWo && activeAsset && (
            <div className="lg:col-span-2 space-y-4">
              {/* Asset & Work Order Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 text-xs space-y-3 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{activeAsset.nameAr}</h3>
                    <span className="font-mono text-slate-500">{activeAsset.assetTag} • {activeAsset.assignedDepartment}</span>
                  </div>
                  <span className="bg-purple-100 text-purple-800 font-bold px-2.5 py-1 rounded-lg text-xs font-mono">
                    أمر العمل: {activeWo.workOrderNumber}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-[11px]">
                  <p><strong>العطل المصلح:</strong> {activeWo.problemDescription}</p>
                  <p><strong>الإجراءات المنفذة:</strong> {activeWo.actionsTaken || 'قيد استكمال التوثيق'}</p>
                  <p><strong>المهندس المنفذ:</strong> {activeWo.assignedEngineer || 'غير محدد'}</p>
                </div>
              </div>

              {/* IEC 62353 Informed Electrical Safety Testing Form */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 text-xs space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <h3 className="font-bold text-sm text-slate-800">
                      اختبار السلامة الكهربائية الدوري (سير عمل مستنير بمفاهيم IEC 62353)
                    </h3>
                  </div>
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono text-[10px]">
                    جهاز الفحص: {testDeviceRef}
                  </span>
                </div>

                <div className={`grid grid-cols-1 ${hasAppliedPart ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4`}>
                  {/* Earth Resistance */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="font-bold text-slate-700 text-[11px]">مقاومة التأريض (Ω):</label>
                      <span className={`text-[10px] font-bold ${safetyEval.earthResistancePass ? 'text-emerald-600' : 'text-red-600'}`}>
                        {safetyEval.earthResistancePass ? 'ضمن الحد' : 'تجاوز الحد'}
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.001"
                      value={earthResistance}
                      onChange={e => setEarthResistance(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono text-sm"
                    />
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>الحد: ≤ {detachableCord ? '0.300' : '0.200'} Ω</span>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={detachableCord}
                          onChange={e => setDetachableCord(e.target.checked)}
                          className="rounded text-teal-600 w-3 h-3"
                        />
                        <span>كابل منفصل</span>
                      </label>
                    </div>
                  </div>

                  {/* Insulation Resistance */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="font-bold text-slate-700 text-[11px]">مقاومة العزل (MΩ):</label>
                      <span className={`text-[10px] font-bold ${safetyEval.insulationResistancePass ? 'text-emerald-600' : 'text-red-600'}`}>
                        {safetyEval.insulationResistancePass ? 'ضمن الحد' : 'أقل من الحد'}
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      value={insulationResistance}
                      onChange={e => setInsulationResistance(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono text-sm"
                    />
                    <span className="text-[10px] text-slate-400 block">الحد الأدنى الآمن: ≥ 2.0 MΩ</span>
                  </div>

                  {/* Chassis Leakage */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="font-bold text-slate-700 text-[11px]">تسريب الهيكل (µA):</label>
                      <span className={`text-[10px] font-bold ${safetyEval.chassisLeakagePass ? 'text-emerald-600' : 'text-red-600'}`}>
                        {safetyEval.chassisLeakagePass ? 'ضمن الحد' : 'تجاوز الحد'}
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      value={chassisLeakage}
                      onChange={e => setChassisLeakage(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono text-sm"
                    />
                    <span className="text-[10px] text-slate-400 block">الحد الأقصى المسموح: ≤ 100 µA</span>
                  </div>

                  {/* Patient Applied Part Leakage (if applicable) */}
                  {hasAppliedPart && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="font-bold text-slate-700 text-[11px]">تسريب المريض ({activeProfile?.appliedPartType}):</label>
                        <span className={`text-[10px] font-bold ${safetyEval.patientLeakagePass ? 'text-emerald-600' : 'text-red-600'}`}>
                          {safetyEval.patientLeakagePass ? 'ضمن الحد' : 'تجاوز الحد'}
                        </span>
                      </div>
                      <input
                        type="number"
                        step="0.1"
                        value={patientLeakage}
                        onChange={e => setPatientLeakage(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono text-sm"
                      />
                      <span className="text-[10px] text-slate-400 block">
                        الحد: ≤ {activeProfile?.patientLeakageLimitMicroAmps || 5000} µA
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">نتيجة الفحص الشاملة:</span>
                    <span
                      className={`font-bold px-2.5 py-0.5 rounded text-xs ${
                        safetyEval.overallPass
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}
                    >
                      {safetyEval.overallPass
                        ? 'ضمن حدود ملف فحص الأمان المعتمد للجهاز'
                        : 'تجاوز حدود ملف الفحص — رسوب في اختبار الأمان'}
                    </span>
                  </div>

                  <button
                    onClick={handleSaveSafetyTest}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl cursor-pointer transition-colors shadow-xs"
                  >
                    حفظ وثيقة الفحص الكهربائي
                  </button>
                </div>
              </div>

              {/* Safety Interlock & Return-to-Service Gating Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 text-xs space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-teal-600" />
                    <h3 className="font-bold text-sm text-slate-900">
                      بوابة الإفراج والتحرير السريري (Clinical Release Gate)
                    </h3>
                  </div>
                  <span
                    className={`font-bold px-2.5 py-0.5 rounded-full text-xs ${
                      eligibility?.eligible
                        ? 'bg-emerald-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {eligibility?.eligible ? 'مستوفٍ لكافة شروط الأمان' : 'محظور من الإفراج السريري'}
                  </span>
                </div>

                {/* Gate Checklist */}
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    {activeWo.safetyTestRecord?.overallSafetyPass ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-semibold text-slate-800">
                      اجتياز فحص السلامة الكهربائية المحدد في ملف فحص الجهاز وتوثيق القيم
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!activeWo.calibrationRequired || (activeWo.calibrationRecord?.passed) ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-semibold text-slate-800">
                      المعايرة المترولوجية الدقيقة (إن كانت مطلوبة لنوع الجهاز)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeWo.technicianSignOff ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-semibold text-slate-800">
                      توقيع واعتماد مهندس الأجهزة الطبية المنفذ للصيانة
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!activeAsset.fscaQuarantineRef ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-semibold text-slate-800">
                      خلو الأصل من أي حظر سلامة أو استدعاء ميداني صادر عن SFDA
                    </span>
                  </div>
                </div>

                {releaseError && (
                  <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-2 font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{releaseError}</span>
                  </div>
                )}

                {releaseSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>تم تحرير الأصل بنجاح وإعادته للخدمة السريرية في قسم {activeAsset.assignedDepartment}!</span>
                  </div>
                )}

                {/* Approver Controls */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-slate-600 block text-[10px] mb-1 font-semibold">
                      سلطة الاعتماد (مدير الهندسة السريرية):
                    </label>
                    <input
                      type="text"
                      value={approverName}
                      onChange={e => setApproverName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block text-[10px] mb-1 font-semibold">
                      توقيع مسؤول استلام العهدة بالقسم (Clinical Custodian):
                    </label>
                    <input
                      type="text"
                      value={custodianName}
                      onChange={e => setCustodianName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleApproveRelease}
                    disabled={!eligibility?.eligible}
                    className={`font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                      eligibility?.eligible
                        ? 'bg-teal-600 hover:bg-teal-700 text-white'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>اعتماد التحرير السريري في المسار الاصطناعي (Release in Synthetic Workflow)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
