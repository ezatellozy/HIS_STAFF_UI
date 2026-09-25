import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flame,
  ShieldCheck,
  RotateCcw,
  Wrench,
  Eye,
  Activity,
  Check
} from 'lucide-react';
import {
  CSSDOpsState,
  CSSDReusableSetInstance,
  WasherDisinfectorCycleRecord,
  CSSDEquipmentReference
} from '../../../types/cssdOps';
import { executeCleaningCycle, evaluateInspectionResult } from '../../../utils/cssdWorkflowEngine';

interface CleaningInspectionWorkspaceProps {
  state: CSSDOpsState;
  onUpdateSetInstance: (set: CSSDReusableSetInstance) => void;
  onAddWasherCycle: (cycle: WasherDisinfectorCycleRecord) => void;
  onAddAuditLog: (action: string, entityId: string, description: string) => void;
}

export const CleaningInspectionWorkspace: React.FC<CleaningInspectionWorkspaceProps> = ({
  state,
  onUpdateSetInstance,
  onAddWasherCycle,
  onAddAuditLog
}) => {
  const [selectedSetId, setSelectedSetId] = useState<string>(
    state.setInstances[0]?.id || ''
  );
  const [selectedWasherId, setSelectedWasherId] = useState<string>(
    state.equipmentList.find(e => e.category === 'washer_disinfector')?.id || ''
  );
  const [cleaningStatusFeedback, setCleaningStatusFeedback] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);

  const selectedSet = state.setInstances.find(s => s.id === selectedSetId);
  const selectedWasher = state.equipmentList.find(e => e.id === selectedWasherId);

  // 1. Run Mechanical Washer Cycle
  const handleRunWasherCycle = (simulatedOutcome: 'pass' | 'fail_thermal') => {
    if (!selectedSet || !selectedWasher) return;

    const result = executeCleaningCycle(selectedWasher, selectedSet, {
      applicableStandard: 'ISO 15883-2:2024 (Critical/Semi-Critical Surgical)',
      programProfile: 'Surgical Instruments Thermal Disinfection A0>=3000',
      temperatureCelsius: simulatedOutcome === 'pass' ? 93.4 : 78.0,
      disinfectionTimeSeconds: simulatedOutcome === 'pass' ? 300 : 40,
      a0Calculated: simulatedOutcome === 'pass' ? 3150 : 420,
      cycleEvidencePresent: true,
      cycleStatus: simulatedOutcome
    });

    if (!result.isValid) {
      setCleaningStatusFeedback({
        type: 'error',
        msg: result.blockReasonAr || 'فشل دورة التطهير الحراري'
      });
      if (result.updatedEntity) onUpdateSetInstance(result.updatedEntity);
      onAddAuditLog('WASHER_CYCLE_FAILED', selectedSet.id, result.blockReasonAr || 'فشل دورة الغسيل والتطهير الحراري');
      return;
    }

    if (result.updatedEntity) {
      onUpdateSetInstance(result.updatedEntity);
    }

    // Add washer cycle record
    const newWasherCycle: WasherDisinfectorCycleRecord = {
      id: `WASH-CYC-${Date.now().toString().slice(-4)}`,
      equipmentId: selectedWasher.id,
      equipmentName: selectedWasher.nameAr,
      applicableStandard: 'ISO 15883-2:2024 (Critical/Semi-Critical Surgical)',
      cycleProfile: 'ISO 15883 Standard Surgical Thermal Disinfection A0=3000',
      targetA0Profile: 3000,
      startTime: new Date().toLocaleTimeString('ar-EG'),
      endTime: new Date(Date.now() + 45 * 60000).toLocaleTimeString('ar-EG'),
      operatorId: 'USR-OP-CURRENT',
      operatorName: 'فني التطهير والتعقيم',
      status: 'completed_pass',
      maxTempReachedCelsius: 93.4,
      disinfectionHoldTimeSeconds: 300,
      a0CalculatedValue: 3150,
      detergentLotNumber: 'LOT-ENZY-9022',
      enzymeWashVerified: true,
      thermalDisinfectionVerified: true,
      cycleEvidencePresent: true,
      includedSetInstanceIds: [selectedSet.id],
      notes: 'دورة غسيل وتطهير حراري ناجحة مستوفية لمعايير ISO 15883-2:2024 القياسية (A0 > 3000)'
    };
    onAddWasherCycle(newWasherCycle);

    setCleaningStatusFeedback({
      type: 'success',
      msg: 'تم إتمام دورة الغسيل والتطهير الحراري بنجاح (A0 > 3000) ونقل الطقم إلى منطقة الفحص النظيفة'
    });
    onAddAuditLog('WASHER_CYCLE_PASSED', selectedSet.id, `اجتياز دورة التطهير الحراري A0=3150 على ${selectedWasher.nameAr}`);
  };

  // 2. Inspection Decision
  const handleInspectionDecision = (
    finding: 'clean_functional' | 'visible_residual_soil' | 'corrosion_crack_damage' | 'blunt_malaligned'
  ) => {
    if (!selectedSet) return;

    const result = evaluateInspectionResult(selectedSet, finding);

    if (!result.isValid) {
      setCleaningStatusFeedback({
        type: 'error',
        msg: result.blockReasonAr || 'فشل فحص النظافة والوظيفة'
      });
      if (result.updatedEntity) onUpdateSetInstance(result.updatedEntity);
      onAddAuditLog('INSPECTION_FAILED', selectedSet.id, result.blockReasonAr || 'رفض الطقم بفحص النظافة');
      return;
    }

    if (result.updatedEntity) {
      onUpdateSetInstance(result.updatedEntity);
    }

    setCleaningStatusFeedback({
      type: 'success',
      msg: 'تم اجتياز الفحص البصري والوظيفي بنجاح وتأكيد خلو الأدوات من أي بقايا شوائب أو تلفيات'
    });
    onAddAuditLog('INSPECTION_PASSED', selectedSet.id, 'اجتياز فحص النظافة والوظيفة بنجاح ونقله لمرحلة التجميع');
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Cleaning & Inspection Zoning */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <strong className="text-amber-900 block font-bold">
              محطة التطهير الآلي والفحص المجهري (Washer Thermal Disinfection & Microscopic Inspection)
            </strong>
            <span className="text-amber-700 text-[11px]">
              التنظيف لا يعادل التطهير، والتطهير لا يعادل التعقيم. يجب التحقق من قيمة A0 ≥ 3000 وفحص خلو الأدوات من الدم والصدأ والتلف العزلي تحت العدسة المكبرة.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px] font-mono">
            المنطقة النظيفة (Clean Inspection Zone)
          </span>
        </div>
      </div>

      {cleaningStatusFeedback && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
            cleaningStatusFeedback.type === 'error'
              ? 'bg-red-100 border-red-300 text-red-900'
              : 'bg-emerald-100 border-emerald-300 text-emerald-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {cleaningStatusFeedback.type === 'error' ? (
              <XCircle className="w-4 h-4 text-red-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
            <span className="font-bold">{cleaningStatusFeedback.msg}</span>
          </div>
          <button
            onClick={() => setCleaningStatusFeedback(null)}
            className="text-xs font-bold underline cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Main Grid: Set Instances in Decon / Clean & Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Set Instances List */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
          <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Search className="w-4 h-4 text-teal-600" />
              <span>أطقم قيد الغسيل والتطهير والفحص ({state.setInstances.length})</span>
            </h3>
            <span className="text-[10px] text-slate-500">اختر طقماً للمتابعة</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {state.setInstances.map(set => {
              const isSelected = set.id === selectedSetId;
              return (
                <div
                  key={set.id}
                  onClick={() => {
                    setSelectedSetId(set.id);
                    setCleaningStatusFeedback(null);
                  }}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isSelected ? 'bg-amber-50/80 border-r-4 border-r-amber-500' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-black text-slate-900">{set.id}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        set.decontaminationStatus === 'cleaning_passed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : set.decontaminationStatus === 'cleaning_failed_reclean_required'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {set.decontaminationStatus === 'cleaning_passed'
                        ? 'تطهير ناجح'
                        : set.decontaminationStatus === 'cleaning_failed_reclean_required'
                        ? 'مرفوض - إعادة تنظيف'
                        : 'بانتظار الغسيل'}
                    </span>
                  </div>

                  <div className="font-bold text-xs text-slate-800 mb-1">{set.setNameAr}</div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>الرقم التسلسلي: <strong className="font-mono">{set.serialNumber}</strong></span>
                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded text-[10px]">
                      {set.currentZoningArea === 'dirty_decontamination' ? 'المنطقة القذرة' : 'المنطقة النظيفة'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Decontamination & Microscopic Inspection Workbench */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
          {selectedSet ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{selectedSet.setNameAr}</h3>
                    <span className="text-xs font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                      {selectedSet.id}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    كود التعريف: {selectedSet.serialNumber} • المنطقة الحالية:{' '}
                    {selectedSet.currentZoningArea}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                {/* 1. Washer-Disinfector Execution Section */}
                <div className="border border-slate-200 rounded-xl p-3.5 space-y-3 bg-slate-50/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-600" />
                      <h4 className="font-bold text-xs text-slate-900">
                        1. دورة الغسيل والتطهير الحراري الميكانيكي (ISO 15883 Washer-Disinfector)
                      </h4>
                    </div>
                    <select
                      value={selectedWasherId}
                      onChange={e => setSelectedWasherId(e.target.value)}
                      className="text-xs border border-slate-300 rounded-lg p-1 font-bold bg-white text-slate-800"
                    >
                      {state.equipmentList
                        .filter(e => e.category === 'washer_disinfector')
                        .map(w => (
                          <option key={w.id} value={w.id}>
                            {w.nameAr} ({w.operationalStatus})
                          </option>
                        ))}
                    </select>
                  </div>

                  <p className="text-[11px] text-slate-600">
                    تتضمن الدورة: غسيل مبدئي بماء بارد • غسيل إنزيمي بماء دافئ • تطهير حراري بدرجة حرارة 90-93°C لمدة 5 دقائق لتحقيق معامل التطهير A0 ≥ 3000 • تجفيف بالهواء المعقم HEPA.
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleRunWasherCycle('pass')}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>محاكاة دورة غسيل ناجحة (A0 = 3150 Pass)</span>
                    </button>
                    <button
                      onClick={() => handleRunWasherCycle('fail_thermal')}
                      className="bg-red-100 hover:bg-red-200 text-red-800 py-2 px-3 rounded-lg text-xs font-bold border border-red-300 cursor-pointer transition-colors"
                      title="محاكاة انخفاض درجة الحرارة أو انقطاع المعقم الحراري"
                    >
                      فشل A0 الحراري (Fail)
                    </button>
                  </div>
                </div>

                {/* 2. Microscopic Inspection & Functional Testing Section */}
                <div className="border border-slate-200 rounded-xl p-3.5 space-y-3 bg-slate-50/40">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-teal-600" />
                    <h4 className="font-bold text-xs text-slate-900">
                      2. الفحص المجهري واختبار العزل والمفاصل (Microscopic & Functional Inspection)
                    </h4>
                  </div>

                  <p className="text-[11px] text-slate-600">
                    الفحص البصري الدقيق تحت عدسة مكبرة مضيئة 5X: التحقق من نظافة المفاصل، سلامة سنون الملاقط، عدم وجود صدمات، واختبار العزل الكهربائي للأدوات الجراحية أحادية وثنائية القطب.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleInspectionDecision('clean_functional')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>نظيف ومطابق وظيفياً (Pass)</span>
                    </button>

                    <button
                      onClick={() => handleInspectionDecision('visible_residual_soil')}
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                      title="إعادة الطقم فوراً للمنطقة القذرة"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>رواسب شوائب مرئية (إعادة للغسيل القذر)</span>
                    </button>

                    <button
                      onClick={() => handleInspectionDecision('corrosion_crack_damage')}
                      className="bg-amber-600 hover:bg-amber-700 text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>تلف أو تآكل (إحالة للهندسة الطبية)</span>
                    </button>

                    <button
                      onClick={() => handleInspectionDecision('blunt_malaligned')}
                      className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>انحراف أسنان الملقط (استبعاد)</span>
                    </button>
                  </div>
                </div>

                {/* Current State Summary */}
                <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                  <span className="font-bold text-slate-800 block">حالة الطقم الحالية بالمنظومة:</span>
                  <div className="flex items-center gap-4 text-[11px] text-slate-600">
                    <span>حالة التطهير: <strong>{selectedSet.decontaminationStatus}</strong></span>
                    <span>حالة الفحص: <strong>{selectedSet.inspectionStatus}</strong></span>
                    <span>حالة التجميع: <strong>{selectedSet.assemblyStatus}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
              اختر طقماً للمتابعة
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
