import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  FileText,
  Microscope,
  Scissors,
  Truck,
  PhoneCall,
  RefreshCw,
  Clock,
  Layers,
  FlaskConical,
  ExternalLink
} from 'lucide-react';
import {
  IncomingLabOrder,
  LabSpecimen,
  LabAccession,
  MicrobiologyCase,
  PathologyCase
} from '../../types/laboratoryOps';

interface LabDemoScenariosViewProps {
  orders: IncomingLabOrder[];
  specimens: LabSpecimen[];
  accessions: LabAccession[];
  microCases: MicrobiologyCase[];
  pathCases: PathologyCase[];
  onNavigateToView: (view: string) => void;
  onPreviewAccession: (accession: LabAccession) => void;
  onPreviewSpecimen: (specimen: LabSpecimen) => void;
  onOpenResultModal: (accession: LabAccession) => void;
  onOpenCriticalModal: (accession: LabAccession) => void;
  onOpenRejectionModal: (specimen: LabSpecimen) => void;
  onDeepLinkAxis6: (patientId: string) => void;
  onDeepLinkAxis7: (patientId: string) => void;
}

export const LabDemoScenariosView: React.FC<LabDemoScenariosViewProps> = ({
  orders,
  specimens,
  accessions,
  microCases,
  pathCases,
  onNavigateToView,
  onPreviewAccession,
  onPreviewSpecimen,
  onOpenResultModal,
  onOpenCriticalModal,
  onOpenRejectionModal,
  onDeepLinkAxis6,
  onDeepLinkAxis7
}) => {
  const [activeScenarioId, setActiveScenarioId] = useState<string>('scenario_b');

  const statAccession = accessions.find(a => a.priority === 'stat') || accessions[0];
  const rejectedSpecimen = specimens.find(s => s.status === 'rejected') || specimens[0];
  const normalSpecimen = specimens.find(s => s.status === 'pending_collection') || specimens[0];
  const microCase = microCases[0];
  const pathCase = pathCases[0];

  const scenarios = [
    {
      id: 'scenario_a',
      letter: 'A',
      titleAr: 'السيناريو أ: دورة الفحص الروتيني المتكاملة حتى إطلاق النتيجة',
      titleEn: 'Routine Inpatient Order to Released Result',
      descriptionAr:
        'طلب سريري روتيني من التنويم ← سحب العينة ومطابقة الإسورة ← الاستلام بالاستقبال والترقيم (Accessioning) ← التشغيل الآلي والتحقق الفني ← اعتماد النتيجة وإتاحتها في المحور 7 لمراجعة الطبيب.',
      keyPoints: [
        'الفصل الصارم: Order ≠ Specimen ≠ Accession ≠ Result',
        'متابعة زمن الاستجابة (TAT) المستهدف',
        'ظهور النتيجة فوراً في مساحة المريض الأصلية (Axis 7)'
      ],
      actionLabel: 'الانتقال لقائمة العمليات (Core Lab)',
      onRun: () => onNavigateToView('core_lab')
    },
    {
      id: 'scenario_b',
      letter: 'B',
      titleAr: 'السيناريو ب: فحص طوارئ STAT مع قيمة حرجة وتوثيق القراءة المتبادلة',
      titleEn: 'STAT ED Order with Critical Result & Closed-Loop Communication',
      descriptionAr:
        'طلب STAT لحالة قلبية حادة (البوتاسيوم 6.8 mmol/L والتروبونين 142.5 ng/L) ← تنبيه القيمة الحرجة الحقيقي ← فتح نموذج توثيق القراءة المتبادلة (Read-Back Confirmed) مع ممرض الطوارئ وإغلاق حلقة البلاغ.',
      keyPoints: [
        'قراءة الإشعار لا تعني الإقرار بالقيمة الحرجة (Notification read ≠ Critical acknowledged)',
        'تحديد هوية المتصل والمستلم والصفة السريرية',
        'إبراز القيمة مع تلوين ووميض بصري واضح'
      ],
      actionLabel: 'فتح نموذج توثيق القيمة الحرجة مباشرة',
      onRun: () => onOpenCriticalModal(statAccession)
    },
    {
      id: 'scenario_c',
      letter: 'C',
      titleAr: 'السيناريو ج: رفض العينة المخبرية المنحلة وطلب إعادة السحب',
      titleEn: 'Specimen Rejection & Recollection Request Workflow',
      descriptionAr:
        'وصول عينة دم منحل بشدة (Gross Hemolysis) ← تقييم فني بالاستقبال وتطبيق سياسة الرفض المخبرية ← توثيق سبب الرفض ← توليد طلب إعادة سحب (Recollection) مرتبط بالطلب الطبي الأصلي دون إلغائه.',
      keyPoints: [
        'محدد الحوكمة: رفض العينة ≠ إلغاء الطلب (Rejected Specimen ≠ Cancelled Order)',
        'ربط العينة الجديدة بالطلب السريري الأصلي للطبيب',
        'قائمة أسباب رفض معتمدة بالسياسة'
      ],
      actionLabel: 'معاينة العينة المرفوضة وتفاصيل الإجراء',
      onRun: () => onOpenRejectionModal(rejectedSpecimen)
    },
    {
      id: 'scenario_d',
      letter: 'D',
      titleAr: 'السيناريو د: تعديل وتصحيح النتيجة مع حوكمة سجل الإصدارات',
      titleEn: 'Result Amendment & Full Versioning Audit',
      descriptionAr:
        'نتيجة بوتاسيوم مسجلة مسبقاً تم تصحيحها ← يحظر النظام استبدال النتيجة بصمت ← حفظ القيمة السابقة وهوية المعدل وتاريخه ومبرر التعديل في سجل دائم مع وسم النتيجة كـ Corrected/Amended.',
      keyPoints: [
        'لا استبدال صامت للنتائج (Never silently replaced)',
        'حفظ القيمة الأصلية والمصححة وتتبع الفرق (Diff Note)',
        'توثيق سبب التعديل ومسؤولية الأخصائي'
      ],
      actionLabel: 'فتح نافذة إدخال وتعديل النتائج',
      onRun: () => onOpenResultModal(statAccession)
    },
    {
      id: 'scenario_e',
      letter: 'E',
      titleAr: 'السيناريو هـ: مزرعة دم مع تقرير غرام أولي وحساسية EUCAST',
      titleEn: 'Blood Culture, Preliminary Gram Stain & EUCAST AST Interpretation',
      descriptionAr:
        'مزرعة دم إيجابية بعد 14 ساعة تحضين ← تقرير صبغة غرام الأولية وإبلاغ العناية ← عزل Staphylococcus aureus ← لوحة حساسية المضادات الحيوية وفق معيار EUCAST حيث الحرف I يعني Susceptible, increased exposure.',
      keyPoints: [
        'تقرير صبغة غرام الأولي مستقل عن التقرير النهائي',
        'معيار EUCAST: الحرف I = حساس مع زيادة التعرض وليس متوسط المقاومة',
        'إمكانية التبديل بين معايير EUCAST و CLSI'
      ],
      actionLabel: 'فتح مساحة الأحياء الدقيقة (Microbiology)',
      onRun: () => onNavigateToView('microbiology')
    },
    {
      id: 'scenario_f',
      letter: 'F',
      titleAr: 'السيناريو و: حالة باثولوجي من الفحص العياني حتى التقرير المتزامن والملحق',
      titleEn: 'Surgical Pathology: Grossing, Synoptic Report & Addendum',
      descriptionAr:
        'استئصال فص درقي وغدة ليمفاوية ← فحص عياني وتوجيه بالخيوط الجراحية وتلوين الحواف بالأحبار (أسود/أزرق) ← تقطيع 4 بلوكات ← شرائح مجهرية ← تقرير متزامن مع تصنيف pT2 pN0 ← توقيع الحالة ← إضافة ملحق لاحق لدراسة IHC.',
      keyPoints: [
        'سلسلة الحوكمة: Specimen ≠ Case ≠ Final Report',
        'خريطة البلوكات والأحبار والأبعاد والوزن',
        'إصدار ملحق لاحق (Addendum) مع الاحتفاظ بالتشخيص الأصلي'
      ],
      actionLabel: 'فتح مساحة الباثولوجي (Pathology)',
      onRun: () => onNavigateToView('pathology')
    },
    {
      id: 'scenario_g',
      letter: 'G',
      titleAr: 'السيناريو ز: تتبع فحص مرجعي خارجي (Send-Out Reference Lab)',
      titleEn: 'Send-Out Reference Test Tracking & Result Integration',
      descriptionAr:
        'إرسال فحص وراثي متقدم (NGS Panel) إلى مختبر الرياض المرجعي الوطني ← تتبع بوليصة الشحن المبرد ← تحديث حالة الاستلام والمعالجة بالمرجع ← استلام التقرير وتوثيق النتيجة المرجعية.',
      keyPoints: [
        'تتبع الشحنات المبردة وبوالص النقل',
        'ربط الفحص المرجعي بملف المريض والزيارة',
        'شفافية زمن الإنجاز للتحاليل الخارجية'
      ],
      actionLabel: 'فتح مساحة المختبرات المرجعية (Send-Out)',
      onRun: () => onNavigateToView('send_out')
    }
  ];

  const activeScenario = scenarios.find(s => s.id === activeScenarioId) || scenarios[0];

  return (
    <div className="space-y-4 text-right font-['Cairo',sans-serif]">
      {/* Top Description */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-black text-slate-900">
              سيناريوهات الاختبار السريرية التفاعلية (Interactive Clinical Scenarios A - G)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            محاكاة شاملة لمسارات العمل المخبرية المعقدة لاختبار كافة القواعد المفاهيمية والحوكمة السريرية المعتمدة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onDeepLinkAxis6(statAccession.patientId)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>معاينة المحور 6 (طلب الطبيب)</span>
          </button>
          <button
            onClick={() => onDeepLinkAxis7(statAccession.patientId)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>معاينة المحور 7 (نتائج الطبيب)</span>
          </button>
        </div>
      </div>

      {/* Scenarios Grid & Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Scenarios Buttons List */}
        <div className="space-y-2">
          {scenarios.map(sc => {
            const isCurrent = sc.id === activeScenarioId;
            return (
              <button
                key={sc.id}
                onClick={() => setActiveScenarioId(sc.id)}
                className={`w-full p-3.5 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-teal-950 text-white border-teal-800 shadow-md scale-101'
                    : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-lg font-black font-mono text-xs flex items-center justify-center ${
                        isCurrent ? 'bg-teal-500 text-slate-950' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {sc.letter}
                    </span>
                    <strong className="text-xs">{sc.titleAr.split(':')[0]}</strong>
                  </div>
                  <div className={`text-[11px] truncate ${isCurrent ? 'text-teal-200' : 'text-slate-500'}`}>
                    {sc.titleEn}
                  </div>
                </div>

                <ArrowRight className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-teal-400' : 'text-slate-400'}`} />
              </button>
            );
          })}
        </div>

        {/* Active Scenario Execution Stage */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-teal-600 text-white font-black font-mono text-sm flex items-center justify-center">
                    {activeScenario.letter}
                  </span>
                  <h3 className="text-base font-black text-slate-900">{activeScenario.titleAr}</h3>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-1">{activeScenario.titleEn}</div>
              </div>

              <button
                onClick={activeScenario.onRun}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 hover:scale-102"
              >
                <Play className="w-4 h-4" />
                <span>{activeScenario.actionLabel}</span>
              </button>
            </div>

            {/* Narrative Explanation */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">وصف المسار السريري والتشغيلي:</span>
              <p className="text-xs text-slate-800 leading-relaxed">{activeScenario.descriptionAr}</p>
            </div>

            {/* Invariant & Governance Checklist */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-800 block">ضوابط الحوكمة وقواعد النظام المفحوصة في هذا السيناريو:</span>
              <div className="grid grid-cols-1 gap-2">
                {activeScenario.keyPoints.map((pt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-teal-50/70 text-teal-950 border border-teal-200/60 font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scenario Direct Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">انقر لتشغيل وتجربة هذا السيناريو عملياً داخل النموذج التفاعلي</span>
              <button
                onClick={activeScenario.onRun}
                className="text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>تنفيذ التجربة الآن</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
