import React from 'react';
import {
  Sparkles,
  UserPlus,
  UserCheck,
  Bed,
  ArrowRightLeft,
  LogOut,
  PlaneTakeoff,
  Play,
  CheckCircle2,
  Volume2,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { AdtTab } from '../../types/patientAccessAdt';

interface AdtScenariosViewProps {
  onSwitchTab: (tab: AdtTab) => void;
  onTriggerVoiceTest: () => void;
}

export const AdtScenariosView: React.FC<AdtScenariosViewProps> = ({
  onSwitchTab,
  onTriggerVoiceTest
}) => {
  const scenarios = [
    {
      id: 'sc-1',
      tab: 'registration_search' as AdtTab,
      title: 'السيناريو 1: البحث، فحص تكرار الملفات، وهوية طوارئ مجهول الهوية',
      tag: 'Patient Access & Identity',
      icon: UserPlus,
      color: 'blue',
      steps: [
        'البحث عن مريض بالرقم الوطني أو الاسم أو الجوال واستعراض التنبيهات الإدارية.',
        'تجربة تسجيل مريض جديد بنفس اسم مريض مسجل مسبقاً لرؤية نافذة مقارنة التشابه (Possible Duplicate Review).',
        'تسجيل مريض طوارئ مجهول الهوية (Unknown Trauma ER) مع رمز سوار الطوارئ ورقم النظام المؤقت.'
      ]
    },
    {
      id: 'sc-2',
      tab: 'arrival_opd_flow' as AdtTab,
      title: 'السيناريو 2: تدفق العيادات - الفصل بين الوصول والدخول مع النداء الصوتي',
      tag: 'OPD Flow & Queue',
      icon: UserCheck,
      color: 'emerald',
      steps: [
        'ملاحظة الفرق بين تسجيل الوصول الفيزيائي (Mark Arrived) وتسجيل الدخول السريري (Check-in).',
        'تشغيل النداء الصوتي الفعلي مع تجربة اللهجات (فصحى، خليجية، مصرية) ونطق أرقام التذاكر الدقيق.',
        'إدراج مريض بدون موعد مسبق (Walk-in) وفتح زيارة سريرية فورية.'
      ]
    },
    {
      id: 'sc-3',
      tab: 'admission_ops' as AdtTab,
      title: 'السيناريو 3: تنسيق طلبات التنويم من الطوارئ وتخصيص السرير المناسب',
      tag: 'Admission Coordination',
      icon: Bed,
      color: 'indigo',
      steps: [
        'مراجعة طلبات التنويم الواردة من الطوارئ والعيادات بدرجات استعجال (STAT, Urgent, Routine).',
        'التحقق من متطلبات العزل الوقائي وأجهزة التنفس وملاءمة جنس السرير.',
        'تخصيص السرير المناسب ثم إتمام خطوة التنويم الفعلي (Admit).'
      ]
    },
    {
      id: 'sc-4',
      tab: 'bed_management' as AdtTab,
      title: 'السيناريو 4: إدارة الأسرّة التشغيلية ودورة التعقيم والتنظيف (Turnover)',
      tag: 'Bed Management & Capacity',
      icon: Sparkles,
      color: 'cyan',
      steps: [
        'استعراض لوحة السعة الاستيعابية الشاملة ومعدل الإشغال ونسب الأسرّة الشاغرة.',
        'تغيير حالة السرير بعد مغادرة المريض من (يحتاج تنظيف) إلى (جاري التعقيم) ثم (نظيف ومتاح).',
        'حظر سرير للصيانة الفنية وإعادته للتشغيل.'
      ]
    },
    {
      id: 'sc-5',
      tab: 'transfer_ops' as AdtTab,
      title: 'السيناريو 5: النقل الداخلي بين الأجنحة وتنسيق النقالين مع الـ Handover',
      tag: 'Internal Transfer & Transport',
      icon: ArrowRightLeft,
      color: 'purple',
      steps: [
        'إدارة طلب نقل مريض من الجناح العام إلى العناية المركزة بسبب تدهور الحالة.',
        'ربط التسليم السريري والتمريضي (SBAR Handover) والتأكد من إقراره.',
        'تحريك فريق النقل الداخلي (In Transit) ثم إتمام النقل وتحديث موقع الزيارة التنويمية.'
      ]
    },
    {
      id: 'sc-6',
      tab: 'discharge_ops' as AdtTab,
      title: 'السيناريو 6: تخطيط الخروج، الجاهزية السريرية وإخلاء السرير الفيزيائي',
      tag: 'Discharge Planning & Clearance',
      icon: LogOut,
      color: 'amber',
      steps: [
        'التحقق من قائمة الجاهزية: تسوية الأدوية (Med Rec)، ملخص الخروج، التخليص المالي.',
        'إتمام الخروج السريري بالنظام (Discharge) أولاً، ثم تأكيد المغادرة الفيزيائية (Physical Departure).',
        'ملاحظة تحول السرير آلياً إلى حالة (يحتاج تعقيم) لتجهيزه للمريض القادم.'
      ]
    },
    {
      id: 'sc-7',
      tab: 'discharge_ops' as AdtTab,
      title: 'السيناريو 7: الإجازة المؤقتة للمنوم (Temporary Inpatient Pass)',
      tag: 'Temporary Inpatient Pass',
      icon: PlaneTakeoff,
      color: 'teal',
      steps: [
        'إصدار تصريح مغادرة مؤقتة للمنوم لساعات محددة مع الحفاظ على السرير والزيارة النشطة.',
        'متابعة حالة المريض أثناء المغادرة وتسجيل توقيت عودته واستقراره بالسرير.'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 border border-blue-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>الدليل العملياتي التفاعلي (Interactive Operational Scenarios Walkthrough)</span>
          </div>
          <h2 className="text-xl font-black text-white">سيناريوهات التحقق العملياتي لتسجيل المرضى وتدفق الأسرّة</h2>
          <p className="text-xs text-blue-200 mt-1 max-w-2xl">
            اختر أي سيناريو للانتقال المباشر وتجربة سير العمل كنموذج تفاعلي عالي الدقة (High-Fidelity Prototype).
          </p>
        </div>

        <button
          onClick={onTriggerVoiceTest}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer border border-emerald-400 shrink-0"
        >
          <Volume2 className="w-4 h-4" />
          <span>اختبار النداء الصوتي العربي الفوري (PA Test)</span>
        </button>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map((sc, idx) => {
          const Icon = sc.icon;
          return (
            <div
              key={sc.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-blue-400 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {sc.tag}
                  </span>
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-base font-black text-slate-900 leading-snug">
                  {sc.title}
                </h3>

                <ul className="space-y-1.5 text-xs text-slate-600">
                  {sc.steps.map((st, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => onSwitchTab(sc.tab)}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all"
                >
                  <span>بدء تجربة هذا السيناريو الآن</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
