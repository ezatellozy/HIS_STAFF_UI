import React, { useState } from 'react';
import {
  Pill,
  Clock,
  Layers,
  Activity,
  GitCompare,
  History,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  Sparkles,
  Info,
  Sliders
} from 'lucide-react';
import { Patient } from '../../../types/his';
import { useHis } from '../../../context/HisContext';
import {
  ActiveMedicationItem,
  AdministrationSlot,
  ContinuousInfusionRecord,
  MedicationReconciliationRecord,
  MedicationHistoryItem
} from '../../../types/clinicalMedicationsMar';
import {
  MOCK_ACTIVE_MEDICATIONS,
  MOCK_CONTINUOUS_INFUSIONS,
  MOCK_MEDICATION_RECONCILIATION,
  MOCK_MEDICATION_HISTORY
} from '../../../data/mockClinicalMedicationsData';
import { ActiveMedicationsListView } from './ActiveMedicationsListView';
import { EmarGridView } from './EmarGridView';
import { ContinuousInfusionsView } from './ContinuousInfusionsView';
import { MedicationReconciliationView } from './MedicationReconciliationView';
import { MedicationHistoryView } from './MedicationHistoryView';
import { AdministrationActionDrawer } from './AdministrationActionDrawer';

interface MedicationsWorkspaceProps {
  patient: Patient;
}

export type MedicationWorkspaceTab =
  | 'emar_grid'
  | 'active_list'
  | 'infusions'
  | 'reconciliation'
  | 'history';

export type CareAreaMedPreset = 'all' | 'er' | 'icu' | 'wards' | 'opd' | 'or';

