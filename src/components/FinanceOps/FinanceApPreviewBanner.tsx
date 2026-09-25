import React from 'react';
import { 
  Building2, 
  Sparkles, 
  Play, 
  UserCheck, 
  Calendar,
  Layers
} from 'lucide-react';
import { ApBranchId } from '../../types/accountsPayable';

interface FinanceApPreviewBannerProps {
  currentBranch: ApBranchId;
  onChangeBranch: (branch: ApBranchId) => void;
  activePersona: string;
  onChangePersona: (persona: string) => void;
  effectiveDate: string;
  onChangeEffectiveDate: (date: string) => void;
  onSelectScenario: (scenarioId: string) => void;
  selectedScenarioId: string;
}

export const FinanceApPreviewBanner: React.FC<FinanceApPreviewBannerProps> = ({
  currentBranch,
  onChangeBranch,
  activePersona,
  onChangePersona,
  effectiveDate,
  onChangeEffectiveDate,
  onSelectScenario,
  selectedScenarioId
}) => {
  return (
    <div id="finance-ap-preview-banner" className="bg-slate-900 border-b border-emerald-500/30 text-slate-200 px-4 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        
        {/* Synthetic Prototype Mandatory Disclaimer */}
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-300">
                معاينة تصميمية للحسابات الدائنة والمالية - نموذج محاكاة تشغيلي
              </span>
              <span className="px-1.5 py-0.5 rounded-sm bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono">
                SYNTHETIC AP PROTOTYPE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Synthetic Finance & AP Design Preview — No Real Money Movement or Accounting Posting.
            </p>
          </div>
        </div>

        {/* Controls: Branch Context, Mock Persona, Effective Date & Scenario Launcher */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start md:justify-end">
          
          {/* Branch Context */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400">الفرع:</span>
            <select
              id="ap-branch-selector"
              value={currentBranch}
              onChange={(e) => onChangeBranch(e.target.value as ApBranchId)}
              className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="main_hospital" className="bg-slate-900 text-slate-200">المستشفى التخصصي الرئيسي (Main)</option>
              <option value="suburban_clinic_branch" className="bg-slate-900 text-slate-200">مجمع العيادات التخصصية (Branch)</option>
              <option value="all" className="bg-slate-900 text-slate-200">كافة الفروع والكيانات (All Branches)</option>
            </select>
          </div>

          {/* Simulated Persona (Staff Assignment Context) */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400">الصفة:</span>
            <select
              id="ap-persona-selector"
              value={activePersona}
              onChange={(e) => onChangePersona(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="ap_clerk" className="bg-slate-900 text-slate-200">محاسب حسابات دائنة (AP Clerk)</option>
              <option value="ap_lead" className="bg-slate-900 text-slate-200">رئيس قسم الحسابات الدائنة (AP Lead)</option>
              <option value="financial_controller" className="bg-slate-900 text-slate-200">المدير المالي (Financial Controller)</option>
              <option value="treasury_officer" className="bg-slate-900 text-slate-200">مسؤول الخزينة والتحويلات (Treasury)</option>
            </select>
          </div>

          {/* Scenario Clock Date */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400">تاريخ المحاكاة:</span>
            <input
              id="ap-effective-clock-input"
              type="date"
              value={effectiveDate}
              onChange={(e) => onChangeEffectiveDate(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-mono focus:outline-none cursor-pointer"
            />
          </div>

          {/* Scenario Quick Launcher AP01 - AP30 */}
          <div className="flex items-center gap-1.5 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/80 text-emerald-300">
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-bold">سيناريو AP:</span>
            <select
              id="ap-scenario-launcher-select"
              value={selectedScenarioId}
              onChange={(e) => onSelectScenario(e.target.value)}
              className="bg-transparent text-emerald-200 text-xs font-mono font-bold focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-300">-- اختر سيناريو التحقق --</option>
              <option value="AP01" className="bg-slate-900 text-slate-200">AP01: فاتورة توريد مرتبطة بأمر شراء مستندي</option>
              <option value="AP02" className="bg-slate-900 text-slate-200">AP02: فاتورة خدمات غير مرتبطة بأمر شراء (Non-PO)</option>
              <option value="AP03" className="bg-slate-900 text-slate-200">AP03: كشف ومنع تكرار فاتورة المورد</option>
              <option value="AP04" className="bg-slate-900 text-slate-200">AP04: رفض فاتورة ناقصة البيانات الإلزامية</option>
              <option value="AP05" className="bg-slate-900 text-slate-200">AP05: عدم تطابق مورد الفاتورة مع أمر الشراء</option>
              <option value="AP06" className="bg-slate-900 text-slate-200">AP06: إعادة الفاتورة للمورد للتصحيح مع حفظ السجل</option>
              <option value="AP07" className="bg-slate-900 text-slate-200">AP07: تعدد الفواتير على بند أمر الشراء الواحد</option>
              <option value="AP08" className="bg-slate-900 text-slate-200">AP08: فاتورة واحدة تشمل بنود أوامر شراء متعددة</option>
              <option value="AP09" className="bg-slate-900 text-slate-200">AP09: وصول الفاتورة قبل سند استلام البضاعة (GRN)</option>
              <option value="AP10" className="bg-slate-900 text-slate-200">AP10: استلام جزئي وفوترة جزئية سليمة</option>
              <option value="AP11" className="bg-slate-900 text-slate-200">AP11: فوترة كمية تتجاوز رصيد الاستلام المتاح</option>
              <option value="AP12" className="bg-slate-900 text-slate-200">AP12: فارق سعر الوحدة يتجاوز نسبة التسامح 2%</option>
              <option value="AP13" className="bg-slate-900 text-slate-200">AP13: قبول خدمة فنية بدون سند استلام مستودعي</option>
              <option value="AP14" className="bg-slate-900 text-slate-200">AP14: استلام بضائع مع رفض ورقابة جودة (QA)</option>
              <option value="AP15" className="bg-slate-900 text-slate-200">AP15: ربط وتطبيق إشعار دائن على الفاتورة الأصلية</option>
              <option value="AP16" className="bg-slate-900 text-slate-200">AP16: مراجعة إشعار مدين وفروقات الفوترة</option>
              <option value="AP17" className="bg-slate-900 text-slate-200">AP17: خصم دفعة مقدمة مؤكدة من الفاتورة</option>
              <option value="AP18" className="bg-slate-900 text-slate-200">AP18: تنوع المعاملات الضريبية على مستوى البنود</option>
              <option value="AP19" className="bg-slate-900 text-slate-200">AP19: ضريبة مدخلات معلقة المراجعة الفنية</option>
              <option value="AP20" className="bg-slate-900 text-slate-200">AP20: فاتورة بعملة أجنبية مع غياب سعر الصرف</option>
              <option value="AP21" className="bg-slate-900 text-slate-200">AP21: اعتماد الفاتورة لا يعني ترحيل القيد لدفتر الأستاذ</option>
              <option value="AP22" className="bg-slate-900 text-slate-200">AP22: مقترح الدفع منفصل عن اعتماد صرف الخزينة</option>
              <option value="AP23" className="bg-slate-900 text-slate-200">AP23: سداد جزئي يحافظ على رصيد الفاتورة المستحق</option>
              <option value="AP24" className="bg-slate-900 text-slate-200">AP24: حظر التخصيص المزدوج لنفس الفاتورة في دفعتين</option>
              <option value="AP25" className="bg-slate-900 text-slate-200">AP25: تغيير الحساب البنكي للمورد يوقف الصرف</option>
              <option value="AP26" className="bg-slate-900 text-slate-200">AP26: الرفض البنكي التجريبي لا ينتج تسوية مالية</option>
              <option value="AP27" className="bg-slate-900 text-slate-200">AP27: إشعار البنك وحده لا يغلق الفاتورة بدون تسوية</option>
              <option value="AP28" className="bg-slate-900 text-slate-200">AP28: سياق الفروع وتعدد مهام فريق العمل</option>
              <option value="AP29" className="bg-slate-900 text-slate-200">AP29: ثبات شريط المعاينة التجريبية عبر الشاشات</option>
              <option value="AP30" className="bg-slate-900 text-slate-200">AP30: صيانة حدود المشتريات والمستودعات والسريرية</option>
            </select>
          </div>

        </div>

      </div>
    </div>
  );
};
