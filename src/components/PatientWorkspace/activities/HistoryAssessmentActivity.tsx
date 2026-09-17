import React, { useState } from 'react';
import {
  Stethoscope,
  Clock,
  User,
  Heart,
  Activity,
  AlertCircle,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Edit3,
  Calendar,
  Layers,
  Sparkles,
  Info,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Award,
  AlertTriangle,
  Sliders,
  CheckSquare
} from 'lucide-react';
import { Patient } from '../../../types/his';
import { AssessmentInstrumentsHub } from '../history/AssessmentInstrumentsHub';
import {
  ClinicalContextMode,
  ChiefComplaintEncounter,
  HistoryOfPresentIllness,
  PastMedicalHistoryItem,
  PastSurgicalHistoryItem,
  FamilyHistoryItem,
  SocialHistoryRecord,
  DetailedAllergyRecord,
  FunctionalAssessmentRecord,
  NutritionalAssessmentRecord,
  ReviewOfSystemsItem,
  PhysicalExamSystemItem,
  HpiDocumentationTemplateId,
  AssessmentProfileType
} from '../../../types/clinicalHistoryProblems';
import {
  MOCK_CHIEF_COMPLAINT_ENCOUNTER,
  MOCK_HPI,
  MOCK_PAST_MEDICAL_HISTORY,
  MOCK_PAST_SURGICAL_HISTORY,
  MOCK_FAMILY_HISTORY,
  MOCK_SOCIAL_HISTORY,
  MOCK_DETAILED_ALLERGIES,
  MOCK_FUNCTIONAL_ASSESSMENT,
  MOCK_NUTRITIONAL_ASSESSMENT,
  MOCK_ROS_DATA,
  MOCK_PHYSICAL_EXAM_DATA,
  MOCK_SPECIALTY_ASSESSMENTS,
  CONFIGURABLE_ASSESSMENT_PROFILES_META,
  HPI_DOCUMENTATION_TEMPLATES
} from '../../../data/mockClinicalHistoryProblemsData';
import { useHis } from '../../../context/HisContext';

interface HistoryAssessmentActivityProps {
  patient: Patient;
}

type SubTab = 'encounter_hpi' | 'longitudinal_hx' | 'ros' | 'physical_exam' | 'functional_nutritional' | 'assessment_instruments' | 'specialty';

