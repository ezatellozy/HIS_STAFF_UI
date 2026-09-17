import React from 'react';
import {
  X,
  Sparkles,
  PlayCircle,
  Droplet,
  ShieldAlert,
  AlertTriangle,
  FlaskConical,
  RotateCcw,
  Layers,
  HeartPulse,
  Activity,
  Zap,
  Box
} from 'lucide-react';
import { BloodBankViewTab, BloodBankDemoScenario } from '../../types/bloodBankOps';

interface BloodBankDemoScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenarios?: BloodBankDemoScenario[];
  activeScenarioId?: string;
  onSelectScenario: (scenario: any, targetTab?: any, targetRequestId?: string) => void;
}

export const BloodBankDemoScenariosModal: React.FC<BloodBankDemoScenariosModalProps> = ({
  isOpen,
  onClose,
  scenarios: passedScenarios,
  activeScenarioId,
  onSelectScenario
}) => {
  if (!isOpen) return null;

  const scenarios = [
    {
      key: 'scenario_a',
      title: 'السيناريو A: طلب روتيني لكريات دم حمراء (Routine RBC Transfusion)',
      product: 'Packed Red Blood Cells (PRBCs) - 2 Units (A+)',
      requestId: 'BPR-2026-801',
      tab: 'incoming_requests' as BloodBankViewTab,
      category: 'Inpatient Ward',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
      description: 'طلب روتيني لمريضة باطنة تعاني من فقر دم حاد (Hb 6.8 g/dL)؛ عينة صالحة، فصيلة دم A+، مسح أضداد سلبي، مطابقة مصلية متوافقة، تخصيص الوحدات، وصرف الوحدة الأولى (الإعطاء السريري في ملف المريض).'
    },
    {
      key: 'scenario_b',
      title: 'السيناريو B: مسح أضداد إيجابي وتحديد جسم مضاد (Positive Antibody Screen - Anti-Kell)',
      product: 'K-negative Phenotyped PRBCs - 2 Units (O+)',
      requestId: 'BPR-2026-802',
      tab: 'antibody_screen' as BloodBankViewTab,
      category: 'Immunohematology',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      description: 'مريض أورام منقول له دم متكرر؛ نتيجة مسح الأضداد إيجابية 3+ وتم تحديد Anti-Kell؛ البحث عن وحدات سالبة للمستضد وإجراء توافق كامل بأضداد الجلوبيولين (AHG Crossmatch).'
    },
    {
      key: 'scenario_c',
      title: 'السيناريو C: صرف طارئ غير متوافق لإنقاذ حياة (Emergency Uncrossmatched Release)',
      product: 'O-Negative Universal PRBCs - 2 Units',
      requestId: 'BPR-2026-803',
      tab: 'compatibility' as BloodBankViewTab,
      category: 'Trauma & Resuscitation',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      description: 'مصاب حادث مروري في غرفة الإنعاش بصدمة نزفية غير مستقرة؛ صرف طارئ لوحدات O سالب بتفويض استشاري الطوارئ قبل اكتمال التطابق، مع استمرار الفحوصات التأكيدية بالتوازي.'
    },
    {
      key: 'scenario_d',
      title: 'السيناريو D: طلب صفائح دموية بالفصادة (Apheresis Platelets Request)',
      product: 'Single Donor Apheresis Platelets (Irradiated B+)',
      requestId: 'BPR-2026-804',
      tab: 'ready_issue' as BloodBankViewTab,
      category: 'Platelet Therapy',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      description: 'مريضة نقص صفائح مناعي (ITP) بنزيف مخاطي نشط (صفائح 12k)؛ اختيار وحدة صفائح مشععة بالفصادة، دون افتراض إجراءات التطابق المصلي الخاصة بكريات الدم الحمراء.'
    },
    {
      key: 'scenario_e',
      title: 'السيناريو E: إرجاع وحدة دم من العمليات وتقرير المصير (Returned Unit & Disposition)',
      product: 'PRBCs AB+ (Returned within 22 mins)',
      requestId: 'BPR-2026-805',
      tab: 'returns_disposition' as BloodBankViewTab,
      category: 'Cold Chain & Returns',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'تأجلت جراحة القولون ولم يتم فتح أو ثقب كيس الدم؛ إعادة الوحدة لبنك الدم، فحص سلامة مؤشر التبريد (أقل من 30 دقيقة خارج الثلاجة)، واعتماد إعادتها للمخزون الصالح.'
    },
    {
      key: 'scenario_f',
      title: 'السيناريو F: بلاغ اشتباه تفاعل نقل دم وتحقيق بنك الدم (Transfusion Reaction Investigation)',
      product: 'PRBCs B+ (Suspected Acute Hemolytic Reaction)',
      requestId: 'BPR-2026-806',
      tab: 'reactions_investigation' as BloodBankViewTab,
      category: 'Hemovigilance & Safety',
      badgeColor: 'bg-red-100 text-red-800 border-red-200',
      description: 'مريضة بالعناية المركزة أوقفت ممرضة العناية النقل فوراً لارتفاع الحرارة إلى 39.2°C وتغير لون البول؛ إجراء التدقيق الكتابي، فحص DAT، وفحص الهيموجلوبين الحر وتوثيق تقرير استشاري نقل الدم.'
    },
    {
      key: 'scenario_g',
      title: 'السيناريو G: عدم توفر مشتق بمواصفات نادرة وتنسيق سريري (Product Unavailable Coordination)',
      product: 'Irradiated CMV-Negative Washed A- PRBCs',
      requestId: 'BPR-2026-807',
      tab: 'exceptions_attention' as BloodBankViewTab,
      category: 'Inventory Shortage',
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
      description: 'مريض زراعة نخاع عظمي يحتاج وحدات مغسولة ومشععة خالية من CMV لفصيلة A سالب غير متوفرة حالياً؛ التنسيق السريري مع استشاري الزراعة وبنك الدم المركزي دون استبدال آلي.'
    },
    {
      key: 'scenario_h',
      title: 'السيناريو H: بروتوكول النقل الهائل للدم في الحوادث (Massive Transfusion Protocol - MTP)',
      product: 'MTP Pack 1 (4 RBC + 4 FFP + 1 Platelet)',
      requestId: 'BPR-2026-808',
      tab: 'operational_home' as BloodBankViewTab,
      category: 'MTP Trauma Rounds',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'تفعيل بروتوكول MTP لمريض رضوح حادة مهددة للحياة؛ تجهيز وصرف الجولة الأولى بحصص متوازنة (كريات دم حمراء + بلازما طازجة بعد الإذابة + صفائح) وتتبع محاسبة الوحدات المصروفة.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30">
              <Droplet className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold">سيناريوهات الاختبار التفاعلية لخدمات بنك الدم (Interactive Scenarios A ➔ H)</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                اختر أي سيناريو للانتقال الفوري وتجربة مسار العمليات المحدد في بنك الدم ونقل الدم
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational Policy Banner */}
        <div className="bg-red-50 border-b border-red-200 px-6 py-2 text-xs text-red-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
            <span>السيناريوهات تعكس الفصل المنهجي الدقيق: الطلب ≠ العينة ≠ الفحص ≠ التوافق ≠ التخصيص ≠ الصرف ≠ الإعطاء السريري.</span>
          </div>
          <span className="font-mono text-[10px] font-bold text-red-700">UI/UX Prototype Only</span>
        </div>

        {/* Scenarios List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 text-xs">
          {scenarios.map(sc => (
            <div
              key={sc.key}
              onClick={() => {
                const fullScenario = passedScenarios?.find(
                  s => s.id === sc.key || s.scenarioCode === sc.key || s.targetRequestId === sc.requestId
                );
                if (fullScenario) {
                  onSelectScenario(fullScenario, sc.tab, sc.requestId);
                } else {
                  onSelectScenario(sc.key, sc.tab, sc.requestId);
                }
                onClose();
              }}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-red-500 hover:bg-red-50/40 transition-all cursor-pointer group flex items-start justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${sc.badgeColor}`}>
                    {sc.category}
                  </span>
                  <span className="font-bold text-slate-900 text-xs">{sc.title}</span>
                </div>
                <div className="text-[11px] font-mono text-red-900 font-medium">
                  {sc.product} • <span className="text-slate-500">Ref: {sc.requestId}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {sc.description}
                </p>
              </div>

              <button className="px-3 py-1.5 rounded-lg bg-white group-hover:bg-red-600 group-hover:text-white text-slate-700 border border-slate-200 group-hover:border-red-600 font-bold text-xs flex items-center gap-1 shrink-0 transition-colors shadow-2xs">
                <span>تشغيل السيناريو</span>
                <PlayCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            جميع السجلات والوحدات والفحوصات في هذه السيناريوهات هي بيانات محاكاة تفاعلية مطابقة لمعمارية التصميم.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
