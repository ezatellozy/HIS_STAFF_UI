import React, { useState } from 'react';
import {
  Flame,
  Plus,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Activity,
  Layers,
  ShieldAlert,
  Sliders,
  Check
} from 'lucide-react';
import {
  CSSDOpsState,
  SterilizerCycleRecord,
  CSSDPackageRecord,
  CSSDEquipmentReference,
  ReprocessingMethodCategory
} from '../../../types/cssdOps';
import { validatePackageInclusionInLoad } from '../../../utils/cssdWorkflowEngine';

interface SterilizationLoadsWorkspaceProps {
  state: CSSDOpsState;
  onAddSterilizerCycle: (cycle: SterilizerCycleRecord) => void;
  onUpdateSterilizerCycle: (cycle: SterilizerCycleRecord) => void;
  onAddAuditLog: (action: string, entityId: string, description: string) => void;
}

export const SterilizationLoadsWorkspace: React.FC<SterilizationLoadsWorkspaceProps> = ({
  state,
  onAddSterilizerCycle,
  onUpdateSterilizerCycle,
  onAddAuditLog
}) => {
  const [selectedLoadId, setSelectedLoadId] = useState<string>(
    state.sterilizerCycles[0]?.id || ''
  );
  const [selectedPackageToAdd, setSelectedPackageToAdd] = useState<string>(
    state.packages.find(p => p.currentStatus === 'packaged_pending_load')?.id || ''
  );
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);

  // New Load Modal state
  const [showNewLoadForm, setShowNewLoadForm] = useState<boolean>(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>(
    state.equipmentList.find(e => e.category === 'autoclave_steam')?.id || ''
  );
  const [isImplantLoad, setIsImplantLoad] = useState<boolean>(false);
  const [isIUSS, setIsIUSS] = useState<boolean>(false);
  const [iussJustification, setIussJustification] = useState<string>('');

  const selectedLoad = state.sterilizerCycles.find(c => c.id === selectedLoadId);
  const selectedEquipment = state.equipmentList.find(e => e.id === selectedEquipmentId);

  // 1. Create New Load
  const handleCreateNewLoad = () => {
    if (!selectedEquipment) return;

    if (isIUSS && !iussJustification.trim()) {
      setFeedback({
        type: 'error',
        msg: 'يلزم إدخال تبرير طبي/جراحي موثق لحالات التعقيم الفوري للطوارئ (IUSS)'
      });
      return;
    }

    const newLoad: SterilizerCycleRecord = {
      id: `STER-2026-CYC-${Date.now().toString().slice(-4)}`,
      sterilizerEquipmentId: selectedEquipment.id,
      sterilizerName: selectedEquipment.nameAr,
      sterilizerType: selectedEquipment.sterilizerType || 'prevacuum_steam',
      methodCategory: selectedEquipment.category === 'vhp_sterilizer' ? 'low_temp_vhp_sterilization' : 'steam_sterilization',
      cycleProfileName: isImplantLoad
        ? '134°C Pre-Vac 4 min with Implant PCD (ISO 17665)'
        : '134°C Pre-Vacuum 4 min Standard Steam Cycle',
      targetTempCelsius: 134.5,
      targetPressureBar: 2.15,
      exposureTimeMinutes: 4.0,
      operatorId: 'USR-OP-STER',
      operatorName: 'فني تشغيل المعقمات',
      startTime: new Date().toLocaleTimeString('ar-EG'),
      cycleStatus: 'cycle_scheduled',
      isIUSSException: isIUSS,
      iussDocumentation: isIUSS ? {
        urgentClinicalNeed: iussJustification,
        itemDeviceDescription: 'أداة جراحية عاجلة للعمليات',
        reasonJustification: iussJustification,
        operatingRoomDestination: 'مسرح العمليات 1',
        operatorStaff: 'فني تشغيل المعقمات',
        immediateUseContext: 'استخدام فوري',
        clinicalApprovalRef: 'APPROVAL-EMERGENCY-01'
      } : undefined,
      hasImplantTray: isImplantLoad,
      mechanicalParamEvidence: {
        passed: false,
        tempGraphVerified: false,
        pressureGraphVerified: false,
        vacuumLeakRateVerified: false,
        airRemovalTestRequired: selectedEquipment.airRemovalTestRequired,
        airRemovalTestPassed: selectedEquipment.bowieDickStatusToday === 'passed'
      },
      chemicalIndicatorEvidence: {
        passed: false,
        indicatorType: 'Class 5 Integrating',
        colorChangeVerified: false,
        requiredByPolicy: true
      },
      biologicalIndicatorEvidence: {
        isRequired: isImplantLoad,
        biVialLot: `BI-LOT-${Math.floor(1000 + Math.random() * 9000)}`,
        biStatus: 'pending',
        controlVialPositiveVerified: true,
        incubatorId: 'INC-AUTO-01',
        quarantinePendingResult: true
      },
      releaseDecision: {
        decision: 'pending_review'
      },
      includedPackageIds: []
    };

    onAddSterilizerCycle(newLoad);
    setSelectedLoadId(newLoad.id);
    setShowNewLoadForm(false);
    setFeedback({
      type: 'success',
      msg: `تم جدولة شحنة التعقيم الجديدة بنجاح (${newLoad.id}) على ${selectedEquipment.nameAr}`
    });
    onAddAuditLog('STERILIZATION_LOAD_SCHEDULED', newLoad.id, `جدولة شحنة تعقيم ${newLoad.id} مع مؤشرات الرقابة`);
  };

  // 2. Add Package to Selected Load
  const handleAddPackageToLoad = () => {
    if (!selectedLoad) return;
    const pkg = state.packages.find(p => p.id === selectedPackageToAdd);
    if (!pkg) {
      setFeedback({ type: 'error', msg: 'لم يتم العثور على العبوة المحددة' });
      return;
    }

    const result = validatePackageInclusionInLoad(pkg, selectedLoad, state.sterilizerCycles);

    if (!result.isValid) {
      setFeedback({
        type: 'error',
        msg: result.blockReasonAr || 'تعارض في إضافة العبوة للشحنة'
      });
      onAddAuditLog('PACKAGE_INCLUSION_BLOCKED', pkg.id, result.blockReasonAr || 'حظر إضافة عبوة للشحنة');
      return;
    }

    if (result.updatedEntity) {
      onUpdateSterilizerCycle(result.updatedEntity);
      setFeedback({
        type: 'success',
        msg: `تمت إضافة العبوة ${pkg.id} بنجاح إلى شحنة التعقيم ${selectedLoad.id}`
      });
      onAddAuditLog('PACKAGE_ADDED_TO_LOAD', pkg.id, `إضافة العبوة للشحنة ${selectedLoad.id}`);
    }
  };

  // 3. Simulate Running & Physical Sterilization
  const handleRunSimulation = () => {
    if (!selectedLoad) return;

    if (selectedLoad.includedPackageIds.length === 0) {
      setFeedback({
        type: 'error',
        msg: 'لا يمكن بدء دورة تعقيم بدون عبوات مضافة (شحنة فارغة)'
      });
      return;
    }

    const updated: SterilizerCycleRecord = {
      ...selectedLoad,
      cycleStatus: 'monitoring_pending',
      endTime: new Date().toLocaleTimeString('ar-EG'),
      mechanicalParamEvidence: {
        ...selectedLoad.mechanicalParamEvidence,
        passed: true,
        tempGraphVerified: true,
        pressureGraphVerified: true,
        vacuumLeakRateVerified: true
      },
      chemicalIndicatorEvidence: {
        ...selectedLoad.chemicalIndicatorEvidence,
        passed: true,
        colorChangeVerified: true
      }
    };

    onUpdateSterilizerCycle(updated);
    setFeedback({
      type: 'success',
      msg: `اكتملت المعالجة الفيزيائية بالمعقم بنجاح (${selectedLoad.id}) وانتقلت لمرحلة فحص أدلة الرقابة والإفراج`
    });
    onAddAuditLog('STERILIZATION_PHYSICAL_PASS', selectedLoad.id, 'اكتمال منحنى الحرارة والضغط الميكانيكي والمؤشرات الكيميائية');
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Sterilization Chamber Area */}
      <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-indigo-600 shrink-0" />
          <div>
            <strong className="text-indigo-900 block font-bold">
              غرفة المعقمات والشحنات المعتمدة (Sterilization Load Management & Exposure Phase)
            </strong>
            <span className="text-indigo-700 text-[11px]">
              توثيق الشحنات برقم دورة فريد • مطابقة ملف التغليف مع نظام المعقم • إلزامية فحص Bowie-Dick اليومي • منع إفراج الغرسات قبل نتيجة الحضانة الحيوية.
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowNewLoadForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>جدولة شحنة معقم جديدة</span>
        </button>
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

      {/* New Load Modal */}
      {showNewLoadForm && (
        <div className="bg-white rounded-xl border border-indigo-300 p-4 shadow-md space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="font-bold text-sm text-indigo-950 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>إعداد وتخصيص شحنة تعقيم جديدة</span>
            </h4>
            <button
              onClick={() => setShowNewLoadForm(false)}
              className="text-slate-400 hover:text-slate-600 font-bold"
            >
              إلغاء ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 text-[11px] mb-1 font-bold">
                المعقم المعتمد:
              </label>
              <select
                value={selectedEquipmentId}
                onChange={e => setSelectedEquipmentId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 font-bold bg-white text-slate-800"
              >
                {state.equipmentList
                  .filter(e => e.category === 'autoclave_steam' || e.category === 'vhp_sterilizer')
                  .map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.nameAr} ({eq.category})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex flex-col justify-end space-y-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={isImplantLoad}
                  onChange={e => setIsImplantLoad(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>تتضمن صواني غرسات (Implants) — يتطلب مؤشر بيولوجي وحجز إلزامي</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-red-800">
                <input
                  type="checkbox"
                  checked={isIUSS}
                  onChange={e => setIsIUSS(e.target.checked)}
                  className="rounded text-red-600"
                />
                <span>دورة تعقيم فوري للطوارئ (IUSS Exception)</span>
              </label>
            </div>
          </div>

          {isIUSS && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-1">
              <label className="block font-bold text-red-900 text-[11px]">
                مبرر IUSS الإلزامي (سقوط أداة طارئة بدون بديل بالعمليات):
              </label>
              <input
                type="text"
                value={iussJustification}
                onChange={e => setIussJustification(e.target.value)}
                placeholder="اكتب التبرير السريري المعتمد ورقم مسرح العمليات..."
                className="w-full border border-red-300 rounded-lg p-2 bg-white text-xs"
              />
            </div>
          )}

          <button
            onClick={handleCreateNewLoad}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>تأكيد إنشاء الشحنة وتعيين باركود الدورة</span>
          </button>
        </div>
      )}

      {/* Main Grid: Loads List & Load Configuration Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Sterilizer Cycles List */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
          <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-indigo-600" />
              <span>دفق شحنات المعقمات ({state.sterilizerCycles.length})</span>
            </h3>
            <span className="text-[10px] text-slate-500">اختر دورة للمتابعة</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {state.sterilizerCycles.map(cycle => {
              const isSelected = cycle.id === selectedLoadId;
              return (
                <div
                  key={cycle.id}
                  onClick={() => {
                    setSelectedLoadId(cycle.id);
                    setFeedback(null);
                  }}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isSelected ? 'bg-indigo-50/80 border-r-4 border-r-indigo-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-black text-slate-900">{cycle.id}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        cycle.cycleStatus === 'released'
                          ? 'bg-emerald-100 text-emerald-800'
                          : cycle.cycleStatus === 'monitoring_pending'
                          ? 'bg-purple-100 text-purple-800'
                          : cycle.cycleStatus === 'cycle_scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {cycle.cycleStatus === 'released'
                        ? 'مفرج عنها رسمياً'
                        : cycle.cycleStatus === 'monitoring_pending'
                        ? 'بانتظار الرقابة الحيوية'
                        : cycle.cycleStatus === 'cycle_scheduled'
                        ? 'مجدولة قيد التحميل'
                        : cycle.cycleStatus}
                    </span>
                  </div>

                  <div className="font-bold text-xs text-slate-800 mb-1">{cycle.sterilizerName}</div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>العبوات المحملة: <strong>{cycle.includedPackageIds.length}</strong></span>
                    {cycle.hasImplantTray && (
                      <span className="text-purple-700 bg-purple-50 border border-purple-200 px-1 rounded text-[10px] font-bold">
                        صواني غرسات
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Load Builder & Exposure Phase Execution */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
          {selectedLoad ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{selectedLoad.id}</h3>
                    <span className="text-xs font-mono bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                      {selectedLoad.sterilizerEquipmentId}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    الملف: {selectedLoad.cycleProfileName} • البخار: {selectedLoad.targetTempCelsius}°C / {selectedLoad.targetPressureBar} Bar
                  </span>
                </div>

                {selectedLoad.cycleStatus === 'cycle_scheduled' && (
                  <button
                    onClick={handleRunSimulation}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>تشغيل الدورة ومحاكاة البخار</span>
                  </button>
                )}
              </div>

              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                {/* Bowie-Dick Check Status for Autoclaves */}
                {selectedLoad.methodCategory === 'steam_sterilization' && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-teal-600" />
                      <div>
                        <strong className="text-slate-800 block">
                          اختبار تفريغ الهواء اليومي (Bowie-Dick Air Removal Test)
                        </strong>
                        <span className="text-slate-500 text-[11px]">
                          يجرى يومياً في أول دورة للتأكد من تفريغ الهواء بالكامل ونفاذية البخار
                        </span>
                      </div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                      ناجح اليوم (Passed Today)
                    </span>
                  </div>
                )}

                {/* Add Package to Load Section */}
                <div className="border border-slate-200 rounded-xl p-3.5 space-y-3 bg-slate-50/40">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center justify-between">
                    <span>العبوات الجراحية المحملة بالشحنة ({selectedLoad.includedPackageIds.length})</span>
                    <span className="text-[11px] text-slate-500">تحميل عربة المعقم</span>
                  </h4>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedPackageToAdd}
                      onChange={e => setSelectedPackageToAdd(e.target.value)}
                      className="flex-1 border border-slate-300 rounded-lg p-2 text-xs font-bold bg-white text-slate-800"
                    >
                      <option value="">-- اختر عبوة جاهزة للإضافة --</option>
                      {state.packages
                        .filter(p => p.currentStatus === 'packaged_pending_load')
                        .map(pkg => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.id} - {pkg.setNameAr} ({pkg.packagingMethod})
                          </option>
                        ))}
                    </select>

                    <button
                      onClick={handleAddPackageToLoad}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs font-bold shrink-0 cursor-pointer transition-colors"
                    >
                      إضافة للشحنة
                    </button>
                  </div>

                  <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden bg-white text-xs">
                    {selectedLoad.includedPackageIds.length === 0 ? (
                      <div className="p-4 text-center text-slate-400">
                        لا توجد عبوات محملة في هذه الشحنة بعد. اختر عبوة وأضفها أعلاه.
                      </div>
                    ) : (
                      selectedLoad.includedPackageIds.map(pkgId => {
                        const pkg = state.packages.find(p => p.id === pkgId);
                        return (
                          <div key={pkgId} className="p-2.5 flex items-center justify-between">
                            <div>
                              <strong className="font-mono text-slate-900 block">{pkgId}</strong>
                              <span className="text-[11px] text-slate-600">{pkg?.setNameAr || 'طقم جراحي'}</span>
                            </div>
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                              {pkg?.packagingMethod}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Evidence Status Summary */}
                <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-2">
                  <span className="font-bold text-slate-800 block">مؤشرات الرقابة والضمان:</span>
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">المنحنى الفيزيائي</span>
                      <strong className={selectedLoad.mechanicalParamEvidence.passed ? 'text-emerald-700' : 'text-slate-600'}>
                        {selectedLoad.mechanicalParamEvidence.passed ? 'ناجح (Verified)' : 'معلق'}
                      </strong>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">المؤشر الكيميائي 5</span>
                      <strong className={selectedLoad.chemicalIndicatorEvidence.passed ? 'text-emerald-700' : 'text-slate-600'}>
                        {selectedLoad.chemicalIndicatorEvidence.passed ? 'ناجح (Integrator)' : 'معلق'}
                      </strong>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">المؤشر البيولوجي (BI)</span>
                      <strong className={
                        selectedLoad.biologicalIndicatorEvidence.biStatus === 'passed'
                          ? 'text-emerald-700'
                          : selectedLoad.biologicalIndicatorEvidence.biStatus === 'pending'
                          ? 'text-purple-700'
                          : 'text-slate-600'
                      }>
                        {selectedLoad.biologicalIndicatorEvidence.biStatus}
                      </strong>
                    </div>
                  </div>
                </div>
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
