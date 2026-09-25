import React, { useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  Scale, 
  Layers, 
  Calendar, 
  ArrowRightLeft, 
  SlidersHorizontal, 
  ShieldCheck, 
  LayoutDashboard,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Building2
} from 'lucide-react';
import { 
  GeneralLedgerState, 
  FiscalCalendar, 
  AccountingPeriod,
  AccountNode
} from '../../types/generalLedger';
import { getInitialGeneralLedgerState, MOCK_GL_PERSONAS } from '../../data/mockGeneralLedgerData';
import { calculateTrialBalance, evaluatePeriodCloseReadiness } from '../../utils/generalLedgerEngine';

// Child Workspaces
import { GlPreviewBanner } from './GlPreviewBanner';
import { GlOverviewDashboard } from './GlOverviewDashboard';
import { ChartOfAccountsWorkspace } from './ChartOfAccountsWorkspace';
import { JournalEntriesWorkspace } from './JournalEntriesWorkspace';
import { TrialBalanceWorkspace } from './TrialBalanceWorkspace';
import { FinancialDimensionsWorkspace } from './FinancialDimensionsWorkspace';
import { FiscalCalendarsWorkspace } from './FiscalCalendarsWorkspace';
import { SourceEventsWorkspace } from './SourceEventsWorkspace';
import { GlReconciliationWorkspace } from './GlReconciliationWorkspace';
import { GlTestSuiteWorkspace } from './GlTestSuiteWorkspace';

