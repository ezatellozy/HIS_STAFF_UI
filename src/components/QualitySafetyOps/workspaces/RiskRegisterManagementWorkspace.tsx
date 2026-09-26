import React, { useState } from 'react';
import {
  RiskRegisterItem,
  RiskDomain,
  RiskLevel,
  RiskLikelihood,
  RiskConsequence,
  RiskTreatmentStrategy,
  RiskMatrixProfile,
  QpsPersona,
  QpsActivityLog
} from '../../../types/qualitySafetyOps';
import { calculateRiskScore, calculateProfileRiskScore } from '../../../utils/qualitySafetyEngine';
import { DEFAULT_RISK_MATRIX_PROFILES } from '../../../data/mockQualitySafetyData';
import {
  AlertOctagon,
  Shield,
  Layers,
  Search,
  Plus,
  Sliders,
  CheckCircle2,
  TrendingDown,
  Info,
  Building,
  Activity,
  ArrowRight,
  Eye,
  Filter,
  X
} from 'lucide-react';

interface Props {
  risks: RiskRegisterItem[];
  setRisks: React.Dispatch<React.SetStateAction<RiskRegisterItem[]>>;
  activePersona: QpsPersona;
  onAddActivityLog: (log: QpsActivityLog) => void;
  activeProfile?: RiskMatrixProfile;
  availableProfiles?: RiskMatrixProfile[];
  onSelectProfile?: (profile: RiskMatrixProfile) => void;
}

