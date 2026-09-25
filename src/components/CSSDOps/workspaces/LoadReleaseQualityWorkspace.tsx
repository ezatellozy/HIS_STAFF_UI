import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Clock,
  Layers,
  FileText,
  Activity,
  Check
} from 'lucide-react';
import {
  CSSDOpsState,
  SterilizerCycleRecord,
  CSSDPackageRecord
} from '../../../types/cssdOps';
import { evaluateLoadRelease } from '../../../utils/cssdWorkflowEngine';

interface LoadReleaseQualityWorkspaceProps {
  state: CSSDOpsState;
  onUpdateSterilizerCycle: (cycle: SterilizerCycleRecord) => void;
  onUpdatePackage: (pkg: CSSDPackageRecord) => void;
  onAddAuditLog: (action: string, entityId: string, description: string) => void;
}

export const LoadReleaseQualityWorkspace: React.FC<LoadReleaseQualityWorkspaceProps> = ({
  state,
  onUpdateSterilizerCycle,
  onUpdatePackage,
  onAddAuditLog
}) => {
  const [selectedLoadId, setSelectedLoadId] = useState<string>(
    state.sterilizerCycles[0]?.id || ''
  );
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);

  const selectedLoad = state.sterilizerCycles.find(c => c.id === selectedLoadId);

  // 1. Simulate Biological Indicator Incubator Result
  const handleSimulateBIResult = (result: 'passed' | 'failed') => {
    if (!selectedLoad) return;

    const updated: SterilizerCycleRecord = {
      ...selectedLoad,
      biologicalIndicatorEvidence: {
        ...selectedLoad.biologicalIndicatorEvidence,
        biStatus: result,
        biReadTimestamp: new Date().toLocaleTimeString('ar-EG'),
        incubatorId: 'INC-AUTO-RAPID-01'
      }
    };

    onUpdateSterilizerCycle(updated);
    setFeedback({
      type: result === 'passed' ? 'success' : 'error',
      msg: result === 'passed'
        ? 'تمت قراءة المؤشر البيولوجي بالحاضنة السريعة بنجاح (سالب للنمو البكتيري - Negative/Pass)'
        : 'تحذير حرج: المؤشر البيولوجي أظهر نمواً بكتيرياً إيجابياً (Positive Culture/Fail) — الشحنة فاشلة بالكامل!'
    });
    onAddAuditLog(
      result === 'passed' ? 'BI_READOUT_PASSED' : 'BI_READOUT_POSITIVE_FAIL',
      selectedLoad.id,
      `قراءة المؤشر البيولوجي BI للشحنة ${selectedLoad.id}: ${result === 'passed' ? 'سالب (نجاح)' : 'إيجابي (فشل حرج)'}`
    );
  };

  // 2. Clinical Release Decision Execution
  const handleExecuteRelease = () => {
    if (!selectedLoad) return;

    const result = evaluateLoadRelease(selectedLoad, 'د. استشاري الجراحة ومكافحة العدوى');

    if (!result.isValid) {
      setFeedback({
        type: 'error',
        msg: result.blockReasonAr || 'تم حظر الإفراج عن الشحنة لعدم استيفاء معايير الأمان'
      });
      onAddAuditLog('LOAD_RELEASE_HARD_BLOCKED', selectedLoad.id, result.blockReasonAr || 'حظر إفراج الشحنة');
      return;
    }

    if (result.updatedEntity) {
      onUpdateSterilizerCycle(result.updatedEntity);

      // Release all associated packages to 'released_sterile' state
      selectedLoad.includedPackageIds.forEach(pkgId => {
        const pkg = state.packages.find(p => p.id === pkgId);
        if (pkg) {
          const updatedPkg: CSSDPackageRecord = {
            ...pkg,
            currentStatus: 'released_sterile',
            storageIntegrity: 'intact_sterile',
            storageLocation: 'المستودع المعقم - Zone S-A1'
          };
          onUpdatePackage(updatedPkg);
        }
      });
    }

    setFeedback({
      type: 'success',
      msg: `تم اعتماد الإفراج السريري النهائي عن الشحنة (${selectedLoad.id}) وترحيل العبوات للمستودع المعقم بنجاح`
    });
    onAddAuditLog('LOAD_CLINICAL_RELEASE_APPROVED', selectedLoad.id, 'الإفراج النهائي الكامل وتوزيع العبوات للمستودع المعقم');
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: 3-Pillar Release Criteria */}
      <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
          <div>
            <strong className="text-purple-900 block font-bold">
              محطة الإفراج المعقم وضمان الجودة الثلاثي (Tri-Pillar Sterile Load Release Authority)
            </strong>
            <span className="text-purple-700 text-[11px]">
              لا يتم الإفراج إلا باكتمال الركائز الثلاث مجتمعة: 1. الرقابة الميكانيكية (المنحنى) • 2. المؤشر الكيميائي التكاملي 5 • 3. قراءة المؤشر البيولوجي (BI) لصواني الغرسات.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="bg-purple-200/80 text-purple-900 font-bold px-2 py-0.5 rounded text-[10px] font-mono">
            بوابة الإفراج المعقم (Release Gatekeeper)
          </span>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
            feedback.type === 'error'
              ? 'bg-red-100 border-red-300 text-red-900'
              : 'bg-emerald-100 border-emerald-300 text-emerald-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'error' ? (
              <XCircle className="w-4 h-4 text-red-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
            <span className="font-bold">{feedback.msg}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-bold underline cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Main Grid: Loads Pending Release & Tri-Pillar Audit Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Loads List */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
          <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>شحنات بانتظار الإفراج والمطابقة ({state.sterilizerCycles.length})</span>
            </h3>
            <span className="text-[10px] text-slate-500">اختر دورة</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {state.sterilizerCycles.map(cycle => {
              const isSelected = cycle.id === selectedLoadId;
              const isReady =
                cycle.mechanicalParamEvidence.passed &&
                cycle.chemicalIndicatorEvidence.passed &&
                (!cycle.biologicalIndicatorEvidence.isRequired || cycle.biologicalIndicatorEvidence.biStatus === 'passed');

              return (
                <div
                  key={cycle.id}
                  onClick={() => {
                    setSelectedLoadId(cycle.id);
                    setFeedback(null);
                  }}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isSelected ? 'bg-purple-50/80 border-r-4 border-r-purple-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-black text-slate-900">{cycle.id}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        cycle.cycleStatus === 'released'
                          ? 'bg-emerald-100 text-emerald-800'
                          : isReady
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {cycle.cycleStatus === 'released'
                        ? 'مفرج عنها'
                        : isReady
                        ? 'مستوفية للأدلة'
                        : 'أدلة معلقة'}
                    </span>
                  </div>

                  <div className="font-bold text-xs text-slate-800 mb-1">{cycle.sterilizerName}</div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>محتوى الغرسات: <strong>{cycle.hasImplantTray ? 'نعم (مؤشر حيوي)' : 'لا'}</strong></span>
                    <span>العبوات: {cycle.includedPackageIds.length}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Tri-Pillar Quality Evidence Verification Panel */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
          {selectedLoad ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{selectedLoad.id}</h3>
                    <span className="text-xs font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                      {selectedLoad.cycleStatus}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    المعقم: {selectedLoad.sterilizerName} • المشغل: {selectedLoad.operatorName}
                  </span>
                </div>

                {selectedLoad.cycleStatus !== 'released' && (
                  <button
                    onClick={handleExecuteRelease}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>اعتماد الإفراج السريري النهائي</span>
                  </button>
                )}
              </div>

              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                {/* Pillar 1: Physical / Mechanical Cycle Audit */}
                <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 bg-slate-50/40">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-600" />
                      <span>الركيزة الأولى: الرقابة الفيزيائية والميكانيكية (Mechanical Evidence)</span>
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selectedLoad.mechanicalParamEvidence.passed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {selectedLoad.mechanicalParamEvidence.passed ? 'مستوفى (Verified)' : 'غير مكتمل'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700">
                    <div>
                      <span className="text-[10px] text-slate-400 block">درجة الحرارة المحققة:</span>
                      <strong className="font-mono">{selectedLoad.targetTempCelsius}°C</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">الضغط المحقق:</span>
                      <strong className="font-mono">{selectedLoad.targetPressureBar} Bar</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">وقت التعريض الصافي:</span>
                      <strong className="font-mono">{selectedLoad.exposureTimeMinutes} دقائق</strong>
                    </div>
                  </div>
                </div>

                {/* Pillar 2: Chemical Indicator Evidence */}
                <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 bg-slate-50/40">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      <span>الركيزة الثانية: المؤشر الكيميائي المحدد ({selectedLoad.chemicalIndicatorEvidence.indicatorType})</span>
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selectedLoad.chemicalIndicatorEvidence.passed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {selectedLoad.chemicalIndicatorEvidence.passed ? 'اجتياز (ACCEPT Endpoint)' : 'قيد الفحص'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600">
                    تم فحص تحول لون المؤشر الكيميائي المعتمد بالشحنة وتأكيد وصوله لنقطة التحول المعيارية.
                  </p>
                </div>

                {/* Pillar 3: Biological Indicator (BI) Evidence */}
                <div className="border border-slate-200 rounded-xl p-3.5 space-y-3 bg-slate-50/40">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-purple-600" />
                      <span>الركيزة الثالثة: المؤشر البيولوجي (Geobacillus stearothermophilus)</span>
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selectedLoad.biologicalIndicatorEvidence.biStatus === 'passed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedLoad.biologicalIndicatorEvidence.biStatus === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {selectedLoad.biologicalIndicatorEvidence.biStatus === 'passed'
                        ? 'سالب للنمو (Pass)'
                        : selectedLoad.biologicalIndicatorEvidence.biStatus === 'failed'
                        ? 'إيجابي ميكروبي (Fail)'
                        : 'قيد الحضانة السريعة'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">رقم تشغيلة أنبوب الحضانة (Lot #):</span>
                      <strong className="font-mono text-slate-800">
                        {selectedLoad.biologicalIndicatorEvidence.biVialLot}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">فحص التحكم الإيجابي:</span>
                      <strong className="text-emerald-700">مطابق (Control Positive Verified)</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleSimulateBIResult('passed')}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-1.5 px-3 rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-colors"
                    >
                      محاكاة نتيجة سالبة (سليم 30 Min Pass)
                    </button>
                    <button
                      onClick={() => handleSimulateBIResult('failed')}
                      className="bg-red-100 hover:bg-red-200 text-red-800 py-1.5 px-3 rounded-lg text-xs font-bold border border-red-300 cursor-pointer transition-colors"
                    >
                      محاكاة تلوث إيجابي (Fail)
                    </button>
                  </div>
                </div>

                {/* Release Sign-off Details */}
                {selectedLoad.releaseDecision.decision === 'released' && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1">
                    <div className="font-bold text-emerald-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>بيانات الاعتماد السريري والإفراج:</span>
                    </div>
                    <div className="text-[11px] text-emerald-800 flex items-center gap-4">
                      <span>المعتمد: <strong>{selectedLoad.releaseDecision.releasedBy}</strong></span>
                      <span>وقت الإفراج: <strong>{selectedLoad.releaseDecision.releaseTimestamp}</strong></span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
              اختر دورة معقم للمتابعة
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
