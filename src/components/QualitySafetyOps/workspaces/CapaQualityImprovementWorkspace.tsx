import React, { useState } from 'react';
import {
  CapaItem,
  QualityIndicatorKpi,
  FocusPdcaProject,
  ControlHierarchyType,
  CapaType,
  QpsPersona,
  QpsActivityLog
} from '../../../types/qualitySafetyOps';
import { validateAndCreateCapa } from '../../../utils/qualitySafetyEngine';
import {
  GitBranch,
  BarChart3,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertTriangle,
  Plus,
  ShieldCheck,
  Search,
  Filter,
  User,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react';

interface Props {
  capas: CapaItem[];
  setCapas: React.Dispatch<React.SetStateAction<CapaItem[]>>;
  kpis: QualityIndicatorKpi[];
  pdcaProjects: FocusPdcaProject[];
  activePersona: QpsPersona;
  onAddActivityLog: (log: QpsActivityLog) => void;
}

export const CapaQualityImprovementWorkspace: React.FC<Props> = ({
  capas,
  setCapas,
  kpis,
  pdcaProjects,
  activePersona,
  onAddActivityLog
}) => {
  const [subTab, setSubTab] = useState<'capa' | 'kpis' | 'pdca'>('capa');
  const [searchQuery, setSearchQuery] = useState('');
  const [hierarchyFilter, setHierarchyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [showNewCapaModal, setShowNewCapaModal] = useState(false);
  const [selectedCapaId, setSelectedCapaId] = useState<string>(capas[0]?.id || '');

  // New CAPA state
  const [newTitle, setNewTitle] = useState('');
  const [newOwner, setNewOwner] = useState('أ. سارة العتيبي (أخصائي سلامة المرضى)');
  const [newDueDate, setNewDueDate] = useState('2025-11-15');
  const [newHierarchy, setNewHierarchy] = useState<ControlHierarchyType>('strong_forcing_function');
  const [newType, setNewType] = useState<CapaType>('corrective');
  const [newDescription, setNewDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const selectedCapa = capas.find(c => c.id === selectedCapaId) || capas[0];

  // Filters for CAPA
  const filteredCapas = capas.filter(c => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.capaCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.actionOwner.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesHierarchy = hierarchyFilter === 'all' || c.controlHierarchy === hierarchyFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

    return matchesSearch && matchesHierarchy && matchesStatus;
  });

  const getHierarchyBadge = (hierarchy: ControlHierarchyType) => {
    switch (hierarchy) {
      case 'strong_forcing_function':
        return { label: 'ضابط هندسي إلزامي (Strong Forcing Function)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold' };
      case 'intermediate_standardized_process':
        return { label: 'إجراء معياري / قائمة تحقق (Intermediate Checklist)', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'weak_training_policy':
      default:
        return { label: 'تحديث سياسة / تدريب (Weak Policy/Training)', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    }
  };

  const handleCreateCapa = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const result = validateAndCreateCapa(
      {
        title: newTitle,
        titleAr: newTitle,
        actionOwner: newOwner,
        dueDate: newDueDate,
        controlHierarchy: newHierarchy,
        type: newType,
        description: newDescription
      },
      activePersona
    );

    if (!result.success || !result.capa) {
      setFormError(result.error || 'حدث خطأ في التحقق من البيانات');
      return;
    }

    setCapas(prev => [result.capa!, ...prev]);
    setSelectedCapaId(result.capa.id);
    if (result.activityLog) onAddActivityLog(result.activityLog);

    setShowNewCapaModal(false);
    setNewTitle('');
    setNewDescription('');
  };

  return (
    <div className="space-y-4">
      {/* 1. Header with Subtabs Switcher */}
      <div className="bg-white rounded-3xl border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('capa')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === 'capa'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>الإجراءات التصحيحية والوقائية (CAPA Tracker)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/40 text-white font-mono">
              {capas.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('kpis')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === 'kpis'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>مؤشرات الجودة الوطنية (CBAHI Quality KPIs)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/40 text-white font-mono">
              {kpis.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('pdca')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === 'pdca'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>مشاريع التحسين (FOCUS-PDCA Projects)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/40 text-white font-mono">
              {pdcaProjects.length}
            </span>
          </button>
        </div>

        {subTab === 'capa' && (
          <button
            onClick={() => setShowNewCapaModal(true)}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إنشاء إجراء CAPA جديد</span>
          </button>
        )}
      </div>

      {/* 2. SUBTAB: CAPA Tracker */}
      {subTab === 'capa' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column (5 Cols): List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-white rounded-3xl border border-slate-200 p-3.5 shadow-xs">
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="بحث برمز CAPA، المسؤول، العنوان..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              {/* Hierarchy filters */}
              <div className="flex flex-wrap gap-1 text-[11px] pb-2 border-b border-slate-100">
                <button
                  onClick={() => setHierarchyFilter('all')}
                  className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer transition-all ${
                    hierarchyFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  الكل
                </button>
                <button
                  onClick={() => setHierarchyFilter('strong_forcing_function')}
                  className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer transition-all ${
                    hierarchyFilter === 'strong_forcing_function' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  ضوابط قوية (Forcing)
                </button>
                <button
                  onClick={() => setHierarchyFilter('intermediate_standardized_process')}
                  className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer transition-all ${
                    hierarchyFilter === 'intermediate_standardized_process' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  إجراءات معيارية
                </button>
              </div>

              {/* List items */}
              <div className="space-y-2 mt-2 max-h-[520px] overflow-y-auto pr-1">
                {filteredCapas.map(capa => {
                  const isSelected = capa.id === selectedCapa?.id;
                  const hierarchyInfo = getHierarchyBadge(capa.controlHierarchy);

                  return (
                    <div
                      key={capa.id}
                      onClick={() => setSelectedCapaId(capa.id)}
                      className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-mono text-xs font-bold text-slate-900">{capa.capaCode}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${hierarchyInfo.color}`}>
                          {capa.controlHierarchy === 'strong_forcing_function' ? 'قوي (Forcing)' : 'معياري (Standard)'}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-slate-800 line-clamp-1 mt-1">
                        {capa.titleAr || capa.title}
                      </div>

                      <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                        <span>المسؤول: {capa.actionOwner.split(' ')[0]}</span>
                        <span>الاستحقاق: {capa.dueDate}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column (7 Cols): Selected CAPA Detail */}
          <div className="lg:col-span-7">
            {selectedCapa ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                        {selectedCapa.capaCode}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getHierarchyBadge(selectedCapa.controlHierarchy).color}`}>
                        {getHierarchyBadge(selectedCapa.controlHierarchy).label}
                      </span>
                    </div>
                    <h2 className="text-sm font-bold text-slate-900 mt-1.5">
                      {selectedCapa.titleAr || selectedCapa.title}
                    </h2>
                  </div>

                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl">
                    حالة الإجراء: {selectedCapa.status === 'implemented' ? 'تم التنفيذ' : selectedCapa.status === 'effectiveness_verified' ? 'تم التحقق من الأثر' : 'قيد المتابعة'}
                  </span>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">المسؤول عن التنفيذ:</div>
                    <div className="font-semibold text-slate-800">{selectedCapa.actionOwner}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">القسم المعني:</div>
                    <div className="font-semibold text-slate-800">{selectedCapa.ownerDepartment}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">تاريخ الاستحقاق:</div>
                    <div className="font-semibold text-slate-800">{selectedCapa.dueDate}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">مراجعة الفاعلية:</div>
                    <div className="font-semibold text-slate-800">{selectedCapa.effectivenessReviewDate}</div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-slate-700">الهدف ونطاق الإجراء التصحيحي:</div>
                  <p className="text-slate-700 bg-slate-50/70 p-3 rounded-2xl border border-slate-200 leading-relaxed">
                    {selectedCapa.description}
                  </p>
                </div>

                {/* Action steps */}
                <div className="space-y-1.5 text-xs">
                  <div className="font-bold text-slate-800">خطوات التنفيذ المحددة (Action Steps):</div>
                  <div className="space-y-1">
                    {selectedCapa.actionSteps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="text-slate-800">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Effectiveness Outcome Audit */}
                {selectedCapa.effectivenessAuditNotes && (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>تدقيق قياس الأثر والفاعلية (Effectiveness Verification):</span>
                    </div>
                    <p className="text-emerald-800 text-[11px] leading-relaxed">
                      {selectedCapa.effectivenessAuditNotes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
                يرجى اختيار إجراء تصحيحي للاطلاع على خطوات المتابعة
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SUBTAB: CBAHI KPIs Dashboard */}
      {subTab === 'kpis' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {kpis.map(kpi => (
              <div
                key={kpi.id}
                className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] font-bold text-slate-500">{kpi.code}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      kpi.status === 'target_met'
                        ? 'bg-emerald-100 text-emerald-800'
                        : kpi.status === 'variance_warning'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {kpi.status === 'target_met' ? 'المستهدف محقق' : 'انحراف بسيط'}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{kpi.nameAr}</h4>
                  <div className="text-[10px] text-slate-400 mt-0.5">{kpi.name}</div>
                </div>

                <div className="flex items-end justify-between pt-2 border-t border-slate-100">
                  <div>
                    <div className="text-[10px] text-slate-400">القيمة الحالية ({kpi.unit}):</div>
                    <div className="text-2xl font-black text-slate-900">{kpi.currentPeriodValue}</div>
                  </div>
                  <div className="text-left text-xs">
                    <div className="text-[10px] text-slate-400">المستهدف الوطني:</div>
                    <div className="font-bold text-teal-700 font-mono">{kpi.benchmarkTarget} {kpi.unit}</div>
                  </div>
                </div>

                {/* Historical mini bar sparkline */}
                <div className="space-y-1">
                  <div className="text-[9px] text-slate-400 font-bold">المسار التاريخي (آخر 5 أشهر):</div>
                  <div className="flex items-end gap-1.5 h-10 pt-1">
                    {kpi.historicalData.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                        <div
                          className="w-full bg-teal-500 rounded-t-sm"
                          style={{ height: `${Math.min(100, (d.value / (kpi.benchmarkTarget * 1.3)) * 32)}px` }}
                        />
                        <span className="text-[8px] text-slate-400">{d.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SUBTAB: FOCUS-PDCA Projects */}
      {subTab === 'pdca' && (
        <div className="space-y-3">
          {pdcaProjects.map(proj => (
            <div
              key={proj.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg">
                    {proj.code}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{proj.titleAr}</h3>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">قائد المشروع: <strong className="text-slate-800">{proj.teamLeader}</strong></span>
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-purple-100 text-purple-800 border border-purple-200 uppercase">
                    مرحلة: {proj.stage}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>نسبة إنجاز خطة العمل:</span>
                  <span className="font-bold text-slate-900 font-mono">{proj.currentProgressPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-600 rounded-full transition-all"
                    style={{ width: `${proj.currentProgressPercent}%` }}
                  />
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                <div>
                  <div className="text-[10px] text-slate-400">المؤشر المستهدف:</div>
                  <div className="font-bold text-slate-800">{proj.targetMetric}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">خط الأساس (Baseline):</div>
                  <div className="font-bold text-slate-800">{proj.baselineValue}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">المستهدف المرجو (Target):</div>
                  <div className="font-bold text-teal-700">{proj.targetValue}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Modal: Add New CAPA */}
      {showNewCapaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-5 shadow-2xl text-right max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
                <Plus className="w-4 h-4 text-teal-600" />
                <span>إنشاء إجراء تصحيحي/وقائي جديد (CAPA Item)</span>
              </div>
              <button
                onClick={() => setShowNewCapaModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-xl text-xs font-bold mt-2">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateCapa} className="space-y-3 mt-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">عنوان الإجراء التصحيحي:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تطبيق الإيقاف الإلزامي للتحقق المزدوج أو لوحات العد..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">تسلسل ضوابط التحكم (Hierarchy):</label>
                  <select
                    value={newHierarchy}
                    onChange={e => setNewHierarchy(e.target.value as ControlHierarchyType)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="strong_forcing_function">ضابط إلزامي قوي (Forcing Function)</option>
                    <option value="intermediate_standardized_process">إجراء معياري / قائمة تحقق (Checklist)</option>
                    <option value="weak_training_policy">تحديث سياسة / تدريب (Policy/Training)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">نوع الإجراء:</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as CapaType)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="corrective">إجراء تصحيحي (Corrective)</option>
                    <option value="preventive">إجراء وقائي (Preventive)</option>
                    <option value="quality_improvement">تحسين جودة (Quality Improvement)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">المسؤول عن التنفيذ (Action Owner):</label>
                  <input
                    type="text"
                    required
                    value={newOwner}
                    onChange={e => setNewOwner(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">تاريخ الاستحقاق (Due Date):</label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={e => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">شرح وتفاصيل خطة التدخل:</label>
                <textarea
                  rows={3}
                  placeholder="حدد ما هي التغييرات في النظام أو الآليات المتبعة لضمان عدم التكرار..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewCapaModal(false)}
                  className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  حفظ وتفعيل الإجراء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