export const HistoryAssessmentActivity: React.FC<HistoryAssessmentActivityProps> = ({ patient }) => {
  const { currentStaff, playChime } = useHis();

  const [activeTab, setActiveTab] = useState<SubTab>('encounter_hpi');
  const [selectedContext, setSelectedContext] = useState<ClinicalContextMode>('icu');
  const [examMode, setExamMode] = useState<'focused' | 'comprehensive'>('comprehensive');

  // HPI Template State (Optional Documentation Templates - not mandatory structures)
  const [activeHpiTemplateId, setActiveHpiTemplateId] = useState<HpiDocumentationTemplateId>(
    MOCK_HPI.activeTemplateId || 'pain_opqrst'
  );
  const [hpiViewMode, setHpiViewMode] = useState<'structured' | 'narrative_free'>('structured');
  const [freeNarrativeText, setFreeNarrativeText] = useState(MOCK_HPI.narrativeText);

  // Interactive state for Longitudinal data
  const [pastMedicalHistory, setPastMedicalHistory] = useState<PastMedicalHistoryItem[]>(MOCK_PAST_MEDICAL_HISTORY);
  const [pastSurgicalHistory, setPastSurgicalHistory] = useState<PastSurgicalHistoryItem[]>(MOCK_PAST_SURGICAL_HISTORY);
  const [familyHistory, setFamilyHistory] = useState<FamilyHistoryItem[]>(MOCK_FAMILY_HISTORY);
  const [socialHistory, setSocialHistory] = useState<SocialHistoryRecord>(MOCK_SOCIAL_HISTORY);
  const [allergies, setAllergies] = useState<DetailedAllergyRecord[]>(MOCK_DETAILED_ALLERGIES);

  // Modals
  const [showAddPmhModal, setShowAddPmhModal] = useState(false);
  const [showAddPshModal, setShowAddPshModal] = useState(false);
  const [showAddFhModal, setShowAddFhModal] = useState(false);

  // Form states
  const [newPmhNameAr, setNewPmhNameAr] = useState('');
  const [newPmhNameEn, setNewPmhNameEn] = useState('');
  const [newPmhOnset, setNewPmhOnset] = useState('');
  const [newPmhStatus, setNewPmhStatus] = useState<'active' | 'inactive' | 'resolved'>('active');

  const [newPshNameAr, setNewPshNameAr] = useState('');
  const [newPshNameEn, setNewPshNameEn] = useState('');
  const [newPshYear, setNewPshYear] = useState('');
  const [newPshFacility, setNewPshFacility] = useState('');

  const [newFhRelation, setNewFhRelation] = useState<'father' | 'mother' | 'brother' | 'sister' | 'paternal_family' | 'maternal_family'>('brother');
  const [newFhCondition, setNewFhCondition] = useState('');
  const [newFhOnset, setNewFhOnset] = useState('');

  // Interactive ROS state
  const [rosData, setRosData] = useState<Record<ClinicalContextMode, ReviewOfSystemsItem[]>>(MOCK_ROS_DATA);

  // Interactive PE state
  const [peData, setPeData] = useState<Record<'focused' | 'comprehensive', PhysicalExamSystemItem[]>>(MOCK_PHYSICAL_EXAM_DATA);

  // Interactive Functional Profile (Mock Katz ADL Example)
  const [katzScores, setKatzScores] = useState(MOCK_FUNCTIONAL_ASSESSMENT.katzAdlIndex);
  const totalKatz = (Object.values(katzScores) as number[]).reduce((a, b) => a + b, 0);

  // Interactive MUST
  const [mustScore, setMustScore] = useState(0);

  // Active Specialty Profile Filter
  const [selectedSpecialtyProfileFilter, setSelectedSpecialtyProfileFilter] = useState<'all' | 'context_matched'>('context_matched');

  const handleToggleRosStatus = (systemKey: string) => {
    setRosData(prev => {
      const currentList = prev[selectedContext];
      const updated = currentList.map(item => {
        if (item.systemKey === systemKey) {
          const nextStatus =
            item.status === 'normal_negative'
              ? 'positive_pertinent'
              : item.status === 'positive_pertinent'
              ? 'not_assessed'
              : 'normal_negative';
          return { ...item, status: nextStatus };
        }
        return item;
      });
      return { ...prev, [selectedContext]: updated };
    });
    playChime('click');
  };

  const handleMarkAllRosNegative = () => {
    setRosData(prev => {
      const currentList = prev[selectedContext];
      const updated = currentList.map(item => ({
        ...item,
        reviewed: true,
        status: 'normal_negative' as const
      }));
      return { ...prev, [selectedContext]: updated };
    });
    playChime('success');
  };

  const handleAddPmh = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPmhNameAr) return;
    const newItem: PastMedicalHistoryItem = {
      id: `PMH-${Date.now()}`,
      conditionNameAr: newPmhNameAr,
      conditionNameEn: newPmhNameEn || 'Chronic Medical Condition',
      onsetYear: newPmhOnset || 'غير محدد بدقة',
      status: newPmhStatus,
      controlLevel: 'under_treatment',
      recordedAt: new Date().toISOString().split('T')[0],
      recordedBy: currentStaff.name,
      isLongitudinal: true
    };
    setPastMedicalHistory([...pastMedicalHistory, newItem]);
    setShowAddPmhModal(false);
    setNewPmhNameAr('');
    setNewPmhNameEn('');
    setNewPmhOnset('');
    playChime('success');
  };

  const handleAddPsh = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPshNameAr) return;
    const newItem: PastSurgicalHistoryItem = {
      id: `PSH-${Date.now()}`,
      procedureNameAr: newPshNameAr,
      procedureNameEn: newPshNameEn || 'Surgical Procedure',
      yearOrDate: newPshYear || 'سنة سابقة',
      hospitalFacility: newPshFacility || 'مستشفى معتمد',
      recordedAt: new Date().toISOString().split('T')[0],
      isLongitudinal: true
    };
    setPastSurgicalHistory([...pastSurgicalHistory, newItem]);
    setShowAddPshModal(false);
    setNewPshNameAr('');
    setNewPshNameEn('');
    setNewPshYear('');
    setNewPshFacility('');
    playChime('success');
  };

  const handleAddFh = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFhCondition) return;
    const relationMap: Record<string, string> = {
      father: 'الأب',
      mother: 'الأم',
      brother: 'الأخ',
      sister: 'الأخت',
      paternal_family: 'العائلة من جهة الأب',
      maternal_family: 'العائلة من جهة الأم'
    };
    const newItem: FamilyHistoryItem = {
      id: `FH-${Date.now()}`,
      relationship: newFhRelation,
      relationshipAr: relationMap[newFhRelation] || newFhRelation,
      conditionNameAr: newFhCondition,
      conditionNameEn: 'Familial condition',
      ageAtOnset: newFhOnset,
      deceasedStatus: 'unknown',
      clinicalRelevance: 'high_genetic_risk',
      isLongitudinal: true
    };
    setFamilyHistory([...familyHistory, newItem]);
    setShowAddFhModal(false);
    setNewFhCondition('');
    setNewFhOnset('');
    playChime('success');
  };

  return (
    <div className="space-y-5">
      {/* ------------------------------------------------------------- */}
      {/* HEADER STRIP & CLINICAL CONTEXT SWITCHER                      */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-sm sm:text-base text-slate-900">
                السيرة المرضية والفحص السريري (History & Physical Assessments)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                Axis 3 Standard
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              فصل منهجي بين توثيق التنويم الحالي (Encounter Documentation) والسجل المرضي الممتد للمريض (Longitudinal Patient History)
            </p>
          </div>
        </div>

        {/* Clinical Setting Context Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl text-xs w-full lg:w-auto overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-500 px-2 shrink-0">سياق الرعاية (Context):</span>
          {(['icu', 'er', 'wards', 'opd', 'or'] as ClinicalContextMode[]).map(ctx => {
            const labels: Record<ClinicalContextMode, { ar: string; en: string }> = {
              icu: { ar: 'العناية المركزة', en: 'ICU' },
              er: { ar: 'الطوارئ', en: 'ER' },
              wards: { ar: 'الأقسام الداخلية', en: 'Wards' },
              opd: { ar: 'العيادات', en: 'OPD' },
              or: { ar: 'العمليات والتخدير', en: 'OR' }
            };
            const isSelected = selectedContext === ctx;
            return (
              <button
                key={ctx}
                onClick={() => setSelectedContext(ctx)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-white text-teal-800 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span>{labels[ctx].ar}</span>
                <span className="font-mono text-[10px] opacity-70 ml-1">({labels[ctx].en})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUB-TABS NAVIGATION RAIL                                      */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-100 p-1.5 rounded-2xl text-xs border border-slate-200">
        <button
          onClick={() => setActiveTab('encounter_hpi')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'encounter_hpi' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-700 hover:bg-white/70'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>الشكوى وتاريخ المرض الحالي (CC & HPI)</span>
        </button>

        <button
          onClick={() => setActiveTab('longitudinal_hx')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'longitudinal_hx' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-700 hover:bg-white/70'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>السيرة المرضية الممتدة عبر الزمن (Longitudinal History)</span>
        </button>

        <button
          onClick={() => setActiveTab('ros')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'ros' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-700 hover:bg-white/70'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>مراجعة أجهزة الجسم بحسب السياق (Context-Aware ROS)</span>
        </button>

        <button
          onClick={() => setActiveTab('physical_exam')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'physical_exam' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-700 hover:bg-white/70'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>الفحص السريري الموجه والشامل (Physical Exam)</span>
        </button>

        <button
          onClick={() => setActiveTab('functional_nutritional')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'functional_nutritional' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-700 hover:bg-white/70'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>الملفات التقييمية الوظيفية والتغذوية (Functional & Nutrition Profiles)</span>
        </button>

        <button
          onClick={() => setActiveTab('assessment_instruments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'assessment_instruments' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-700 hover:bg-white/70'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>مقاييس التقييم السريري (Clinical Scales & Instruments)</span>
        </button>

        <button
          onClick={() => setActiveTab('specialty')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'specialty' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-700 hover:bg-white/70'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>الملفات التقييمية التخصصية (Contextual Specialty Profiles)</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: ENCOUNTER CHIEF COMPLAINT & HPI                        */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'encounter_hpi' && (
        <div className="space-y-5">
          {/* Chief Complaint Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
                <h3 className="font-extrabold text-sm text-slate-900">
                  الشكوى الرئيسية لطلب الرعاية (Chief Complaint - Presenting Reason)
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-0.5 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  درجة الشدة: حادة وشديدة (Severe)
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  {MOCK_CHIEF_COMPLAINT_ENCOUNTER.recordedAt}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-base font-black text-slate-900 leading-relaxed">
                "{MOCK_CHIEF_COMPLAINT_ENCOUNTER.complaintAr}"
              </div>
              <div className="text-xs font-mono text-slate-500 mt-1" dir="ltr">
                "{MOCK_CHIEF_COMPLAINT_ENCOUNTER.complaintEn}"
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block mb-0.5">توقيت البدء (Onset):</span>
                <strong className="text-slate-900 font-bold">{MOCK_CHIEF_COMPLAINT_ENCOUNTER.onset}</strong>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block mb-0.5">النمط والتطور (Duration):</span>
                <strong className="text-slate-900 font-bold">{MOCK_CHIEF_COMPLAINT_ENCOUNTER.duration}</strong>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block mb-0.5">السياق والمحفز (Trigger):</span>
                <strong className="text-slate-900 font-bold">{MOCK_CHIEF_COMPLAINT_ENCOUNTER.triggerContext}</strong>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1.5">الأعراض المتزامنة المحورية:</span>
              <div className="flex flex-wrap gap-2">
                {MOCK_CHIEF_COMPLAINT_ENCOUNTER.associatedSymptoms.map((sym, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold">
                    • {sym}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>الموثق السريري المعتمد: <strong>{MOCK_CHIEF_COMPLAINT_ENCOUNTER.recordedBy}</strong></span>
                <span>({MOCK_CHIEF_COMPLAINT_ENCOUNTER.recordedByRole})</span>
              </div>
              <span className="text-teal-700 font-bold">موثق كجزء من الزيارة الحالية (Encounter-Bound)</span>
            </div>
          </div>

          {/* History of Present Illness (HPI) with Configurable Templates */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    تاريخ المرض الحالي بتفاصيله السريرية (History of Present Illness - HPI)
                  </h3>
                  <span className="text-xs text-slate-500">
                    قوالب التوثيق السريري (مثل OPQRST و SOCRATES) اختيارية ومرنة حسب طبيعة الحالة وليست هيكلًا إلزاميًا موحدًا
                  </span>
                </div>
              </div>

              {/* View Format Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setHpiViewMode('structured')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    hpiViewMode === 'structured' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  هيكل القالب السريري
                </button>
                <button
                  type="button"
                  onClick={() => setHpiViewMode('narrative_free')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    hpiViewMode === 'narrative_free' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  توثيق حر وسردي (Free Narrative)
                </button>
              </div>
            </div>

            {/* Template Selector Bar */}
            <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-teal-600" />
                  <span>قالب التوثيق النشط (Documentation Template):</span>
                </span>
                <span className="text-[11px] text-teal-800 font-bold">
                  سياق التوثيق: {selectedContext.toUpperCase()}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {HPI_DOCUMENTATION_TEMPLATES.map(tpl => {
                  const isSelected = activeHpiTemplateId === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => {
                        setActiveHpiTemplateId(tpl.id);
                        playChime('click');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-teal-700 text-white shadow-xs ring-2 ring-teal-600/30'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <span>{tpl.labelAr}</span>
                      <span className="text-[10px] opacity-80" dir="ltr">({tpl.labelEn})</span>
                    </button>
                  );
                })}
              </div>

              <p className="text-[11px] text-slate-500 pt-1">
                {HPI_DOCUMENTATION_TEMPLATES.find(t => t.id === activeHpiTemplateId)?.description}
              </p>
            </div>

            {/* Narrative / Free Text Mode */}
            {hpiViewMode === 'narrative_free' ? (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  السرد السريري الحر للمرض الحالي (Unstructured Clinical Narrative):
                </label>
                <textarea
                  value={freeNarrativeText}
                  onChange={e => setFreeNarrativeText(e.target.value)}
                  rows={6}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs leading-relaxed text-slate-800 font-sans focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="اكتب التوثيق السردي المفصل للمرض الحالي..."
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>يدعم التوثيق السردي الزمني وتفاصيل تطور الحالة اليومية</span>
                  <span>{freeNarrativeText.length} حرف</span>
                </div>
              </div>
            ) : (
              /* Structured Framework Mode based on Active Template */
              <div className="space-y-4">
                {/* Clinical Narrative Summary Banner */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 leading-relaxed text-slate-800 text-xs text-justify">
                  {freeNarrativeText}
                </div>

                {/* Template Specific Grid: Pain OPQRST */}
                {activeHpiTemplateId === 'pain_opqrst' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                      <span className="font-bold text-slate-500 text-[11px] block">
                        [O & T] وقت البدء والتطور الزمني (Onset & Timing):
                      </span>
                      <span className="text-slate-900 font-semibold">{MOCK_HPI.onsetTimeline || MOCK_CHIEF_COMPLAINT_ENCOUNTER.onset}</span>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                      <span className="font-bold text-slate-500 text-[11px] block">
                        [P] عوامل التحفيز والتخفيف (Provocation & Palliation):
                      </span>
                      <div className="text-[11px] space-y-0.5">
                        <div><strong className="text-rose-700">يزداد بـ:</strong> {MOCK_HPI.aggravatingFactors?.join(', ')}</div>
                        <div><strong className="text-emerald-700">يخف بـ:</strong> {MOCK_HPI.relievingFactors?.join(', ')}</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                      <span className="font-bold text-slate-500 text-[11px] block">
                        [Q & R] طبيعة الألم والانتشار (Quality & Radiation):
                      </span>
                      <span className="text-slate-900 font-semibold">{MOCK_HPI.painQuality}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">{MOCK_HPI.radiationPattern}</p>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                      <span className="font-bold text-slate-500 text-[11px] block">
                        [S] درجة الشدة والأعراض المرافقة (Severity & Associated):
                      </span>
                      <span className="text-slate-900 font-semibold">
                        الشدة 8 / 10 على مقياس NRS • {MOCK_HPI.associatedSymptomsSummary}
                      </span>
                    </div>
                  </div>
                )}

                {/* Template Specific Grid: SOCRATES */}
                {activeHpiTemplateId === 'socrates' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                      <span className="text-[10px] font-bold text-slate-400 block">[S] Site الموقع:</span>
                      <strong className="text-slate-900 font-bold">{MOCK_HPI.socrates?.site}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                      <span className="text-[10px] font-bold text-slate-400 block">[O] Onset البدء:</span>
                      <strong className="text-slate-900 font-bold">{MOCK_HPI.socrates?.onset}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                      <span className="text-[10px] font-bold text-slate-400 block">[C] Character الطبيعة:</span>
                      <strong className="text-slate-900 font-bold">{MOCK_HPI.socrates?.character}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                      <span className="text-[10px] font-bold text-slate-400 block">[R] Radiation الانتشار:</span>
                      <strong className="text-slate-900 font-bold">{MOCK_HPI.socrates?.radiation}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                      <span className="text-[10px] font-bold text-slate-400 block">[A] Associations المرافقة:</span>
                      <strong className="text-slate-900 font-bold">{MOCK_HPI.socrates?.associations}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                      <span className="text-[10px] font-bold text-slate-400 block">[T] Time Course المسار:</span>
                      <strong className="text-slate-900 font-bold">{MOCK_HPI.socrates?.timeCourse}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                      <span className="text-[10px] font-bold text-slate-400 block">[E] Exacerbating المفاقم:</span>
                      <strong className="text-slate-900 font-bold">{MOCK_HPI.socrates?.exacerbatingRelieving}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                      <span className="text-[10px] font-bold text-slate-400 block">[S] Severity الشدة:</span>
                      <strong className="text-slate-900 font-bold">{MOCK_HPI.socrates?.severity}</strong>
                    </div>
                  </div>
                )}

                {/* Template Specific Grid: General Narrative or Free Structured */}
                {(activeHpiTemplateId === 'general_narrative' || activeHpiTemplateId === 'free_structured') && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                      <span className="font-bold text-slate-500 text-[11px] block">الموقع والتوطين التشريحي:</span>
                      <span className="text-slate-900 font-semibold">{MOCK_HPI.anatomicalLocation}</span>
                      <p className="text-[11px] text-slate-500">{MOCK_HPI.radiationPattern}</p>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                      <span className="font-bold text-slate-500 text-[11px] block">السياق والمحفزات السريرية:</span>
                      <span className="text-slate-900 font-semibold">{MOCK_CHIEF_COMPLAINT_ENCOUNTER.triggerContext}</span>
                      <p className="text-[11px] text-slate-500">البدء: {MOCK_HPI.onsetTimeline || MOCK_CHIEF_COMPLAINT_ENCOUNTER.onset}</p>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                      <span className="font-bold text-slate-500 text-[11px] block">الأعراض المصاحبة والاستجابة:</span>
                      <span className="text-slate-900 font-semibold">{MOCK_HPI.associatedSymptomsSummary}</span>
                    </div>
                  </div>
                )}

                {/* Template Specific Grid: Cardiopulmonary Focus */}
                {activeHpiTemplateId === 'specialty_dyspnea_cardiac' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                      <span className="font-bold text-slate-500 text-[11px] block">التقييم القلبي الوعائي المركز (Cardiovascular Focus):</span>
                      <span className="text-slate-900 font-semibold">ألم صدري ضاغط خلف القص (Retro-sternal Crushing) ممتد للفك والذراع</span>
                      <p className="text-[11px] text-slate-500">لا يستجيب للراحة ومصاحب لتعرق غزير وغثيان</p>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                      <span className="font-bold text-slate-500 text-[11px] block">التقييم التنفسي والوظيفي (Respiratory & Hemodynamic):</span>
                      <span className="text-slate-900 font-semibold">ضيق تنفس حاد عند أي جهد طفيف (NYHA Class II-III)</span>
                      <p className="text-[11px] text-slate-500">لا يوجد كتمة عند الاستلقاء (Orthopnea) حتى الآن</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: LONGITUDINAL PATIENT HISTORY                           */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'longitudinal_hx' && (
        <div className="space-y-6">
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-amber-950 text-sm">
                السجل الصحي التراكمي للمريض (Longitudinal Patient Record):
              </strong>
              <p className="text-amber-900 mt-0.5 leading-relaxed">
                هذه المعلومات مستمرة وتخص المريض عبر الزمن في كافة الزيارات والتنويمات وليست محصورة بـ Encounter الحالي.
                يتم الحفاظ على تاريخ البدء والحالة المزمنة وإمكانية تحديثها وربطها بالمشكلات والتشخيصات.
              </p>
            </div>
          </div>

          {/* Past Medical History (PMHx) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    الأمراض الباطنية والمزمنة السابقة (Past Medical History - PMHx)
                  </h3>
                  <span className="text-[11px] text-slate-400">سجل تراكمي مستمر عبر التنويمات</span>
                </div>
              </div>

              <button
                onClick={() => setShowAddPmhModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة مرض مزمن / سابق</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {pastMedicalHistory.map(pmh => (
                <div key={pmh.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50 p-2 rounded-xl transition-colors">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-slate-900 font-bold">{pmh.conditionNameAr}</strong>
                      <span className="text-slate-500 font-mono text-[11px]" dir="ltr">({pmh.conditionNameEn})</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        pmh.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {pmh.status === 'active' ? 'نشط ومستمر' : 'غير نشط / خامل'}
                      </span>
                    </div>
                    {pmh.clinicalNotes && (
                      <p className="text-slate-600 text-[11px]">{pmh.clinicalNotes}</p>
                    )}
                    <div className="text-[10px] text-slate-400 flex items-center gap-2">
                      <span>تاريخ البدء: <strong className="text-slate-600">{pmh.onsetYear}</strong></span>
                      <span>•</span>
                      <span>جهة المتابعة: {pmh.treatingPhysicianOrFacility || 'غير محدد'}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0 bg-slate-100 px-2 py-1 rounded">
                    Longitudinal Record
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Past Surgical History (PSHx) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    العمليات الجراحية السابقة (Past Surgical History - PSHx)
                  </h3>
                  <span className="text-[11px] text-slate-400">التاريخ الجراحي والغرسات والأجهزة المزروعة</span>
                </div>
              </div>

              <button
                onClick={() => setShowAddPshModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة عملية جراحية سابقة</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {pastSurgicalHistory.map(psh => (
                <div key={psh.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50 p-2 rounded-xl transition-colors">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-slate-900 font-bold">{psh.procedureNameAr}</strong>
                      <span className="text-slate-500 font-mono text-[11px]" dir="ltr">({psh.procedureNameEn})</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        سنة: {psh.yearOrDate}
                      </span>
                    </div>
                    {psh.implantOrProsthesis && (
                      <p className="text-amber-800 text-[11px] font-medium">⚠️ غرسة/شبكة: {psh.implantOrProsthesis}</p>
                    )}
                    <div className="text-[10px] text-slate-400 flex items-center gap-2">
                      <span>المركز: {psh.hospitalFacility}</span>
                      {psh.surgeonName && <span>• الجراح: {psh.surgeonName}</span>}
                      {psh.complications && <span>• {psh.complications}</span>}
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0 bg-slate-100 px-2 py-1 rounded">
                    Surgical Profile
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Family History (FHx) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    التاريخ المرضي الوراثي والعائلي (Family History - FHx)
                  </h3>
                  <span className="text-[11px] text-slate-400">عوامل الخطورة الوراثية لأمراض القلب والسكري والأورام</span>
                </div>
              </div>

              <button
                onClick={() => setShowAddFhModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة صلة قرابة / مرض عائلي</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {familyHistory.map(fh => (
                <div key={fh.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{fh.relationshipAr}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      خطر قلبي/وراثي عالي
                    </span>
                  </div>
                  <strong className="block text-slate-800 text-[11px] font-bold">{fh.conditionNameAr}</strong>
                  {fh.notes && (
                    <p className="text-slate-600 text-[10px] leading-relaxed">{fh.notes}</p>
                  )}
                  <div className="text-[10px] text-slate-400 font-mono">
                    {fh.ageAtOnset} • {fh.deceasedStatus === 'deceased' ? 'متوفى' : 'على قيد الحياة'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social History (SHx) & Detailed Allergies */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Social History Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <User className="w-4 h-4 text-teal-600" />
                <h4 className="font-extrabold text-slate-900">التاريخ الاجتماعي ونمط الحياة (Social History)</h4>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-500 block mb-0.5">حالة التدخين والتبغ:</span>
                  <strong className="text-slate-900">مدخن سابق (Former Smoker - Quit 3 months ago)</strong>
                  <p className="text-slate-600 text-[11px] mt-0.5">{socialHistory.smokingDetails}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-500 block mb-0.5">المهنة وبيئة العمل:</span>
                    <strong className="text-slate-900">{socialHistory.occupation}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-500 block mb-0.5">السكن والدعم الأسري:</span>
                    <strong className="text-slate-900">{socialHistory.livingArrangement}</strong>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-500 block mb-0.5">الكحول والمواد المؤثرة:</span>
                  <span className="text-emerald-700 font-bold">سلبي تماماً (Non-Drinker, Negative for illicit substances)</span>
                </div>
              </div>
            </div>

            {/* Detailed Allergies Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <h4 className="font-extrabold text-slate-900">سجل الحساسيات الموثق (Detailed Allergies)</h4>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  {allergies.length} حساسيات مسجلة
                </span>
              </div>

              <div className="space-y-2.5">
                {allergies.map(all => (
                  <div key={all.id} className="p-3 rounded-xl border border-rose-200 bg-rose-50/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-rose-950 font-bold">{all.substanceNameAr}</strong>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800">
                        {all.severity === 'severe_anaphylaxis' ? 'شديدة / صدمة حساسية' : 'متوسطة'}
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-900">
                      <strong>التظاهر السريري:</strong> {all.reactionManifestationAr}
                    </p>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                      <span>حالة التحقق: <strong>{all.verificationStatus === 'confirmed' ? 'مؤكدة سريرياً' : 'مبلغ عنها'}</strong></span>
                      <span>الموثق: {all.recordedBy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: CONTEXT-AWARE REVIEW OF SYSTEMS (ROS)                  */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'ros' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-slate-900">
                    مراجعة أجهزة الجسم بحسب السياق السريري (Context-Aware Review of Systems)
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                    سياق: {selectedContext.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  لا يتم فرض استمارة عملاقة موحدة على كل مريض؛ يتم التركيز ديناميكياً على الأجهزة المحورية لسياق التنويم
                </p>
              </div>

              <button
                onClick={handleMarkAllRosNegative}
                className="px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-xs transition-colors cursor-pointer"
              >
                ✓ تعيين باقي الأجهزة كـ سليمة/سلبية (All Other Systems Reviewed Negative)
              </button>
            </div>

            {/* ROS Systems Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {(rosData[selectedContext] || rosData.icu).map(item => (
                <div
                  key={item.systemKey}
                  className={`p-3.5 rounded-xl border transition-all ${
                    item.status === 'positive_pertinent'
                      ? 'border-amber-300 bg-amber-50/40'
                      : item.status === 'normal_negative'
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <strong className="text-slate-900 font-bold">{item.systemNameAr}</strong>
                    <button
                      onClick={() => handleToggleRosStatus(item.systemKey)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        item.status === 'positive_pertinent'
                          ? 'bg-amber-500 text-white'
                          : item.status === 'normal_negative'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.status === 'positive_pertinent'
                        ? 'إيجابي ذو دلالة (Positive)'
                        : item.status === 'normal_negative'
                        ? 'سلبي / طبيعي (Negative)'
                        : 'لم يُفحص (Not Assessed)'}
                    </button>
                  </div>

                  {item.pertinentFindings && (
                    <p className="text-[11px] text-slate-700 leading-relaxed bg-white/80 p-2 rounded-lg border border-slate-200">
                      {item.pertinentFindings}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: CONTEXT-AWARE PHYSICAL EXAMINATION                     */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'physical_exam' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  الفحص السريري المنهجي المعتمد (Physical Examination)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  يتكيف النمط بين الفحص السريع الموجه لحالات الطوارئ والفحص الشامل للأقسام الداخلية
                </p>
              </div>

              {/* Toggle Focused vs Comprehensive */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                <button
                  onClick={() => setExamMode('focused')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    examMode === 'focused' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  فحص موجه ومحدد (Focused PE)
                </button>
                <button
                  onClick={() => setExamMode('comprehensive')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    examMode === 'comprehensive' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  فحص شامل لجميع الأجهزة (Comprehensive PE)
                </button>
              </div>
            </div>

            {/* PE Findings List */}
            <div className="grid grid-cols-1 gap-3 text-xs">
              {peData[examMode].map(sys => (
                <div
                  key={sys.systemKey}
                  className={`p-3.5 rounded-xl border transition-all ${
                    sys.status === 'abnormal'
                      ? 'border-amber-300 bg-amber-50/30'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-teal-700" />
                      <strong className="text-slate-900 font-bold">{sys.systemNameAr}</strong>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sys.status === 'abnormal'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {sys.status === 'abnormal' ? 'ملاحظات غير طبيعية (Abnormal Findings)' : 'سليم وطبيعي (Within Normal Limits)'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                    {sys.findings}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 5: FUNCTIONAL & NUTRITIONAL ASSESSMENT PROFILES           */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'functional_nutritional' && (
        <div className="space-y-6">
          {/* Architectural Notice Banner */}
          <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-4 text-xs flex items-start gap-3">
            <Info className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-teal-950 flex items-center gap-2">
                <span>الملفات التقييمية الوظيفية والتغذوية (Configurable Assessment Profiles):</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-teal-800 border border-teal-300">
                  Profile Abstraction Architecture
                </span>
              </div>
              <p className="text-teal-900 leading-relaxed">
                أدوات التقييم (مثل مؤشر كاتز Katz ADL وفحص MUST) مهيأة كأمثلة توضيحية (Mock Profiles) داخل أطر تقييم عامة قابلة للتهيئة المؤسسية (Functional Profile & Nutrition Screening Profile). ظهورها واستحقاقها محكوم بسياق الرعاية السريري ({selectedContext.toUpperCase()}) وسياسات الحوكمة، وليست أدوات إلزامية عالمية ثابتة في كافة البيئات.
              </p>
            </div>
          </div>

          {/* Functional Assessment Profile (Katz ADL Mock Example) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                    ملف التقييم الوظيفي (Functional Assessment Profile)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Mock Example: Katz ADL Index</span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 mt-1">
                  مؤشر الاستقلالية في الأنشطة الحياتية اليومية (Independence in Activities of Daily Living)
                </h3>
                <span className="text-xs text-slate-400">تقييم القدرة الوظيفية والاعتماد على الذات قبل التنويم وأثنائه</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-bold">الدرجة الإجمالية:</span>
                <span className="px-3 py-1 rounded-xl bg-teal-50 text-teal-800 font-mono font-black text-sm border border-teal-200">
                  {totalKatz} / 6
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                  {totalKatz === 6 ? 'استقلالية وظيفية تامة (High Independence)' : 'يحتاج مساعدة جزئية'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              {[
                { key: 'bathing', label: 'الاستحمام (Bathing)' },
                { key: 'dressing', label: 'ارتداء الملابس (Dressing)' },
                { key: 'toileting', label: 'دخول الحمام (Toileting)' },
                { key: 'transferring', label: 'الانتقال/النهوض (Transferring)' },
                { key: 'continence', label: 'التحكم بالإخراج (Continence)' },
                { key: 'feeding', label: 'تناول الطعام (Feeding)' }
              ].map(item => {
                const isIndependent = katzScores[item.key as keyof typeof katzScores] === 1;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setKatzScores(prev => ({
                        ...prev,
                        [item.key]: isIndependent ? 0 : 1
                      }));
                      playChime('click');
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isIndependent
                        ? 'border-teal-300 bg-teal-50/50 text-teal-900 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="text-[11px] mb-1 font-bold">{item.label}</div>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-black ${
                      isIndependent ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {isIndependent ? '1 (مستقل)' : '0 (يحتاج مساعدة)'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
              <div>
                <strong>مستوى الحركة الحالي أثناء الرعاية: </strong>
                <span>مقيد بالراحة بالسرير (Bed Rest ordered post-ACS / CCU)</span>
              </div>
              <div className="text-amber-800 font-bold text-[11px]">
                ⚠️ تقييم خطر السقوط (Morse Fall Scale Mock): 35 نقطة (خطر سقوط متوسط يستوجب تدابير وقائية)
              </div>
            </div>
          </div>

          {/* Nutritional Screening Profile (MUST Tool Mock Example) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                    ملف المسح التغذوي (Nutrition Screening Profile)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Mock Example: MUST Screening Tool</span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 mt-1">
                  المسح التغذوي الشامل وتحديد الخطورة (Nutritional Screening & Diet Allocation)
                </h3>
                <span className="text-xs text-slate-400">تقييم خطر سوء التغذية وتحديد الحمية العلاجية الموصوفة</span>
              </div>
              <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                تصنيف الخطر: منخفض (Low Risk - Score 0)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block mb-0.5 font-semibold">مؤشر كتلة الجسم (BMI):</span>
                <strong className="text-slate-900 font-bold">28.1 kg/m² (زيادة وزن خفيفة - درجة 0)</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block mb-0.5 font-semibold">فقدان الوزن غير المخطط (3-6 أشهر):</span>
                <strong className="text-slate-900 font-bold">0% (وزن ثابت - درجة 0)</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block mb-0.5 font-semibold">تأثير المرض الحاد على التغذية:</span>
                <strong className="text-slate-900 font-bold">لا يوجد صيام ممتد &gt; 5 أيام (درجة 0)</strong>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-200 text-xs space-y-1.5">
              <div className="font-bold text-teal-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>الحمية الغذائية السريرية الموصوفة: {MOCK_NUTRITIONAL_ASSESSMENT.recommendedDiet}</span>
              </div>
              <ul className="text-[11px] text-teal-900 pr-5 list-disc space-y-0.5">
                {MOCK_NUTRITIONAL_ASSESSMENT.dietaryRestrictions.map((res, idx) => (
                  <li key={idx}>{res}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 6: CONTEXTUAL SPECIALTY ASSESSMENT PROFILES               */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'specialty' && (
        <div className="space-y-5">
          {/* Architectural Notice Banner */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-amber-950 flex items-center gap-2">
                <span>الملفات التقييمية التخصصية وحسب السياق (Contextual Specialty Assessment Profiles):</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-amber-800 border border-amber-300">
                  Configurable Profiles
                </span>
              </div>
              <p className="text-amber-900 leading-relaxed">
                المقاييس السريرية التخصصية (مثل ESI للطوارئ، Killip و TIMI لطب القلب والعناية المركزة، و ASA للياقة التخديرية والجراحية) هي أمثلة توضيحية داخل أطر تقييم مجردة (Triage, Specialty Risk, Perioperative). لا يتم إجبار ظهورها خارج سياق الرعاية المناسب (مثل عدم إلزامية ASA خارج التخدير والعمليات، أو عدم إلزامية Killip خارج طب القلب).
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  المقاييس السريرية التخصصية المهيأة حسب السياق (Configured Specialty Profiles)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  السياق النشط حالياً: <strong className="text-teal-700 uppercase font-mono">{selectedContext}</strong>
                </p>
              </div>

              {/* Filter mode */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedSpecialtyProfileFilter('context_matched')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedSpecialtyProfileFilter === 'context_matched'
                      ? 'bg-white text-teal-800 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  المرتبط بسياق الرعاية الحالي ({selectedContext.toUpperCase()})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSpecialtyProfileFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedSpecialtyProfileFilter === 'all'
                      ? 'bg-white text-teal-800 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  عرض كافة الملفات التقييمية المهيأة (All Profiles)
                </button>
              </div>
            </div>

            {/* Specialty Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {MOCK_SPECIALTY_ASSESSMENTS
                .filter(spec => selectedSpecialtyProfileFilter === 'all' || spec.context === selectedContext)
                .map((spec, idx) => {
                  const isContextMatch = spec.context === selectedContext;
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition-all space-y-3 ${
                        isContextMatch
                          ? 'border-teal-300 bg-teal-50/20 shadow-xs ring-1 ring-teal-500/20'
                          : 'border-slate-200 bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-start justify-between border-b border-slate-200/80 pb-2.5">
                        <div>
                          <span className="text-[10px] font-bold text-teal-700 block mb-0.5">
                            {spec.profileType || 'specialty_profile'}
                          </span>
                          <strong className="font-black text-slate-900 text-xs">
                            {spec.profileNameAr}
                          </strong>
                          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                            {spec.exampleMockBasis || spec.profileNameEn}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                          isContextMatch
                            ? 'bg-teal-700 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {spec.context.toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {spec.scores.map((score, sIdx) => (
                          <div key={sIdx} className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-700 text-[11px]">{score.labelAr}</span>
                              <span className="font-mono font-black text-xs text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                {score.value}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-600 leading-relaxed">{score.interpretation}</p>
                            <div className="text-[9px] text-slate-400 pt-1 border-t border-slate-100">
                              الموثق: {score.provenance}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>

            {selectedSpecialtyProfileFilter === 'context_matched' &&
              MOCK_SPECIALTY_ASSESSMENTS.filter(s => s.context === selectedContext).length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  لا توجد ملفات تقييمية تخصصية مخصصة لسياق ({selectedContext.toUpperCase()}) الحالي.
                  <button
                    type="button"
                    onClick={() => setSelectedSpecialtyProfileFilter('all')}
                    className="block mx-auto mt-2 text-teal-700 font-bold hover:underline"
                  >
                    عرض الملفات التقييمية المتاحة في سياقات أخرى
                  </button>
                </div>
              )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB: ASSESSMENT INSTRUMENTS & SCALES                          */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'assessment_instruments' && (
        <AssessmentInstrumentsHub patient={patient} />
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD PAST MEDICAL HISTORY ITEM                          */}
      {/* ------------------------------------------------------------- */}
      {showAddPmhModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900">
                إضافة مرض مزمن إلى السجل الممتد (Add Past Medical History)
              </h3>
              <button onClick={() => setShowAddPmhModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPmh} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الحالة أو المرض بالعربية:</label>
                <input
                  type="text"
                  value={newPmhNameAr}
                  onChange={e => setNewPmhNameAr(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                  placeholder="مثال: قصور كلوي مزمن، ربو شعبي"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الاسم بالإنجليزية (Clinical Concept):</label>
                <input
                  type="text"
                  value={newPmhNameEn}
                  onChange={e => setNewPmhNameEn(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                  placeholder="e.g. Chronic Kidney Disease, Bronchial Asthma"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">سنة أو عمر البدء:</label>
                  <input
                    type="text"
                    value={newPmhOnset}
                    onChange={e => setNewPmhOnset(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300"
                    placeholder="2020 أو منذ 4 سنوات"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الحالة السريرية:</label>
                  <select
                    value={newPmhStatus}
                    onChange={e => setNewPmhStatus(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value="active">نشط ومستمر (Active)</option>
                    <option value="inactive">خامل / تحت السيطرة (Inactive)</option>
                    <option value="resolved">تم الشفاء (Resolved)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPmhModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs transition-colors"
                >
                  حفظ في السجل التراكمي
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD PAST SURGICAL HISTORY ITEM                         */}
      {/* ------------------------------------------------------------- */}
      {showAddPshModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900">
                إضافة إجراء جراحي سابق (Add Past Surgical History)
              </h3>
              <button onClick={() => setShowAddPshModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPsh} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم العملية الجراحية بالعربية:</label>
                <input
                  type="text"
                  value={newPshNameAr}
                  onChange={e => setNewPshNameAr(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                  placeholder="مثال: استئصال المرارة بالمنظار"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الاسم بالإنجليزية:</label>
                <input
                  type="text"
                  value={newPshNameEn}
                  onChange={e => setNewPshNameEn(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                  placeholder="e.g. Laparoscopic Cholecystectomy"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">سنة الإجراء:</label>
                  <input
                    type="text"
                    value={newPshYear}
                    onChange={e => setNewPshYear(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300"
                    placeholder="2018"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المستشفى / المركز:</label>
                  <input
                    type="text"
                    value={newPshFacility}
                    onChange={e => setNewPshFacility(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300"
                    placeholder="اسم المستشفى"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPshModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs transition-colors"
                >
                  حفظ الإجراء الجراحي
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD FAMILY HISTORY ITEM                                */}
      {/* ------------------------------------------------------------- */}
      {showAddFhModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900">
                إضافة تاريخ مرضي عائلي (Add Family History)
              </h3>
              <button onClick={() => setShowAddFhModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddFh} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">صلة القرابة:</label>
                <select
                  value={newFhRelation}
                  onChange={e => setNewFhRelation(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold"
                >
                  <option value="father">الأب (Father)</option>
                  <option value="mother">الأم (Mother)</option>
                  <option value="brother">الأخ (Brother)</option>
                  <option value="sister">الأخت (Sister)</option>
                  <option value="paternal_family">عائلة الأب (Paternal Side)</option>
                  <option value="maternal_family">عائلة الأم (Maternal Side)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المرض أو الحالة:</label>
                <input
                  type="text"
                  value={newFhCondition}
                  onChange={e => setNewFhCondition(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                  placeholder="مثال: جلطة دماغية، سرطان قولون وراثي"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">سن الإصابة لدى القريب:</label>
                <input
                  type="text"
                  value={newFhOnset}
                  onChange={e => setNewFhOnset(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                  placeholder="مثال: أصيب في سن 48 سنة"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddFhModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-colors"
                >
                  حفظ التاريخ العائلي
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