export const RiskRegisterManagementWorkspace: React.FC<Props> = ({
  risks,
  setRisks,
  activePersona,
  onAddActivityLog,
  activeProfile,
  availableProfiles,
  onSelectProfile
}) => {
  const profiles = availableProfiles || DEFAULT_RISK_MATRIX_PROFILES;
  const [currentProfile, setCurrentProfile] = useState<RiskMatrixProfile>(
    activeProfile || profiles[0]
  );

  const handleSwitchProfile = (p: RiskMatrixProfile) => {
    setCurrentProfile(p);
    if (onSelectProfile) onSelectProfile(p);
  };
  const [selectedRiskId, setSelectedRiskId] = useState<string>(risks[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  // Modals
  const [showNewRiskModal, setShowNewRiskModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDomain, setNewDomain] = useState<RiskDomain>('clinical');
  const [newLikelihood, setNewLikelihood] = useState<RiskLikelihood>(3);
  const [newConsequence, setNewConsequence] = useState<RiskConsequence>(4);
  const [newExistingControls, setNewExistingControls] = useState('');
  const [newMitigations, setNewMitigations] = useState('');
  const [newResidualLikelihood, setNewResidualLikelihood] = useState<RiskLikelihood>(2);
  const [newResidualConsequence, setNewResidualConsequence] = useState<RiskConsequence>(3);
  const [newStrategy, setNewStrategy] = useState<RiskTreatmentStrategy>('mitigate');
  const [newOwner, setNewOwner] = useState('مدير إدارة المخاطر واللجنة الطبية');

  const selectedRisk = risks.find(r => r.id === selectedRiskId) || risks[0];

  // Filters
  const filteredRisks = risks.filter(r => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.riskCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.riskOwner.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDomain = domainFilter === 'all' || r.domain === domainFilter;
    const matchesLevel = levelFilter === 'all' || r.inherentLevel === levelFilter || r.residualLevel === levelFilter;

    return matchesSearch && matchesDomain && matchesLevel;
  });

  const getLevelBadge = (level: RiskLevel) => {
    switch (level) {
      case 'extreme':
        return 'bg-red-600 text-white border-red-700';
      case 'high':
        return 'bg-orange-600 text-white border-orange-700';
      case 'medium':
        return 'bg-amber-500 text-slate-900 border-amber-600 font-bold';
      case 'low':
      default:
        return 'bg-emerald-600 text-white border-emerald-700';
    }
  };

  const getDomainLabel = (domain: RiskDomain) => {
    switch (domain) {
      case 'clinical':
        return 'سريري وطبي';
      case 'medication_safety':
        return 'سلامة الدواء';
      case 'infection_control':
        return 'مكافحة العدوى';
      case 'facilities_biomedical':
        return 'أجهزة ومرافق حيوية';
      case 'information_cyber':
        return 'أمن معلومات ومعلوماتية';
      case 'governance_regulatory':
        return 'حوكمة وامتثال';
      case 'operational':
      default:
        return 'تشغيلي عام';
    }
  };

  // Add new risk
  const handleCreateRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const inherent = calculateRiskScore(newLikelihood, newConsequence);
    const residual = calculateRiskScore(newResidualLikelihood, newResidualConsequence);

    const newRiskItem: RiskRegisterItem = {
      id: `risk-${Date.now()}`,
      riskCode: `RISK-${newDomain.substring(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      title: newTitle,
      titleAr: newTitle,
      description: newDescription,
      domain: newDomain,
      identifiedBy: activePersona.name,
      identifiedDate: new Date().toISOString().split('T')[0],
      activeMatrixProfileId: currentProfile.matrixId,
      inherentLikelihood: newLikelihood,
      inherentConsequence: newConsequence,
      inherentScore: inherent.score,
      inherentLevel: inherent.level,
      existingControls: newExistingControls ? [newExistingControls] : ['سياسات المستشفى العامة'],
      proposedMitigations: newMitigations ? [newMitigations] : ['تحديث الضوابط وتكثيف المراقبة'],
      residualLikelihood: newResidualLikelihood,
      residualConsequence: newResidualConsequence,
      residualScore: residual.score,
      residualLevel: residual.level,
      treatmentStrategy: newStrategy,
      riskOwner: newOwner,
      targetResolutionDate: '2025-12-31',
      status: 'active',
      keyRiskIndicators: [
        {
          name: 'معدل الحوادث المرتبطة بالخطر',
          nameAr: 'مؤشر تكرار الحدث',
          threshold: '< 2/شهر',
          currentValue: '1/شهر',
          status: 'normal'
        }
      ],
      lastReviewDate: new Date().toISOString().split('T')[0]
    };

    setRisks(prev => [newRiskItem, ...prev]);
    setSelectedRiskId(newRiskItem.id);

    onAddActivityLog({
      id: `ACT-RISK-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actorName: activePersona.name,
      actorRole: activePersona.roleTitleAr,
      action: `إدراج خطر جديد بسجل المخاطر: ${newRiskItem.riskCode}`,
      domain: 'risk',
      referenceId: newRiskItem.riskCode,
      details: `${newRiskItem.title} • الخطر الأصلي: ${newRiskItem.inherentScore} -> الخطر المتبقي: ${newRiskItem.residualScore}`
    });

    setShowNewRiskModal(false);
    setNewTitle('');
    setNewDescription('');
  };

  return (
    <div className="space-y-4">
      {/* 1. Heatmap & Dashboard Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Dynamic Configurable Matrix (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold text-slate-800">
                {currentProfile.nameAr}
              </h3>
            </div>

            {/* Profile Switcher Pills */}
            <div className="flex items-center gap-1">
              {profiles.map(p => (
                <button
                  key={p.matrixId}
                  onClick={() => handleSwitchProfile(p)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    currentProfile.matrixId === p.matrixId
                      ? 'bg-slate-900 text-teal-400 shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title={`${p.name} • ${p.policySource}`}
                >
                  {p.likelihoodLevels}×{p.impactLevels}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2 px-1">
            <span className="font-mono">الاحتمالية (1-{currentProfile.likelihoodLevels}) × الأثر (1-{currentProfile.impactLevels})</span>
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
              {currentProfile.status === 'illustrative_hospital_risk_profile'
                ? 'ملف استرشادي للمستشفى (Illustrative Profile)'
                : 'ملف سريري معتمد'}
            </span>
          </div>

          {/* Interactive Heatmap Table */}
          <div className="overflow-x-auto text-[11px]">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr>
                  <th className="p-1 text-slate-400 text-[10px] w-20">الاحتمالية ↓ / الأثر →</th>
                  {Array.from({ length: currentProfile.impactLevels }, (_, i) => i + 1).map(c => (
                    <th key={c} className="p-1 text-slate-600 font-bold">
                      {c === 5 ? '5: كارثي' : c === 4 ? '4: جسيم' : c === 3 ? '3: متوسط' : c === 2 ? '2: بسيط' : '1: طفيف'}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: currentProfile.likelihoodLevels }, (_, i) => currentProfile.likelihoodLevels - i).map(l => (
                  <tr key={l}>
                    <td className="p-1 text-slate-600 font-bold text-[10px] text-right whitespace-nowrap">
                      {l === 5 ? '5: شبه مؤكد' : l === 4 ? '4: مرجح' : l === 3 ? '3: محتمل' : l === 2 ? '2: نادر' : '1: نادر جداً'}
                    </td>
                    {Array.from({ length: currentProfile.impactLevels }, (_, i) => i + 1).map(c => {
                      const evaluated = calculateProfileRiskScore(l, c, currentProfile);
                      let bg = 'bg-emerald-100 text-emerald-800';
                      if (evaluated.level === 'extreme') bg = 'bg-red-500 text-white font-bold';
                      else if (evaluated.level === 'high') bg = 'bg-orange-500 text-white font-bold';
                      else if (evaluated.level === 'medium') bg = 'bg-yellow-300 text-slate-900 font-bold';

                      // Find how many risks sit in this cell (inherent)
                      const matchingRisks = risks.filter(
                        r => r.inherentLikelihood === l && r.inherentConsequence === c
                      );

                      return (
                        <td key={c} className="p-1">
                          <div
                            className={`h-9 rounded-xl flex items-center justify-center relative transition-transform hover:scale-105 shadow-2xs ${bg}`}
                            title={`درجة الخطر: ${evaluated.score} • النطاق: ${evaluated.bandLabelAr}`}
                          >
                            <span className="text-[10px] opacity-70 absolute top-1 right-1.5 font-mono">{evaluated.score}</span>
                            {matchingRisks.length > 0 && (
                              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                                {matchingRisks.length}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-100 gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {currentProfile.riskBands.map((band, idx) => (
                <span key={idx} className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: band.colorHex }}></span>
                  <span>{band.labelAr} ({band.minScore}-{band.maxScore})</span>
                </span>
              ))}
            </div>
            <span className="text-slate-400 font-mono text-[9px]">{currentProfile.policySource}</span>
          </div>
        </div>

        {/* Right: Quick Stats & Register Controls (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-teal-600" />
                <span>إحصائيات سجل المخاطر العام</span>
              </h3>
              <button
                onClick={() => setShowNewRiskModal(true)}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إدراج خطر جديد</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-400">إجمالي المخاطر المسجلة</div>
                <div className="text-lg font-black text-slate-800">{risks.length}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200">
                <div className="text-[10px] text-red-600 font-bold">مخاطر حرجة مبدئية</div>
                <div className="text-lg font-black text-red-700">
                  {risks.filter(r => r.inherentLevel === 'extreme').length}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-[10px] text-emerald-600 font-bold">مخاطر تم تخفيفها بنجاح</div>
                <div className="text-lg font-black text-emerald-700">
                  {risks.filter(r => r.residualLevel === 'medium' || r.residualLevel === 'low').length}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200">
                <div className="text-[10px] text-indigo-600 font-bold">مؤشرات إنذار مبكر (KRIs)</div>
                <div className="text-lg font-black text-indigo-700">
                  {risks.reduce((acc, r) => acc + r.keyRiskIndicators.length, 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Guidelines Box */}
          <div className="bg-slate-900 text-slate-200 rounded-3xl p-4 text-xs space-y-1.5 shadow-xs">
            <div className="font-bold text-amber-400 flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              <span>حوكمة المخاطر السريرية والمؤسسية (CBAHI QM-04 & Risk Governance):</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              تحتفظ المنشأة بسجل مخاطر محدث دورياً يوثق المخاطر المبدئية (Inherent) وضوابط التخفيف (Mitigations) والأثر المتبقي (Residual) ومؤشرات الإنذار المبكر (KRIs). أبعاد المصفوفة ونطاقات الدرجات محددة عبر ملفات قابلة للتكوين (Configurable Profiles) وليست ثوابت قطعية مفروضة.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Risk Register Master/Detail List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (5 Cols): Risk Items List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white rounded-3xl border border-slate-200 p-3.5 shadow-xs">
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="بحث برمز الخطر، العنوان، المالك..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            {/* Domain filter */}
            <div className="flex flex-wrap gap-1 text-[11px] pb-2 border-b border-slate-100">
              <button
                onClick={() => setDomainFilter('all')}
                className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer transition-all ${
                  domainFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setDomainFilter('medication_safety')}
                className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer transition-all ${
                  domainFilter === 'medication_safety' ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-700'
                }`}
              >
                سلامة الدواء
              </button>
              <button
                onClick={() => setDomainFilter('infection_control')}
                className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer transition-all ${
                  domainFilter === 'infection_control' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700'
                }`}
              >
                مكافحة العدوى
              </button>
              <button
                onClick={() => setDomainFilter('facilities_biomedical')}
                className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer transition-all ${
                  domainFilter === 'facilities_biomedical' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700'
                }`}
              >
                الأجهزة والمرافق
              </button>
            </div>

            {/* Risk List */}
            <div className="space-y-2 mt-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredRisks.map(r => {
                const isSelected = r.id === selectedRisk?.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRiskId(r.id)}
                    className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-slate-900">{r.riskCode}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                          {getDomainLabel(r.domain)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className={`px-1.5 py-0.5 rounded-md font-black border ${getLevelBadge(r.inherentLevel)}`}>
                          {r.inherentScore}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400 rotate-180" />
                        <span className={`px-1.5 py-0.5 rounded-md font-black border ${getLevelBadge(r.residualLevel)}`}>
                          {r.residualScore}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs font-bold text-slate-800 line-clamp-1 mt-1">
                      {r.titleAr || r.title}
                    </div>

                    <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>المالك: {r.riskOwner.split(' ')[0]}</span>
                      <span>تاريخ المراجعة: {r.lastReviewDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Risk Detail Card */}
        <div className="lg:col-span-7">
          {selectedRisk ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                      {selectedRisk.riskCode}
                    </span>
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      {getDomainLabel(selectedRisk.domain)}
                    </span>
                    <span className="text-xs text-slate-500">
                      استراتيجية المعالجة: <strong className="text-slate-800">{selectedRisk.treatmentStrategy === 'mitigate' ? 'تخفيف وضبط (Mitigate)' : selectedRisk.treatmentStrategy}</strong>
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-slate-900 mt-1.5">
                    {selectedRisk.titleAr || selectedRisk.title}
                  </h2>
                </div>

                <div className="text-left text-xs">
                  <div className="text-[10px] text-slate-400">مالك الخطر المسؤول:</div>
                  <div className="font-bold text-slate-800">{selectedRisk.riskOwner}</div>
                </div>
              </div>

              {/* Inherent vs Residual Delta Card */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-red-50/60 border border-red-200 space-y-1">
                  <div className="flex items-center justify-between text-red-800 font-bold text-[11px]">
                    <span>الخطر الأصلي المبدئي (Inherent Risk):</span>
                    <span className={`px-2 py-0.5 rounded-md font-black border ${getLevelBadge(selectedRisk.inherentLevel)}`}>
                      {selectedRisk.inherentScore} / 25
                    </span>
                  </div>
                  <div className="text-[11px] text-red-900/80">
                    الاحتمالية: <strong>{selectedRisk.inherentLikelihood}/5</strong> • الأثر: <strong>{selectedRisk.inherentConsequence}/5</strong>
                  </div>
                  <div className="text-[10px] text-red-700">قبل تطبيق خطة التدخل والتحكم</div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between text-emerald-800 font-bold text-[11px]">
                    <span>الخطر المتبقي (Residual Risk):</span>
                    <span className={`px-2 py-0.5 rounded-md font-black border ${getLevelBadge(selectedRisk.residualLevel)}`}>
                      {selectedRisk.residualScore} / 25
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-900/80">
                    الاحتمالية: <strong>{selectedRisk.residualLikelihood}/5</strong> • الأثر: <strong>{selectedRisk.residualConsequence}/5</strong>
                  </div>
                  <div className="text-[10px] text-emerald-700">بعد تفعيل الضوابط والحلول البديلة</div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1 text-xs">
                <div className="font-bold text-slate-700">شرح طبيعة الخطر وسياق الحدوث:</div>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-200 leading-relaxed">
                  {selectedRisk.description}
                </p>
              </div>

              {/* Controls & Mitigations Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>ضوابط التحكم الحالية (Existing Controls):</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-700">
                    {selectedRisk.existingControls.map((c, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-2xl border border-teal-200 bg-teal-50/40 space-y-2">
                  <div className="font-bold text-teal-900 flex items-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5 text-teal-600" />
                    <span>خطة التخفيف والضوابط المضافة (Proposed Mitigations):</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-teal-900">
                    {selectedRisk.proposedMitigations.map((m, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-teal-600 font-bold">•</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Key Risk Indicators (KRIs) */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>مؤشرات الإنذار المبكر للمخاطر (Key Risk Indicators - KRIs):</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {selectedRisk.keyRiskIndicators.length} مؤشر نشط
                  </span>
                </div>

                <div className="space-y-1.5">
                  {selectedRisk.keyRiskIndicators.map((kri, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[11px]"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{kri.nameAr || kri.name}</div>
                        <div className="text-[10px] text-slate-400">عتبة القياس المقبولة: {kri.threshold}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{kri.currentValue}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            kri.status === 'normal'
                              ? 'bg-emerald-100 text-emerald-800'
                              : kri.status === 'warning'
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {kri.status === 'normal' ? 'طبيعي' : kri.status === 'warning' ? 'تنبيه' : 'حرج'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              يرجى اختيار خطر من القائمة لاستعراض تقييم الأثر
            </div>
          )}
        </div>
      </div>

      {/* 3. Modal: Add New Risk */}
      {showNewRiskModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-5 shadow-2xl text-right max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
                <Plus className="w-4 h-4 text-teal-600" />
                <span>إدراج خطر سريري ومؤسسي جديد (5x5 Risk Item)</span>
              </div>
              <button
                onClick={() => setShowNewRiskModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRisk} className="space-y-3 mt-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">عنوان الخطر المحتمل:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تأخر استجابة فريق الإنعاش أو تعطل الشفط الجراحي..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">مجال الخطر (Domain):</label>
                  <select
                    value={newDomain}
                    onChange={e => setNewDomain(e.target.value as RiskDomain)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="clinical">سريري وطبي عام</option>
                    <option value="medication_safety">سلامة الدواء والصيدلة</option>
                    <option value="infection_control">مكافحة العدوى والوبائيات</option>
                    <option value="facilities_biomedical">أجهزة طبية ومرافق</option>
                    <option value="information_cyber">أمن معلومات ومعلوماتية</option>
                    <option value="governance_regulatory">حوكمة وامتثال سباهي</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">استراتيجية التعامل:</label>
                  <select
                    value={newStrategy}
                    onChange={e => setNewStrategy(e.target.value as RiskTreatmentStrategy)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="mitigate">تخفيف وتحكم (Mitigate)</option>
                    <option value="avoid">تجنب (Avoid)</option>
                    <option value="transfer">نقل/تأمين (Transfer)</option>
                    <option value="accept">قبول واعتماد (Accept)</option>
                  </select>
                </div>
              </div>

              {/* Inherent Score Inputs */}
              <div className="p-3 bg-red-50/50 border border-red-200 rounded-2xl space-y-2">
                <div className="font-bold text-red-800 text-[11px]">
                  تقييم الخطر المبدئي قبل التدخل (Inherent Risk):
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-600 font-bold block mb-1">الاحتمالية (1-5):</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={newLikelihood}
                      onChange={e => setNewLikelihood(Number(e.target.value) as RiskLikelihood)}
                      className="w-full px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 font-bold block mb-1">الأثر (1-5):</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={newConsequence}
                      onChange={e => setNewConsequence(Number(e.target.value) as RiskConsequence)}
                      className="w-full px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>
                <div className="text-[11px] text-red-700 font-bold flex items-center justify-between">
                  <span>الدرجة المحسوبة:</span>
                  <span className="font-mono text-sm">{newLikelihood * newConsequence} / 25</span>
                </div>
              </div>

              {/* Residual Score Inputs */}
              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-2">
                <div className="font-bold text-emerald-800 text-[11px]">
                  تقييم الخطر المتبقي المستهدف بعد تطبيق الضوابط (Residual Risk):
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-600 font-bold block mb-1">احتمالية متبقية (1-5):</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={newResidualLikelihood}
                      onChange={e => setNewResidualLikelihood(Number(e.target.value) as RiskLikelihood)}
                      className="w-full px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 font-bold block mb-1">أثر متبقي (1-5):</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={newResidualConsequence}
                      onChange={e => setNewResidualConsequence(Number(e.target.value) as RiskConsequence)}
                      className="w-full px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>
                <div className="text-[11px] text-emerald-700 font-bold flex items-center justify-between">
                  <span>الدرجة المتبقية:</span>
                  <span className="font-mono text-sm">{newResidualLikelihood * newResidualConsequence} / 25</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الضوابط وخطة التخفيف المقترحة:</label>
                <input
                  type="text"
                  placeholder="مثال: صيانة وقائية مزدوجة، باركود ذكي، تدريب دوري..."
                  value={newMitigations}
                  onChange={e => setNewMitigations(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">مالك الخطر المسؤول عن المتابعة:</label>
                <input
                  type="text"
                  value={newOwner}
                  onChange={e => setNewOwner(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewRiskModal(false)}
                  className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  إدراج بسجل المخاطر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
