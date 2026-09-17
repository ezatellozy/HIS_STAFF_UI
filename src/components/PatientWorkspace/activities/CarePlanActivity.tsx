import React, { useState } from 'react';
import {
  HeartHandshake,
  Target,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Filter,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Activity,
  Calendar,
  Layers,
  Sparkles,
  Link as LinkIcon,
  ShieldCheck,
  BookOpen,
  FileCheck,
  X
} from 'lucide-react';
import { Patient } from '../../../types/his';
import {
  MultidisciplinaryCarePlanItem,
  CarePlanGoal,
  CarePlanIntervention,
  CarePlanDiscipline,
  CarePlanGoalStatus,
  EducationRecord,
  DischargeReadinessCheckItem,
  FollowUpPlanItem
} from '../../../types/clinicalCarePlanJourney';
import { PatientEducationView } from './carePlan/PatientEducationView';
import { DischargeReadinessView } from './carePlan/DischargeReadinessView';

interface CarePlanActivityProps {
  patient: Patient;
}

export const CarePlanActivity: React.FC<CarePlanActivityProps> = ({ patient }) => {
  // Main Sub-Tab within Axis 9
  const [activeSubTab, setActiveSubTab] = useState<'care_plan' | 'education' | 'discharge_readiness'>('care_plan');

  // Discipline Filter for Care Plan Goals & Interventions
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('active');

  // Drawer for Adding/Editing Care Plan Item
  const [showAddGoalDrawer, setShowAddGoalDrawer] = useState(false);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>('cp-1');

  // Mock State for Multidisciplinary Care Plan Items
  const [carePlanItems, setCarePlanItems] = useState<MultidisciplinaryCarePlanItem[]>([
    {
      id: 'cp-1',
      titleAr: 'خطة استقرار ديناميكا الدم وعضلة القلب بعد المتلازمة الإكليلية الحادة',
      titleEn: 'Cardiovascular Hemodynamic Stabilization Post-ACS',
      category: 'medical',
      discipline: 'physician',
      ownerName: 'د. خالد عبد العزيز',
      ownerRole: 'استشاري أمراض القلب والعناية القلبية المركزة (CCU)',
      priority: 'high',
      lifecycleStatus: 'active',
      createdAt: '2026-09-08 09:30',
      updatedAt: '2026-09-08 14:00',
      provenance: {
        createdBy: 'د. خالد عبد العزيز',
        department: 'icu',
        encounterId: 'ENC-2026-0908-01',
        reviewScheduledAt: '2026-09-09 08:00'
      },
      linkedReferences: [
        {
          type: 'diagnosis',
          id: 'diag-1',
          label: 'احتشاء حاد بعضلة القلب مع ارتفاع ST (STEMI Anterolateral)'
        },
        {
          type: 'observation',
          id: 'obs-trop',
          label: 'Troponin I عالي الحساسية: 420 ng/L (مرتفع حرج)'
        },
        {
          type: 'order',
          id: 'ord-heparin',
          label: 'تسريب وريدي مستمر للهيبارين مع قياس aPTT كل 6 ساعات'
        }
      ],
      goals: [
        {
          id: 'goal-1',
          descriptionAr: 'الحفاظ على استقرار ضغط الدم الشرياني ومعدل النبض الطبيعي بدون نوبات ذبحة',
          descriptionEn: 'Maintain MAP > 65 mmHg, HR 60-80 bpm, zero anginal episodes',
          targetMetric: 'MAP ≥ 65 mmHg, HR 60-80 bpm, Pain = 0/10',
          targetDate: 'خلال 24 ساعة',
          priority: 'high',
          status: 'active',
          currentProgressPercent: 75,
          latestProgressSummary: 'المريض مستقر حالياً، لا يشكو من ألم صدري خلال آخر 6 ساعات، ضغط الدم 125/78.',
          lastAssessedAt: 'اليوم، 14:00',
          lastAssessedBy: 'د. شريف عثمان (طبيب مقيم قلب)',
          interventions: [
            {
              id: 'int-1',
              actionTitleAr: 'مراقبة التخطيط القلبي المستمر وملاحظة أي تسارع بطيني أو تغيرات في ST',
              discipline: 'nursing',
              ownerName: 'أحمد جلال (CCU RN)',
              frequencyOrTiming: 'مستمر على شاشة المونيتور',
              status: 'in_progress',
              notes: 'تنبيه الطبيب فوراً عند تجاوز النبض 100 أو انخفاضه دون 50.'
            },
            {
              id: 'int-2',
              actionTitleAr: 'ضبط جرعة النيتروجليسرين الوريدي حسب بروتوكول الألم الشرياني',
              discipline: 'physician',
              ownerName: 'د. خالد عبد العزيز',
              frequencyOrTiming: 'تسريب مستمر مع معايرة الجرعة',
              status: 'in_progress'
            }
          ]
        },
        {
          id: 'goal-2',
          descriptionAr: 'تحقيق زمن تخثر علاجي مستهدف (Target aPTT 60-80 sec) لتفادي تجلط الدعامة',
          targetMetric: 'aPTT: 60 - 80 seconds',
          targetDate: 'اليوم، 18:00',
          priority: 'high',
          status: 'active',
          currentProgressPercent: 90,
          latestProgressSummary: 'آخر نتيجة aPTT كانت 68 ثانية، وهي ضمن النطاق العلاجي المطلوب.',
          lastAssessedAt: 'اليوم، 12:30',
          lastAssessedBy: 'د. سارة عادل (صيدلي إكلينيكي)',
          interventions: [
            {
              id: 'int-3',
              actionTitleAr: 'سحب عينة aPTT وإعادة تقييم معدل التسريب بالتنسيق مع الصيدلة السريرية',
              discipline: 'clinical_pharmacy',
              ownerName: 'د. سارة عادل',
              frequencyOrTiming: 'كل 6 ساعات',
              status: 'in_progress'
            }
          ]
        }
      ]
    },
    {
      id: 'cp-2',
      titleAr: 'خطة التأهيل الحركي والتنفسي والحد من مخاطر التدهور الوظيفي',
      titleEn: 'Early Mobility & Pulmonary Care Protocol',
      category: 'rehabilitation',
      discipline: 'physiotherapy',
      ownerName: 'أ. هاني سليم',
      ownerRole: 'أخصائي العلاج الطبيعي والتأهيل القلبي',
      priority: 'medium',
      lifecycleStatus: 'active',
      createdAt: '2026-09-08 10:15',
      updatedAt: '2026-09-08 13:45',
      provenance: {
        createdBy: 'أ. هاني سليم',
        department: 'icu',
        encounterId: 'ENC-2026-0908-01'
      },
      linkedReferences: [
        {
          type: 'assessment',
          id: 'ass-mob',
          label: 'تقييم القدرة الوظيفية (ICU Mobility Scale: Level 1)'
        }
      ],
      goals: [
        {
          id: 'goal-3',
          descriptionAr: 'الجلوس على حافة السرير لمدة 20 دقيقة مرتين يومياً دون هبوط ضغط انتصابي',
          targetMetric: 'Sit on bedside > 20 min, Delta SBP < 15 mmHg',
          targetDate: 'غداً، 11:00',
          priority: 'medium',
          status: 'active',
          currentProgressPercent: 50,
          latestProgressSummary: 'تمكن المريض من الجلوس بزاوية 60 درجة على السرير لمدة 15 دقيقة مع ثبات العلامات الحيوية.',
          lastAssessedAt: 'اليوم، 11:15',
          lastAssessedBy: 'أ. هاني سليم',
          interventions: [
            {
              id: 'int-4',
              actionTitleAr: 'تمارين الحركة السلبية والإيجابية للأطراف السفلية لتنشيط الدورة الدموية',
              discipline: 'physiotherapy',
              ownerName: 'أ. هاني سليم',
              frequencyOrTiming: 'مرتان يومياً',
              status: 'in_progress'
            },
            {
              id: 'int-5',
              actionTitleAr: 'تمارين التنفس العميق واستخدام مقياس التنفس الحافز (Incentive Spirometry)',
              discipline: 'respiratory_therapy',
              ownerName: 'م. تامر ممدوح (RRT)',
              frequencyOrTiming: '10 مرات كل ساعتين يقظة',
              status: 'in_progress'
            }
          ]
        }
      ]
    },
    {
      id: 'cp-3',
      titleAr: 'خطة التغذية العلاجية وضبط الشوارد للوقاية من اعتلال الكلى',
      titleEn: 'Cardio-Renal Medical Nutrition Therapy',
      category: 'nutrition',
      discipline: 'clinical_nutrition',
      ownerName: 'د. ياسمين النجار',
      ownerRole: 'أخصائية التغذية العلاجية السريرية',
      priority: 'medium',
      lifecycleStatus: 'active',
      createdAt: '2026-09-08 11:00',
      updatedAt: '2026-09-08 12:00',
      provenance: {
        createdBy: 'د. ياسمين النجار',
        department: 'icu',
        encounterId: 'ENC-2026-0908-01'
      },
      linkedReferences: [
        {
          type: 'diagnosis',
          id: 'diag-dm',
          label: 'داء السكري من النوع الثاني'
        }
      ],
      goals: [
        {
          id: 'goal-4',
          descriptionAr: 'الالتزام بحمية قلبية قليلة الصوديوم (<2g/يوم) ومراقبة سكر الدم بين 140-180 mg/dL',
          targetMetric: 'Sodium < 2000 mg/day, Blood Glucose: 140-180 mg/dL',
          targetDate: 'مستمر طوال فترة التنويم',
          priority: 'medium',
          status: 'active',
          currentProgressPercent: 80,
          latestProgressSummary: 'المريض يتناول الوجبات المقررة بانتظام، قراءات السكر مستقرة على بروتوكول الأنسولين.',
          lastAssessedAt: 'اليوم، 12:00',
          lastAssessedBy: 'د. ياسمين النجار',
          interventions: [
            {
              id: 'int-6',
              actionTitleAr: 'تطبيق وجبات القلب المنخفضة للملح والدهون المشبعة',
              discipline: 'clinical_nutrition',
              ownerName: 'قسم التغذية العلاجية',
              frequencyOrTiming: '3 وجبات رئيسية + وجبة خفيفة',
              status: 'in_progress'
            }
          ]
        }
      ]
    }
  ]);

  // Mock State for Education Records (Axis 9)
  const [educationRecords, setEducationRecords] = useState<EducationRecord[]>([
    {
      id: 'edu-1',
      topicCategory: 'medication',
      topicTitleAr: 'تثقيف حول العلاج المضاد للصفائح الثنائي (DAPT: Aspirin + Ticagrelor)',
      topicTitleEn: 'Dual Antiplatelet Therapy Education',
      specificContentSummary:
        'تم شرح ضرورة عدم إيقاف الأسبرين والتيكاجريلور تحت أي ظرف دون استشارة طبيب القلب المعالج لمنع انسداد الدعامة التاجية. تم شرح أعراض النزيف التي تستوجب مراجعة الطوارئ.',
      audience: 'patient_and_caregiver',
      audienceName: `${patient.fullNameAr} وزوجته`,
      method: 'verbal_discussion',
      languageUsed: 'العربية (Arabic)',
      interpreterUsed: false,
      materialsProvided: ['كتيب العناية بالدعامات التاجية المطبوع', 'بطاقة تنبيه دواء السيولة'],
      educatorName: 'د. سارة عادل',
      educatorRole: 'صيدلي إكلينيكي CCU',
      documentedAt: '2026-09-08 11:30',
      teachBackAssessment: {
        conducted: true,
        comprehension: 'demonstrated_understanding',
        notes: 'قام المريض والمرافق بذكر موعد الجرعات وأكدا على عدم التوقف عن تناول الدواء حتى لو شعر بتحسن تام.'
      },
      patientQuestionsOrConcerns: 'استفسار عن إمكانية شرب الشاي والقهوة، ونصح بالاعتدال وتجنب المنبهات الزائدة.',
      followUpEducationNeeded: false
    },
    {
      id: 'edu-2',
      topicCategory: 'diet_nutrition',
      topicTitleAr: 'الحمية الغذائية قليلة الصوديوم وصحة عضلة القلب بعد القسطرة',
      topicTitleEn: 'Low-Sodium Heart Healthy Diet',
      specificContentSummary:
        'شرح تجنب المخللات والأطعمة المعلبة والمصنعة، والتركيز على الخضراوات الطازجة والطهي بزيت الزيتون وتقليل ملح الطعام المضاف لأقل من نصف ملعقة صغيرة يومياً.',
      audience: 'patient_and_caregiver',
      audienceName: `${patient.fullNameAr} والمرافق`,
      method: 'written_brochure',
      languageUsed: 'العربية (Arabic)',
      interpreterUsed: false,
      materialsProvided: ['دليل التغذية لمرضى شرايين القلب'],
      educatorName: 'د. ياسمين النجار',
      educatorRole: 'أخصائية التغذية العلاجية',
      documentedAt: '2026-09-08 12:45',
      teachBackAssessment: {
        conducted: true,
        comprehension: 'demonstrated_understanding',
        notes: 'حددت الزوجة البدائل الصحية المناسبة للطهي المنزلي.'
      },
      followUpEducationNeeded: true,
      followUpEducationFocus: 'مراجعة خطة الوجبات الأسبوعية قبل الخروج.'
    }
  ]);

  // Mock State for Discharge Readiness Checklist (Axis 9)
  const [dischargeChecklist, setDischargeChecklist] = useState<DischargeReadinessCheckItem[]>([
    {
      id: 'dc-1',
      domain: 'clinical_stability',
      labelAr: 'استقرار ديناميكا الدم وغياب آلام الصدر الحادة لمدة ≥ 24 ساعة',
      status: 'ready',
      criticalForDischarge: true,
      responsibleDiscipline: 'physician',
      notes: 'المريض مستقر تماماً وبدون أي نوبات متكررة.',
      completedAt: 'اليوم، 14:00',
      completedBy: 'د. خالد عبد العزيز'
    },
    {
      id: 'dc-2',
      domain: 'medication_reconciliation',
      labelAr: 'إجراء المطابقة الدوائية للخروج (Discharge Med Reconciliation)',
      status: 'in_progress',
      criticalForDischarge: true,
      responsibleDiscipline: 'clinical_pharmacy',
      notes: 'جاري مراجعة جرعات الأنسولين المنزلي مع أدوية القلب الجديدة.'
    },
    {
      id: 'dc-3',
      domain: 'patient_education',
      labelAr: 'اكتمال جلسات التثقيف حول أدوية السيولة وإشارات الخطر (Teach-Back)',
      status: 'ready',
      criticalForDischarge: true,
      responsibleDiscipline: 'nursing',
      notes: 'تم توثيق جلسة الأدوية والحمية بنجاح.',
      completedAt: 'اليوم، 12:45',
      completedBy: 'أحمد جلال (CCU RN)'
    },
    {
      id: 'dc-4',
      domain: 'follow_up_appointments',
      labelAr: 'حجز موعد عيادة القلب التخصصية بعد أسبوع من الخروج',
      status: 'ready',
      criticalForDischarge: false,
      responsibleDiscipline: 'case_management',
      notes: 'الموعد محجوز في عيادة د. خالد الأحد القادم.',
      completedAt: 'اليوم، 13:00',
      completedBy: 'قسم التنسيق السريري'
    },
    {
      id: 'dc-5',
      domain: 'pending_results_orders',
      labelAr: 'فحص وظائف الكلى النهائي (Creatinine/eGFR) لتقييم تأثير صبغة القسطرة',
      status: 'in_progress',
      criticalForDischarge: true,
      responsibleDiscipline: 'physician',
      notes: 'تم سحب العينة والنتيجة متوقعة خلال ساعتين.'
    },
    {
      id: 'dc-6',
      domain: 'transport_social_support',
      labelAr: 'تأكيد وسيلة النقل الآمن ووجود مرافق بالغ بالمنزل لمساعدة المريض',
      status: 'ready',
      criticalForDischarge: true,
      responsibleDiscipline: 'social_work',
      notes: 'تم التنسيق مع نجل المريض للحضور ومرافقته للمنزل.',
      completedAt: 'اليوم، 11:00',
      completedBy: 'أخصائي الخدمة الاجتماعية'
    }
  ]);

  // Mock State for Follow-up Plans (Axis 9)
  const [followUpPlans, setFollowUpPlans] = useState<FollowUpPlanItem[]>([
    {
      id: 'fup-1',
      specialtyOrClinic: 'عيادة أمراض القلب التخصصية (Cardiology Follow-Up Clinic)',
      recommendedTimeframe: 'بعد 7 أيام من تاريخ الخروج',
      reasonAr: 'إعادة تقييم وظائف القلب، مراجعة استجابة المريض للعلاج وضبط ضغط الدم الشرياني.',
      prerequisites: ['إجراء تحليل وظائف كلى وشوارد (BUN, Creatinine, Electrolytes) قبل الزيارة'],
      status: 'planned'
    },
    {
      id: 'fup-2',
      specialtyOrClinic: 'عيادة التثقيف السكري والغدد الصماء (Diabetic Clinic)',
      recommendedTimeframe: 'بعد أسبوعين من الخروج',
      reasonAr: 'متابعة جدول السكر المنزلي وتعديل جرعات الأنسولين.',
      status: 'planned'
    }
  ]);

  // Form states for creating a new Goal
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalMetric, setNewGoalMetric] = useState('');
  const [newGoalTargetDate, setNewGoalTargetDate] = useState('خلال 48 ساعة');
  const [newGoalDiscipline, setNewGoalDiscipline] = useState<CarePlanDiscipline>('nursing');
  const [newGoalPriority, setNewGoalPriority] = useState<'high' | 'medium' | 'low'>('high');

  const handleToggleChecklistItem = (id: string) => {
    setDischargeChecklist(prev =>
      prev.map(item => {
        if (item.id === id) {
          const nextStatus = item.status === 'ready' ? 'in_progress' : 'ready';
          return {
            ...item,
            status: nextStatus,
            completedAt: nextStatus === 'ready' ? 'اليوم، الآن' : undefined,
            completedBy: nextStatus === 'ready' ? 'ممارس سريري معتمد' : undefined
          };
        }
        return item;
      })
    );
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    const newGoal: CarePlanGoal = {
      id: `goal-${Date.now()}`,
      descriptionAr: newGoalTitle,
      targetMetric: newGoalMetric || undefined,
      targetDate: newGoalTargetDate,
      priority: newGoalPriority,
      status: 'active',
      currentProgressPercent: 0,
      latestProgressSummary: 'تم إدراج الهدف السريري حديثاً، قيد المتابعة.',
      lastAssessedAt: 'اليوم، الآن',
      lastAssessedBy: 'الفريق السريري المعالج',
      interventions: [
        {
          id: `int-${Date.now()}`,
          actionTitleAr: 'مراقبة المؤشرات السريرية المرتبطة بالهدف',
          discipline: newGoalDiscipline,
          status: 'planned',
          frequencyOrTiming: 'حسب الجدول السريري'
        }
      ]
    };

    setCarePlanItems(prev => {
      // Add to the first matching discipline plan or create new
      const target = prev[0];
      return [
        {
          ...target,
          goals: [newGoal, ...target.goals],
          updatedAt: 'اليوم، الآن'
        },
        ...prev.slice(1)
      ];
    });

    setNewGoalTitle('');
    setNewGoalMetric('');
    setShowAddGoalDrawer(false);
  };

  const filteredPlanItems = carePlanItems.filter(item => {
    if (selectedDiscipline !== 'all' && item.discipline !== selectedDiscipline) {
      return false;
    }
    return true;
  });

  const getDisciplineBadge = (d: CarePlanDiscipline) => {
    switch (d) {
      case 'physician':
        return { label: 'طبي (Medical)', color: 'bg-blue-100 text-blue-900 border-blue-200' };
      case 'nursing':
        return { label: 'تمريضي (Nursing)', color: 'bg-teal-100 text-teal-900 border-teal-200' };
      case 'clinical_pharmacy':
        return { label: 'صيدلة سريرية (Pharmacy)', color: 'bg-purple-100 text-purple-900 border-purple-200' };
      case 'physiotherapy':
        return { label: 'تأهيل وعلاج طبيعي (PT)', color: 'bg-amber-100 text-amber-900 border-amber-200' };
      case 'clinical_nutrition':
        return { label: 'تغذية علاجية (Nutrition)', color: 'bg-emerald-100 text-emerald-900 border-emerald-200' };
      case 'respiratory_therapy':
        return { label: 'علاج تنفسي (RT)', color: 'bg-cyan-100 text-cyan-900 border-cyan-200' };
      case 'social_work':
        return { label: 'خدمة اجتماعية (Social)', color: 'bg-rose-100 text-rose-900 border-rose-200' };
      default:
        return { label: 'فريق متعدد التخصصات', color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const getGoalStatusBadge = (s: CarePlanGoalStatus) => {
    switch (s) {
      case 'active':
        return { label: 'نشط ومستمر (Active)', color: 'bg-teal-100 text-teal-900 border-teal-300' };
      case 'achieved':
        return { label: 'تم تحقيقه (Achieved)', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'partially_achieved':
        return { label: 'تحقق جزئياً (Partial)', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'revised':
        return { label: 'تمت المراجعة والتعديل', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
      case 'discontinued':
        return { label: 'ملغي / متوقف', color: 'bg-slate-100 text-slate-600 border-slate-300' };
      default:
        return { label: s, color: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Sub-Tab Header Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('care_plan')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'care_plan'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>خطة الرعاية السريرية والأهداف (Care Plan & Goals)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('education')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'education'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>تثقيف المريض والأسرة (Patient Education)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-100 text-teal-800">
              {educationRecords.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('discharge_readiness')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'discharge_readiness'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>جاهزية الخروج والمتابعة (Discharge Readiness)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800">
              {dischargeChecklist.filter(c => c.status === 'ready').length}/{dischargeChecklist.length}
            </span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400 px-3 hidden lg:block">
          Axis 9: Multidisciplinary Care Planning & Education
        </div>
      </div>

      {/* 2. Content based on Sub-Tab */}
      {activeSubTab === 'education' && (
        <PatientEducationView
          patient={patient}
          educationRecords={educationRecords}
          onAddRecord={newRec => setEducationRecords(prev => [newRec, ...prev])}
        />
      )}

      {activeSubTab === 'discharge_readiness' && (
        <DischargeReadinessView
          patient={patient}
          checklist={dischargeChecklist}
          onToggleItem={handleToggleChecklistItem}
          followUpPlans={followUpPlans}
          onAddFollowUp={plan => setFollowUpPlans(prev => [...prev, plan])}
        />
      )}

      {activeSubTab === 'care_plan' && (
        <div className="space-y-4">
          {/* Action and Filter Ribbon */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-teal-600" />
                <span>الخطة السريرية التشاركية متعددة التخصصات (Interprofessional Care Plan)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                تحديد الأهداف السريرية القابلة للقياس، التدخلات المنفذة، وتقييم التقدم دون تكرار أوامر الطبيب
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Discipline Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 font-medium">التخصص:</span>
                <select
                  value={selectedDiscipline}
                  onChange={e => setSelectedDiscipline(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-teal-600"
                >
                  <option value="all">كافة التخصصات (All Disciplines)</option>
                  <option value="physician">الأطباء (Medical)</option>
                  <option value="nursing">التمريض (Nursing)</option>
                  <option value="clinical_pharmacy">الصيدلة السريرية</option>
                  <option value="physiotherapy">العلاج الطبيعي والتأهيل</option>
                  <option value="clinical_nutrition">التغذية العلاجية</option>
                </select>
              </div>

              <button
                onClick={() => setShowAddGoalDrawer(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة هدف وتدخل سريري</span>
              </button>
            </div>
          </div>

          {/* Care Plan Items Accordions / Cards */}
          <div className="space-y-4">
            {filteredPlanItems.map(item => {
              const discBadge = getDisciplineBadge(item.discipline);
              const isExpanded = expandedPlanId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all text-xs"
                >
                  {/* Item Header */}
                  <div
                    onClick={() => setExpandedPlanId(isExpanded ? null : item.id)}
                    className="p-4 bg-slate-50/70 hover:bg-slate-100/70 border-b border-slate-200 cursor-pointer flex flex-wrap items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-teal-700 shrink-0">
                        <HeartHandshake className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-extrabold text-sm text-slate-900">{item.titleAr}</h5>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${discBadge.color}`}>
                            {discBadge.label}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-mono">
                            {item.goals.length} أهداف
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span>المشرف المسؤول: <strong className="text-slate-700">{item.ownerName}</strong> ({item.ownerRole})</span>
                          <span>•</span>
                          <span>آخر مراجعة: <strong className="text-slate-600 font-mono">{item.updatedAt}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                        خطة نشطة
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Body: Linked References + Structured Goals + Interventions */}
                  {isExpanded && (
                    <div className="p-5 space-y-5">
                      {/* Linked Clinical Context References */}
                      {item.linkedReferences && item.linkedReferences.length > 0 && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                            <LinkIcon className="w-3.5 h-3.5 text-teal-600" />
                            <span>السياق والمشكلات السريرية المرتبطة بالخطة (Clinical Provenance References):</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {item.linkedReferences.map(ref => (
                              <span
                                key={ref.id}
                                className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 text-[11px] font-medium text-slate-800 shadow-2xs flex items-center gap-1.5"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                                <span>{ref.label}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Goals List */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="font-extrabold text-xs text-slate-800">
                            الأهداف السريرية والتدخلات المنبثقة (Structured Goals & Interventions):
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">Separated from Orders & Tasks</span>
                        </div>

                        {item.goals.map(goal => {
                          const statusBadge = getGoalStatusBadge(goal.status);

                          return (
                            <div
                              key={goal.id}
                              className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3"
                            >
                              {/* Goal Header */}
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Target className="w-4 h-4 text-teal-600 shrink-0" />
                                    <span className="font-bold text-slate-900 text-xs">{goal.descriptionAr}</span>
                                  </div>
                                  {goal.targetMetric && (
                                    <div className="text-[11px] text-teal-800 font-medium mr-6">
                                      <strong>المعيار المستهدف (Target Metric):</strong>{' '}
                                      <span className="font-mono bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                                        {goal.targetMetric}
                                      </span>{' '}
                                      • الإطار الزمني: {goal.targetDate}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.color}`}>
                                    {statusBadge.label}
                                  </span>
                                </div>
                              </div>

                              {/* Progress Tracker Bar */}
                              <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-slate-500 font-medium">
                                    التقدم السريري نحو تحقيق الهدف:
                                  </span>
                                  <strong className="text-teal-800 font-mono font-bold">
                                    {goal.currentProgressPercent}%
                                  </strong>
                                </div>
                                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-teal-600 rounded-full transition-all duration-300"
                                    style={{ width: `${goal.currentProgressPercent}%` }}
                                  />
                                </div>
                                {goal.latestProgressSummary && (
                                  <p className="text-[11px] text-slate-600 mt-1">
                                    <strong>آخر تقييم سريري:</strong> {goal.latestProgressSummary} (بواسطة: {goal.lastAssessedBy} - {goal.lastAssessedAt})
                                  </p>
                                )}
                              </div>

                              {/* Interventions Sub-Section */}
                              {goal.interventions && goal.interventions.length > 0 && (
                                <div className="space-y-2 pt-2 border-t border-slate-100">
                                  <span className="text-[11px] font-bold text-slate-700 block">
                                    التدخلات التشاركية المحددة لتنفيذ هذا الهدف:
                                  </span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {goal.interventions.map(interv => (
                                      <div
                                        key={interv.id}
                                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1"
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="font-bold text-slate-800">{interv.actionTitleAr}</span>
                                          <span className="px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 text-[9px] font-bold">
                                            {interv.discipline}
                                          </span>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                                          <span>التوقيت/التكرار: {interv.frequencyOrTiming || 'مستمر'}</span>
                                          <span>المكلف: {interv.ownerName || 'المناوب'}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Structured Goal Drawer */}
          {showAddGoalDrawer && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-end animate-in fade-in duration-150">
              <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col overflow-hidden text-xs">
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-teal-400" />
                    <h4 className="font-bold text-sm">إضافة هدف وتدخل سريري جديد (New Clinical Goal)</h4>
                  </div>
                  <button
                    onClick={() => setShowAddGoalDrawer(false)}
                    className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAddGoal} className="p-6 overflow-y-auto flex-1 space-y-4 text-slate-800">
                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-[11px]">
                    <strong>تنبيه منهجي:</strong> الأهداف السريرية تعبر عن المخرجات المستهدفة وليست أوامر طبية تنفيذية مباشرة أو مهام مجدولة.
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">وصف الهدف السريري المطلوب تحقيقه:</label>
                    <textarea
                      rows={3}
                      value={newGoalTitle}
                      onChange={e => setNewGoalTitle(e.target.value)}
                      placeholder="مثال: استقرار وظائف التنفس وفطام الأكسجين إلى أقل من 2 لتر/دقيقة..."
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">المعيار الرقمي / السريري المستهدف (Target Metric):</label>
                    <input
                      type="text"
                      value={newGoalMetric}
                      onChange={e => setNewGoalMetric(e.target.value)}
                      placeholder="مثال: SpO2 ≥ 95% on Room Air, RASS Score = 0"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">التخصص المسؤول:</label>
                      <select
                        value={newGoalDiscipline}
                        onChange={e => setNewGoalDiscipline(e.target.value as any)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                      >
                        <option value="physician">طبي (Physician)</option>
                        <option value="nursing">تمريضي (Nursing)</option>
                        <option value="clinical_pharmacy">صيدلة سريرية</option>
                        <option value="physiotherapy">علاج طبيعي وتأهيل</option>
                        <option value="respiratory_therapy">علاج تنفسي</option>
                        <option value="clinical_nutrition">تغذية علاجية</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">الأولوية:</label>
                      <select
                        value={newGoalPriority}
                        onChange={e => setNewGoalPriority(e.target.value as any)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                      >
                        <option value="high">عالية (High)</option>
                        <option value="medium">متوسطة (Medium)</option>
                        <option value="low">روتينية (Low)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">الإطار الزمني المستهدف:</label>
                    <input
                      type="text"
                      value={newGoalTargetDate}
                      onChange={e => setNewGoalTargetDate(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      إدراج الهدف في الخطة السريرية
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