export const GeneralLedgerOpsShell: React.FC = () => {
  // Master General Ledger State
  const [glState, setGlState] = useState<GeneralLedgerState>(() => getInitialGeneralLedgerState());

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Branch Dimension Filter
  const [currentBranch, setCurrentBranch] = useState<string>('all');

  // Active Persona
  const [activePersonaId, setActivePersonaId] = useState<string>('PERSONA-CONTROLLER');

  // Active Calendar and Period
  const [activeCalendarId, setActiveCalendarId] = useState<string>('CAL-2026-STANDARD');
  const [activePeriodId, setActivePeriodId] = useState<string>('FY2026-P09');

  // Quick Scenario Selection
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');

  // Controlled Modals from external triggers
  const [openCreateJournalModal, setOpenCreateJournalModal] = useState(false);
  const [inspectedVoucherId, setInspectedVoucherId] = useState<string | null>(null);

  // Active objects
  const activeCalendar = glState.calendars.find(c => c.id === activeCalendarId) || glState.calendars[0];
  const activePeriod = activeCalendar.periods.find(p => p.id === activePeriodId) || activeCalendar.periods[0];
  const activePersona = MOCK_GL_PERSONAS.find(p => p.id === activePersonaId) || MOCK_GL_PERSONAS[0];

  // Derived Financial Summaries
  const trialBalance = calculateTrialBalance(glState, activePeriod.id, activeCalendar.id);
  const closeChecklist = evaluatePeriodCloseReadiness(glState, activePeriod.id, activeCalendar.id);

  // Handle Scenario Jumper
  const handleSelectScenario = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    if (!scenarioId) return;

    if (scenarioId === 'GL01' || scenarioId === 'GL02' || scenarioId === 'GL03' || scenarioId === 'GL04') {
      setActiveTab('coa');
    } else if (scenarioId === 'GL05' || scenarioId === 'GL06' || scenarioId === 'GL07' || scenarioId === 'GL28') {
      setActiveTab('dimensions');
    } else if (scenarioId === 'GL08' || scenarioId === 'GL09' || scenarioId === 'GL27') {
      setActiveTab('calendars');
      if (scenarioId === 'GL08') {
        setActiveCalendarId('CAL-2026-NON-CALENDAR');
      }
    } else if (
      scenarioId === 'GL10' || scenarioId === 'GL11' || scenarioId === 'GL12' || 
      scenarioId === 'GL13' || scenarioId === 'GL14' || scenarioId === 'GL15' || 
      scenarioId === 'GL16' || scenarioId === 'GL17' || scenarioId === 'GL18' || 
      scenarioId === 'GL19' || scenarioId === 'GL23'
    ) {
      setActiveTab('journals');
      if (scenarioId === 'GL10' || scenarioId === 'GL11') {
        setOpenCreateJournalModal(true);
      }
    } else if (scenarioId === 'GL20' || scenarioId === 'GL21' || scenarioId === 'GL22' || scenarioId === 'GL30') {
      setActiveTab('source_events');
    } else if (scenarioId === 'GL24' || scenarioId === 'GL25') {
      setActiveTab('trial_balance');
    } else if (scenarioId === 'GL26') {
      setActiveTab('reconciliations');
    } else {
      setActiveTab('test_suite');
    }
  };

  // Switch tabs
  const handleNavigateToTab = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Inspect Voucher from any tab
  const handleViewVoucher = (voucherNumber: string) => {
    const v = glState.postedVouchers.find(item => item.voucherNumber === voucherNumber);
    if (v) {
      setInspectedVoucherId(v.voucherId);
      setActiveTab('journals');
    }
  };

  return (
    <div id="general-ledger-ops-shell" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" dir="rtl">
      
      {/* 1. Mandatory Synthetic Preview Disclosure Banner & Persona Switcher */}
      <GlPreviewBanner
        currentBranch={currentBranch}
        onChangeBranch={setCurrentBranch}
        activePersonaId={activePersonaId}
        onChangePersona={setActivePersonaId}
        activeCalendarId={activeCalendarId}
        onChangeCalendar={setActiveCalendarId}
        activePeriodId={activePeriodId}
        onChangePeriod={setActivePeriodId}
        calendars={glState.calendars}
        activeCalendar={activeCalendar}
        activePeriod={activePeriod}
        onSelectScenario={handleSelectScenario}
        selectedScenarioId={selectedScenarioId}
      />

      {/* 2. Primary Navigation Bar */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-[45px] z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-x-auto no-scrollbar py-1">
          
          <div className="flex items-center gap-1 shrink-0 text-xs">
            
            {/* Overview Tab */}
            <button
              id="gl-tab-overview"
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>لوحة المؤشرات والملخص</span>
            </button>

            {/* Chart of Accounts */}
            <button
              id="gl-tab-coa"
              onClick={() => setActiveTab('coa')}
              className={`px-3 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'coa'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>دليل الحسابات (COA)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 font-mono">
                {glState.accounts.length}
              </span>
            </button>

            {/* Journal Entries */}
            <button
              id="gl-tab-journals"
              onClick={() => setActiveTab('journals')}
              className={`px-3 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'journals'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>قيود اليومية والسندات</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 font-mono">
                {glState.journals.length}
              </span>
            </button>

            {/* Trial Balance */}
            <button
              id="gl-tab-trial-balance"
              onClick={() => setActiveTab('trial_balance')}
              className={`px-3 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'trial_balance'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>ميزان المراجعة والأستاذ</span>
              {trialBalance.status === 'VERIFIED_BALANCED' && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="متوازن حسابياً" />
              )}
            </button>

            {/* Financial Dimensions */}
            <button
              id="gl-tab-dimensions"
              onClick={() => setActiveTab('dimensions')}
              className={`px-3 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'dimensions'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>الأبعاد ومراكز التكلفة</span>
            </button>

            {/* Fiscal Calendars */}
            <button
              id="gl-tab-calendars"
              onClick={() => setActiveTab('calendars')}
              className={`px-3 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'calendars'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>التقاويم وإقفال الفترات</span>
            </button>

            {/* Source Events */}
            <button
              id="gl-tab-source-events"
              onClick={() => setActiveTab('source_events')}
              className={`px-3 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'source_events'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>أحداث المصادر (AP/Proc)</span>
            </button>

            {/* Reconciliations */}
            <button
              id="gl-tab-reconciliations"
              onClick={() => setActiveTab('reconciliations')}
              className={`px-3 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'reconciliations'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>مطابقة الأستاذ الفرعي</span>
            </button>

            {/* Autonomous Test Suite */}
            <button
              id="gl-tab-test-suite"
              onClick={() => setActiveTab('test_suite')}
              className={`px-3 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'test_suite'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>حزمة التحقق (48 Tests)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                48/48
              </span>
            </button>

          </div>

        </div>
      </div>

      {/* 3. Main Workspace Container */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full">
        {activeTab === 'overview' && (
          <GlOverviewDashboard
            glState={glState}
            trialBalance={trialBalance}
            closeChecklist={closeChecklist}
            onNavigateToTab={handleNavigateToTab}
            onOpenCreateJournal={() => {
              setActiveTab('journals');
              setOpenCreateJournalModal(true);
            }}
            onOpenCreateAccount={() => {
              setActiveTab('coa');
            }}
            onSelectVoucher={(voucherId) => {
              setInspectedVoucherId(voucherId);
              setActiveTab('journals');
            }}
          />
        )}

        {activeTab === 'coa' && (
          <ChartOfAccountsWorkspace
            accounts={glState.accounts}
            onUpdateAccounts={(updatedAccounts) => {
              setGlState({ ...glState, accounts: updatedAccounts });
            }}
            activePersona={activePersona}
          />
        )}

        {activeTab === 'journals' && (
          <JournalEntriesWorkspace
            glState={glState}
            onUpdateState={setGlState}
            activeCalendar={activeCalendar}
            activePeriod={activePeriod}
            activePersona={activePersona}
            initialOpenCreate={openCreateJournalModal}
            onCloseInitialCreate={() => setOpenCreateJournalModal(false)}
            inspectedVoucherId={inspectedVoucherId}
            onCloseInspectedVoucher={() => setInspectedVoucherId(null)}
          />
        )}

        {activeTab === 'trial_balance' && (
          <TrialBalanceWorkspace
            glState={glState}
            activeCalendar={activeCalendar}
            activePeriod={activePeriod}
            onChangePeriod={setActivePeriodId}
            onViewVoucher={handleViewVoucher}
          />
        )}

        {activeTab === 'dimensions' && (
          <FinancialDimensionsWorkspace
            glState={glState}
          />
        )}

        {activeTab === 'calendars' && (
          <FiscalCalendarsWorkspace
            glState={glState}
            onUpdateState={setGlState}
            activeCalendarId={activeCalendarId}
            onChangeCalendar={setActiveCalendarId}
            activePeriodId={activePeriodId}
            onChangePeriod={setActivePeriodId}
          />
        )}

        {activeTab === 'source_events' && (
          <SourceEventsWorkspace
            glState={glState}
            onUpdateState={setGlState}
            activePersona={activePersona}
            onViewVoucher={handleViewVoucher}
          />
        )}

        {activeTab === 'reconciliations' && (
          <GlReconciliationWorkspace
            glState={glState}
          />
        )}

        {activeTab === 'test_suite' && (
          <GlTestSuiteWorkspace />
        )}
      </main>

      {/* 4. Footer with Provenance */}
      <footer className="bg-slate-950 border-t border-slate-900 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>نظام دفتر الأستاذ العام والدليل المحاسبي الموحد للمستشفى • Hospital General Ledger & Chart of Accounts</span>
          <span className="font-mono text-[11px] text-slate-600">IFRS / SOCPA Illustrative Synthetic Model — 2026</span>
        </div>
      </footer>

    </div>
  );
};
