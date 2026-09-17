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
  Plus
} from 'lucide-react';
import {
  PathologyCase,
  GrossExaminationData,
  PathologyReportData,
  PathologyBlockMapping
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
  const [activeTab, setActiveTab] = useState<'grossing' | 'processing' | 'microscopic' | 'report'>('report');
  const [newAddendumText, setNewAddendumText] = useState('');
  const [showAddendumForm, setShowAddendumForm] = useState(false);

  const activeCase = cases.find(c => c.id === selectedCaseId) || cases[0];

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
            <strong>سلسلة الحوكمة المترابطة:</strong> العينة (Specimen) ← الحاوية (Container) ← ترقيم الحالة (Case) ← الفحص العياني (Grossing) ← البلوكات (Blocks) ← الشرائح (Slides) ← التقرير التشخيصي (Synoptic Report).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-bold">الحالات المسجلة:</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">
            {cases.length} حالات
          </span>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Cases List */}
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            <span className="font-black text-sm text-slate-900 block border-b border-slate-100 pb-2">
              حالات الباثولوجي النشطة
            </span>

            <div className="space-y-2.5">
              {cases.map(c => {
                const isSelected = c.id === activeCase?.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCaseId(c.id)}
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
                    <div className="text-[10px] text-slate-500">
                      الجراح: {c.orderingClinician} ({c.clinicalDepartment})
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

        {/* Right 2 Columns: Active Case Detail & Tabs (Grossing, Blocks/Processing, Synoptic Report) */}
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

              {/* Pathology Tabs */}
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
                  <span>التقرير والتشخيص المتزامن (Synoptic Report)</span>
                </button>

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
              </div>

              {/* Tab 1: Diagnostic Report & Synoptic Checklist */}
              {activeTab === 'report' && activeCase.report && (
                <div className="space-y-4 pt-1">
                  {/* Final Diagnosis Box */}
                  <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1.5">
                    <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                      <Bookmark className="w-4 h-4 text-emerald-700" />
                      <span>التشخيص الباثولوجي النهائي (Final Pathologic Diagnosis):</span>
                    </span>
                    <pre className="text-xs font-bold text-slate-900 whitespace-pre-wrap font-['Cairo',sans-serif] leading-relaxed bg-white p-3 rounded-lg border border-emerald-100">
                      {activeCase.report.finalDiagnosis}
                    </pre>
                  </div>

                  {/* Synoptic Checklist Section (CAP Standard) */}
                  {activeCase.report.synopticChecklist && (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                      <span className="font-black text-slate-900 block border-b border-slate-200 pb-1.5">
                        قائمة التقرير المتزامن المعياري (CAP Synoptic Protocol Data):
                      </span>
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
                          <strong className="text-emerald-700 font-mono font-black">{activeCase.report.synopticChecklist.pathologicStaging}</strong>
                        </div>
                      </div>
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
                  {activeCase.report.ancillaryStudies.length > 0 && (
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
