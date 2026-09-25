import React, { useState } from 'react';
import {
  HimOpsState,
  RetentionPolicyReference,
  LegalHoldRecord,
  RecordIntegrityException
} from '../../../types/himOps';
import {
  evaluateRetentionEligibility
} from '../../../utils/himWorkflowEngine';
import { getPersonaProfile } from '../../../data/mockHimOpsData';
import {
  Archive,
  ShieldAlert,
  Scale,
  Lock,
  Unlock,
  AlertTriangle,
  Clock,
  Calendar,
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  Plus,
  Building,
  User,
  History,
  FileCheck
} from 'lucide-react';

interface RetentionLegalHoldWorkspaceProps {
  state: HimOpsState;
  onUpdateState: (updater: (prev: HimOpsState) => HimOpsState) => void;
}

export const RetentionLegalHoldWorkspace: React.FC<RetentionLegalHoldWorkspaceProps> = ({
  state,
  onUpdateState
}) => {
  const [activeTab, setActiveTab] = useState<'legal_holds' | 'retention_policies' | 'integrity_exceptions' | 'audit_trail'>('legal_holds');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddHoldModal, setShowAddHoldModal] = useState(false);

  // New Hold Form State
  const [holdCaseNumber, setHoldCaseNumber] = useState('');
  const [holdAuthority, setHoldAuthority] = useState('');
  const [holdReason, setHoldReason] = useState('');
  const [holdTargetMrn, setHoldTargetMrn] = useState('MRN-789012');
  const [holdTargetEncounter, setHoldTargetEncounter] = useState('ENC-2026-ER-091');

  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Action: Add Legal Hold
  const handleAddLegalHold = () => {
    if (!holdCaseNumber.trim() || !holdAuthority.trim() || !holdReason.trim()) return;

    const actorProfile = getPersonaProfile(state.activePersona);
    const newHold: LegalHoldRecord = {
      id: `HOLD-${Date.now()}`,
      holdReferenceNumber: holdCaseNumber.trim(),
      titleAr: `حجز قضائي رقم ${holdCaseNumber.trim()}`,
      titleEn: `Legal Hold Case ${holdCaseNumber.trim()}`,
      caseNumber: holdCaseNumber.trim(),
      issuingAuthority: holdAuthority.trim(),
      authorizedSource: holdAuthority.trim(),
      reason: holdReason.trim(),
      patientId: 'P-101',
      patientName: 'عبد الله بن سعيد الشهري',
      mrn: holdTargetMrn,
      encounterId: holdTargetEncounter,
      startDate: new Date().toISOString().substring(0, 10),
      reviewDate: '2027-01-01',
      issuedAt: new Date().toISOString().substring(0, 10),
      placedByName: actorProfile.name,
      authorizedBy: actorProfile.name,
      status: 'active',
      affectedPatientIds: ['P-101'],
      affectedEncounterIds: [holdTargetEncounter],
      scopeDescription: 'حجز كامل السجل الطبي للتنويم المحدد',
      destructionLocked: true,
      expungementLocked: true,
      disclosureLocked: true
    };

    onUpdateState(prev => {
      const prevActor = getPersonaProfile(prev.activePersona);
      return {
        ...prev,
        legalHolds: [newHold, ...prev.legalHolds],
        auditLogs: [
          {
            id: `AUD-${Date.now()}`,
            timestamp: new Date().toISOString().substring(0, 19).replace('T', ' '),
            actor: prevActor.name,
            persona: prev.activePersona,
            action: 'legal_hold_placed',
            actorId: prevActor.id,
            actorName: prevActor.name,
            actorRole: prevActor.roleTitle,
            actionType: 'legal_hold_placed',
            targetType: 'legal_hold',
            targetId: newHold.id,
            descriptionAr: `فرض حجز قضائي / نظامي نشط (Legal Hold) برقم قضية: ${newHold.caseNumber} صادر من: ${newHold.issuingAuthority}`,
            patientId: newHold.patientId,
            mrn: newHold.mrn,
            details: `فرض حجز قضائي / نظامي نشط (Legal Hold) برقم قضية: ${newHold.caseNumber} صادر من: ${newHold.issuingAuthority}`,
            classificationProfileId: 'HIM_LEGAL_HOLD_ENGINE'
          },
          ...prev.auditLogs
        ]
      };
    });

    setBannerNotice(`تم فرض الحجز القضائي بنجاح وقفل السجل الطبي ضد أي إتلاف أو إفراج (رقم القضية: ${holdCaseNumber})`);
    setShowAddHoldModal(false);
    setHoldCaseNumber('');
    setHoldAuthority('');
    setHoldReason('');
    setTimeout(() => setBannerNotice(null), 5000);
  };

  // Action: Release Legal Hold
  const handleReleaseHold = (holdId: string) => {
    onUpdateState(prev => {
      const prevActor = getPersonaProfile(prev.activePersona);
      return {
        ...prev,
        legalHolds: prev.legalHolds.map(h =>
          h.id === holdId
            ? {
                ...h,
                status: 'released' as const,
                releasedAt: new Date().toISOString().substring(0, 10),
                releasedByName: prevActor.name,
                destructionLocked: false,
                disclosureLocked: false
              }
            : h
        ),
        auditLogs: [
          {
            id: `AUD-${Date.now()}`,
            timestamp: new Date().toISOString().substring(0, 19).replace('T', ' '),
            actor: prevActor.name,
            persona: prev.activePersona,
            action: 'legal_hold_released',
            actorId: prevActor.id,
            actorName: prevActor.name,
            actorRole: prevActor.roleTitle,
            actionType: 'legal_hold_released',
            targetType: 'legal_hold',
            targetId: holdId,
            descriptionAr: `رفع الحجز القضائي بعد صدور الحكم النهائي والتأكد من انتهاء الموجب القانوني`,
            details: `رفع الحجز القضائي بعد صدور الحكم النهائي والتأكد من انتهاء الموجب القانوني`,
            classificationProfileId: 'HIM_LEGAL_HOLD_ENGINE'
          },
          ...prev.auditLogs
        ]
      };
    });

    setBannerNotice('تم رفع الحجز القضائي بنجاح وتحديث صلاحية السجل الطبي');
    setTimeout(() => setBannerNotice(null), 4500);
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
        <div className="bg-white rounded-xl p-4 border border-rose-200 bg-rose-50/20 shadow-xs">
          <div className="flex items-center justify-between text-rose-700 mb-1">
            <span className="text-xs font-bold">الحجوزات القضائية النشطة</span>
            <Scale className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-800">
            {state.legalHolds.filter(h => h.status === 'active').length}
          </div>
          <div className="text-[11px] text-rose-700 mt-1">حظر مطلق للإتلاف أو الحذف</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">سياسات الحفظ النظامي</span>
            <Archive className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{state.retentionPolicies.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">لوائح وزارة الصحة المعتمدة</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-amber-200 bg-amber-50/30 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-xs font-bold">استثناءات نزاهة السجلات</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">
            {state.integrityExceptions.filter(e => e.status !== 'resolved').length}
          </div>
          <div className="text-[11px] text-amber-800 mt-1">دمج مكرر / وثائق واردة خطأً</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">سجل التدقيق الرقمي</span>
            <History className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{state.auditLogs.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">عمليات موثقة وغير قابلة للتعديل</div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="bg-white rounded-xl p-2 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('legal_holds')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'legal_holds'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>سجل الحجز القضائي والنظامي (Legal Holds)</span>
          </button>

          <button
            onClick={() => setActiveTab('retention_policies')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'retention_policies'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>مدد الحفظ والاستبقاء (Retention Schedules)</span>
          </button>

          <button
            onClick={() => setActiveTab('integrity_exceptions')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'integrity_exceptions'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>استثناءات سلامة السجلات (Integrity Exceptions)</span>
          </button>

          <button
            onClick={() => setActiveTab('audit_trail')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'audit_trail'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>سجل النشاط الاصطناعي (Synthetic Activity History)</span>
          </button>
        </div>

        {activeTab === 'legal_holds' && (
          <button
            onClick={() => setShowAddHoldModal(true)}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>مسار الحجز الاصطناعي للسجلات (Synthetic Legal Hold)</span>
          </button>
        )}
      </div>

      {/* Tab 1: Legal Holds */}
      {activeTab === 'legal_holds' && (
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-900 space-y-1">
            <div className="font-bold flex items-center gap-2 text-rose-800">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              مسار الحجز الاصطناعي للسجلات (Synthetic Legal Hold Workflow):
            </div>
            <div className="text-[11px] leading-relaxed">
              الحجز الاصطناعي للسجلات الطبية يعلق أي تصرف أو إتلاف أو استبعاد للملف بصورة مستقلة ومطلقة، بصرف النظر عن انتهاء مدة الحفظ المحسوبة. رفع الحجز يتطلب إجراءً اصطناعياً صريحاً ومصرحاً مع تسجيل السبب في سجل النشاط. التحرير العادي للسجلات لا يمكنه إزالة الحجز.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.legalHolds.map(hold => {
              const isActive = hold.status === 'active';

              return (
                <div
                  key={hold.id}
                  className={`p-5 rounded-2xl border text-xs space-y-3 ${
                    isActive
                      ? 'bg-white border-rose-300 shadow-xs ring-1 ring-rose-200'
                      : 'bg-slate-50 border-slate-200 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{hold.patientName}</span>
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {hold.mrn}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        رقم القضية: {hold.caseNumber}
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        isActive
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Lock className="w-3 h-3" />
                          حجز نشط ومقفل
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3 h-3" />
                          تم رفع الحجز
                        </>
                      )}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1 text-[11px]">
                    <div><span className="font-bold text-slate-700">الجهة القضائية / النظامية:</span> {hold.issuingAuthority}</div>
                    <div><span className="font-bold text-slate-700">سبب الحجز:</span> {hold.reason}</div>
                    <div><span className="font-bold text-slate-700">تاريخ الفرض:</span> {hold.issuedAt} (بواسطة: {hold.placedByName})</div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                    <span className="text-rose-700 font-bold flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      قفل الإتلاف والحجب مشغل
                    </span>

                    {isActive && (
                      <button
                        onClick={() => handleReleaseHold(hold.id)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>رفع الحجز القضائي</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Retention Policies */}
      {activeTab === 'retention_policies' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-1">
            <div className="font-bold flex items-center gap-2 text-blue-800">
              <Archive className="w-4 h-4 text-blue-600" />
              ملفات ومدد حفظ السجلات الطبية التوضيحية (Configurable Synthetic Retention Profiles):
            </div>
            <div className="text-[11px] leading-relaxed space-y-1">
              <div>
                • <strong>ضابط المصدر والتحقق:</strong> المدد المعروضة هي إعدادات توضيحية داخلية (ILLUSTRATIVE_CONFIGURATION) ولا تنسب كتشريع ملزم لوزارة الصحة السعودية لغياب مرجع تشريعي قطعي منشور في هذا النطاق.
              </div>
              <div>
                • <strong>القواعد غير الموثقة:</strong> أي فئة تفتقر للمرجع القطعي تظل بعلامة <code>RETENTION_RULE_NOT_VERIFIED</code> ويحظر افتراض مدة صفر أو إتلاف السجلات تلقائياً.
              </div>
              <div>
                • <strong>أولوية الحجز القضائي:</strong> الحجز القضائي يلغي أهلية التصرف أو الإتلاف بصورة مطلقة بصرف النظر عن انتهاء المدة المحسوبة.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.retentionPolicies.map(pol => {
              const duration = pol.durationRule ?? pol.retentionDurationYears;
              const isVerified = pol.ruleStatus === 'VERIFIED' && duration !== undefined;

              return (
                <div key={pol.policyId} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{pol.policyTitleAr || pol.recordCategory}</span>
                    <span className={`font-mono font-bold px-2.5 py-0.5 rounded-md border text-[11px] ${
                      isVerified
                        ? 'text-teal-700 bg-teal-50 border-teal-200'
                        : 'text-amber-800 bg-amber-50 border-amber-300'
                    }`}>
                      {isVerified ? `${duration} سنوات` : 'RETENTION_RULE_NOT_VERIFIED'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      pol.verificationState === 'verified_source'
                        ? 'bg-emerald-100 text-emerald-800'
                        : pol.verificationState === 'illustrative_configuration'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {pol.verificationState === 'verified_source'
                        ? 'مصدر قطعي موثق'
                        : pol.verificationState === 'illustrative_configuration'
                        ? 'إعداد توضيحي (ILLUSTRATIVE)'
                        : 'غير متحقق منه (NOT_VERIFIED)'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{pol.policyId}</span>
                  </div>

                  <div className="text-slate-600 leading-relaxed text-[11px]">
                    {pol.notes}
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] space-y-1">
                    <div><span className="font-bold text-slate-700">جهة المصدر:</span> {pol.sourceAuthority || 'غير محدد'}</div>
                    <div><span className="font-bold text-slate-700">المرجع التنظيمي:</span> {pol.sourceReference || 'RETENTION_RULE_NOT_VERIFIED'}</div>
                    <div><span className="font-bold text-slate-700">شرط بدء الاحتساب:</span> {pol.retentionTrigger}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Integrity Exceptions */}
      {activeTab === 'integrity_exceptions' && (
        <div className="space-y-4">
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            {state.integrityExceptions.map(exc => (
              <div key={exc.id} className="p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{exc.titleAr}</span>
                    <span className="font-mono text-[11px] text-slate-400">{exc.id}</span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      exc.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {exc.status === 'resolved' ? 'تمت المعالجة والاعتماد' : 'قيد المراجعة والتدقيق'}
                  </span>
                </div>

                <div className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed text-[11px]">
                  {exc.descriptionAr}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>المريض: {exc.patientName} ({exc.mrn})</span>
                  <span>المحقق: {exc.detectedBy} ({exc.detectedAt})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Synthetic Activity History */}
      {activeTab === 'audit_trail' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-bold">سجل النشاط الاصطناعي والعمليات التشغيلية — Synthetic Activity History ({state.auditLogs.length})</span>
            <span className="font-mono text-[11px]">Synthetic Provenance Preview</span>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            {state.auditLogs.map(log => (
              <div key={log.id} className="p-3.5 text-xs flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.actionType.replace(/_/g, ' ')}</span>
                    <span className="text-slate-400 font-mono text-[10px]">{log.id}</span>
                    {log.mrn && (
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600">
                        {log.mrn}
                      </span>
                    )}
                  </div>
                  <div className="text-slate-600 text-[11px]">{log.details}</div>
                </div>

                <div className="text-left font-mono text-[11px] text-slate-400 shrink-0">
                  <div>{log.timestamp}</div>
                  <div className="text-slate-600 font-sans font-semibold">{log.actorName}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add Legal Hold */}
      {showAddHoldModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-rose-800 flex items-center gap-2">
                <Scale className="w-4 h-4 text-rose-600" />
                فرض حجز قضائي / نظامي جديد (Place Legal Hold)
              </h3>
              <button onClick={() => setShowAddHoldModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">رقم القضية / المعاملة الرسمية:</label>
                <input
                  type="text"
                  value={holdCaseNumber}
                  onChange={e => setHoldCaseNumber(e.target.value)}
                  placeholder="مثال: CASE-2026-HC-891"
                  className="w-full p-2 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">الجهة الآمرة بالحجز:</label>
                <input
                  type="text"
                  value={holdAuthority}
                  onChange={e => setHoldAuthority(e.target.value)}
                  placeholder="مثال: المحكمة العامة بالرياض أو الهيئة الصحية الشرعية..."
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">رقم الملف الطبي المستهدف (MRN):</label>
                <input
                  type="text"
                  value={holdTargetMrn}
                  onChange={e => setHoldTargetMrn(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">سبب وموضوع الحجز القضائي:</label>
                <textarea
                  rows={3}
                  value={holdReason}
                  onChange={e => setHoldReason(e.target.value)}
                  placeholder="أدخل تفاصيل ومبررات الحجز القضائي..."
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAddHoldModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddLegalHold}
                disabled={!holdCaseNumber.trim() || !holdAuthority.trim() || !holdReason.trim()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg font-bold shadow-xs"
              >
                تأكيد فرض الحجز والقفل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
