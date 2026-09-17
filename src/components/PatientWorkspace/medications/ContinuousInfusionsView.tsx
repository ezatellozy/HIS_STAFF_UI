import React, { useState } from 'react';
import {
  Activity,
  Play,
  Pause,
  Sliders,
  ShieldAlert,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Plus,
  ArrowRight,
  TrendingUp,
  X,
  Check
} from 'lucide-react';
import {
  ContinuousInfusionRecord,
  TitrationStep
} from '../../../types/clinicalMedicationsMar';
import { StaffUser } from '../../../types/his';

interface ContinuousInfusionsViewProps {
  infusions: ContinuousInfusionRecord[];
  currentStaff: StaffUser;
  onUpdateInfusion: (updated: ContinuousInfusionRecord) => void;
}

export const ContinuousInfusionsView: React.FC<ContinuousInfusionsViewProps> = ({
  infusions,
  currentStaff,
  onUpdateInfusion
}) => {
  const [selectedInfusion, setSelectedInfusion] = useState<ContinuousInfusionRecord | null>(null);
  const [titrateModalOpen, setTitrateModalOpen] = useState(false);

  // Titration Form
  const [newRate, setNewRate] = useState<string>('0.08');
  const [newUnit, setNewUnit] = useState<string>('');
  const [titrateReason, setTitrateReason] = useState<string>('');
  const [currentVitalsValue, setCurrentVitalsValue] = useState<string>('MAP 62 mmHg');
  const [verificationType, setVerificationType] = useState<'independent_double_check' | 'co_signature'>('independent_double_check');
  const [dualVerifier, setDualVerifier] = useState<string>('أحمد جلال (RN - ICU)');

  const handleOpenTitrate = (inf: ContinuousInfusionRecord) => {
    setSelectedInfusion(inf);
    setNewRate(inf.currentRate);
    setNewUnit(inf.rateUnit);
    setTitrateReason(`معايرة للوصول للهدف: ${inf.titrationGoal}`);
    setTitrateModalOpen(true);
  };

  const handleSaveTitration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInfusion) return;

    const newStep: TitrationStep = {
      id: `titr-${Date.now()}`,
      timestamp: 'اليوم، الآن',
      previousRate: selectedInfusion.currentRate,
      newRate: newRate,
      rateUnit: newUnit,
      targetParameter: selectedInfusion.titrationGoal,
      patientResponseValue: currentVitalsValue,
      reason: titrateReason,
      changedBy: `${currentStaff.name} (${currentStaff.role.toUpperCase()})`,
      verifiedBy: `${dualVerifier} [${verificationType === 'independent_double_check' ? 'تدقيق مستقل' : 'توقيع مشترك'}]`
    };

    const updated: ContinuousInfusionRecord = {
      ...selectedInfusion,
      currentRate: newRate,
      infusionStatus: 'running',
      lastTitratedAt: 'اليوم، الآن',
      titrationHistory: [newStep, ...selectedInfusion.titrationHistory]
    };

    onUpdateInfusion(updated);
    setTitrateModalOpen(false);
  };

  const handleTogglePause = (inf: ContinuousInfusionRecord) => {
    const nextStatus = inf.infusionStatus === 'running' ? 'paused' : 'running';
    const updated: ContinuousInfusionRecord = {
      ...inf,
      infusionStatus: nextStatus
    };
    onUpdateInfusion(updated);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">
              محاليل ومضخات التسريب الوريدي المستمر (ICU IV Drips & Titration Engine)
            </h4>
            <span className="text-xs text-slate-500">
              مراقبة سرعات الضخ، المعايرة السريرية الديناميكية، وسجل التحقق المزدوج
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-800 font-bold text-xs border border-purple-200 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
            <span>Smart Pump Safety Guardrails Enforced</span>
          </span>
        </div>
      </div>

      {/* Infusion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {infusions.map(inf => {
          const isRunning = inf.infusionStatus === 'running';

          return (
            <div
              key={inf.id}
              className={`bg-white rounded-2xl border transition-all p-5 shadow-xs flex flex-col justify-between space-y-4 ${
                isRunning ? 'border-teal-300 ring-1 ring-teal-100' : 'border-slate-200'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-base font-black text-slate-900">
                        {inf.medicationName}
                      </strong>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        High-Alert Drip
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono mt-0.5 block">
                      التركيز: {inf.concentration}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                      isRunning
                        ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                    <span>{isRunning ? 'قيد التسريب المستمر' : 'متوقف مؤقتاً (Paused)'}</span>
                  </span>
                </div>

                {/* Primary Pump Gauge Display */}
                <div className="p-4 rounded-2xl bg-slate-950 text-white my-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-teal-400 font-bold block uppercase tracking-wider">
                      معدل الضخ الحالي (Current Rate)
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-3xl font-black font-mono text-teal-300">
                        {inf.currentRate}
                      </span>
                      <span className="text-xs font-bold text-slate-300 font-mono">
                        {inf.rateUnit}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      السرعة الأساسية: {inf.baseRate} {inf.rateUnit}
                    </span>
                  </div>

                  <div className="text-left border-r border-slate-800 pr-4">
                    <span className="text-[10px] text-slate-400 block font-semibold">مجرى القسطرة الوريدية:</span>
                    <strong className="text-xs text-slate-200 font-mono block mt-0.5">{inf.lineLocation}</strong>
                    <span className="text-[10px] text-teal-400 block mt-2 font-bold">
                      الهدف: {inf.titrationGoal}
                    </span>
                  </div>
                </div>

                {/* Titration History Log Accordion */}
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 font-bold text-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      <span>سجل المعايرات الأخيرة (Titration Audit Trail)</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {inf.titrationHistory.length} تعديلات مسجلة
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                    {inf.titrationHistory.map(step => (
                      <div key={step.id} className="p-3 text-[11px] space-y-1 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-teal-800 text-xs">
                            {step.previousRate} → {step.newRate} {step.rateUnit}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{step.timestamp}</span>
                        </div>

                        <p className="text-slate-700">{step.reason}</p>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                          <span>بواسطة: <strong>{step.changedBy.split(' ')[0]}</strong></span>
                          {step.verifiedBy && (
                            <span className="text-purple-700 font-bold">
                              ✓✓ تدقيق: {step.verifiedBy.split(' ')[0]}
                            </span>
                          )}
                          {step.patientResponseValue && (
                            <span className="font-mono text-slate-600">[{step.patientResponseValue}]</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Controls Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => handleTogglePause(inf)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isRunning
                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                      : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                  }`}
                >
                  {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isRunning ? 'إيقاف مؤقت (Pause)' : 'استئناف الضخ (Resume)'}</span>
                </button>

                <button
                  onClick={() => handleOpenTitrate(inf)}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>معايرة وضبط السرعة (Titrate)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Titration Action Slide-Over Drawer */}
      {titrateModalOpen && selectedInfusion && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div>
              {/* Header */}
              <div className="p-5 bg-gradient-to-r from-teal-800 to-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center text-teal-300">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">
                      معايرة سرعة التسريب المستمر (Infusion Titration Drawer)
                    </h3>
                    <span className="text-xs text-teal-200/80">
                      {selectedInfusion.medicationName} • {selectedInfusion.concentration}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setTitrateModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form id="titrate-form" onSubmit={handleSaveTitration} className="p-6 space-y-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 font-bold block text-[10px]">السرعة الحالية:</span>
                    <span className="text-lg font-black font-mono text-teal-950">
                      {selectedInfusion.currentRate} {selectedInfusion.rateUnit}
                    </span>
                  </div>
                  <div className="text-left">
                    <span className="text-slate-500 font-bold block text-[10px]">الهدف السريري:</span>
                    <strong className="text-teal-900 text-xs">{selectedInfusion.titrationGoal}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      السرعة الجديدة المطلوبة:
                    </label>
                    <input
                      type="text"
                      value={newRate}
                      onChange={e => setNewRate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base font-mono font-black text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      الوحدة:
                    </label>
                    <input
                      type="text"
                      value={newUnit}
                      disabled
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    مبرر المعايرة السريرية (Titration Rationale):
                  </label>
                  <input
                    type="text"
                    value={titrateReason}
                    onChange={e => setTitrateReason(e.target.value)}
                    placeholder="سبب زيادة أو خفض المعدل..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    قراءة العلامات الحيوية المصاحبة (Patient Snapshot):
                  </label>
                  <input
                    type="text"
                    value={currentVitalsValue}
                    onChange={e => setCurrentVitalsValue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>

                {/* Verification according to Hospital / Clinical Policy */}
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-rose-900 font-bold text-xs">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>سياسة التدقيق السريري للمعايرة (Verification Policy):</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setVerificationType('independent_double_check')}
                        className={`px-2 py-0.5 rounded cursor-pointer ${
                          verificationType === 'independent_double_check'
                            ? 'bg-rose-700 text-white font-bold'
                            : 'bg-white text-rose-800'
                        }`}
                      >
                        تدقيق مستقل
                      </button>
                      <button
                        type="button"
                        onClick={() => setVerificationType('co_signature')}
                        className={`px-2 py-0.5 rounded cursor-pointer ${
                          verificationType === 'co_signature'
                            ? 'bg-rose-700 text-white font-bold'
                            : 'bg-white text-rose-800'
                        }`}
                      >
                        توقيع مشترك
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={dualVerifier}
                    onChange={e => setDualVerifier(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl text-xs font-bold text-rose-950"
                    placeholder="اسم الممارس المدقق الثاني..."
                    required
                  />
                </div>
              </form>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setTitrateModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                form="titrate-form"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>تأكيد وضخ المعدل الجديد</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
