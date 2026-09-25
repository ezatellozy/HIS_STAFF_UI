import React, { useState } from 'react';
import {
  HimOpsState,
  RecordDocumentReference
} from '../../../types/himOps';
import {
  createDocumentAmendment,
  createDocumentCorrection,
  markDocumentEnteredInError
} from '../../../utils/himWorkflowEngine';
import { getPersonaProfile } from '../../../data/mockHimOpsData';
import {
  FileText,
  History,
  AlertOctagon,
  ShieldCheck,
  Search,
  PlusCircle,
  Edit3,
  XCircle,
  Eye,
  CheckCircle2,
  Clock,
  User,
  ShieldAlert,
  Calendar,
  Lock
} from 'lucide-react';

interface DocumentIntegrityWorkspaceProps {
  state: HimOpsState;
  onUpdateState: (updater: (prev: HimOpsState) => HimOpsState) => void;
}

export const DocumentIntegrityWorkspace: React.FC<DocumentIntegrityWorkspaceProps> = ({
  state,
  onUpdateState
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(
    state.documents[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'signed' | 'amended' | 'entered_in_error'>('all');

  // Modals state
  const [showAddendumModal, setShowAddendumModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Form states
  const [addendumText, setAddendumText] = useState('');
  const [addendumReason, setAddendumReason] = useState('');
  const [correctionText, setCorrectionText] = useState('');
  const [correctionReason, setCorrectionReason] = useState('');
  const [errorReason, setErrorReason] = useState('');
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const selectedDoc = state.documents.find(d => d.id === selectedDocId) || state.documents[0];

  const filteredDocs = state.documents.filter(d => {
    const matchesSearch =
      d.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'entered_in_error'
        ? d.lifecycleState === 'entered_in_error' || d.isQuarantined
        : statusFilter === 'amended'
        ? d.lifecycleState === 'amended' || d.currentVersionNumber > 1
        : d.lifecycleState === 'signed';

    return matchesSearch && matchesStatus;
  });

  // Action: Add Addendum
  const handleSaveAddendum = () => {
    if (!selectedDoc || !addendumText.trim() || !addendumReason.trim()) return;

    const actorProfile = getPersonaProfile(state.activePersona);
    const res = createDocumentAmendment(
      selectedDoc,
      actorProfile.name,
      actorProfile.roleTitle,
      addendumText,
      addendumReason
    );

    if (res.success && res.updatedDocument) {
      onUpdateState(prev => {
        const prevActor = getPersonaProfile(prev.activePersona);
        return {
          ...prev,
          documents: prev.documents.map(d =>
            d.id === selectedDoc.id ? res.updatedDocument! : d
          ),
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: new Date().toISOString().substring(0, 19).replace('T', ' '),
              actor: prevActor.name,
              persona: prev.activePersona,
              action: 'document_amended',
              actorId: prevActor.id,
              actorName: prevActor.name,
              actorRole: prevActor.roleTitle,
              actionType: 'document_amended',
              targetType: 'document',
              targetId: selectedDoc.id,
              descriptionAr: `إضافة ملحق سريري (Addendum) للوثيقة: ${selectedDoc.titleAr} - سبب: ${addendumReason}`,
              patientId: selectedDoc.patientId,
              mrn: selectedDoc.mrn,
              details: `إضافة ملحق سريري (Addendum) للوثيقة: ${selectedDoc.titleAr} - سبب: ${addendumReason}`,
              classificationProfileId: 'HIM_DOC_INTEGRITY'
            },
            ...prev.auditLogs
          ]
        };
      });
      setBannerNotice(`تم تسجيل الملحق التوثيقي بنجاح للوثيقة ${selectedDoc.id}، وحفظ النسخة السابقة رقم ${selectedDoc.currentVersionNumber}`);
      setShowAddendumModal(false);
      setAddendumText('');
      setAddendumReason('');
      setTimeout(() => setBannerNotice(null), 5000);
    }
  };

  // Action: Save Correction
  const handleSaveCorrection = () => {
    if (!selectedDoc || !correctionText.trim() || !correctionReason.trim()) return;

    const actorProfile = getPersonaProfile(state.activePersona);
    const res = createDocumentCorrection(
      selectedDoc,
      actorProfile.name,
      actorProfile.roleTitle,
      correctionText,
      correctionReason
    );

    if (res.success && res.updatedDocument) {
      onUpdateState(prev => {
        const prevActor = getPersonaProfile(prev.activePersona);
        return {
          ...prev,
          documents: prev.documents.map(d =>
            d.id === selectedDoc.id ? res.updatedDocument! : d
          ),
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: new Date().toISOString().substring(0, 19).replace('T', ' '),
              actor: prevActor.name,
              persona: prev.activePersona,
              action: 'document_corrected',
              actorId: prevActor.id,
              actorName: prevActor.name,
              actorRole: prevActor.roleTitle,
              actionType: 'document_corrected',
              targetType: 'document',
              targetId: selectedDoc.id,
              descriptionAr: `تصحيح مادي للوثيقة: ${selectedDoc.titleAr} - سبب التصحيح: ${correctionReason}`,
              patientId: selectedDoc.patientId,
              mrn: selectedDoc.mrn,
              details: `تصحيح مادي للوثيقة: ${selectedDoc.titleAr} - سبب التصحيح: ${correctionReason}`,
              classificationProfileId: 'HIM_DOC_INTEGRITY'
            },
            ...prev.auditLogs
          ]
        };
      });
      setBannerNotice(`تم توثيق التصحيح المادي للوثيقة ${selectedDoc.id} مع إدراج سبب التصحيح والاحتفاظ بالنص السابق`);
      setShowCorrectionModal(false);
      setCorrectionText('');
      setCorrectionReason('');
      setTimeout(() => setBannerNotice(null), 5000);
    }
  };

  // Action: Mark Entered in Error
  const handleMarkEnteredInError = () => {
    if (!selectedDoc || !errorReason.trim()) return;

    const actorProfile = getPersonaProfile(state.activePersona);
    const res = markDocumentEnteredInError(
      selectedDoc,
      actorProfile.name,
      actorProfile.roleTitle,
      errorReason
    );

    if (res.success && res.updatedDocument) {
      onUpdateState(prev => {
        const prevActor = getPersonaProfile(prev.activePersona);
        return {
          ...prev,
          documents: prev.documents.map(d =>
            d.id === selectedDoc.id ? res.updatedDocument! : d
          ),
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: new Date().toISOString().substring(0, 19).replace('T', ' '),
              actor: prevActor.name,
              persona: prev.activePersona,
              action: 'document_entered_in_error',
              actorId: prevActor.id,
              actorName: prevActor.name,
              actorRole: prevActor.roleTitle,
              actionType: 'document_entered_in_error',
              targetType: 'document',
              targetId: selectedDoc.id,
              descriptionAr: `عزل الوثيقة وحجبها كمدخلة خطأً: ${selectedDoc.titleAr} - السبب: ${errorReason}`,
              patientId: selectedDoc.patientId,
              mrn: selectedDoc.mrn,
              details: `عزل الوثيقة وحجبها كمدخلة خطأً: ${selectedDoc.titleAr} - السبب: ${errorReason}`,
              classificationProfileId: 'HIM_DOC_INTEGRITY'
            },
            ...prev.auditLogs
          ]
        };
      });
      setBannerNotice(`تم عزل الوثيقة ${selectedDoc.id} وإلغاء اعتمادها السريري بنجاح، ووضع علامة Entered-in-Error المائية`);
      setShowErrorModal(false);
      setErrorReason('');
      setTimeout(() => setBannerNotice(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      {bannerNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{bannerNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="البحث بعنوان الوثيقة، اسم المريض، الطبيب، أو رقم الوثيقة..."
              className="w-full pl-3 pr-9 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md transition-all font-semibold ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setStatusFilter('signed')}
              className={`px-3 py-1 rounded-md transition-all font-semibold ${
                statusFilter === 'signed'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              معتمد وموقع
            </button>
            <button
              onClick={() => setStatusFilter('amended')}
              className={`px-3 py-1 rounded-md transition-all font-semibold ${
                statusFilter === 'amended'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-indigo-700 hover:text-indigo-800'
              }`}
            >
              معدل / ملحق (Amended)
            </button>
            <button
              onClick={() => setStatusFilter('entered_in_error')}
              className={`px-3 py-1 rounded-md transition-all font-semibold ${
                statusFilter === 'entered_in_error'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:text-rose-800'
              }`}
            >
              مدخل خطأً (معزول)
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>سلسلة سجل العمليات وإصدارات الوثيقة (Synthetic Version & Activity History)</span>
        </div>
      </div>

      {/* Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Document Registry (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-bold">سجل الوثائق السريرية المعتمدة ({filteredDocs.length})</span>
            <span>اختر وثيقة لمراجعة سلسلة الإصدارات</span>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredDocs.map(doc => {
              const isSelected = doc.id === selectedDoc?.id;
              const isError = doc.lifecycleState === 'entered_in_error' || doc.isQuarantined;

              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/30 ring-2 ring-indigo-500/20 shadow-xs'
                      : isError
                      ? 'border-rose-200 bg-rose-50/20 hover:border-rose-300'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        {isError && <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />}
                        <span>{doc.titleAr}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {doc.patientName} • {doc.mrn}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isError
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : doc.lifecycleState === 'amended'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {isError ? 'مدخل خطأً (معزول)' : doc.lifecycleState === 'amended' ? 'معدل / ملحق' : 'معتمد'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        الإصدار: v{doc.currentVersionNumber}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg line-clamp-2 my-2 border border-slate-100 font-mono">
                    {doc.contentSnippet || doc.versions[0]?.contentSnippet}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="truncate">{doc.authorName} ({doc.authorDepartment})</span>
                    <span>{doc.clinicalDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Version Dossier & Governance (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedDoc ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
              {/* Document Header & Banner */}
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedDoc.titleAr}</h3>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 text-slate-700">
                      v{selectedDoc.currentVersionNumber}
                    </span>
                    {selectedDoc.confidentialityLevel === 'highly_restricted' && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        عالي الحساسية
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                    <span>المريض: {selectedDoc.patientName} ({selectedDoc.mrn})</span>
                    <span>•</span>
                    <span>المحرر: {selectedDoc.authorName}</span>
                    <span>•</span>
                    <span>القسم: {selectedDoc.authorDepartment}</span>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="flex items-center gap-1.5">
                  {selectedDoc.lifecycleState !== 'entered_in_error' && !selectedDoc.isQuarantined ? (
                    <>
                      <button
                        onClick={() => setShowAddendumModal(true)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-all border border-indigo-200"
                        title="إضافة ملحق استكمالي دون المساس بالنص المعتمد"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>إلحاق (Addendum)</span>
                      </button>
                      <button
                        onClick={() => setShowCorrectionModal(true)}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-all border border-amber-200"
                        title="تصحيح مادي مع توثيق سبب التصحيح وحفظ النص الأصلي"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>تصحيح (Correction)</span>
                      </button>
                      <button
                        onClick={() => setShowErrorModal(true)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-all border border-rose-200"
                        title="عزل الوثيقة وحجبها لورودها بالخطأ"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>أدخل خطأً</span>
                      </button>
                    </>
                  ) : (
                    <span className="px-3 py-1.5 bg-rose-100 text-rose-800 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-rose-300">
                      <AlertOctagon className="w-4 h-4 text-rose-600" />
                      وثيقة معزولة ومحجوبة (Entered in Error)
                    </span>
                  )}
                </div>
              </div>

              {/* Watermark / Warning for Entered-in-Error */}
              {(selectedDoc.lifecycleState === 'entered_in_error' || selectedDoc.isQuarantined) && (
                <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-4 text-rose-900 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-2 text-rose-800">
                    <AlertOctagon className="w-5 h-5 text-rose-600" />
                    علامة أمان: تم استبعاد هذه الوثيقة نهائياً من الاستخدام السريري الروتيني
                  </div>
                  <div className="text-rose-700 leading-relaxed pr-7">
                    سبب العزل: {selectedDoc.versions[0]?.changeReason || 'تم إدخال الوثيقة بالخطأ في ملف المريض'}
                  </div>
                </div>
              )}

              {/* Version History Audit Chain */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-indigo-600" />
                    سلسلة الإصدارات التاريخية المحفوظة ({selectedDoc.versions.length} إصدارات)
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    الحفظ التراكمي لا يتيح الكتابة فوق النسخ السابقة
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedDoc.versions.map((ver, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border text-xs space-y-2 ${
                        idx === 0
                          ? 'bg-slate-50/80 border-slate-300 shadow-xs'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 text-[11px]">
                            الإصدار {ver.versionNumber}
                          </span>
                          <span className="font-bold text-slate-800">{ver.title}</span>
                          <span
                            className={`px-2 py-0.2 rounded-md text-[10px] font-bold ${
                              ver.changeType === 'original_created'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ver.changeType === 'amendment'
                                ? 'bg-indigo-100 text-indigo-800'
                                : ver.changeType === 'correction'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {ver.changeType}
                          </span>
                        </div>
                        <div className="text-slate-400 text-[11px] font-mono">
                          {ver.savedAt}
                        </div>
                      </div>

                      <div className="text-slate-700 bg-white p-3 rounded-lg border border-slate-200/80 leading-relaxed font-sans">
                        {ver.contentSnippet}
                      </div>

                      {ver.changeReason && (
                        <div className="text-[11px] text-amber-800 bg-amber-50/80 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5">
                          <Edit3 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>سبب التعديل / التصحيح: {ver.changeReason}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                        <span>الموقع: {ver.savedBy} ({ver.savedByRole})</span>
                        <span className="text-slate-400">{ver.relationshipToPrior}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              اختر وثيقة لمراجعة بياناتها وسلسلة إصداراتها
            </div>
          )}
        </div>
      </div>

      {/* Modal: Addendum */}
      {showAddendumModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-indigo-600" />
                إضافة ملحق سريري (Clinical Addendum)
              </h3>
              <button onClick={() => setShowAddendumModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="text-[11px] text-indigo-700 bg-indigo-50 p-2.5 rounded-lg border border-indigo-200 leading-relaxed">
              الملحق السريري يضيف معطيات جديدة إلى الوثيقة المعتمدة (مثل نتائج تحاليل لاحقة أو تطورات) دون شطب أو إعادة كتابة النص الأصلي.
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">سبب الملحق السريري:</label>
                <input
                  type="text"
                  value={addendumReason}
                  onChange={e => setAddendumReason(e.target.value)}
                  placeholder="مثال: استكمال نتائج زراعة الدم أو الرقم التسلسلي للغرسة..."
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">نص الملحق الإضافي:</label>
                <textarea
                  rows={4}
                  value={addendumText}
                  onChange={e => setAddendumText(e.target.value)}
                  placeholder="أدخل النص الاستكمالي الجديد..."
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAddendumModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveAddendum}
                disabled={!addendumText.trim() || !addendumReason.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-bold shadow-xs"
              >
                حفظ وإلحاق الإصدار الجديد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Correction */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-600" />
                تصحيح مادي للوثيقة (Material Correction)
              </h3>
              <button onClick={() => setShowCorrectionModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 leading-relaxed">
              وفقاً لقواعد السجلات الطبية، يتطلب أي تصحيح مادي توثيقاً صريحاً لسبب التصحيح، مع الحفاظ على النص السابق في تاريخ الإصدارات دون شطب مادي.
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">سبب التصحيح المادي (إلزامي):</label>
                <input
                  type="text"
                  value={correctionReason}
                  onChange={e => setCorrectionReason(e.target.value)}
                  placeholder="مثال: تصحيح خطأ كتابي في جرعة الدواء أو التوقيت..."
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">النص المصحح الجديد:</label>
                <textarea
                  rows={4}
                  value={correctionText}
                  onChange={e => setCorrectionText(e.target.value)}
                  placeholder="أدخل النص السريري المصحح..."
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowCorrectionModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveCorrection}
                disabled={!correctionText.trim() || !correctionReason.trim()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg font-bold shadow-xs"
              >
                حفظ التصحيح المادي
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Entered in Error */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-rose-800 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                عزل الوثيقة (Entered in Error Quarantine)
              </h3>
              <button onClick={() => setShowErrorModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="text-[11px] text-rose-800 bg-rose-50 p-2.5 rounded-lg border border-rose-200 leading-relaxed">
              تحذير نظامي: هذه العملية تعزل الوثيقة وتضع عليها علامة "أدخل خطأً". لا يتم حذف الوثيقة من قاعدة البيانات، بل تحجب عن العرض الروتيني وتحفظ لغايات التدقيق القانوني.
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">سبب العزل والخطأ التوثيقي (إلزامي):</label>
                <textarea
                  rows={3}
                  value={errorReason}
                  onChange={e => setErrorReason(e.target.value)}
                  placeholder="مثال: تسجيل الملاحظة في ملف مريض آخر عن طريق الخطأ..."
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={handleMarkEnteredInError}
                disabled={!errorReason.trim()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg font-bold shadow-xs"
              >
                تأكيد العزل وحجب الوثيقة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
