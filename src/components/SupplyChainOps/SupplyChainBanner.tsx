import React, { useState, useEffect } from 'react';
import { AlertCircle, ShieldAlert, Sparkles, DatabaseZap, Clock, Settings2, Check } from 'lucide-react';
import { AuditScenarioDefinition } from '../../types/supplyChainOps';
import {
  getClockState,
  setClockMode,
  setScenarioDate,
  subscribeClock,
  ClockState
} from '../../utils/mockClock';

interface SupplyChainBannerProps {
  onOpenScenarioModal?: () => void;
  selectedScenario?: AuditScenarioDefinition | null;
}

export const SupplyChainBanner: React.FC<SupplyChainBannerProps> = ({
  onOpenScenarioModal,
  selectedScenario
}) => {
  const [clockState, setClockState] = useState<ClockState>(getClockState());
  const [showClockConfig, setShowClockConfig] = useState(false);
  const [customDate, setCustomDate] = useState(clockState.scenarioDate);

  useEffect(() => {
    return subscribeClock(setClockState);
  }, []);

  const isDeterministic = clockState.mode === 'deterministic_scenario';

  return (
    <div
      id="supply-chain-synthetic-preview-banner"
      className="bg-amber-950/80 border-b border-amber-600/40 px-4 py-2 text-amber-200 text-xs flex flex-wrap items-center justify-between gap-3 shadow-inner"
    >
      <div className="flex items-center gap-2 font-medium">
        <span className="p-1 rounded bg-amber-500/20 text-amber-400 shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
        </span>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="font-bold text-white bg-amber-900/80 px-2 py-0.5 rounded text-[11px] border border-amber-700/60 font-mono">
            SYNTHETIC DESIGN PREVIEW
          </span>
          <span className="font-semibold text-amber-100">
            معاينة تصميمية ونموذج محاكاة تجريبي لإدارة سلاسل الإمداد والمستودعات الطبية (Synthetic Supply Chain UI/UX Prototype)
          </span>
          <span className="text-amber-300/80 hidden sm:inline">
            — لا توجد بيانات مخزون حقيقية ولا ربط بمستودع فيزيائي (No Real Stock Ledger / Offline Mock State)
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-[11px] text-amber-300/90 shrink-0 font-mono relative">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowClockConfig(prev => !prev)}
            className="flex items-center gap-1 bg-amber-900/60 hover:bg-amber-900 px-2 py-0.5 rounded border border-amber-700 text-amber-200 font-bold cursor-pointer transition-colors"
            title="إعدادات الساعة وسيناريوهات التاريخ (Mock Clock Settings)"
          >
            <Clock className="w-3 h-3 text-amber-400" />
            {isDeterministic ? (
              <span>ساعة السيناريو المرجعية: {clockState.scenarioDate} (Scenario Fixture)</span>
            ) : (
              <span className="text-emerald-300">ساعة النظام الحية (Live System Clock)</span>
            )}
            <Settings2 className="w-2.5 h-2.5 text-amber-400 opacity-70" />
          </button>

          {showClockConfig && (
            <div className="absolute top-8 left-0 z-50 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl space-y-2.5 text-xs text-white min-w-[280px]">
              <div className="font-bold border-b border-slate-800 pb-1.5 text-amber-300">
                ضبط ساعة المحاكاة (Mock Clock Controller)
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="clock_mode"
                    checked={isDeterministic}
                    onChange={() => setClockMode('deterministic_scenario')}
                  />
                  <span>سيناريو مرجعي ثابت (Scenario Fixture: 2026-09-20)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="clock_mode"
                    checked={!isDeterministic}
                    onChange={() => setClockMode('live_system')}
                  />
                  <span>الوقت الفعلي للنظام (Live Browser System Date)</span>
                </label>
              </div>
              {isDeterministic && (
                <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                  <input
                    type="date"
                    value={customDate}
                    onChange={e => setCustomDate(e.target.value)}
                    className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                  />
                  <button
                    onClick={() => {
                      setScenarioDate(customDate);
                      setShowClockConfig(false);
                    }}
                    className="px-2 py-1 bg-amber-600 hover:bg-amber-500 rounded font-bold text-[11px] cursor-pointer"
                  >
                    تطبيق
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <span className="text-amber-600 hidden sm:inline">|</span>
        <span className="flex items-center gap-1">
          <ShieldAlert className="w-3 h-3 text-amber-400" />
          <span>استقلالية الصيدلية وبنك الدم والمختبر محفوظة</span>
        </span>
        {selectedScenario && (
          <>
            <span className="text-amber-600">|</span>
            <span className="text-teal-300 font-bold bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800">
              سيناريو نشط: {selectedScenario.id} — {selectedScenario.titleAr}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

