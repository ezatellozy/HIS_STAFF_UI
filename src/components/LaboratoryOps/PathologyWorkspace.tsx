import React, { useState } from 'react';
import {
  FileText,
  Layers,
  CheckCircle2,
  Clock,
  Eye,
  AlertTriangle,
  Sparkles,
  Scissors,
  Microscope,
  Edit3,
  Bookmark,
  ShieldCheck,
  ChevronDown,
  Plus,
  Target,
  FileCheck2,
  FileSearch,
  Check,
  Activity
} from 'lucide-react';
import {
  PathologyCase,
  GrossExaminationData,
  PathologyReportData,
  PathologyBlockMapping,
  CytologyExaminationData
} from '../../types/laboratoryOps';

interface PathologyWorkspaceProps {
  cases: PathologyCase[];
  onUpdateCase: (updatedCase: PathologyCase) => void;
  onPreviewCase: (pathCase: PathologyCase) => void;
}

export const PathologyWorkspace: React.FC<PathologyWorkspaceProps> = ({
  cases,
  onUpdateCase,
  onPreviewCase
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'report' | 'grossing' | 'processing' | 'cytology'>('report');
  const [newAddendumText, setNewAddendumText] = useState('');
  const [showAddendumForm, setShowAddendumForm] = useState(false);

  const activeCase = cases.find(c => c.id === selectedCaseId) || cases[0];
  const isCytology = activeCase?.domain === 'cytopathology';

  const handleSignOut = () => {
    if (!activeCase) return;
    const updated: PathologyCase = {
      ...activeCase,
      status: 'signed_out',
      report: activeCase.report
        ? {
            ...activeCase.report,
            signedOutAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
          }
        : undefined
    };
    onUpdateCase(updated);
  };

  const handleAddAddendum = () => {
    if (!activeCase || !activeCase.report || !newAddendumText) return;
    const newAddendum = {
      id: `add-${Date.now()}`,
      author: activeCase.assignedPathologist,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      note: newAddendumText
    };

    const updated: PathologyCase = {
      ...activeCase,
      status: 'addendum_issued',
      report: {
        ...activeCase.report,
        addenda: [...(activeCase.report.addenda || []), newAddendum]
      }
    };
    onUpdateCase(updated);
    setNewAddendumText('');
    setShowAddendumForm(false);
  };

  return (
    <div className="space-y-4 text-right font-['Cairo',sans-serif]">
      {/* Header with Case Invariant Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-black text-slate-900">
              مساحة علم الأمراض الجراحي والتشريح النسيجي والخلوي (Surgical Pathology & Cytology)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            <strong>سلسلة الحوكمة المترابطة:</strong> العينة ← الحاوية ← ترقيم الحالة ← الفحص العياني/الخلوي ← البلوكات/الشرائح ← التقرير المتزامن الموجه وفق نوع العينة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-bold">الحالات المسجلة:</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">
            {cases.length} حالات
          </span>
        </div>
      </div>

      {/* Governance Invariant Banner for Pathology & Cytology */}
      <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-950">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>محدد الحوكمة في تقارير الأنسجة والخلايا:</strong> اكتمال التقرير المتزامن يعتمد على نوع العينة والسياق السريري. لا يتم إجبار الحالات الحميدة (Non-cancer) أو عينات السحب الخلوي (Cytology) على بروتوكول التدريج الورمي (pTNM Staging) أو حواف الاستئصال عندما لا تنطبق سريرياً.
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Cases List */}
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            <span className="font-black text-sm text-slate-900 block border-b border-slate-100 pb-2">
              حالات الباثولوجي والخلايا النشطة
            </span>

            <div className="space-y-2.5">
              {cases.map(c => {
                const isSelected = c.id === activeCase?.id;
                const isCytoCase = c.domain === 'cytopathology';
                const isBenign = c.report?.synopticChecklist?.isCancerCase === false;

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCaseId(c.id);
                      setActiveTab('report');
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-500 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-slate-900">{c.patientName}</strong>
                      <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                        {c.caseNumber}
                      </span>
                    </div>

                    <div className="text-[11px] font-bold text-slate-800">{c.procedureName}</div>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between">
                      <span>القسم: {c.clinicalDepartment}</span>
                      <span className="px-1.5 py-0.2 rounded font-sans text-[9px] bg-slate-200 text-slate-700">
                        {isCytoCase ? 'سيتولوجي (خلايا)' : isBenign ? 'أنسجة حميدة' : 'أنسجة وأورام'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200/60 font-mono">
                      <span className="text-slate-600">الحاويات: {c.containerCount}</span>
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        c.status === 'signed_out'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.status === 'addendum_issued'
                          ? 'bg-purple-100 text-purple-800'
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

        {/* Right 2 Columns: Active Case Detail & Context Tabs */}
        {activeCase && (
          <div className="lg:col-span-2 space-y-4">
            {/* Case Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-slate-900">{activeCase.patientName}</span>
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {activeCase.mrn}
                    </span>
                    <span className="font-mono text-xs text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                      {activeCase.caseNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isCytology
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isCytology ? 'علم الأمراض الخلوي (Cytology)' : 'علم الأمراض الجراحي (Surgical)'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    الإجراء: <strong>{activeCase.procedureName}</strong> • الاستشاري: <strong>{activeCase.assignedPathologist}</strong>
                  </div>
                </div>

                {activeCase.status !== 'signed_out' && activeCase.status !== 'addendum_issued' ? (
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>توقيع واعتماد التقرير النهائي (Sign Out Case)</span>
                  </button>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center gap-1 border border-emerald-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>الحالة موقعة ومعتمدة سريرياً</span>
                  </span>
                )}
              </div>

              {/* Pathology Navigation Tabs (Adapted to Domain) */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  onClick={() => setActiveTab('report')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'report'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>
                    {isCytology
                      ? 'التقرير الخلوي ومعايير الكفاية (Cytology Report)'
                      : 'التقرير والتشخيص المتزامن (Pathology Report)'}
                  </span>
                </button>

                {!isCytology && activeCase.grossExamination && (
                  <button
                    onClick={() => setActiveTab('grossing')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'grossing'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>الفحص العياني والأحبار (Gross Exam & Inking)</span>
                  </button>
                )}

                {!isCytology && activeCase.grossExamination && (
                  <button
                    onClick={() => setActiveTab('processing')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'processing'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>البلوكات والشرائح المجهرية (Blocks & Slides)</span>
                  </button>
                )}

                {isCytology && (
                  <button
                    onClick={() => setActiveTab('cytology')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'cytology'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Microscope className="w-3.5 h-3.5" />
                    <span>فحص السحب والتلطيخ الخلوي (FNA Smears & Rinse)</span>
                  </button>
                )}
              </div>

              {/* Tab 1: Diagnostic Report & Protocol Section */}
              {activeTab === 'report' && activeCase.report && (
                <div className="space-y-4 pt-1">
                  {/* Final Diagnosis Box */}
                  <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1.5">
                    <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                      <Bookmark className="w-4 h-4 text-emerald-700" />
                      <span>
                        {isCytology
                          ? 'التشخيص الخلوي النهائي (Final Cytopathologic Diagnosis):'
                          : 'التشخيص الباثولوجي النهائي (Final Pathologic Diagnosis):'}
                      </span>
                    </span>
                    <pre className="text-xs font-bold text-slate-900 whitespace-pre-wrap font-['Cairo',sans-serif] leading-relaxed bg-white p-3 rounded-lg border border-emerald-100">
                      {activeCase.report.finalDiagnosis}
                    </pre>
                  </div>

                  {/* Cytology Adequacy & Classification Banner (when Cytology) */}
                  {isCytology && activeCase.cytologyData && (
                    <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                        <span className="font-black text-blue-950 flex items-center gap-1.5">
                          <FileCheck2 className="w-4 h-4 text-blue-700" />
                          <span>معايير كفاية العينة وتصنيف بيثيسدا الخلوي (Cytology Adequacy & Bethesda Classification):</span>
                        </span>
                        <span className="text-[10px] font-bold bg-blue-200/70 text-blue-900 px-2 py-0.5 rounded">
                          {activeCase.cytologyData.classificationSystem}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <span className="text-slate-500 block text-[11px]">كفاية العينة الخلوية (Adequacy):</span>
                          <strong className="text-blue-900 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>كافية ومطابقة لمعايير الفحص المعتمدة (Satisfactory)</span>
                          </strong>
                          <p className="text-[10px] text-slate-600 mt-0.5">
                            {activeCase.cytologyData.adequacyComment}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">فئة بيثيسدا الخلوية (Bethesda Category):</span>
                          <strong className="text-emerald-800 font-bold block">
                            {activeCase.cytologyData.bethesdaCategory}
                          </strong>
                          <span className="text-[10px] text-slate-600 block mt-0.5">
                            نسبة الخباثة التقديرية (Risk of Malignancy): <strong>{activeCase.cytologyData.riskOfMalignancy}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-white rounded-lg border border-blue-200 space-y-1">
                        <span className="font-bold text-slate-800 block text-[11px]">
                          موجودات الفرز المجهري (Screening Findings):
                        </span>
                        <p className="text-slate-700 leading-relaxed text-[11px]">
                          {activeCase.cytologyData.screeningFindings}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Synoptic Reporting Protocol for Surgical Pathology */}
                  {!isCytology && activeCase.report.synopticChecklist && (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                        <span className="font-black text-slate-900 flex items-center gap-1.5">
                          <Target className="w-4 h-4 text-emerald-600" />
                          <span>
                            {activeCase.report.synopticChecklist.isCancerCase !== false
                              ? 'قائمة التقرير المتزامن المعياري للأورام (CAP Cancer Synoptic Protocol):'
                              : 'بيانات التشريح النسيجي المعياري للحالات الحميدة (Benign Histology Protocol):'}
                          </span>
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          activeCase.report.synopticChecklist.isCancerCase !== false
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {activeCase.report.synopticChecklist.isCancerCase !== false
                            ? 'CAP Oncology Protocol'
                            : 'Benign Resection Protocol'}
                        </span>
                      </div>

                      {activeCase.report.synopticChecklist.isCancerCase !== false ? (
                        <>
                          <div className="p-2.5 bg-purple-50/70 rounded-lg border border-purple-200/80 text-[11px] grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div>
                              <span className="text-purple-700 font-bold block">موقع الورم (Tumor Site):</span>
                              <strong className="text-slate-900">{activeCase.report.synopticChecklist.tumorSite || 'غير محدد'}</strong>
                            </div>
                            <div>
                              <span className="text-purple-700 font-bold block">الإجراء المنطبق (Procedure):</span>
                              <strong className="text-slate-900">{activeCase.report.synopticChecklist.procedureApplicability || 'استئصال قياسي'}</strong>
                            </div>
                            <div>
                              <span className="text-purple-700 font-bold block">البروتوكول والإصدار (Protocol ID & Version):</span>
                              <strong className="text-slate-900 font-mono">
                                {activeCase.report.synopticChecklist.protocolIdentifier || 'CAP Protocol'} ({activeCase.report.synopticChecklist.protocolVersion || 'v4.3'})
                              </strong>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div>
                              <span className="text-slate-400 block text-[11px]">النوع النسيجي (Histologic Type):</span>
                              <strong className="text-slate-800">{activeCase.report.synopticChecklist.histologicType}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[11px]">حجم الورم (Tumor Size):</span>
                              <strong className="text-slate-800">{activeCase.report.synopticChecklist.tumorSize}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[11px]">حواف الاستئصال الجراحي (Margins):</span>
                              <strong className="text-slate-800">{activeCase.report.synopticChecklist.marginsStatus}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[11px]">المرحلة الورمية (pTNM Staging):</span>
                              <strong className="text-purple-800 font-mono font-black">
                                {activeCase.report.synopticChecklist.pathologicStaging}
                              </strong>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-slate-400 block text-[11px]">التصنيف النسيجي:</span>
                              <strong className="text-slate-800">{activeCase.report.synopticChecklist.histologicType}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[11px]">حافة الاستئصال التشريحي:</span>
                              <strong className="text-slate-800">{activeCase.report.synopticChecklist.marginsStatus}</strong>
                            </div>
                          </div>
                          <div className="p-2 bg-emerald-50 rounded border border-emerald-200 text-emerald-900 text-[11px]">
                            <strong>قاعدة الحوكمة المعتمدة:</strong> تشخيص حميد سليم (Benign Non-Oncologic Pathology) — تصنيف ومراحل الأورام (pTNM Cancer Staging) غير منطبقة ولا يتم فرضها قسراً على الحالة.
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Microscopic Description */}
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-slate-800 block">الوصف المجهري (Microscopic Narrative):</span>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed text-xs">
                      {activeCase.report.microscopicDescription}
                    </p>
                  </div>

                  {/* Ancillary Studies (IHC / Molecular) */}
                  {activeCase.report.ancillaryStudies && activeCase.report.ancillaryStudies.length > 0 && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                      <span className="font-bold text-slate-800 block">
                        الفحوصات التكميلية والمناعية الكيميائية (Ancillary IHC Studies):
                      </span>
                      <div className="space-y-1.5">
                        {activeCase.report.ancillaryStudies.map(anc => (
                          <div key={anc.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                            <div>
                              <strong className="text-slate-900">{anc.testName}</strong>
                              <span className="text-[10px] text-slate-500 block">طلبها: {anc.orderedBy}</span>
                            </div>
                            <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {anc.resultSummary}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Addenda Section */}
                  <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-950 flex items-center gap-1.5">
                        <Bookmark className="w-4 h-4 text-purple-700" />
                        <span>الملاحق التوضيحية والتعديلات (Addenda & Amendments):</span>
                      </span>
                      {!showAddendumForm && (
                        <button
                          onClick={() => setShowAddendumForm(true)}
                          className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>إضافة ملحق (Add Addendum)</span>
                        </button>
                      )}
                    </div>

                    {activeCase.report.addenda && activeCase.report.addenda.length > 0 ? (
                      <div className="space-y-2 pt-1">
                        {activeCase.report.addenda.map(ad => (
                          <div key={ad.id} className="p-2.5 bg-white rounded-lg border border-purple-200 space-y-1">
                            <p className="text-slate-800 text-xs leading-relaxed">{ad.note}</p>
                            <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-1">
                              كتبه: {ad.author} في {ad.timestamp}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">لا توجد ملاحق مسجلة.</span>
                    )}

                    {showAddendumForm && (
                      <div className="space-y-2 p-3 bg-white rounded-xl border border-purple-300 mt-2">
                        <label className="block text-slate-800 font-bold text-xs">نص الملحق التوضيحي الجديد:</label>
                        <textarea
                          rows={2}
                          value={newAddendumText}
                          onChange={e => setNewAddendumText(e.target.value)}
                          placeholder="اكتب تفاصيل الملحق (مثال: نتائج دراسة جزيئية لاحقة أو توضيح سريري)..."
                          className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setShowAddendumForm(false)}
                            className="px-3 py-1 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
                          >
                            إلغاء
                          </button>
                          <button
                            onClick={handleAddAddendum}
                            disabled={!newAddendumText}
                            className="px-4 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer"
                          >
                            حفظ وتثبيت الملحق نهائياً
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Grossing Workspace */}
              {activeTab === 'grossing' && activeCase.grossExamination && (
                <div className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block">القائم بالفحص العياني:</span>
                      <strong className="text-slate-900">{activeCase.grossExamination.performedBy}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">أبعاد العينة ووزنها:</span>
                      <strong className="text-slate-900">
                        {activeCase.grossExamination.dimensions} ({activeCase.grossExamination.weightGrams} جم)
                      </strong>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-slate-800 block">توجيه العينة والخيوط الجراحية:</span>
                    <p className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed">
                      {activeCase.grossExamination.specimenOrientation}
                    </p>
                  </div>

                  {/* Inking Margin Colors */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-800 block">أحبار الحواف الجراحية المستخدمة (Inking Protocol):</span>
                    <div className="grid grid-cols-2 gap-2">
                      {activeCase.grossExamination.inkColorsUsed.map((ink, idx) => (
                        <div key={idx} className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                          <strong className="text-slate-900">{ink.color}</strong>
                          <span className="text-slate-500 text-[11px]">{ink.marginSite}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-slate-800 block">الوصف العياني الكامل (Gross Description):</span>
                    <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed text-xs">
                      {activeCase.grossExamination.grossDescription}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 3: Blocks and Slide Tracking */}
              {activeTab === 'processing' && activeCase.grossExamination && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      خريطة البلوكات المقتطعة والشرائح المجهزة ({activeCase.grossExamination.blocks.length} بلوك):
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Cassettes Tracking</span>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {activeCase.grossExamination.blocks.map(block => (
                      <div key={block.blockId} className="p-3 flex items-center justify-between hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-black font-mono flex items-center justify-center text-sm border border-teal-300">
                            {block.blockId}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900">{block.tissueDescription}</div>
                            <div className="text-[10px] text-slate-500">
                              الكاسيت: {block.cassetteColor} • قطع الأنسجة: {block.numberOfPieces} • الشرائح: {block.slidesCount}
                            </div>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>الشرائح المجهرية جاهزة (Slide Ready)</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Cytology Smears & Preparation */}
              {activeTab === 'cytology' && isCytology && (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 space-y-2">
                    <span className="font-bold text-blue-900 flex items-center gap-1.5">
                      <Microscope className="w-4 h-4 text-blue-700" />
                      <span>حاويات وتحضيرات الفحص الخلوي (Cytology Smears & Preparations):</span>
                    </span>
                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      تتضمن عينات السحب بالإبرة الرفيعة (FNA) شرائح تلطيخ مباشر مثبتة بالكحول وأخرى مجففة بالهواء لصبغة Diff-Quik، بالإضافة لكتلة خلايا السائل (Cell Block) لإجراء الدراسات المناعية المكملة.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="font-bold text-slate-800 block">الحاويات المستلمة للعينات الخلوية:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {activeCase.containers.map(cont => (
                        <div key={cont.containerNumber} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                          <div className="flex items-center justify-between">
                            <strong className="text-slate-900">حاوية #{cont.containerNumber}: {cont.containerLabel}</strong>
                          </div>
                          <div className="text-[11px] text-slate-600">المثبت: {cont.fixative}</div>
                          <div className="text-[10px] text-slate-400">المصدر: {cont.tissueSource}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
