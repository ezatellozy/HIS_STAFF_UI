import React, { useState } from 'react';
import {
  HimOpsState,
  ReleaseOfInformationRequest,
  RecordDocumentReference
} from '../../../types/himOps';
import {
  evaluateRoiEligibility,
  prepareDisclosurePackage,
  executeSyntheticRelease
} from '../../../utils/himWorkflowEngine';
import { getPersonaProfile } from '../../../data/mockHimOpsData';
import {
  Share2,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  Eye,
  EyeOff,
  User,
  Building,
  Calendar,
  Lock,
  Download,
  AlertTriangle,
  Send,
  BookOpen
} from 'lucide-react';

interface ReleaseOfInformationWorkspaceProps {
  state: HimOpsState;
  onUpdateState: (updater: (prev: HimOpsState) => HimOpsState) => void;
}

export const ReleaseOfInformationWorkspace: React.FC<ReleaseOfInformationWorkspaceProps> = ({
  state,
  onUpdateState
}) => {
  const [selectedRequestId, setSelectedRequestId] = useState<string>(
    state.roiRequests[0]?.id || ''
  );
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'approved' | 'released'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const selectedRequest = state.roiRequests.find(r => r.id === selectedRequestId) || state.roiRequests[0];

  // Relevant patient documents
  const patientDocs = selectedRequest
    ? state.documents.filter(d => d.patientId === selectedRequest.patientId && !d.isQuarantined)
    : [];

  const eligibilityEval = selectedRequest
    ? evaluateRoiEligibility(selectedRequest, selectedRequest.activeLegalHoldPresent)
    : null;

  const disclosurePkg = selectedRequest
    ? prepareDisclosurePackage(selectedRequest, patientDocs)
    : null;

  const filteredRequests = state.roiRequests.filter(r => {
    const matchesSearch =
      r.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.purpose.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Action: Verify Requester Identity
  const handleVerifyIdentity = () => {
    if (!selectedRequest) return;

    onUpdateState(prev => {
      const prevActor = getPersonaProfile(prev.activePersona);
      return {
        ...prev,
        roiRequests: prev.roiRequests.map(r =>
          r.id === selectedRequest.id
            ? {
                ...r,
                isRequesterIdentityVerified: true
              }
            : r
        ),
        auditLogs: [
          {
            id: `AUD-${Date.now()}`,
            timestamp: new Date().toISOString().substring(0, 19).replace('T', ' '),
            actor: prevActor.name,
            persona: prev.activePersona,
            action: 'roi_reviewed',
            actorId: prevActor.id,
            actorName: prevActor.name,
            actorRole: prevActor.roleTitle,
            actionType: 'roi_reviewed',
            targetType: 'roi_request',
            targetId: selectedRequest.id,
            descriptionAr: `التحقق الرسمي من هوية وتفويض مقدم طلب الإفراج: ${selectedRequest.requesterName}`,
            patientId: selectedRequest.patientId,
            mrn: selectedRequest.mrn,
            details: `التحقق الرسمي من هوية وتفويض مقدم طلب الإفراج: ${selectedRequest.requesterName}`,
            classificationProfileId: 'HIM_PDPL_ENGINE'
          },
          ...prev.auditLogs
        ]
      };
    });

    setBannerNotice(`تم التحقق من هوية مقدم الطلب (${selectedRequest.requesterName}) بنجاح`);
    setTimeout(() => setBannerNotice(null), 4000);
  };

  // Action: Verify Legal Basis
  const handleVerifyLegalBasis = () => {
    if (!selectedRequest) return;

    onUpdateState(prev => {
      const prevActor = getPersonaProfile(prev.activePersona);
      return {
        ...prev,
        roiRequests: prev.roiRequests.map(r =>
          r.id === selectedRequest.id
            ? {
                ...r,
                isLegalBasisVerified: true
              }
            : r
        ),
        auditLogs: [
          {
            id: `AUD-${Date.now()}`,
            timestamp: new Date().toISOString().substring(0, 19).replace('T', ' '),
            actor: prevActor.name,
            persona: prev.activePersona,
            action: 'roi_reviewed',
            actorId: prevActor.id,
            actorName: prevActor.name,
            actorRole: prevActor.roleTitle,
            actionType: 'roi_reviewed',
            targetType: 'roi_request',
            targetId: selectedRequest.id,
            descriptionAr: `اعتماد السند النظامي والغرض المشروع لطلب الإفراج (PDPL-oriented privacy safeguards)`,
            patientId: selectedRequest.patientId,
            mrn: selectedRequest.mrn,
            details: `اعتماد السند النظامي والغرض المشروع لطلب الإفراج (Workflow informed by Saudi PDPL health-data processing controls)`,
            classificationProfileId: 'HIM_PDPL_ENGINE'
          },
          ...prev.auditLogs
        ]
      };
    });

    setBannerNotice('تم اعتماد السند النظامي والغرض المشروع لطلب الإفراج وفق ضوابط الخصوصية');
    setTimeout(() => setBannerNotice(null), 4000);
  };

  // Action: Execute Synthetic Release
  const handleExecuteRelease = () => {
    if (!selectedRequest) return;

    const actorProfile = getPersonaProfile(state.activePersona);
    const res = executeSyntheticRelease(selectedRequest, actorProfile.name);

    if (res.success && res.updatedRequest && res.disclosureLog) {
      onUpdateState(prev => {
        const prevActor = getPersonaProfile(prev.activePersona);
        return {
          ...prev,
          roiRequests: prev.roiRequests.map(r =>
            r.id === selectedRequest.id ? res.updatedRequest! : r
          ),
          disclosureLogs: [res.disclosureLog!, ...prev.disclosureLogs],
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: new Date().toISOString().substring(0, 19).replace('T', ' '),
              actor: prevActor.name,
              persona: prev.activePersona,
              action: 'roi_released',
              actorId: prevActor.id,
              actorName: prevActor.name,
              actorRole: prevActor.roleTitle,
              actionType: 'roi_released',
              targetType: 'roi_request',
              targetId: selectedRequest.id,
              descriptionAr: `تنفيذ إفراج المعلومات في بيئة العمل الاصطناعية وتوثيقه في سجل الإفصاح (${res.disclosureLog!.id})`,
              patientId: selectedRequest.patientId,
              mrn: selectedRequest.mrn,
              details: `Released in synthetic workflow (Log: ${res.disclosureLog!.id}). No real disclosure transmission.`,
              classificationProfileId: 'HIM_PDPL_ENGINE'
            },
            ...prev.auditLogs
          ]
        };
      });

      setBannerNotice(`تم تنفيذ الإفراج في بيئة العمل الاصطناعية بنجاح (Release in Synthetic Workflow: ${res.disclosureLog.id}) — مسار تجريبي ولا يعد إرسالاً خارجياً حقيقياً.`);
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">إجمالي طلبات الإفراج</span>
            <Share2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{state.roiRequests.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">طلبات مقدمة رسمياً</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">بانتظار التحقق من الهوية</span>
            <User className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">
            {state.roiRequests.filter(r => !r.isRequesterIdentityVerified).length}
          </div>
          <div className="text-[11px] text-amber-800/80 mt-1">يتطلب مطابقة الوثائق الرسمية</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-rose-200 bg-rose-50/30 shadow-xs">
          <div className="flex items-center justify-between text-rose-700 mb-1">
            <span className="text-xs font-bold">محظور (حجز قضائي / غير مؤهل)</span>
            <Lock className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700">
            {state.roiRequests.filter(r => r.activeLegalHoldPresent).length}
          </div>
          <div className="text-[11px] text-rose-800 mt-1">خاضع لحجز قضائي يمنع الإفراج</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-emerald-200 bg-emerald-50/30 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-xs font-bold">تم الإفراج وقيد الإفصاح</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">
            {state.roiRequests.filter(r => r.status === 'released').length}
          </div>
          <div className="text-[11px] text-emerald-800 mt-1">مقيد في سجل الإفصاح (PDPL Log)</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="البحث برقم الطلب، اسم المريض، المستلم، أو الغرض..."
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
              onClick={() => setStatusFilter('submitted')}
              className={`px-3 py-1 rounded-md transition-all font-semibold ${
                statusFilter === 'submitted'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-700 hover:text-amber-800'
              }`}
            >
              قيد المراجعة
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1 rounded-md transition-all font-semibold ${
                statusFilter === 'approved'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-700 hover:text-blue-800'
              }`}
            >
              معتمد بانتظار الصرف
            </button>
            <button
              onClick={() => setStatusFilter('released')}
              className={`px-3 py-1 rounded-md transition-all font-semibold ${
                statusFilter === 'released'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:text-emerald-800'
              }`}
            >
              مفرج عنه ومقيد
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>ضوابط الخصوصية واحتساب الحد الأدنى الضروري (PDPL-oriented privacy safeguards)</span>
        </div>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Requests List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-bold">قائمة طلبات إفراج المعلومات ({filteredRequests.length})</span>
            <span>اختر طلباً لمراجعة حزمة الإفصاح</span>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredRequests.map(r => {
              const isSelected = r.id === selectedRequest?.id;

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRequestId(r.id)}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/30 ring-2 ring-teal-500/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{r.patientName}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {r.mrn} • طلب: {r.requestNumber}
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'released'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : r.activeLegalHoldPresent
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : r.status === 'approved'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {r.status === 'released'
                        ? 'تم الإفراج'
                        : r.activeLegalHoldPresent
                        ? 'محظور (حجز قضائي)'
                        : r.status === 'approved'
                        ? 'معتمد للإفراج'
                        : 'قيد المراجعة'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-1 my-2">
                    <div><span className="font-bold">المستلم:</span> {r.requesterName} ({r.requesterType})</div>
                    <div><span className="font-bold">الغرض:</span> {r.purpose}</div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="font-semibold text-teal-700">
                      {r.requestedScope === 'minimum_necessary_encounter'
                        ? 'الحد الأدنى الضروري للتنويم'
                        : r.requestedScope === 'custom_date_range'
                        ? 'فترة زمنية محددة'
                        : 'استثناء كامل الملف'}
                    </span>
                    <span>{r.requestDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Selected Request Review & Disclosure Dossier (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedRequest ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
              {/* Header Banner */}
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedRequest.patientName}</h3>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 text-slate-700">
                      {selectedRequest.mrn}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-blue-50 text-blue-700 border border-blue-200">
                      {selectedRequest.requestNumber}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                    <span>مقدم الطلب: {selectedRequest.requesterName} ({selectedRequest.requesterType})</span>
                    <span>•</span>
                    <span>تاريخ التقديم: {selectedRequest.requestDate}</span>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="flex items-center gap-2">
                  {!selectedRequest.isRequesterIdentityVerified && (
                    <button
                      onClick={handleVerifyIdentity}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-all"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>التحقق من الهوية والتفويض</span>
                    </button>
                  )}

                  {!selectedRequest.isLegalBasisVerified && (
                    <button
                      onClick={handleVerifyLegalBasis}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-all"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>اعتماد السند النظامي (PDPL Safeguards)</span>
                    </button>
                  )}

                  {selectedRequest.status !== 'released' && (
                    <button
                      onClick={handleExecuteRelease}
                      disabled={!eligibilityEval?.isEligible}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                      title={eligibilityEval?.isEligible ? 'تنفيذ الإفراج في بيئة العمل الاصطناعية وقيده في سجل الإفصاح' : 'لا يمكن الإفراج قبل استيفاء التحقق من الهوية والسند النظامي'}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Release in Synthetic Workflow</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Legal Hold / Eligibility Alert */}
              <div className={`p-4 rounded-xl border text-xs space-y-2 ${
                eligibilityEval?.isEligible
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : 'bg-rose-50/70 border-rose-200'
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5 text-slate-800">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    محرك التحقق من ضوابط الخصوصية واحتساب الحد الأدنى الضروري (PDPL-oriented privacy safeguards)
                  </span>
                  <span className={eligibilityEval?.isEligible ? 'text-emerald-700' : 'text-rose-700'}>
                    {eligibilityEval?.isEligible ? 'مستوفٍ لضوابط الإفراج' : 'محظور من الإفراج'}
                  </span>
                </div>

                {eligibilityEval?.reasons && eligibilityEval.reasons.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {eligibilityEval.reasons.map((reason, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-rose-800 text-[11px] bg-white/80 p-2 rounded-lg border border-rose-200">
                        <XCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Minimum Necessary Scope Warning */}
              <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1.5">
                <div className="font-bold flex items-center gap-2 text-blue-800">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  مبدأ الحد الأدنى الضروري للمعلومات (Minimum Necessary Disclosure):
                </div>
                <div className="text-[11px] text-blue-800 leading-relaxed">
                  يقتصر الإفراج على الوثائق المرتبطة بالغرض المصرح به فقط (تنويم محدد أو نتائج محددة). يمنع نظاماً استخراج كامل السجل الطبي (Entire Chart) إلا بقرار قضائي صريح أو استثناء مبرر وموقع من مسؤول الخصوصية.
                </div>
              </div>

              {/* Disclosure Package Documents with Redaction Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-teal-600" />
                    الوثائق المشمولة في حزمة الإفصاح المجهزة ({patientDocs.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    الحجب والتنقيح يطبقان على نسخة الإفراج دون المساس بالسجل السريري الأصلي
                  </span>
                </div>

                {patientDocs.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    لا توجد وثائق مستوفاة لحزمة الإفصاح
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {patientDocs.map(doc => {
                      const isSensitive = doc.confidentialityLevel === 'sensitive' || doc.confidentialityLevel === 'highly_restricted';

                      return (
                        <div key={doc.id} className="p-3.5 text-xs bg-white space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{doc.titleAr}</span>
                              <span className="text-[10px] font-mono text-slate-400">v{doc.currentVersionNumber}</span>
                              {isSensitive && (
                                <span className="px-2 py-0.2 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                                  <Lock className="w-3 h-3" />
                                  بيانات حساسة
                                </span>
                              )}
                            </div>

                            <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              مشمول في الحزمة
                            </span>
                          </div>

                          {/* Redaction Comparison */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1">
                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                              <span className="text-[10px] font-bold text-slate-500 block mb-1">
                                الأصل السريري المحفوظ (غير معدل):
                              </span>
                              <div className="text-slate-700 font-mono">
                                {doc.contentSnippet || doc.versions[0]?.contentSnippet}
                              </div>
                            </div>

                            <div className="bg-amber-50/40 p-2.5 rounded-lg border border-amber-200">
                              <span className="text-[10px] font-bold text-amber-800 block mb-1 flex items-center gap-1">
                                <EyeOff className="w-3 h-3" />
                                نسخة الإفصاح المفرجة (المنقحة):
                              </span>
                              <div className="text-amber-900 font-mono">
                                {isSensitive
                                  ? '[تم حجب البيانات الحساسة أو ذات الخصوصية العالية بموجب نظام PDPL] - ' + (doc.contentSnippet || '').substring(0, 40) + '...'
                                  : doc.contentSnippet || doc.versions[0]?.contentSnippet}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Disclosure Log Ledger Reference */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>سجل الإفصاح الرسمي المقيد (PDPL Disclosure Ledger)</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {state.disclosureLogs.length} قيود مسجلة
                  </span>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {state.disclosureLogs.slice(0, 3).map(log => (
                    <div key={log.id} className="p-3 text-[11px] bg-white flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-900">{log.recipientName} ({log.recipientType})</div>
                        <div className="text-slate-500">
                          {log.patientMrn} • {log.purpose} • السند: {log.legalBasis}
                        </div>
                      </div>

                      <div className="text-left font-mono text-slate-400">
                        <div>{log.timestamp}</div>
                        <div className="text-emerald-700 font-bold">{log.id}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              اختر طلباً لمعاينة حزمة الإفصاح
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