export const MedicationsWorkspace: React.FC<MedicationsWorkspaceProps> = ({ patient }) => {
  const { currentStaff, playChime } = useHis();

  // Active Tab & Care Area Presets
  const [activeTab, setActiveTab] = useState<MedicationWorkspaceTab>('emar_grid');
  const [activePreset, setActivePreset] = useState<CareAreaMedPreset>('all');

  // Datasets State
  const [activeMeds, setActiveMeds] = useState<ActiveMedicationItem[]>(MOCK_ACTIVE_MEDICATIONS);
  const [infusions, setInfusions] = useState<ContinuousInfusionRecord[]>(MOCK_CONTINUOUS_INFUSIONS);
  const [reconciliation, setReconciliation] = useState<MedicationReconciliationRecord>(
    MOCK_MEDICATION_RECONCILIATION
  );
  const [pastMeds, setPastMeds] = useState<MedicationHistoryItem[]>(MOCK_MEDICATION_HISTORY);

  // Drawer State
  const [selectedMedForAction, setSelectedMedForAction] = useState<ActiveMedicationItem | null>(null);
  const [selectedSlotForAction, setSelectedSlotForAction] = useState<AdministrationSlot | null>(null);

  // Safety Counts
  const highAlertCount = activeMeds.filter(m => m.isHighAlert).length;
  const overdueCount = activeMeds.reduce((acc, med) => {
    const ov = med.scheduleSlots?.filter(s => s.status === 'overdue').length || 0;
    return acc + ov;
  }, 0);

  // Handlers
  const handleOpenSlotAction = (med: ActiveMedicationItem, slot: AdministrationSlot) => {
    setSelectedMedForAction(med);
    setSelectedSlotForAction(slot);
  };

  const handleAdministerPrn = (med: ActiveMedicationItem) => {
    const newPrnSlot: AdministrationSlot = {
      slotId: `slot-prn-${Date.now()}`,
      scheduledTime: 'الآن (PRN)',
      status: 'administered',
      administeredAt: 'اليوم، الآن',
      administeredDose: med.orderedDose,
      administeredRoute: med.route,
      administeredBy: `${currentStaff.name} (${currentStaff.role.toUpperCase()})`
    };

    setSelectedMedForAction(med);
    setSelectedSlotForAction(newPrnSlot);
  };

  const handleSaveSlot = (updatedSlot: AdministrationSlot) => {
    if (!selectedMedForAction) return;

    setActiveMeds(prev =>
      prev.map(med => {
        if (med.id === selectedMedForAction.id) {
          const existingSlots = med.scheduleSlots || [];
          const slotExists = existingSlots.some(s => s.slotId === updatedSlot.slotId);
          const newSlots = slotExists
            ? existingSlots.map(s => (s.slotId === updatedSlot.slotId ? updatedSlot : s))
            : [...existingSlots, updatedSlot];

          return {
            ...med,
            scheduleSlots: newSlots
          };
        }
        return med;
      })
    );

    setSelectedMedForAction(null);
    setSelectedSlotForAction(null);
    playChime('success');
  };

  const handleUpdateInfusion = (updated: ContinuousInfusionRecord) => {
    setInfusions(prev =>
      prev.map(inf => (inf.id === updated.id ? updated : inf))
    );
    playChime('success');
  };

  return (
    <div className="space-y-6">
      {/* 1. Allergy & High-Alert Safety Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-sm font-black text-slate-900">
                حساسية دوائية مسجلة:
              </strong>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white">
                بنسلين (Penicillin) — صدمة تأقية حادة (Anaphylaxis)
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span>أدوية عالية الخطورة: <strong className="text-rose-700 font-bold">{highAlertCount} أدوية</strong></span>
              {overdueCount > 0 && (
                <>
                  <span>•</span>
                  <span className="text-rose-700 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{overdueCount} جرعات متأخرة في eMAR</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Care Area Quick Presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">سياق الرعاية:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => {
                setActivePreset('all');
                setActiveTab('emar_grid');
              }}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activePreset === 'all' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              شامل (All)
            </button>
            <button
              onClick={() => {
                setActivePreset('icu');
                setActiveTab('infusions');
              }}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activePreset === 'icu' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              عناية مركزة (ICU Drips)
            </button>
            <button
              onClick={() => {
                setActivePreset('wards');
                setActiveTab('emar_grid');
              }}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activePreset === 'wards' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              أجنحة (Wards eMAR)
            </button>
            <button
              onClick={() => {
                setActivePreset('or');
                setActiveTab('active_list');
              }}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activePreset === 'or' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              العمليات (OR Perioperative)
            </button>
          </div>
        </div>
      </div>

      {/* 2. Concept Workspace Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <button
          onClick={() => setActiveTab('emar_grid')}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
            activeTab === 'emar_grid'
              ? 'bg-teal-700 text-white border-teal-800 shadow-md ring-2 ring-teal-500/20'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              activeTab === 'emar_grid' ? 'bg-white/20 text-white' : 'bg-slate-100 text-teal-700'
            }`}
          >
            <Clock className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <strong className="text-xs block font-extrabold truncate">سجل إعطاء الدواء</strong>
            <span className={`text-[10px] block truncate ${activeTab === 'emar_grid' ? 'text-teal-100' : 'text-slate-400'}`}>
              eMAR 24H Matrix
            </span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('active_list')}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
            activeTab === 'active_list'
              ? 'bg-teal-700 text-white border-teal-800 shadow-md ring-2 ring-teal-500/20'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              activeTab === 'active_list' ? 'bg-white/20 text-white' : 'bg-slate-100 text-teal-700'
            }`}
          >
            <Pill className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <strong className="text-xs block font-extrabold truncate">الأدوية النشطة</strong>
            <span className={`text-[10px] block truncate ${activeTab === 'active_list' ? 'text-teal-100' : 'text-slate-400'}`}>
              {activeMeds.length} أدوية مصرحة
            </span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('infusions')}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
            activeTab === 'infusions'
              ? 'bg-teal-700 text-white border-teal-800 shadow-md ring-2 ring-teal-500/20'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              activeTab === 'infusions' ? 'bg-white/20 text-white' : 'bg-slate-100 text-teal-700'
            }`}
          >
            <Activity className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <strong className="text-xs block font-extrabold truncate">التسريب والمعايرة</strong>
            <span className={`text-[10px] block truncate ${activeTab === 'infusions' ? 'text-teal-100' : 'text-slate-400'}`}>
              {infusions.length} محاليل وريدية
            </span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
            activeTab === 'reconciliation'
              ? 'bg-teal-700 text-white border-teal-800 shadow-md ring-2 ring-teal-500/20'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              activeTab === 'reconciliation' ? 'bg-white/20 text-white' : 'bg-slate-100 text-teal-700'
            }`}
          >
            <GitCompare className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <strong className="text-xs block font-extrabold truncate">التوفيق الدوائي</strong>
            <span className={`text-[10px] block truncate ${activeTab === 'reconciliation' ? 'text-teal-100' : 'text-slate-400'}`}>
              Med Reconciliation
            </span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
            activeTab === 'history'
              ? 'bg-teal-700 text-white border-teal-800 shadow-md ring-2 ring-teal-500/20'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              activeTab === 'history' ? 'bg-white/20 text-white' : 'bg-slate-100 text-teal-700'
            }`}
          >
            <History className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <strong className="text-xs block font-extrabold truncate">التاريخ الطولي</strong>
            <span className={`text-[10px] block truncate ${activeTab === 'history' ? 'text-teal-100' : 'text-slate-400'}`}>
              الأدوية السابقة
            </span>
          </div>
        </button>
      </div>

      {/* 3. Tab Views */}
      {activeTab === 'emar_grid' && (
        <EmarGridView
          medications={activeMeds}
          onOpenSlotAction={handleOpenSlotAction}
          onAdministerPrn={handleAdministerPrn}
        />
      )}

      {activeTab === 'active_list' && (
        <ActiveMedicationsListView
          medications={activeMeds}
          onSelectMedicationForMar={medId => {
            setActiveTab('emar_grid');
          }}
        />
      )}

      {activeTab === 'infusions' && (
        <ContinuousInfusionsView
          infusions={infusions}
          currentStaff={currentStaff}
          onUpdateInfusion={handleUpdateInfusion}
        />
      )}

      {activeTab === 'reconciliation' && (
        <MedicationReconciliationView
          initialReconciliation={reconciliation}
          currentStaff={currentStaff}
          onSaveReconciliation={setReconciliation}
        />
      )}

      {activeTab === 'history' && (
        <MedicationHistoryView pastMedications={pastMeds} />
      )}

      {/* 4. Administration Action Drawer / Slide-Over */}
      {selectedMedForAction && selectedSlotForAction && (
        <AdministrationActionDrawer
          medication={selectedMedForAction}
          slot={selectedSlotForAction}
          currentStaff={currentStaff}
          patient={patient}
          onSave={handleSaveSlot}
          onClose={() => {
            setSelectedMedForAction(null);
            setSelectedSlotForAction(null);
          }}
        />
      )}
    </div>
  );
};
