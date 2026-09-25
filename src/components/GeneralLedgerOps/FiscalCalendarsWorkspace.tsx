import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles,
  ArrowRight,
  Info,
  Clock
} from 'lucide-react';
import { 
  GeneralLedgerState, 
  FiscalCalendar, 
  AccountingPeriod, 
  PeriodCloseChecklist 
} from '../../types/generalLedger';
import { evaluatePeriodCloseReadiness } from '../../utils/generalLedgerEngine';

interface FiscalCalendarsWorkspaceProps {
  glState: GeneralLedgerState;
  onUpdateState: (newState: GeneralLedgerState) => void;
  activeCalendarId: string;
  onChangeCalendar: (calId: string) => void;
  activePeriodId: string;
  onChangePeriod: (periodId: string) => void;
}

export const FiscalCalendarsWorkspace: React.FC<FiscalCalendarsWorkspaceProps> = ({
  glState,
  onUpdateState,
  activeCalendarId,
  onChangeCalendar,
  activePeriodId,
  onChangePeriod
}) => {
  const [selectedCalendarId, setSelectedCalendarId] = useState(activeCalendarId);
  const [closeSuccessMessage, setCloseSuccessMessage] = useState<string | null>(null);

  const selectedCalendar = glState.calendars.find(c => c.id === selectedCalendarId) || glState.calendars[0];
  const activePeriod = selectedCalendar.periods.find(p => p.id === activePeriodId) || selectedCalendar.periods[0];

  // Evaluate Period-Close Readiness
  const checklist: PeriodCloseChecklist = evaluatePeriodCloseReadiness(
    glState,
    activePeriod.id,
    selectedCalendar.id
  );

  // Handle Simulated Period Close
  const handleSimulateClosePeriod = () => {
    if (checklist.overallReadiness !== 'ready_for_simulated_close') {
      alert('لا يمكن إقفال الفترة لوجود موانع رقابية قائمة.');
      return;
    }

    const updatedCalendars = glState.calendars.map(cal => {
      if (cal.id !== selectedCalendar.id) return cal;
      return {
        ...cal,
        periods: cal.periods.map(p => {
          if (p.id === activePeriod.id) {
            return { ...p, status: 'closed_simulated' as const };
          }
          return p;
        })
      };
    });

    onUpdateState({
      ...glState,
      calendars: updatedCalendars
    });

    setCloseSuccessMessage(`تم إقفال الفترة المالية ${activePeriod.periodNameAr} بنجاح في بيئة المحاكاة.`);
    setTimeout(() => setCloseSuccessMessage(null), 6000);
  };

  return (
    <div id="fiscal-calendars-workspace" className="space-y-6">
      
      {/* Workspace Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-bold text-white">
            التقاويم المالية والفترات المحاسبية (Fiscal Calendars & Periods)
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          إدارة السنوات والتقاويم المالية (السنوات التقويمية القياسية وسنوات الميزانية غير التقويمية) وضوابط حماية الفترات من الترحيل غير المصرح به.
        </p>

        {/* GL08 Non-Calendar Year Principle Banner */}
        <div className="mt-3 p-3 rounded-lg bg-blue-950/30 border border-blue-500/30 text-blue-200 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">
              دعم السنة المالية غير التقويمية (GL08):
            </span>
            <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
              يدعم النظام المستشفيات التي تتبع سنوات مالية خاصة (مثل 1 يوليو إلى 30 يونيو)، مع الحفاظ التام على أرقام الفترات والأرصدة الافتتاحية دون أي تداخل مع التقويم الميلادي المعتاد.
            </p>
          </div>
        </div>
      </div>

      {/* Calendar Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">التقويم المالي المستعرض:</span>
          <div className="flex items-center gap-1.5">
            {glState.calendars.map(cal => (
              <button
                key={cal.id}
                onClick={() => {
                  setSelectedCalendarId(cal.id);
                  onChangeCalendar(cal.id);
                  // pick first open period
                  const firstOpen = cal.periods.find(p => p.status === 'open') || cal.periods[0];
                  if (firstOpen) onChangePeriod(firstOpen.id);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedCalendarId === cal.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cal.calendarType === 'calendar_year_standard' ? 'التقويم القياسي (2026)' : 'سنة غير تقويمية (2026/2027)'}
              </button>
            ))}
          </div>
        </div>

        <div className="font-mono text-xs text-slate-300">
          السنة: <b className="text-white">{selectedCalendar.fiscalYearName}</b> ({selectedCalendar.startDate} إلى {selectedCalendar.endDate})
        </div>
      </div>

      {/* Periods Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">الفترات المحاسبية للتقويم ({selectedCalendar.periods.length} فترة)</h3>
            <p className="text-xs text-slate-400">تتضمن 12 فترة تشغيلية عادية + فترة الإقفال والتسويات الختامية</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {selectedCalendar.periods.map(period => {
            const isCurrent = period.id === activePeriod.id;
            const isOpen = period.status === 'open';
            const isClosed = period.status === 'closed_simulated';

            return (
              <div
                key={period.id}
                onClick={() => onChangePeriod(period.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-950/40 border-blue-500 shadow-sm'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-white">{period.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-sans ${
                    isOpen ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    isClosed ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                    'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {isOpen ? 'مفتوحة' : isClosed ? 'مغلقة' : 'معلقة'}
                  </span>
                </div>

                <div className="font-bold text-sm text-slate-100 mt-2">
                  {period.periodNameAr}
                </div>
                <div className="text-[11px] text-slate-400 font-sans">
                  {period.periodNameEn}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-3 pt-2 border-t border-slate-800/80">
                  <span>{period.startDate}</span>
                  <span>إلى</span>
                  <span>{period.endDate}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Period-Close Readiness Operational Checklist */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">
              قائمة جاهزية إقفال الفترة المالية (Period-Close Readiness Checklist)
            </h3>
            <p className="text-xs text-slate-400">
              فحص رقابي إلزامي للفترة <b className="text-blue-400">{activePeriod.periodNameAr} ({activePeriod.id})</b> قبل السماح بالإقفال المحاسبي
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
              checklist.overallReadiness === 'ready_for_simulated_close'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-rose-950 text-rose-300 border border-rose-800'
            }`}>
              {checklist.overallReadiness === 'ready_for_simulated_close'
                ? 'مكتملة وجاهزة للإقفال المحاكى'
                : 'يوجد موانع رقابية قائمة'}
            </span>

            {activePeriod.status === 'open' && (
              <button
                id="btn-simulate-close-period"
                onClick={handleSimulateClosePeriod}
                disabled={checklist.overallReadiness !== 'ready_for_simulated_close'}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  checklist.overallReadiness === 'ready_for_simulated_close'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>إقفال الفترة محاكياً</span>
              </button>
            )}
          </div>
        </div>

        {closeSuccessMessage && (
          <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{closeSuccessMessage}</span>
          </div>
        )}

        {/* Verification Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          
          {/* Check 1: Unposted Journals */}
          <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            checklist.unpostedDraftJournalsCount === 0
              ? 'bg-slate-950 border-slate-800 text-slate-300'
              : 'bg-rose-950/20 border-rose-800/40 text-rose-200'
          }`}>
            <div className={`p-1.5 rounded-md shrink-0 mt-0.5 ${
              checklist.unpostedDraftJournalsCount === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {checklist.unpostedDraftJournalsCount === 0 ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            </div>
            <div>
              <div className="font-bold text-white">قيود اليومية غير المرحلة أو المعلقة</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                يوجد <b className="text-white font-mono">{checklist.unpostedDraftJournalsCount}</b> مسودات أو قيود تحت الاعتماد في هذه الفترة.
              </div>
            </div>
          </div>

          {/* Check 2: Unmapped Source Events */}
          <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            checklist.unmappedSourceEventsCount === 0
              ? 'bg-slate-950 border-slate-800 text-slate-300'
              : 'bg-rose-950/20 border-rose-800/40 text-rose-200'
          }`}>
            <div className={`p-1.5 rounded-md shrink-0 mt-0.5 ${
              checklist.unmappedSourceEventsCount === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {checklist.unmappedSourceEventsCount === 0 ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            </div>
            <div>
              <div className="font-bold text-white">أحداث المصادر غير الموجهة محاسبياً</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                يوجد <b className="text-white font-mono">{checklist.unmappedSourceEventsCount}</b> حدثاً مصدرياً بانتظار استكمال التوجيه المحاسبي.
              </div>
            </div>
          </div>

          {/* Check 3: Trial Balance Status */}
          <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            checklist.trialBalanceBalanced
              ? 'bg-slate-950 border-slate-800 text-slate-300'
              : 'bg-rose-950/20 border-rose-800/40 text-rose-200'
          }`}>
            <div className={`p-1.5 rounded-md shrink-0 mt-0.5 ${
              checklist.trialBalanceBalanced ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {checklist.trialBalanceBalanced ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            </div>
            <div>
              <div className="font-bold text-white">توازن ميزان المراجعة الحسابي</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {checklist.trialBalanceBalanced ? 'متوازن بدقة (المدين = الدائن)' : 'غير متوازن حسابياً - يوجد فرق غير مسوى'}
              </div>
            </div>
          </div>

          {/* Check 4: Subledger Reconciliations */}
          <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            checklist.subledgerReconciliationDiscrepanciesCount === 0
              ? 'bg-slate-950 border-slate-800 text-slate-300'
              : 'bg-amber-950/20 border-amber-800/40 text-amber-200'
          }`}>
            <div className={`p-1.5 rounded-md shrink-0 mt-0.5 ${
              checklist.subledgerReconciliationDiscrepanciesCount === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {checklist.subledgerReconciliationDiscrepanciesCount === 0 ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            </div>
            <div>
              <div className="font-bold text-white">فروقات مطابقة الأستاذ الفرعي</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                يوجد <b className="text-white font-mono">{checklist.subledgerReconciliationDiscrepanciesCount}</b> حسابات رقابية تتطلب استكمال المطابقة أو إيضاحاً.
              </div>
            </div>
          </div>

        </div>

        {/* Blocking Issues List */}
        {checklist.blockingIssuesListAr.length > 0 && (
          <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800 text-rose-200 text-xs space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>الموانع الرقابية التي تحول دون إقفال الفترة:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-300 pr-2">
              {checklist.blockingIssuesListAr.map((issue, idx) => (
                <li key={idx}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

      </div>

    </div>
  );
};
