import React, { useState } from 'react';
import {
  GitFork,
  ArrowRightLeft,
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  Activity,
  Plus,
  ShieldCheck,
  MapPin,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Patient } from '../../../types/his';
import { useHis } from '../../../context/HisContext';
import { CareTransitionModal } from '../../CareTransitions/CareTransitionModal';
import {
  JourneyActualEvent,
  StructuredHandoverDocument
} from '../../../types/clinicalCarePlanJourney';
import { PatientJourneyTimelineView } from './journey/PatientJourneyTimelineView';
import { StructuredHandoverView } from './journey/StructuredHandoverView';

interface JourneyTimelineActivityProps {
  patient: Patient;
}

export const JourneyTimelineActivity: React.FC<JourneyTimelineActivityProps> = ({ patient }) => {
  const { careTransitions } = useHis();

  // Active Sub-Tab in Axis 10: Journey vs Handover vs Care Transition Requests
  const [activeSubTab, setActiveSubTab] = useState<'journey_timeline' | 'structured_handover' | 'care_transitions'>('journey_timeline');
  const [showTransitionModal, setShowTransitionModal] = useState(false);

  // Mock Actual Historical Events (Distinct from Requests and Handover)
  const [actualEvents, setActualEvents] = useState<JourneyActualEvent[]>([
    {
      id: 'jev-1',
      eventType: 'arrival_registration',
      titleAr: 'وصول المريض واستقبال الطوارئ والتصنيف المبدئي',
      titleEn: 'Emergency Department Arrival & Triage',
      category: 'encounter',
      effectiveDateTime: '2026-09-08 06:15',
      encounterId: 'ENC-2026-0908-01',
      fromLocation: 'الإسعاف (EMS Transport)',
      toLocation: 'قسم الطوارئ - سرير الإنعاش 01',
      responsibleTeamOrService: 'فريق طوارئ القلب والحوادث',
      clinicianName: 'د. سامي الجزار',
      clinicianRole: 'أخصائي طب الطوارئ',
      clinicalSummary: 'حضور المريض بألم حاد شديد خلف القص ممتد للذراع الأيسر مع تعرق بارد. تم تصنيفه فوراً كأولوية قصوى (Level 1 Resuscitation).',
      isMilestone: true,
      sourceContext: 'ER Care'
    },
    {
      id: 'jev-2',
      eventType: 'significant_milestone',
      titleAr: 'تأكيد التشخيص القلبي: STEMI عبر تخطيط القلب الأولي',
      titleEn: 'ECG STEMI Confirmed & Code STEMI Activated',
      category: 'milestone',
      effectiveDateTime: '2026-09-08 06:22',
      encounterId: 'ENC-2026-0908-01',
      responsibleTeamOrService: 'طوارئ القلب',
      clinicianName: 'د. سامي الجزار',
      clinicianRole: 'طبيب الطوارئ المعالج',
      clinicalSummary: 'إجراء تخطيط القلب في غضون 7 دقائق من الوصول، أظهر ارتفاع واضح في ST في المساري V1-V4. تم تفعيل كود القسطرة الطارئ فوراً.',
      isMilestone: true,
      sourceContext: 'ER Care'
    },
    {
      id: 'jev-3',
      eventType: 'clinical_location_move',
      titleAr: 'النقل الفوري إلى وحدة قسطرة القلب التداخلية',
      titleEn: 'Patient Transported to Cardiac Cath Lab',
      category: 'location',
      effectiveDateTime: '2026-09-08 06:45',
      encounterId: 'ENC-2026-0908-01',
      fromLocation: 'ER - سرير الإنعاش 01',
      toLocation: 'معمل القسطرة القلبية (Cath Lab 02)',
      responsibleTeamOrService: 'فريق النقل السريري التمريضي',
      clinicianName: 'محمود عبد الرازق',
      clinicianRole: 'فني طوارئ ونقل حرج',
      clinicalSummary: 'نقل سريع بمرافقة الطبيب والمونيتور المحمول دون أي مضاعفات في الطريق.',
      isMilestone: false,
      sourceContext: 'Cath Lab'
    },
    {
      id: 'jev-4',
      eventType: 'procedure_performed',
      titleAr: 'إجراء القسطرة التاجية وزراعة دعامة شريانية دوائية (PCI)',
      titleEn: 'Primary PCI with Drug-Eluting Stent (DES) to LAD',
      category: 'procedure',
      effectiveDateTime: '2026-09-08 07:40',
      encounterId: 'ENC-2026-0908-01',
      toLocation: 'Cath Lab 02',
      responsibleTeamOrService: 'فريق القسطرة القلبية التداخلية',
      clinicianName: 'د. خالد عبد العزيز',
      clinicianRole: 'استشاري أمراض القلب والقسطرة التداخلية',
      clinicalSummary: 'إجراء فتح ناجح للشريان التاجي الأيسر النازل الأمامي (LAD) مع استعادة كاملة لتدفق الدم (TIMI III Flow) وتركيب دعامة دوائية 3.5 × 18 mm.',
      isMilestone: true,
      sourceContext: 'Cath Lab'
    },
    {
      id: 'jev-5',
      eventType: 'icu_admission',
      titleAr: 'القبول والتنويم السريري في العناية القلبية المركزة (CCU)',
      titleEn: 'Admission to Coronary Care Unit (CCU Bed 03)',
      category: 'encounter',
      effectiveDateTime: '2026-09-08 08:30',
      encounterId: 'ENC-2026-0908-01',
      fromLocation: 'معمل القسطرة',
      toLocation: 'العناية القلبية المركزة CCU - السرير 03',
      responsibleTeamOrService: 'فريق CCU التمريضي والطبي',
      clinicianName: 'د. خالد عبد العزيز / ممرض أحمد جلال',
      clinicianRole: 'الفريق المعالج في العناية',
      clinicalSummary: 'استقرار تام بعد القسطرة، وصل المريض على تسريب هيبارين، وعلامات حيوية مستقرة تماماً.',
      isMilestone: true,
      sourceContext: 'Inpatient CCU'
    }
  ]);

  // Mock State for Structured Handovers (Item 3: Two-way discussion & profile-driven read-back)
  const [handovers, setHandovers] = useState<StructuredHandoverDocument[]>([
    {
      id: 'HND-20260908-01',
      contextType: 'internal_transfer',
      templateType: 'ISBAR',
      status: 'acknowledged',
      encounterId: 'ENC-2026-0908-01',
      createdAt: '2026-09-08 07:00',
      handoverTime: '2026-09-08 07:00',
      acknowledgedAt: '2026-09-08 07:05',
      sendingClinician: 'د. سامي الجزار',
      sendingClinicianRole: 'طبيب الطوارئ (ورديّة الليل)',
      sendingTeamOrUnit: 'ER Resuscitation Team',
      receivingClinician: 'د. خالد عبد العزيز',
      receivingClinicianRole: 'استشاري القسطرة القلبية',
      receivingTeamOrUnit: 'Interventional Cardiology Team',
      referencedContext: {
        currentLocation: 'معمل القسطرة (Cath Lab 02)',
        activeDiagnosis: 'احتشاء حاد بعضلة القلب (STEMI)',
        allergies: ['لا توجد حساسية معروفة'],
        resuscitationStatus: 'Full Code',
        activeInfusionsOrLines: ['خطين وريديين 18G', 'أكسجين عبر قنية أنفية'],
        keyVitalSignSnapshot: 'BP 130/80, HR 85, SpO2 97%',
        pendingResultsOrRequests: ['Troponin I متسلسل'],
        safetyPrecautions: ['مخاطر تدهور نظم القلب']
      },
      content: {
        situation: 'مريض ذكر 54 سنة حضر بألم حاد بالصدر وتشخيص مؤكد STEMI تم تفعيله للقسطرة الفورية.',
        background: 'تاريخ مرضي لداء السكري وضغط الدم، تناول الأسبرين والتيكاجريلور في الطوارئ.',
        assessment: 'ديناميكا الدم مستقرة ومستعد للقسطرة التداخلية الفورية.',
        recommendation: 'نقل مباشر لمعمل القسطرة والبدء بالقسطرة الأولية دون تأخير.'
      },
      actionItemsToFollowUp: [
        {
          id: 'act-1',
          description: 'البدء بالقسطرة وفتح الشريان',
          priority: 'stat',
          assignedDiscipline: 'طبيب القسطرة'
        }
      ],
      escalationConcerns: 'في حال حدوث بطء قلب حاد أو VT، يتم البدء ببروتوكول الإنعاش المتقدم فوراً.',
      provenanceSource: 'Emergency-to-Cath-Lab Handover',
      // Receiver Discussion (Two-way communication)
      receiverDiscussion: {
        questionsRaised: 'هل تم إعطاء الهيبارين وما هو قياس الـ ACT الحالي؟',
        clarificationsProvided: 'تم إعطاء 5000 وحدة دولية في تمام 06:50، الـ ACT مستهدف فوق 250 ثانية.',
        discussionNotes: 'تمت المناقشة الثنائية المباشرة وتأكيد جاهزية طاولة القسطرة.',
        documentedBy: 'د. خالد عبد العزيز (Cath Lab Attending)',
        documentedAt: '2026-09-08 07:04'
      },
      // Configured Profile where Read-Back is REQUIRED (High-risk transition)
      handoverProfile: {
        profileId: 'PROF-HND-HIGHRISK-READBACK',
        profileNameAr: 'بروفايل الانتقال الإسعافي الحرج (مع إلزامية التأكيد الشفوي)',
        requiresReadBack: true,
        readBackReasonAr: 'انتقال رعاية عالي الخطورة (High-Risk Emergency Care Transition)',
        readBackStatus: 'documented_confirmed',
        readBackNotes: 'قام استشاري القسطرة المستلم بمراجعة قراءات الشرايين وخطة الدعامات وإقرارها شفوياً وتأكيد المطابقة.'
      }
    },
    {
      id: 'HND-20260908-02',
      contextType: 'shift_change',
      templateType: 'SBAR',
      status: 'acknowledged',
      encounterId: 'ENC-2026-0908-01',
      createdAt: '2026-09-08 19:00',
      handoverTime: '2026-09-08 19:00',
      acknowledgedAt: '2026-09-08 19:12',
      sendingClinician: 'أحمد صلاح (RN)',
      sendingClinicianRole: 'تمريض العناية القلبية (نهاري)',
      sendingTeamOrUnit: 'CCU Day Nursing Team',
      receivingClinician: 'سارة العتيبي (RN)',
      receivingClinicianRole: 'تمريض العناية القلبية (ليلي)',
      receivingTeamOrUnit: 'CCU Night Nursing Team',
      referencedContext: {
        currentLocation: 'وحدة العناية القلبية - سرير 03',
        activeDiagnosis: 'ما بعد رأب الوعاء الإكليلي ودعامة دوائية للشريان الأمامي النازل LAD',
        allergies: ['لا توجد حساسية معروفة'],
        resuscitationStatus: 'Full Code',
        activeInfusionsOrLines: ['تسريب هيبارين وريدي مستمر معيار 1000u/hr', 'قنية وريدية طرفية يمنى'],
        keyVitalSignSnapshot: 'BP 118/74, HR 68, SpO2 99%',
        pendingResultsOrRequests: ['aPTT الساعة 22:00'],
        safetyPrecautions: ['راحة تامة بالسرير ومراقبة موضع القسطرة الفخذي']
      },
      content: {
        situation: 'المريض مستقر تماماً بعد القسطرة، لا يوجد ألم صدري، والنبض منتظم.',
        background: 'تم زرع دعامة دوائية بنجاح، وظائف الكلى طبيعية مع تعويض السوائل الوريدية.',
        assessment: 'الطرف السفلي دافئ مع نبض قوي في الشريان الظنبوبي الخلفي وموضع الدخول جاف.',
        recommendation: 'متابعة فحص موضع الوخز كل ساعتين وسحب عينة aPTT الساعة 22:00 لتعديل جرعة الهيبارين.'
      },
      actionItemsToFollowUp: [
        {
          id: 'act-2',
          description: 'سحب ومتابعة نتيجة aPTT الساعة 22:00',
          priority: 'urgent',
          assignedDiscipline: 'تمريض العناية المركزة'
        }
      ],
      escalationConcerns: 'إبلاغ الطبيب المقيم فوراً في حال حدوث تورم أو نزيف موضعي أو هبوط الضغط أقل من 95.',
      provenanceSource: 'CCU Shift Handover Record',
      // Receiver Discussion (Two-way communication)
      receiverDiscussion: {
        questionsRaised: 'هل اشتكى المريض من ألم موضعي بالفخذ أو طلب مسكناً خلال المساء؟',
        clarificationsProvided: 'لم يطلب أي مسكن؛ الألم موضعي خفيف جداً ومستقر، ومقياس الألم 1/10.',
        discussionNotes: 'تمت مراجعة خطة تسريب السوائل وتأكيد زمن العينة القادمة.',
        documentedBy: 'سارة العتيبي (Night RN)',
        documentedAt: '2026-09-08 19:10'
      },
      // Configured Profile where Read-Back is NOT required (Routine shift handover)
      handoverProfile: {
        profileId: 'PROF-HND-ROUTINE-SHIFT',
        profileNameAr: 'بروفايل تسليم المناوبة التمريضية الروتينية (بدون إلزامية القراءة العكسية)',
        requiresReadBack: false,
        readBackReasonAr: 'تسليم وردية روتيني ضمن نفس القسم السريري',
        readBackStatus: 'not_required_by_profile'
      }
    }
  ]);

  const patientTransitions = careTransitions.filter(t => t.patientId === patient.id);

  const handleAcknowledge = (id: string) => {
    setHandovers(prev =>
      prev.map(h => {
        if (h.id === id) {
          return {
            ...h,
            status: 'acknowledged',
            acknowledgedAt: 'اليوم، الآن',
            receivingClinician: 'د. شريف عثمان / ممرض CCU المستلم'
          };
        }
        return h;
      })
    );
  };

  return (
    <div className="space-y-4">
      {/* 1. Sub-Tab Header Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('journey_timeline')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'journey_timeline'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GitFork className="w-4 h-4" />
            <span>المسار السريري الزمني الفعلي (Patient Journey)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-100 text-teal-800">
              {actualEvents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('structured_handover')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'structured_handover'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>تسليم الحالات والمسؤولية السريرية (Structured Handover)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 text-purple-800">
              {handovers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('care_transitions')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'care_transitions'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>طلبات التحويل والانتقال بين الأقسام (Transition Requests)</span>
            {patientTransitions.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800">
                {patientTransitions.length}
              </span>
            )}
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400 px-3 hidden lg:block">
          Axis 10: Journey Timeline ≠ Structured Handover
        </div>
      </div>

      {/* 2. Sub-Tab View Rendering */}
      {activeSubTab === 'journey_timeline' && (
        <PatientJourneyTimelineView
          patient={patient}
          actualEvents={actualEvents}
          onRequestTransition={() => setShowTransitionModal(true)}
        />
      )}

      {activeSubTab === 'structured_handover' && (
        <StructuredHandoverView
          patient={patient}
          handovers={handovers}
          onAddHandover={doc => setHandovers(prev => [doc, ...prev])}
          onAcknowledgeHandover={handleAcknowledge}
        />
      )}

      {activeSubTab === 'care_transitions' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-teal-600" />
                <span>إدارة ومتابعة طلبات الانتقال السريري (Care Transitions Tracking)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                طلبات التحويل للأقسام الأخرى، حجز وتخصيص الأسرة، ونقل المرضى الداخلي والخارجي
              </p>
            </div>

            <button
              onClick={() => setShowTransitionModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>بدء طلب انتقال جديد</span>
            </button>
          </div>

          {patientTransitions.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
              <ArrowRightLeft className="w-8 h-8 mx-auto mb-2 opacity-40 text-teal-600" />
              <p className="font-bold text-slate-700">لا توجد طلبات انتقال سريري معلقة للمريض حالياً.</p>
              <p className="text-[11px] mt-1">المريض مستقر في سريره الحالي. يمكنك الضغط على "بدء طلب انتقال جديد" لتحويل الحالة.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {patientTransitions.map(trans => (
                <div
                  key={trans.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-teal-800">{trans.id}</span>
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-red-100 text-red-800">
                        {trans.priority.toUpperCase()}
                      </span>
                      <span className="text-slate-400 text-[11px]">• {trans.requestedAt}</span>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                      حالة الطلب: {trans.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                    <span>{trans.fromLocation}</span>
                    <ArrowRightLeft className="w-4 h-4 text-teal-600" />
                    <span className="text-teal-900">{trans.toLocation}</span>
                  </div>

                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                    <strong>سبب النقل:</strong> {trans.reason}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                    <span>مقدم الطلب: {trans.requestedBy}</span>
                    <button
                      onClick={() => setShowTransitionModal(true)}
                      className="text-teal-700 font-bold hover:underline cursor-pointer"
                    >
                      متابعة واعتماد مراحل النقل (Advance Transition) ➔
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Care Transition Modal */}
      <CareTransitionModal
        isOpen={showTransitionModal}
        onClose={() => setShowTransitionModal(false)}
        patient={patient}
      />
    </div>
  );
};
