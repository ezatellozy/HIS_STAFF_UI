import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  FileText,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRightLeft,
  X,
  Plus,
  Link as LinkIcon,
  MessageSquare
} from 'lucide-react';
import { Patient } from '../../../../types/his';
import {
  StructuredHandoverDocument,
  HandoverTemplateType,
  HandoverContextType
} from '../../../../types/clinicalCarePlanJourney';

interface StructuredHandoverViewProps {
  patient: Patient;
  handovers: StructuredHandoverDocument[];
  onAddHandover: (doc: StructuredHandoverDocument) => void;
  onAcknowledgeHandover: (id: string) => void;
}

export const StructuredHandoverView: React.FC<StructuredHandoverViewProps> = ({
  patient,
  handovers,
  onAddHandover,
  onAcknowledgeHandover
}) => {
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [expandedHandoverId, setExpandedHandoverId] = useState<string | null>(handovers[0]?.id || null);

  // Handover Form States
  const [templateType, setTemplateType] = useState<HandoverTemplateType>('SBAR');
  const [contextType, setContextType] = useState<HandoverContextType>('shift_change');
  const [sendingTeam, setSendingTeam] = useState('CCU Day Nursing Team');
  const [receivingTeam, setReceivingTeam] = useState('CCU Night Nursing Team');
  const [situation, setSituation] = useState(
    `المريض ${patient.fullNameAr} (${patient.age} سنة)، منوم في CCU بعد إجراء قسطرة قلبية علاجية وزراعة دعامة دوائية ناجحة.`
  );
  const [background, setBackground] = useState(
    `تاريخ مرضي: احتشاء قلبي حاد، سكري نوع 2، تم إيقاف الميتفورمين بسبب الصبغة. الحساسية: ${patient.allergies?.join('، ') || 'لا توجد'}.`
  );
  const [assessment, setAssessment] = useState(
    'العلامات الحيوية مستقرة تماماً: ضغط الدم 125/78، النبض 72 منتظم، تشبع الأكسجين 98% على هواء الغرفة. لا توجد أي نوبات ألم صدري أو نزيف بموضع الشريان الفخذي.'
  );
  const [recommendation, setRecommendation] = useState(
    'مراقبة موقع الفخذ كل 4 ساعات، استمرار تسريب الهيبارين مع قياس aPTT عند الساعة 18:00، والتأكد من إعطاء جرعة التيكاجريلور 90mg.'
  );
  const [escalationConcerns, setEscalationConcerns] = useState(
    'إذا انخفض ضغط الدم الانقباضي عن 95 أو حدث ألم مفاجئ بالصدر، استدعاء طبيب القلب المناوب فوراً.'
  );

  const handleSubmitHandover = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoc: StructuredHandoverDocument = {
      id: `HND-${Date.now()}`,
      contextType,
      templateType,
      status: 'ready_to_present',
      encounterId: 'ENC-2026-0908-01',
      createdAt: 'اليوم، الآن',
      handoverTime: 'اليوم، الآن',
      sendingClinician: 'أحمد جلال',
      sendingClinicianRole: 'CCU Charge Nurse',
      sendingTeamOrUnit: sendingTeam,
      receivingClinician: 'سارة إبراهيم',
      receivingClinicianRole: 'CCU Night Shift Nurse',
      receivingTeamOrUnit: receivingTeam,
      referencedContext: {
        currentLocation: 'CCU - السرير رقم 03',
        activeDiagnosis: (patient.chronicConditions || []).join('، ') || 'احتشاء قلبي حاد',
        allergies: patient.allergies || ['لا توجد حساسية معروفة'],
        resuscitationStatus: 'Full Code (إنعاش قلبي رئوي كامل)',
        activeInfusionsOrLines: ['تسريب هيبارين وريدي مستمر', 'قسطرة وريدية محيطية 18G باليد اليسرى'],
        keyVitalSignSnapshot: 'BP 125/78, HR 72, SpO2 98%, Pain 0/10',
        pendingResultsOrRequests: ['aPTT الساعة 18:00', 'كرياتينين الصباح'],
        safetyPrecautions: ['مخاطر نزيف (مضادات تخثر)', 'مخاطر سقوط متوسطة']
      },
      content: {
        situation,
        background,
        assessment,
        recommendation
      },
      actionItemsToFollowUp: [
        {
          id: `act-${Date.now()}-1`,
          description: 'متابعة نتيجة aPTT وتعديل تسريب الهيبارين',
          priority: 'urgent',
          assignedDiscipline: 'تمريض العناية القلبية'
        },
        {
          id: `act-${Date.now()}-2`,
          description: 'فحص نبض الشريان الكعبري والظنبوبي الخلفي وموضع القسطرة',
          priority: 'routine',
          assignedDiscipline: 'تمريض المناوبة'
        }
      ],
      escalationConcerns,
      provenanceSource: 'Structured Handover Protocol'
    };

    onAddHandover(newDoc);
    setExpandedHandoverId(newDoc.id);
    setShowCreateDrawer(false);
  };

  const getContextTypeBadge = (c: HandoverContextType) => {
    switch (c) {
      case 'shift_change':
        return { label: 'تسليم مناوبة (Shift Change)', color: 'bg-teal-100 text-teal-900 border-teal-300' };
      case 'internal_transfer':
        return { label: 'نقل داخلي بين الأقسام (Unit Transfer)', color: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'icu_stepdown':
        return { label: 'انتقال من العناية للجناح (Step-down)', color: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'or_pacu_transfer':
        return { label: 'تسليم العمليات والإفاقة (OR/PACU)', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      default:
        return { label: 'تسليم سريري', color: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  const getStatusBadge = (s: StructuredHandoverDocument['status']) => {
    switch (s) {
      case 'acknowledged':
        return { label: 'تم الاستلام والإقرار (Acknowledged)', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'sent_presented':
        return { label: 'تم العرض بانتظار الإقرار', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'ready_to_present':
        return { label: 'جاهز للتسليم الشفهي والسريري', color: 'bg-blue-100 text-blue-900 border-blue-300' };
      default:
        return { label: s, color: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & New Handover Action */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">
              تسليم الحالات السريرية الهيكلي (Structured Clinical Handover)
            </h4>
            <p className="text-xs text-slate-500">
              منظومة تسليم المسؤولية الطبية بين المناوبات والأقسام بنموذج SBAR الهيكلي المعتمد مع إقرار الاستلام
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateDrawer(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء وتوثيق تسليم جديد</span>
        </button>
      </div>

      {/* Structured Handover Document Cards */}
      <div className="space-y-4 text-xs">
        {handovers.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-purple-600" />
            <p className="font-bold text-slate-700">لا توجد وثائق تسليم سريري مسجلة حالياً.</p>
            <p className="text-[11px] mt-1">اضغط على زر "إنشاء وتوثيق تسليم جديد" لبدء تسليم الحالة بين الورديات أو الأقسام.</p>
          </div>
        ) : (
          handovers.map(doc => {
            const isExpanded = expandedHandoverId === doc.id;
            const ctxBadge = getContextTypeBadge(doc.contextType);
            const statusBadge = getStatusBadge(doc.status);

            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all text-xs"
              >
                {/* Header Strip */}
                <div
                  onClick={() => setExpandedHandoverId(isExpanded ? null : doc.id)}
                  className="p-4 bg-slate-50/70 hover:bg-slate-100/70 border-b border-slate-200 cursor-pointer flex flex-wrap items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-purple-700 font-bold shrink-0">
                      {doc.templateType}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{doc.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${ctxBadge.color}`}>
                          {ctxBadge.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <span>المسلّم: <strong className="text-slate-800">{doc.sendingClinician}</strong> ({doc.sendingTeamOrUnit})</span>
                        <span>➔</span>
                        <span>المستلم: <strong className="text-slate-800">{doc.receivingClinician || 'الفريق المناوب'}</strong> ({doc.receivingTeamOrUnit})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                    <span>{doc.handoverTime}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-5 space-y-4">
                    {/* Referenced Patient Safety Context Box (No data duplication) */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <LinkIcon className="w-3.5 h-3.5 text-teal-600" />
                        <span>السياق السريري المرجعي وقت التسليم (Referenced Clinical State):</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
                        <div className="p-2 bg-white rounded-lg border border-slate-200">
                          <span className="text-slate-400 block">الموقع والسرير:</span>
                          <strong className="text-slate-800">{doc.referencedContext.currentLocation}</strong>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-slate-200">
                          <span className="text-slate-400 block">خطة الإنعاش:</span>
                          <strong className="text-emerald-700">{doc.referencedContext.resuscitationStatus}</strong>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-slate-200">
                          <span className="text-slate-400 block">الخطوط الوريدية والتسريب:</span>
                          <strong className="text-purple-700">{doc.referencedContext.activeInfusionsOrLines.join(' • ')}</strong>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-slate-200">
                          <span className="text-slate-400 block">لقطة العلامات الحيوية:</span>
                          <strong className="text-teal-800 font-mono">{doc.referencedContext.keyVitalSignSnapshot}</strong>
                        </div>
                      </div>
                    </div>

                    {/* SBAR 4-Quadrant / Stack Structure */}
                    <div className="space-y-3">
                      {/* S: Situation */}
                      <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200 space-y-1">
                        <div className="flex items-center gap-1.5 font-extrabold text-blue-950 text-xs">
                          <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px]">S</span>
                          <span>الموقف والوضع السريري الحالي (Situation):</span>
                        </div>
                        <p className="text-slate-800 leading-relaxed mr-6">{doc.content.situation}</p>
                      </div>

                      {/* B: Background */}
                      <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 space-y-1">
                        <div className="flex items-center gap-1.5 font-extrabold text-amber-950 text-xs">
                          <span className="w-5 h-5 rounded-md bg-amber-600 text-white flex items-center justify-center text-[10px]">B</span>
                          <span>الخلفية المرضية والتاريخ السريري (Background):</span>
                        </div>
                        <p className="text-slate-800 leading-relaxed mr-6">{doc.content.background}</p>
                      </div>

                      {/* A: Assessment */}
                      <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-200 space-y-1">
                        <div className="flex items-center gap-1.5 font-extrabold text-purple-950 text-xs">
                          <span className="w-5 h-5 rounded-md bg-purple-600 text-white flex items-center justify-center text-[10px]">A</span>
                          <span>التقييم السريري الحالي والنتائج (Assessment):</span>
                        </div>
                        <p className="text-slate-800 leading-relaxed mr-6">{doc.content.assessment}</p>
                      </div>

                      {/* R: Recommendation */}
                      <div className="p-3.5 rounded-xl bg-teal-50/50 border border-teal-200 space-y-1">
                        <div className="flex items-center gap-1.5 font-extrabold text-teal-950 text-xs">
                          <span className="w-5 h-5 rounded-md bg-teal-600 text-white flex items-center justify-center text-[10px]">R</span>
                          <span>التوصيات وخطة المتابعة للوردية القادمة (Recommendation):</span>
                        </div>
                        <p className="text-slate-800 leading-relaxed mr-6">{doc.content.recommendation}</p>
                      </div>
                    </div>

                    {/* Escalation Concerns */}
                    {doc.escalationConcerns && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-950 text-[11px]">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold">حدود ونقاط التصعيد العاجل (Escalation Watch Criteria):</strong>
                          <p className="mt-0.5 text-rose-900">{doc.escalationConcerns}</p>
                        </div>
                      </div>
                    )}

                    {/* Action Items to Follow Up */}
                    {doc.actionItemsToFollowUp && doc.actionItemsToFollowUp.length > 0 && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <span className="font-bold text-slate-800 text-[11px] block">
                          مهام ومتابعات موجهة للوردية القادمة (Watchlist Actions):
                        </span>
                        <div className="space-y-1">
                          {doc.actionItemsToFollowUp.map(act => (
                            <div key={act.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-[11px]">
                              <span className="text-slate-800 font-medium">📋 {act.description}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400">{act.assignedDiscipline}</span>
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                                  {act.priority.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Receiver Opportunity for Discussion & Clarifications (Item 3: Two-way communication) */}
                    {doc.receiverDiscussion && (
                      <div className="p-3.5 rounded-xl bg-teal-50/50 border border-teal-200 text-xs space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-teal-950">
                          <MessageSquare className="w-3.5 h-3.5 text-teal-700" />
                          <span>المناقشة والاستيضاح الثنائي للطرف المستلم (Receiver Discussion & Clarifications):</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-white/80 p-2.5 rounded-lg border border-teal-100">
                          {doc.receiverDiscussion.questionsRaised && (
                            <div>
                              <span className="font-bold text-slate-700 block mb-0.5">أسئلة واستفسارات المستلم:</span>
                              <p className="text-slate-600">{doc.receiverDiscussion.questionsRaised}</p>
                            </div>
                          )}
                          {doc.receiverDiscussion.clarificationsProvided && (
                            <div>
                              <span className="font-bold text-slate-700 block mb-0.5">التوضيحات والإجابات المقدمة:</span>
                              <p className="text-slate-600">{doc.receiverDiscussion.clarificationsProvided}</p>
                            </div>
                          )}
                        </div>
                        {doc.receiverDiscussion.discussionNotes && (
                          <div className="text-[11px] text-slate-600">
                            <span className="font-semibold text-slate-700">ملاحظات التنسيق السريري:</span> {doc.receiverDiscussion.discussionNotes}
                          </div>
                        )}
                        {doc.receiverDiscussion.documentedBy && (
                          <div className="text-[10px] text-slate-400">
                            وثّق بواسطة: {doc.receiverDiscussion.documentedBy} • {doc.receiverDiscussion.documentedAt}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Configured Handover Verification / Interaction Profile (Item 3 & Scenario H) */}
                    {doc.handoverProfile && (
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                            <span>بروفايل سياسة التسليم: {doc.handoverProfile.profileNameAr}</span>
                          </span>
                          {doc.handoverProfile.requiresReadBack ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-[10px] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>التأكيد الشفوي المتبادل (Read-Back): موثّق ومكتمل ✓</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-200/80 border border-slate-300 text-slate-700 font-medium text-[10px]">
                              التأكيد الشفوي: غير مطلوب وفق سياسة البروفايل
                            </span>
                          )}
                        </div>
                        {doc.handoverProfile.requiresReadBack && doc.handoverProfile.readBackNotes && (
                          <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                            {doc.handoverProfile.readBackNotes}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Handover Acknowledgement Section */}
                    <div className="p-3.5 bg-slate-100/70 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-teal-700" />
                        <span className="text-[11px] text-slate-600">
                          {doc.status === 'acknowledged' ? (
                            <span>
                              تم إقرار الاستلام السريري بواسطة: <strong>{doc.receivingClinician || 'المستلم'}</strong> عند {doc.acknowledgedAt || 'اليوم'}
                            </span>
                          ) : (
                            <span>بانتظار إقرار الاستلام من الممارس المستلم (Two-way Closed Loop Handoff)</span>
                          )}
                        </span>
                      </div>

                      {doc.status !== 'acknowledged' && (
                        <button
                          onClick={() => onAcknowledgeHandover(doc.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>إقرار وتأكيد استلام الحالة السريرية</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New Handover Drawer */}
      {showCreateDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-end animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden text-xs">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-400" />
                <h4 className="font-bold text-sm">توثيق تسليم سريري هيكلي (New Structured Handover)</h4>
              </div>
              <button
                onClick={() => setShowCreateDrawer(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitHandover} className="p-6 overflow-y-auto flex-1 space-y-4 text-slate-800">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-[11px]">
                <strong>المريض:</strong> {patient.fullNameAr} ({patient.mrn}) • الموقع: CCU السرير 03
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">نموذج التسليم (Template Profile):</label>
                  <select
                    value={templateType}
                    onChange={e => setTemplateType(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="SBAR">SBAR (Situation - Background - Assessment - Recommendation)</option>
                    <option value="ISBAR">ISBAR (Identification + SBAR)</option>
                    <option value="IPASS">IPASS (Illness Severity - Patient Summary - Action List)</option>
                    <option value="SOAP">SOAP Handoff Note</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">سياق التسليم السريري:</label>
                  <select
                    value={contextType}
                    onChange={e => setContextType(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="shift_change">تسليم وردية / مناوبة (Shift Handover)</option>
                    <option value="internal_transfer">نقل داخلي بين الأقسام (Unit Transfer)</option>
                    <option value="icu_stepdown">نقل من العناية المركزة للتنويم (ICU Stepdown)</option>
                    <option value="or_pacu_transfer">تسليم العمليات والإفاقة (OR/PACU)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الفريق أو الوحدة المسلّمة:</label>
                  <input
                    type="text"
                    value={sendingTeam}
                    onChange={e => setSendingTeam(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الفريق أو الوحدة المستلمة:</label>
                  <input
                    type="text"
                    value={receivingTeam}
                    onChange={e => setReceivingTeam(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              {/* SBAR Form Inputs */}
              <div>
                <label className="font-extrabold text-blue-900 block mb-1">
                  1. الموقف السريري المباشر (Situation):
                </label>
                <textarea
                  rows={2}
                  value={situation}
                  onChange={e => setSituation(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-extrabold text-amber-900 block mb-1">
                  2. الخلفية المرضية والتاريخ السريري (Background):
                </label>
                <textarea
                  rows={2}
                  value={background}
                  onChange={e => setBackground(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-extrabold text-purple-900 block mb-1">
                  3. التقييم السريري ونتائج الفحوصات (Assessment):
                </label>
                <textarea
                  rows={2}
                  value={assessment}
                  onChange={e => setAssessment(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-extrabold text-teal-900 block mb-1">
                  4. التوصيات وخطة الرعاية الموجهة (Recommendation):
                </label>
                <textarea
                  rows={2}
                  value={recommendation}
                  onChange={e => setRecommendation(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-extrabold text-rose-800 block mb-1">
                  نقاط التصعيد والمخاطر الحرجة (Escalation Watch Criteria):
                </label>
                <input
                  type="text"
                  value={escalationConcerns}
                  onChange={e => setEscalationConcerns(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  حفظ واعتماد وثيقة التسليم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
