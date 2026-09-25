import React, { useState } from 'react';
import {
  Layers,
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  Barcode,
  ArrowRight,
  Info,
  Check
} from 'lucide-react';
import {
  CSSDOpsState,
  CSSDReusableSetInstance,
  InstrumentSetDefinition,
  CSSDPackageRecord,
  PackagingMethod,
  ReprocessingMethodCategory
} from '../../../types/cssdOps';
import { verifySetAssembly, createSterilizationPackage } from '../../../utils/cssdWorkflowEngine';

interface AssemblyPackagingWorkspaceProps {
  state: CSSDOpsState;
  onUpdateSetInstance: (set: CSSDReusableSetInstance) => void;
  onAddPackage: (pkg: CSSDPackageRecord) => void;
  onAddAuditLog: (action: string, entityId: string, description: string) => void;
}

export const AssemblyPackagingWorkspace: React.FC<AssemblyPackagingWorkspaceProps> = ({
  state,
  onUpdateSetInstance,
  onAddPackage,
  onAddAuditLog
}) => {
  const [selectedSetId, setSelectedSetId] = useState<string>(
    state.setInstances[0]?.id || ''
  );
  const [selectedPackagingMethod, setSelectedPackagingMethod] = useState<PackagingMethod>(
    'rigid_container_with_filter'
  );
  const [intendedProcessMethod, setIntendedProcessMethod] = useState<ReprocessingMethodCategory>(
    'steam_sterilization'
  );
  const [simulateMissingPart, setSimulateMissingPart] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'warning';
    msg: string;
  } | null>(null);

  const selectedSet = state.setInstances.find(s => s.id === selectedSetId);
  const setDefinition = state.setDefinitions.find(
    d => d.id === selectedSet?.setDefinitionId
  ) || state.setDefinitions[0];

  // 1. Verify Assembly Completeness
  const handleVerifyAssembly = () => {
    if (!selectedSet || !setDefinition) return;

    // Available items simulated:
    const availableItemIds = simulateMissingPart
      ? setDefinition.components.slice(1).map(c => c.componentId) // Omit the first essential tool!
      : setDefinition.components.map(c => c.componentId);

    const result = verifySetAssembly(selectedSet, setDefinition, availableItemIds);

    if (!result.isValid) {
      setFeedback({
        type: 'error',
        msg: result.blockReasonAr || 'الطقم غير مكتمل - أدوات أساسية مفقودة'
      });
      if (result.updatedEntity) onUpdateSetInstance(result.updatedEntity);
      onAddAuditLog('ASSEMBLY_INCOMPLETE_BLOCK', selectedSet.id, result.blockReasonAr || 'حظر تجميع طقم غير مكتمل');
      return;
    }

    if (result.updatedEntity) {
      onUpdateSetInstance(result.updatedEntity);
    }

    setFeedback({
      type: 'success',
      msg: 'تم تأكيد اكتمال جميع مكونات الطقم الجراحي ومطابقتها لوصفة الطقم الرسمية بنجاح'
    });
    onAddAuditLog('SET_ASSEMBLY_VERIFIED', selectedSet.id, `تأكيد تجميع الطقم الجراحي ${selectedSet.setNameAr} كاملاً`);
  };

  // 2. Package & Apply Indicators
  const handlePackageAndApplyIndicators = () => {
    if (!selectedSet || !setDefinition) return;

    const result = createSterilizationPackage(
      selectedSet,
      setDefinition,
      selectedPackagingMethod,
      intendedProcessMethod,
      'أخصائي التغليف المعقم'
    );

    if (!result.isValid) {
      setFeedback({
        type: 'error',
        msg: result.blockReasonAr || 'تعارض في التغليف ومسار التعقيم'
      });
      onAddAuditLog('PACKAGING_CONFLICT_BLOCK', selectedSet.id, result.blockReasonAr || 'حظر تغليف غير متوافق');
      return;
    }

    if (result.updatedEntity) {
      onAddPackage(result.updatedEntity);
      const updatedSet: CSSDReusableSetInstance = {
        ...selectedSet,
        currentZoningArea: 'packaging_preparation',
        packagingStatus: 'packaged_pending_load',
        currentPackageId: result.updatedEntity.id
      };
      onUpdateSetInstance(updatedSet);
    }

    setFeedback({
      type: 'success',
      msg: `تم حزم وتغليف الطقم بنجاح (${result.updatedEntity?.id}) مع إدراج المؤشر الكيميائي التكاملي Class 5 والملصق الخارجي`
    });
    onAddAuditLog('PACKAGE_CREATED', result.updatedEntity?.id || 'PKG', `تغليف الطقم ${selectedSet.setNameAr} بطريقة ${selectedPackagingMethod}`);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Assembly & Indicator Packaging */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600 shrink-0" />
          <div>
            <strong className="text-blue-900 block font-bold">
              محطة التجميع والتغليف والمؤشرات الكيميائية (Assembly & Chemical Indicator Integration)
            </strong>
            <span className="text-blue-700 text-[11px]">
              التحقق الصارم من عدد الأدوات حسب القائمة المعيارية • إلزامية وضع مؤشر تكاملي Class 5 داخل كل صينية أو حاوية • التحقق من توافق الغلاف مع نظام التعقيم.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="bg-blue-200/80 text-blue-900 font-bold px-2 py-0.5 rounded text-[10px] font-mono">
            منطقة التجهيز (Packaging Prep Zone)
          </span>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
            feedback.type === 'error'
              ? 'bg-red-100 border-red-300 text-red-900'
              : feedback.type === 'warning'
              ? 'bg-amber-100 border-amber-300 text-amber-900'
              : 'bg-emerald-100 border-emerald-300 text-emerald-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'error' ? (
              <XCircle className="w-4 h-4 text-red-600" />
            ) : feedback.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
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

      {/* Main Grid: Set List & Assembly/Packaging Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Sets Ready for Assembly */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
          <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>الأطقم الجراحية للتجهيز ({state.setInstances.length})</span>
            </h3>
            <span className="text-[10px] text-slate-500">مرحلة التجميع</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {state.setInstances.map(set => {
              const isSelected = set.id === selectedSetId;
              return (
                <div
                  key={set.id}
                  onClick={() => {
                    setSelectedSetId(set.id);
                    setFeedback(null);
                  }}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isSelected ? 'bg-blue-50/80 border-r-4 border-r-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-black text-slate-900">{set.id}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        set.assemblyStatus === 'set_complete'
                          ? 'bg-emerald-100 text-emerald-800'
                          : set.assemblyStatus === 'set_incomplete_missing_parts'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {set.assemblyStatus === 'set_complete'
                        ? 'مكتمل التجميع'
                        : set.assemblyStatus === 'set_incomplete_missing_parts'
                        ? 'ناقص (مفقودات)'
                        : 'بانتظار التجميع'}
                    </span>
                  </div>

                  <div className="font-bold text-xs text-slate-800 mb-1">{set.setNameAr}</div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>التغليف: <strong className="font-mono">{set.packagingStatus}</strong></span>
                    {set.missingComponentsList.length > 0 && (
                      <span className="text-red-600 font-bold text-[10px]">
                        عجز: {set.missingComponentsList.length} أداة
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Assembly List & Packaging Controls */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
          {selectedSet && setDefinition ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{selectedSet.setNameAr}</h3>
                    <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {setDefinition.code}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    التصنيف: {setDefinition.serviceCategory} • إجمالي الأدوات الإلزامية: {setDefinition.totalInstrumentCount} أداة
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                {/* 1. Component Count & Completeness Verification */}
                <div className="border border-slate-200 rounded-xl p-3.5 space-y-3 bg-slate-50/40">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      <span>قائمة محتويات الطقم الإلزامية (Master Set Recipe)</span>
                    </h4>
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={simulateMissingPart}
                        onChange={e => setSimulateMissingPart(e.target.checked)}
                        className="rounded text-red-600"
                      />
                      <span className="text-[11px]">محاكاة نقص أداة إجبارية</span>
                    </label>
                  </div>

                  <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden bg-white text-xs">
                    {setDefinition.components.map((comp, idx) => (
                      <div key={comp.componentId} className="p-2 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-800">{comp.componentNameAr}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{comp.componentNameEn}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                            الكمية: {comp.requiredQuantity}
                          </span>
                          {simulateMissingPart && idx === 0 ? (
                            <span className="text-[10px] text-red-600 font-bold bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                              مفقود
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                              مكتمل
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleVerifyAssembly}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>التحقق من اكتمال الطقم واعتماد التجميع</span>
                  </button>
                </div>

                {/* 2. Packaging Method & Process Profile Compatibility */}
                <div className="border border-slate-200 rounded-xl p-3.5 space-y-3 bg-slate-50/40">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-600" />
                    <span>اختيار نوع التغليف ونظام التعقيم المستهدف</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-600 text-[11px] mb-1 font-bold">
                        طريقة التغليف المعتمدة:
                      </label>
                      <select
                        value={selectedPackagingMethod}
                        onChange={e => setSelectedPackagingMethod(e.target.value as PackagingMethod)}
                        className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800 font-bold"
                      >
                        <option value="rigid_container_with_filter">حاوية صلبة بفلتر دائم (Rigid Container)</option>
                        <option value="double_wrap_nonwoven">تغليف مزدوج غير منسوج (Double Non-Woven Wrap)</option>
                        <option value="peel_pouch_paper_plastic">كيس ورق/بلاستيك مقوى (Peel Pouch)</option>
                        <option value="tyvek_pouch_vhp">أكياس تايفك لبخار البلازما (Tyvek Pouch - VHP)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 text-[11px] mb-1 font-bold">
                        مسار التعقيم المستهدف:
                      </label>
                      <select
                        value={intendedProcessMethod}
                        onChange={e => setIntendedProcessMethod(e.target.value as ReprocessingMethodCategory)}
                        className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800 font-bold"
                      >
                        <option value="steam_sterilization">تعقيم بخاري عالي الحرارة (134°C Steam)</option>
                        <option value="low_temp_vhp_sterilization">تعقيم بلازما بيروكسيد الهيدروجين (VHP Low Temp)</option>
                        <option value="high_level_disinfection">تطهير عالي المستوى (HLD)</option>
                      </select>
                    </div>
                  </div>

                  {/* Indicator Affirmation */}
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs space-y-1">
                    <div className="font-bold text-purple-900 flex items-center justify-between">
                      <span>إلزامية المؤشرات الكيميائية التخصصية (Chemical Indicators)</span>
                      <span className="font-mono text-[10px] bg-purple-200 text-purple-900 px-2 py-0.5 rounded font-bold">
                        Class 5 Integrator Required
                      </span>
                    </div>
                    <p className="text-purple-800 text-[11px]">
                      يتم وضع مؤشر تكاملي كيميائي Class 5 في أعمق نقطة حرجة بالصينية لضمان وصول البخار، مع وضع شريط ملصق Class 1 خارج الحاوية.
                    </p>
                  </div>

                  <button
                    onClick={handlePackageAndApplyIndicators}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>تغليف الطقم وتوليد باركود العبوة وإدراج المؤشرات</span>
                  </button>
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
