import React from 'react';
import { 
  Building2, 
  Calendar, 
  UserCheck, 
  AlertTriangle, 
  Layers, 
  Info,
  Sparkles
} from 'lucide-react';
import { MOCK_GL_PERSONAS } from '../../data/mockGeneralLedgerData';
import { FiscalCalendar, AccountingPeriod } from '../../types/generalLedger';

interface GlPreviewBannerProps {
  currentBranch: string;
  onChangeBranch: (branchId: string) => void;
  activePersonaId: string;
  onChangePersona: (personaId: string) => void;
  activeCalendarId: string;
  onChangeCalendar: (calId: string) => void;
  activePeriodId: string;
  onChangePeriod: (periodId: string) => void;
  calendars: FiscalCalendar[];
  activeCalendar: FiscalCalendar;
  activePeriod: AccountingPeriod;
  onSelectScenario: (scenarioId: string) => void;
  selectedScenarioId: string;
}

export const GlPreviewBanner: React.FC<GlPreviewBannerProps> = ({
  currentBranch,
  onChangeBranch,
  activePersonaId,
  onChangePersona,
  activeCalendarId,
  onChangeCalendar,
  activePeriodId,
  onChangePeriod,
  calendars,
  activeCalendar,
  activePeriod,
  onSelectScenario,
  selectedScenarioId
}) => {
  return (
    <div 
      id="gl-synthetic-preview-banner" 
      className="bg-amber-950/40 border-b border-amber-500/30 text-amber-200 text-xs px-4 py-2.5 backdrop-blur-md sticky top-0 z-40"
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Left Side: Mandatory Synthetic Disclosure */}
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="p-1 rounded-md bg-amber-500/20 text-amber-400 shrink-0 mt-0.5 sm:mt-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-300">
                بيئة محاكاة دفتر الأستاذ العام والدليل المحاسبي (General Ledger & Chart of Accounts - Synthetic Mode)
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-900/80 border border-amber-600/40 font-mono text-amber-300">
                IFRS / SOCPA Illustrative
              </span>
            </div>
            <p className="text-[11px] text-amber-300/80 leading-tight mt-0.5">
              بيانات مالية نموذجية مصممة لأغراض المحاكاة والتحقق التشغيلي وتدقيق القيود المزدوجة وميزان المراجعة، دون أي أثر قانوني أو ضريبي فعلي.
            </p>
          </div>
        </div>

        {/* Right Side: Operational Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          {/* Quick Scenario Jumper (GL01 - GL30) */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-2 py-1 rounded-lg border border-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] text-slate-300 hidden sm:inline">سيناريوهات الاختبار:</span>
            <select
              id="gl-scenario-select"
              value={selectedScenarioId}
              onChange={(e) => onSelectScenario(e.target.value)}
              className="bg-transparent text-amber-300 font-mono text-xs focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-300">اختر سيناريو (GL01 - GL30)...</option>
              <option value="GL01" className="bg-slate-900 text-white">GL01: إنشاء حساب جديد بالدليل المحاسبي</option>
              <option value="GL02" className="bg-slate-900 text-white">GL02: منع تكرار رمز الحساب (Unique Code)</option>
              <option value="GL03" className="bg-slate-900 text-white">GL03: منع القيد على الحسابات التجميعية (Groups)</option>
              <option value="GL04" className="bg-slate-900 text-white">GL04: تعطيل الحساب مع الاحتفاظ بتاريخه (Inactivate)</option>
              <option value="GL05" className="bg-slate-900 text-white">GL05: فصل الحساب الرئيسي عن مركز التكلفة</option>
              <option value="GL06" className="bg-slate-900 text-white">GL06: التحقق من إلزامية الأبعاد (Dimension Rules)</option>
              <option value="GL07" className="bg-slate-900 text-white">GL07: الفروع كأبعاد مالية بكيان قانوني واحد</option>
              <option value="GL08" className="bg-slate-900 text-white">GL08: السنة المالية غير التقويمية (1 يوليو - 30 يونيو)</option>
              <option value="GL09" className="bg-slate-900 text-white">GL09: منع الترحيل في فترات مغلقة (Closed Period)</option>
              <option value="GL10" className="bg-slate-900 text-white">GL10: قيد يومية متعدد الأطراف ومتوازن</option>
              <option value="GL11" className="bg-slate-900 text-white">GL11: رفض القيد غير المتوازن مع إيضاح الفرق</option>
              <option value="GL12" className="bg-slate-900 text-white">GL12: رفض القيد على حساب غير موجود أو معطل</option>
              <option value="GL13" className="bg-slate-900 text-white">GL13: تقديم القيد لدورة الاعتماد المالي</option>
              <option value="GL14" className="bg-slate-900 text-white">GL14: اعتماد القيد دون الترحيل التلقائي</option>
              <option value="GL15" className="bg-slate-900 text-white">GL15: ترحيل القيد ومنع التكرار (Idempotency)</option>
              <option value="GL16" className="bg-slate-900 text-white">GL16: لقطة سند القيد المحاسبي غير القابل للتعديل</option>
              <option value="GL17" className="bg-slate-900 text-white">GL17: عكس القيد بسند قيد عكسي مطابق</option>
              <option value="GL18" className="bg-slate-900 text-white">GL18: منع تكرار العكس على قيد معكوس مسبقاً</option>
              <option value="GL19" className="bg-slate-900 text-white">GL19: تصحيح القيد (عكس + قيد بديل معتمد)</option>
              <option value="GL20" className="bg-slate-900 text-white">GL20: استيراد أحداث المصدر كمرجع للقراءة فقط</option>
              <option value="GL21" className="bg-slate-900 text-white">GL21: ترحيل حدث المصدر ومنع التكرار المركب</option>
              <option value="GL22" className="bg-slate-900 text-white">GL22: إيقاف الترحيل عند نقص التوجيه المحاسبي</option>
              <option value="GL23" className="bg-slate-900 text-white">GL23: التحقق الصارم من سعر صرف العملة الأجنبية</option>
              <option value="GL24" className="bg-slate-900 text-white">GL24: أرصدة أول المدة ومصدر التدقيق الموثق</option>
              <option value="GL25" className="bg-slate-900 text-white">GL25: ميزان المراجعة الحسابي المتوازن</option>
              <option value="GL26" className="bg-slate-900 text-white">GL26: مطابقة دفتر الأستاذ مع الأنظمة الفرعية (Reconciliation)</option>
              <option value="GL27" className="bg-slate-900 text-white">GL27: قائمة جاهزية إقفال الفترة المالية (Period-Close)</option>
              <option value="GL28" className="bg-slate-900 text-white">GL28: استقلالية الفروع والأبعاد عن صلاحيات الدخول</option>
              <option value="GL29" className="bg-slate-900 text-white">GL29: الإفصاح عن المحاكاة في كامل واجهات النظام</option>
              <option value="GL30" className="bg-slate-900 text-white">GL30: صيانة حدود الوحدات كقراءة فقط للمصادر</option>
            </select>
          </div>

          {/* Calendar & Period Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-700">
            <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <select
              id="gl-calendar-select"
              value={activeCalendarId}
              onChange={(e) => onChangeCalendar(e.target.value)}
              className="bg-transparent text-slate-200 font-mono text-xs focus:outline-none cursor-pointer"
            >
              {calendars.map(cal => (
                <option key={cal.id} value={cal.id} className="bg-slate-900 text-white">
                  {cal.calendarType === 'calendar_year_standard' ? 'التقويم السنوي القياسي' : 'سنة مالية غير تقويمية'} ({cal.fiscalYearName})
                </option>
              ))}
            </select>
            <span className="text-slate-600">/</span>
            <select
              id="gl-period-select"
              value={activePeriodId}
              onChange={(e) => onChangePeriod(e.target.value)}
              className="bg-transparent text-blue-300 font-mono text-xs focus:outline-none cursor-pointer"
            >
              {activeCalendar.periods.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.periodNameAr} ({p.status === 'open' ? 'مفتوحة' : p.status === 'closed_simulated' ? 'مغلقة' : 'معلقة'})
                </option>
              ))}
            </select>
          </div>

          {/* Branch Dimension Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-700">
            <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <select
              id="gl-branch-select"
              value={currentBranch}
              onChange={(e) => onChangeBranch(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">جميع الفروع الموحدة (Consolidated)</option>
              <option value="main_hospital" className="bg-slate-900 text-white">المستشفى الرئيسي (الرياض)</option>
              <option value="north_clinic" className="bg-slate-900 text-white">مركز عيادات الشمال (الملقا)</option>
              <option value="east_rehab" className="bg-slate-900 text-white">مركز الشرق للتأهيل (اليرموك)</option>
            </select>
          </div>

          {/* Mock Persona Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-700">
            <UserCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <select
              id="gl-persona-select"
              value={activePersonaId}
              onChange={(e) => onChangePersona(e.target.value)}
              className="bg-transparent text-purple-300 text-xs font-bold focus:outline-none cursor-pointer"
            >
              {MOCK_GL_PERSONAS.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.nameAr} - {p.roleTitleAr}
                </option>
              ))}
            </select>
          </div>

        </div>

      </div>
    </div>
  );
};
