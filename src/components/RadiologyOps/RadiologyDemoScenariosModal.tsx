import React from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Play,
  FileCheck,
  Radio,
  ShieldCheck,
  AlertTriangle,
  History,
  Bed,
  Activity,
  Layers
} from 'lucide-react';

export interface DemoScenario {
  id: string;
  code: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  titleAr: string;
  titleEn: string;
  modality: string;
  descriptionAr: string;
  steps: string[];
  targetTab: string;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'scen-a',
    code: 'A',
    titleAr: 'السيناريو أ: فحص أشعة عادية روتيني (Routine Outpatient X-Ray)',
    titleEn: 'Routine Walk-in X-Ray Lifecycle',
    modality: 'XR',
    descriptionAr: 'دورة عمل متكاملة لأشعة الصدر من وصول المريض كـ Walk-in، استكمال الفحص بجهاز DR الرقمي، مراجعة الجودة الفنية، واعتماد التقرير النهائي بدون تأخير.',
    steps: [
      '1. استلام طلب الطبيب المعالج للصدر (Axis 6)',
      '2. استقبال المريض كـ Walk-in والتحقق من الهوية',
      '3. التقاط الصورة بجهاز الأشعة الرقمي DR Suite 1',
      '4. مراجعة الجودة الفنية وتحويلها لطابور القراءة',
      '5. اعتماد التقرير النهائي ونشره لملف المريض (Axis 7)'
    ],
    targetTab: 'modality_worklist'
  },
  {
    id: 'scen-b',
    code: 'B',
    titleAr: 'السيناريو ب: أشعة مقطعية بالصبغة وتقييم الكلى (Contrast CT & Renal Safety)',
    titleEn: 'Contrast CT with Renal Clearance Protocol',
    modality: 'CT',
    descriptionAr: 'فحص مقطعي للجذع بالصبغة يتطلب اعتماد بروتوكول ثلاثي المراحل، التحقق من وظائف الكلى (eGFR > 85) وتحضير كانيولا 20G في غرفة التحضير قبل المسح.',
    steps: [
      '1. استعراض الطلب ومراجعة التحضير والصيام',
      '2. اعتماد بروتوكول الصبغة الوريدية والفموية Triphasic',
      '3. مراجعة ملف أمان الصبغة وفحص الكرياتينين وeGFR',
      '4. غرفة التحضير: التأكد من الكانيولا والموافقة',
      '5. إتمام المسح المقطعي على CT Suite 2 وتحويله للقراءة'
    ],
    targetTab: 'incoming'
  },
  {
    id: 'scen-c',
    code: 'C',
    titleAr: 'السيناريو ج: سلامة الرنين المغناطيسي 3 تسلا (MRI Safety Screening 3.0T)',
    titleEn: 'High-Field MRI Safety & Implant Clearance',
    modality: 'MRI',
    descriptionAr: 'استبيان الأمان الإلزامي للرنين المغناطيسي، فحص منظمات ضربات القلب والزرعات المعدنية والرهاب، والتحقق من أمان الجهاز عالي المجال 3.0T.',
    steps: [
      '1. فحص طلب رنين المخ للأعصاب',
      '2. استكمال استبيان فحص أمان الرنين الشامل',
      '3. التحقق من سلامة زرعات التيتانيوم غير المغناطيسية',
      '4. تجهيز المريضة بسدادات الأذن ومرآة الرؤية',
      '5. تنفيذ متتاليات الانتشار والفلير وإرسالها للأخصائي'
    ],
    targetTab: 'modality_worklist'
  },
  {
    id: 'scen-d',
    code: 'D',
    titleAr: 'السيناريو د: كود السكتة الدماغية والنتائج الحرجة (ER STAT Stroke Code)',
    titleEn: 'Emergency Stroke Code & Critical Findings Handover',
    modality: 'CT',
    descriptionAr: 'حالة كود سكتة دماغية STAT من الطوارئ، فحص مقطعي فوري بدون صبغة، رصد علامات نقص التروية (ASPECTS 8)، وتوثيق إخطار الطبيب بالقراءة المتبادلة.',
    steps: [
      '1. دخول فوري للمريض من الطوارئ كود STAT',
      '2. تنفيذ المسح المقطعي على CT 1 خلال دقائق',
      '3. رصد علامات الجلطة الحادة وغياب النزيف',
      '4. توثيق الاتصال الهاتفي المباشر والقراءة المتبادلة Read-back',
      '5. نشر التقرير المبدئي العاجل فورياً لفريق الطوارئ'
    ],
    targetTab: 'radiologist_worklist'
  },
  {
    id: 'scen-e',
    code: 'E',
    titleAr: 'السيناريو هـ: تعديل التقرير النهائي بدون مسح (Report Addendum / Amendment)',
    titleEn: 'Preserving Report Version Provenance via Addendum',
    modality: 'XR',
    descriptionAr: 'تطبيق قاعدة النزاهة الطبية: عدم مسح أو استبدال التقرير النهائي المعتمد سريرياً، بل إصدار ملحق موثق (Version 2 Addendum) مع ذكر السبب والأثر.',
    steps: [
      '1. استعراض التقرير النهائي المعتمد بالنتائج',
      '2. فتح نافذة إضافة ملحق سريري مصحح (Add Addendum)',
      '3. كتابة التوضيح المطلوب ومراجعة موقع أنبوب التغذية',
      '4. توثيق اسم الاستشاري والوقت وسبب التعديل',
      '5. حفظ الإصدار الثاني رسمياً في السجل الطبي القانوني'
    ],
    targetTab: 'radiologist_worklist'
  },
  {
    id: 'scen-f',
    code: 'F',
    titleAr: 'السيناريو و: الأشعة المتنقلة بالعناية المركزة (Portable ICU Chest X-Ray)',
    titleEn: 'Mobile Bedside Radiography with Isolation Precautions',
    modality: 'XR',
    descriptionAr: 'إرسال جهاز الأشعة الرقمي المتنقل إلى سرير العناية المركزة لمريض على جهاز التنفس الصناعي تحت عزل الرذاذ والتقاط الصورة لاسلكياً.',
    steps: [
      '1. استلام طلب أشعة متنقلة STAT لمريض العناية المركزة',
      '2. تجهيز الجهاز المتنقل ومراجعة شحن البطارية (88%)',
      '3. تطبيق احتياطات العزل الرذاذي الكاملة بالسرير',
      '4. التقاط صورة التحقق من موقع أنبوب التنفس الرغامي',
      '5. نقل الصورة لاسلكياً وتأكيد الجودة الفنية فوراً'
    ],
    targetTab: 'portable'
  },
  {
    id: 'scen-g',
    code: 'G',
    titleAr: 'السيناريو ز: الأشعة التداخلية وخزعة الكبد (Interventional CT Liver Biopsy)',
    titleEn: 'CT-Guided Core Biopsy with Sedation & Recovery',
    modality: 'IR',
    descriptionAr: 'إجراء تداخلي معقم لأخذ خزعة كبدية موجهة بالأشعة المقطعية، التحقق من الموافقة المستنيرة وفحص السيولة (INR)، ومتابعة مرحلة الإفاقة ونقل العينات.',
    steps: [
      '1. التحقق من مطابقة المريض وتوقيع الموافقة المستنيرة',
      '2. مراجعة فحص السيولة وتأكيد سلامة تجلط الدم (INR 1.1)',
      '3. دخول الجناح التداخلي وإجراء الخزعة تحت التهدئة الواعية',
      '4. تجميع العينات النسيجية وتحويلها للمختبر والباثولوجي',
      '5. مراقبة المريض في سرير الإفاقة قبل الخروج للجناح الداخلي'
    ],
    targetTab: 'ir'
  }
];

