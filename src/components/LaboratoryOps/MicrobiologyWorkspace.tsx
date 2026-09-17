import React, { useState } from 'react';
import {
  Microscope,
  FlaskConical,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Layers,
  Settings2,
  Sparkles,
  User,
  ShieldAlert,
  Info,
  ChevronDown
} from 'lucide-react';
import {
  MicrobiologyCase,
  ASTInterpretationStandard,
  ASTResultRow,
  OrganismIdentification
} from '../../types/laboratoryOps';

interface MicrobiologyWorkspaceProps {
  cases: MicrobiologyCase[];
  onUpdateCase: (updatedCase: MicrobiologyCase) => void;
  onPreviewCase: (microCase: MicrobiologyCase) => void;
}

export const MicrobiologyWorkspace: React.FC<MicrobiologyWorkspaceProps> = ({
  cases,
  onUpdateCase,
  onPreviewCase
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '');
  const [selectedStandard, setSelectedStandard] = useState<ASTInterpretationStandard>('eucast');
  const [editingGramStain, setEditingGramStain] = useState(false);
  const [gramFindingText, setGramFindingText] = useState(
    cases[0]?.gramStainPreliminary?.findings || 'Gram-positive cocci in clusters'
  );
  const [gramWbcText, setGramWbcText] = useState(
    cases[0]?.gramStainPreliminary?.wbcObserved || 'Moderate polymorphonuclear leukocytes'
  );

  const activeCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  const handleSaveGramStain = () => {
    if (!activeCase) return;
    const updated: MicrobiologyCase = {
      ...activeCase,
      gramStainPreliminary: {
        reportedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        reportedBy: 'أخصائية الأحياء الدقيقة: سناء السبيعي',
        findings: gramFindingText,
        wbcObserved: gramWbcText,
        status: 'preliminary_released',
        comments: 'تم توثيق وإبلاغ النتيجة الأولية لصبغة غرام سريرياً.'
      }
    };
    onUpdateCase(updated);
    setEditingGramStain(false);
  };

  const handleToggleExtendedIncubation = () => {
    if (!activeCase) return;
    const updated: MicrobiologyCase = {
      ...activeCase,
      isExtendedIncubation: !activeCase.isExtendedIncubation,
      incubationTargetHours: !activeCase.isExtendedIncubation ? 168 : 120 // 7 days vs 5 days
    };
    onUpdateCase(updated);
  };

  const handleMarkFinalNoGrowth = () => {
    if (!activeCase) return;
    const updated: MicrobiologyCase = {
      ...activeCase,
      status: 'final_no_growth',
      finalReportNote: 'لا يوجد نمو بكتيري أو فطري بعد انتهاء فترة التحضين المعيارية الكاملة.'
    };
    onUpdateCase(updated);
  };

  return (
    <div className="space-y-4 text-right font-['Cairo',sans-serif]">
      {/* Top Banner with EUCAST / CLSI Governance Note */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Microscope className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-black text-slate-900">
              مساحة عمليات الأحياء الدقيقة والمزارع والمضادات الحيوية (Clinical Microbiology & AST)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            إدارة المزارع، فترات التحضين، صبغة غرام الأولية، واختبارات الحساسية الدوائية وفق المعايير السريرية.
          </p>
        </div>

        {/* Switchable AST Interpretation Standard */}
        <div className="flex items-center gap-2 bg-purple-50 p-2 rounded-xl border border-purple-200">
          <span className="text-xs font-bold text-purple-900 flex items-center gap-1">
            <Settings2 className="w-3.5 h-3.5 text-purple-700" />
            <span>معيار تفسير الحساسية (AST Standard):</span>
          </span>
          <div className="flex rounded-lg bg-white p-0.5 border border-purple-200 text-xs font-bold">
            <button
              onClick={() => setSelectedStandard('eucast')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                selectedStandard === 'eucast'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-purple-700'
              }`}
            >
              EUCAST (المعتمد)
            </button>
            <button
              onClick={() => setSelectedStandard('clsi')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                selectedStandard === 'clsi'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-purple-700'
              }`}
            >
              CLSI Profile
            </button>
          </div>
        </div>
      </div>

      {/* Critical Invariant Banner for AST */}
      <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-xl flex items-start gap-3 text-xs text-purple-950">
        <Info className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>محدد الحوكمة في تصنيف المضادات الحيوية (AST Invariant):</strong>
          {selectedStandard === 'eucast' ? (
            <span>
              {' '}وفق معيار <strong>EUCAST</strong>، يرمز الحرف <strong>«I»</strong> إلى <em>«حساس عند زيادة التعرض الدوائي (Susceptible, increased exposure)»</em> وليس إلى متوسط المقاومة (Intermediate). يتطلب ذلك زيادة الجرعة أو تركيز الدواء في موقع الإنتان.
            </span>
          ) : (
            <span>
              {' '}وفق معيار <strong>CLSI</strong>، يرمز الحرف <strong>«I»</strong> إلى <em>«متوسط المقاومة (Intermediate)»</em> مع إمكانية الفعالية في مواقع تركيز الدواء الفسيولوجي.
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Cases List (Left/Col 1) and Case Detail/AST Workspace (Right/Col 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Culture Cases Worklist */}
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-black text-sm text-slate-900">حالات المزارع الجارية</span>
              <span className="text-xs font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">
                {cases.length} حالات
              </span>
            </div>

            <div className="space-y-2">
              {cases.map(c => {
                const isSelected = c.id === activeCase?.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCaseId(c.id);
                      if (c.gramStainPreliminary) {
                        setGramFindingText(c.gramStainPreliminary.findings);
                        setGramWbcText(c.gramStainPreliminary.wbcObserved);
                      }
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-purple-50/70 border-purple-500 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-slate-900">{c.patientName}</strong>
                      <span className="text-[10px] font-mono text-slate-500">{c.accessionNumber}</span>
                    </div>

                    <div className="text-[11px] font-bold text-purple-900">{c.cultureType}</div>
                    <div className="text-[10px] text-slate-500">
                      العينة: {c.specimenType} • {c.anatomicalSite}
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200/60 font-mono">
                      <span className="text-slate-600 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>تحضين: {c.incubationDurationHours} س / {c.incubationTargetHours} س</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        c.status === 'organism_identified'
                          ? 'bg-purple-100 text-purple-800'
                          : c.status === 'no_growth_to_date'
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Active Case Deep Dive (Incubation, Gram, Organism ID, AST Grid) */}
        {activeCase && (
          <div className="lg:col-span-2 space-y-4">
            {/* Case Overview Header */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-slate-900">{activeCase.patientName}</span>
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {activeCase.mrn}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-xs font-bold">
                      {activeCase.accessionNumber}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    الموقع: {activeCase.bedLocation || 'قسم العيادات'} • نوع المزرعة: <strong>{activeCase.cultureType}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleExtendedIncubation}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                      activeCase.isExtendedIncubation
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>تمديد التحضين (Extended Incubation)</span>
                  </button>

                  <button
                    onClick={handleMarkFinalNoGrowth}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer"
                  >
                    إغلاق: لا يوجد نمو نهائياً
                  </button>
                </div>
              </div>

              {/* Preliminary Gram Stain Section */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Microscope className="w-4 h-4 text-purple-600" />
                    <span>تقرير صبغة غرام الأولية (Gram Stain Preliminary Finding):</span>
                  </span>
                  {!editingGramStain ? (
                    <button
                      onClick={() => setEditingGramStain(true)}
                      className="text-xs text-purple-700 font-bold hover:underline cursor-pointer"
                    >
                      تعديل التقرير
                    </button>
                  ) : null}
                </div>

                {!editingGramStain ? (
                  activeCase.gramStainPreliminary ? (
                    <div className="p-2.5 bg-purple-50/50 rounded-lg border border-purple-200/60 space-y-1">
                      <div className="font-bold text-purple-950">{activeCase.gramStainPreliminary.findings}</div>
                      <div className="text-[11px] text-slate-600">
                        الخلايا البيضاء: {activeCase.gramStainPreliminary.wbcObserved}
                      </div>
                      <div className="text-[10px] text-slate-400 pt-1 border-t border-purple-200/40">
                        صدر بواسطة: {activeCase.gramStainPreliminary.reportedBy} في {activeCase.gramStainPreliminary.reportedAt}
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400 italic">لم تصدر صبغة غرام أولية لهذه المزرعة بعد.</div>
                  )
                ) : (
                  <div className="space-y-2 p-3 bg-white rounded-xl border border-purple-300">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">الموجودات المجهرية للبكتيريا:</label>
                      <input
                        type="text"
                        value={gramFindingText}
                        onChange={e => setGramFindingText(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">الكريات البيضاء والملاحظات:</label>
                      <input
                        type="text"
                        value={gramWbcText}
                        onChange={e => setGramWbcText(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setEditingGramStain(false)}
                        className="px-3 py-1 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={handleSaveGramStain}
                        className="px-4 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        اعتماد ونشر النتيجة الأولية
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Organism Identification & AST Table */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4 text-teal-600" />
                    <span>الكائن الحي المعزول واختبار الحساسية (Organism ID & AST Panel):</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    المعيار النشط: {selectedStandard.toUpperCase()}
                  </span>
                </div>

                {activeCase.organisms.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    لم يتم عزل كائن حي بعد • المزرعة تحت المراقبة الآلية في جهاز الحضانة.
                  </div>
                ) : (
                  activeCase.organisms.map(org => (
                    <div key={org.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <div>
                          <span className="font-bold text-slate-900 text-sm">{org.organismName}</span>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            SNOMED-CT: {org.snomedCode} • {org.colonyCount}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
                          {org.clinicalSignificance === 'significant' ? 'ممرض رئيسي (Pathogen)' : org.clinicalSignificance}
                        </span>
                      </div>

                      {/* AST Table */}
                      <table className="w-full text-xs text-right">
                        <thead className="bg-slate-200/70 text-slate-700 font-bold border-b border-slate-300">
                          <tr>
                            <th className="p-2">المضاد الحيوي (Antimicrobial)</th>
                            <th className="p-2">طريقة الفحص</th>
                            <th className="p-2">التركيز المثبط (MIC Value)</th>
                            <th className="p-2">التفسير ({selectedStandard.toUpperCase()})</th>
                            <th className="p-2">نطاق الحساسية (Breakpoint)</th>
                            <th className="p-2">ملاحظات توجيهية</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-medium">
                          {org.astRows.map(ast => {
                            // Dynamically adjust display meaning based on selected standard
                            const isEucast = selectedStandard === 'eucast';
                            let meaning = ast.interpretationMeaning;
                            if (ast.interpretation === 'I') {
                              meaning = isEucast
                                ? 'حساس، مع زيادة التعرض الدوائي (Susceptible, increased exposure)'
                                : 'متوسط المقاومة (Intermediate)';
                            }

                            return (
                              <tr key={ast.id} className="hover:bg-slate-100/70">
                                <td className="p-2 font-bold text-slate-900">{ast.antimicrobial}</td>
                                <td className="p-2 font-mono text-[10px] text-slate-500">{ast.method}</td>
                                <td className="p-2 font-mono font-bold text-slate-800">{ast.measuredValue}</td>
                                <td className="p-2">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[11px] font-black font-mono inline-block ${
                                      ast.interpretation === 'S'
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        : ast.interpretation === 'I'
                                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                        : 'bg-red-100 text-red-800 border border-red-300'
                                    }`}
                                  >
                                    {ast.interpretation}
                                  </span>
                                </td>
                                <td className="p-2 font-mono text-[10px] text-slate-600">{ast.breakpointRange}</td>
                                <td className="p-2 text-[11px] text-slate-600">{meaning}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
