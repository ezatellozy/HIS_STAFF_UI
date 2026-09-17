import React from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  PlayCircle,
  Pill,
  ShieldAlert,
  AlertTriangle,
  FlaskConical,
  LogOut,
  RefreshCw,
  Package,
  Layers,
  FileCheck
} from 'lucide-react';
import { PharmacyViewTab } from '../../types/pharmacyOps';

interface PharmacyDemoScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenarioKey: string, targetTab: PharmacyViewTab, targetOrderId?: string) => void;
}

export const PharmacyDemoScenariosModal: React.FC<PharmacyDemoScenariosModalProps> = ({
  isOpen,
  onClose,
  onSelectScenario
}) => {
  if (!isOpen) return null;

  const scenarios = [
    {
      key: 'scenario_a',
      title: 'السيناريو A: صرف روتيني لمريض تنويم (Routine Inpatient Medication)',
      drug: 'Levofloxacin 750mg IV Infusion',
      orderId: 'RX-2026-9041',
      tab: 'incoming_orders' as PharmacyViewTab,
      category: 'Inpatient Flow',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
      description: 'طلب مضاد حيوي روتيني لمريضة تعاني من حساسية البنسلين؛ التدقيق السريري، تجهيز العبوة، الفحص النهائي، ثم الصرف المنفصل تماماً عن الإعطاء.'
    },
    {
      key: 'scenario_b',
      title: 'السيناريو B: استيضاح وتدخل صيدلاني (Clinical Clarification & Intervention)',
      drug: 'Vancomycin 1g IV Q12H (eGFR 34 mL/min)',
      orderId: 'RX-2026-9042',
      tab: 'interventions' as PharmacyViewTab,
      category: 'Clinical Pharmacist',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      description: 'جرعة فانكومايسين غير مناسبة لوظائف كلى منخفضة؛ تعليق الصرف، توثيق تدخل صيدلاني، والتنسيق مع الطبيب المقيم لتعديل الفاصل الزمني ومراقبة القاع.'
    },
    {
      key: 'scenario_c',
      title: 'السيناريو C: دواء عالي الخطورة وتدقيق مزدوج (High-Alert Heparin Protocol)',
      drug: 'Heparin Sodium 25,000 Units in 250 mL D5W',
      orderId: 'RX-2026-9043',
      tab: 'preparation' as PharmacyViewTab,
      category: 'High Alert Safety',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      description: 'تسريب هيبارين مستمر للعناية القلبية؛ سياسة التدقيق المستقل المزدوج (Independent Double Check) بين فني التحضير والصيدلي الفاحص.'
    },
    {
      key: 'scenario_d',
      title: 'السيناريو D: نقص المخزون واقتراح بديل علاجي (Stock Shortage & Substitution)',
      drug: 'Meropenem 1g IV (Out of Stock) ➔ Ertapenem',
      orderId: 'RX-2026-9044',
      tab: 'verification' as PharmacyViewTab,
      category: 'Formulary & Shortages',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      description: 'نفاد ميروبينيم من الصيدلية الرئيسية؛ استعراض البدائل المعتمدة في الدليل واقتراح إيرتابينيم مع اشتراط موافقة الطبيب بالمصدر.'
    },
    {
      key: 'scenario_e',
      title: 'السيناريو E: تحضير معقم للمحاليل الوريدية (Sterile Compounding in Cleanroom)',
      drug: 'Piperacillin/Tazobactam 4.5g Admixture Bag',
      orderId: 'RX-2026-9045',
      tab: 'preparation' as PharmacyViewTab,
      category: 'Sterile IV Cleanroom',
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      description: 'ورقة تحضير معقم داخل كابينة التدفق الصفحي (ISO Class 5)؛ توثيق المكونات، الحجم النهائي، فترة الصلاحية بعد الحل (BUD 24h).'
    },
    {
      key: 'scenario_f',
      title: 'السيناريو F: أدوية التخريج والإرشاد الصيدلاني (Discharge Medication & Counseling)',
      drug: 'Apixaban (Eliquis) 5mg Tablets (30 Days)',
      orderId: 'RX-2026-9046',
      tab: 'discharge_supply' as PharmacyViewTab,
      category: 'Discharge & Med Rec',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'تجهيز حزمة أدوية الخروج المرتبطة بملف المصالحة الدوائية (Axis 8) مع محاكاة جلسة تثقيف المريض المحددة بالسياسة (Mock Policy: Counseling Required).'
    },
    {
      key: 'scenario_g',
      title: 'السيناريو G: إلغاء الطلب بعد اكتمال التحضير (Cancelled After Preparation)',
      drug: 'Ceftriaxone 2g Reconstituted IV Bag',
      orderId: 'RX-2026-9047',
      tab: 'returns_exceptions' as PharmacyViewTab,
      category: 'Waste & Disposition',
      badgeColor: 'bg-red-100 text-red-800 border-red-200',
      description: 'الطبيب ألغى الطلب في الطوارئ بعد اكتمال حل الفيال في الصيدلية؛ مسار التوثيق الطبي للتخلص أو إعادة التخصيص وفق السياسة.'
    },
    {
      key: 'scenario_h',
      title: 'السيناريو H: صرف جزئي للكمية (Partial Dispense State)',
      drug: 'Enoxaparin (Clexane) 40mg (4 of 10 Dispensed)',
      orderId: 'RX-2026-9048',
      tab: 'dispensing' as PharmacyViewTab,
      category: 'Partial Supply',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'مخزون محدود في عهدة الجناح؛ صرف 4 حقن تغطي 4 أيام مع جدولة توريد الحقن الست المتبقية قبل موعد الجرعة القادمة.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Sparkles className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold">سيناريوهات الاختبار التفاعلية للنموذج الأولي (Interactive Demo Scenarios A ➔ H)</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                انقر على أي سيناريو للانتقال المباشر وتجربة مسار العمليات الصيدلانية المحدد
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
        <div className="bg-teal-50 border-b border-teal-200 px-6 py-2 text-xs text-teal-900 flex items-center justify-between">
          <span>السيناريوهات توضح اكتمال المسارات: التدقيق، التدخل، التحضير المعقم، الدواء عالي الخطورة، والتخريج.</span>
          <span className="font-mono text-[10px] font-bold text-teal-700">UI/UX Prototype Only</span>
        </div>

        {/* Scenarios List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 text-xs">
          {scenarios.map(sc => (
            <div
              key={sc.key}
              onClick={() => {
                onSelectScenario(sc.key, sc.tab, sc.orderId);
                onClose();
              }}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 transition-all cursor-pointer group flex items-start justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${sc.badgeColor}`}>
                    {sc.category}
                  </span>
                  <span className="font-bold text-slate-900 text-xs">{sc.title}</span>
                </div>
                <div className="text-[11px] font-mono text-teal-800 font-medium">
                  {sc.drug} • <span className="text-slate-500">Ref: {sc.orderId}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {sc.description}
                </p>
              </div>

              <button className="px-3 py-1.5 rounded-lg bg-white group-hover:bg-teal-600 group-hover:text-white text-slate-700 border border-slate-200 group-hover:border-teal-600 font-bold text-xs flex items-center gap-1 shrink-0 transition-colors shadow-2xs">
                <span>تشغيل السيناريو</span>
                <PlayCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            جميع البيانات الواردة في السيناريوهات هي بيانات محاكاة مطابقة لمواصفات التصميم.
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