interface RadiologyDemoScenariosModalProps {
  onSelectScenario: (scenario: DemoScenario) => void;
  onClose: () => void;
}

export const RadiologyDemoScenariosModal: React.FC<RadiologyDemoScenariosModalProps> = ({
  onSelectScenario,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold">
                مشغل سيناريوهات المحاكاة التشغيلية (Radiology Interactive Scenarios A → G)
              </h3>
              <p className="text-[11px] text-slate-300">
                اختر أي سيناريو للانتقال المباشر وتجربة مسار الفحص والخطوات التشغيلية التفاعلية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scenarios Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          {DEMO_SCENARIOS.map(scen => (
            <div
              key={scen.id}
              onClick={() => onSelectScenario(scen)}
              className="p-4 rounded-2xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/20 transition-all cursor-pointer space-y-3 group shadow-2xs hover:shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-xl bg-teal-600 text-white font-black font-mono text-xs flex items-center justify-center shadow-2xs">
                    {scen.code}
                  </span>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {scen.modality}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-slate-900 group-hover:text-teal-800 transition-colors">
                  {scen.titleAr}
                </h4>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {scen.descriptionAr}
                </p>

                <div className="space-y-1 pt-1 border-t border-slate-100 text-[10px] text-slate-500">
                  {scen.steps.map((st, i) => (
                    <div key={i} className="flex items-center gap-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                      <span className="truncate">{st}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs font-bold text-teal-700 group-hover:text-teal-900">
                <span>تشغيل السيناريو</span>
                <ArrowRight className="w-4 h-4 rotate-180 transition-transform group-hover:-translate-x-1" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            كافة السيناريوهات تدعم دورة العمل الحية من الطلب الأصلي وحتى التقرير والنتائج الحرجة
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition-all"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
