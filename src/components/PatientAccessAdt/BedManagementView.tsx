import React, { useState } from 'react';
import {
  Bed,
  Layers,
  Sparkles,
  Wrench,
  Ban,
  CheckCircle2,
  Clock,
  Building,
  User,
  Activity,
  AlertTriangle,
  RefreshCw,
  Filter,
  Check,
  ChevronRight
} from 'lucide-react';
import {
  BedLocationEntity,
  CapacityOverviewMetrics,
  BedOperationalState
} from '../../types/patientAccessAdt';

interface BedManagementViewProps {
  beds: BedLocationEntity[];
  capacity: CapacityOverviewMetrics;
  onUpdateBedState: (bedId: string, newState: BedOperationalState) => void;
  onUpdateHousekeeping: (bedId: string, status: 'clean' | 'cleaning_in_progress' | 'dirty_turnover') => void;
  onOpenPatientWorkspace: (mrn: string, encounterId?: string) => void;
}

export const BedManagementView: React.FC<BedManagementViewProps> = ({
  beds,
  capacity,
  onUpdateBedState,
  onUpdateHousekeeping,
  onOpenPatientWorkspace
}) => {
  const [filterUnit, setFilterUnit] = useState<string>('all');
  const [filterState, setFilterState] = useState<string>('all');
  const [selectedBed, setSelectedBed] = useState<BedLocationEntity | null>(beds[0] || null);

  // Filtered beds
  const filteredBeds = beds.filter(b => {
    if (filterUnit !== 'all' && b.unitId !== filterUnit) return false;
    if (filterState !== 'all' && b.state !== filterState) return false;
    return true;
  });

  // Distinct units
  const unitsMap = new Map<string, string>();
  beds.forEach(b => unitsMap.set(b.unitId, b.unitName));
  const units = Array.from(unitsMap.entries()).map(([id, name]) => ({ id, name }));

  const getStateBadge = (state: BedOperationalState) => {
    switch (state) {
      case 'available':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300">متاح شاغر (Available)</span>;
      case 'occupied':
        return <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-bold border border-blue-300">مشغول (Occupied)</span>;
      case 'reserved':
        return <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-300">محجوز (Reserved)</span>;
      case 'assigned':
        return <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[11px] font-bold border border-purple-300">مخصص لمريض قادم</span>;
      case 'cleaning':
        return <span className="px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-800 text-[11px] font-bold border border-cyan-300">جاري التعقيم والتنظيف</span>;
      case 'blocked':
      case 'maintenance':
        return <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 text-[11px] font-bold border border-red-300">محظور / صيانة (Blocked)</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold">{state}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Conceptual Invariant */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl p-5 border border-slate-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4 text-cyan-300" />
            <span>الفصل العملياتي: سعة الأسرة (ADT Bed Management) ≠ التعداد السريري للأقسام (Unit Board Census)</span>
          </div>
          <h2 className="text-xl font-black text-white">إدارة سعة وإشغال الأسرة ودورة التعقيم بالمنشأة</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            <strong>هيكلية المواقع:</strong> مستويات المكان (Facility, Building, Floor, Unit, Room, Bed) مهيأة واختيارية وفقاً لتنظيم كل قسم.<br />
            <strong>طبيعة العرض:</strong> يركز هذا المحور على الحالة التشغيلية واللوجستية للأسرة والنظافة، بينما تركز Unit Boards على رعاية المرضى والمهام السريرية.<br />
            <strong>تنبيهات الانتباه:</strong> مؤشرات الحالة هنا هي حالات انتباه عملياتية (Operational Attention States) وليست تنبيهات سريرية (Clinical Alerts).
          </p>
        </div>
      </div>

      {/* Capacity Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] text-slate-500 block">إجمالي الأسرّة التشغيلية</span>
          <strong className="text-xl font-black text-slate-900 block mt-0.5">{capacity.totalOperationalBeds}</strong>
          <div className="text-[10px] text-slate-400 mt-1">نسبة الإشغال: {capacity.occupancyPercent}%</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <span className="text-[11px] text-emerald-700 font-bold block">متاح وشاغر فوراً</span>
          <strong className="text-xl font-black text-emerald-800 block mt-0.5">{capacity.availableBeds}</strong>
          <div className="text-[10px] text-emerald-600 mt-1">جاهز لاستقبال المرضى</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-sm">
          <span className="text-[11px] text-blue-700 font-bold block">مشغول حالياً</span>
          <strong className="text-xl font-black text-blue-800 block mt-0.5">{capacity.occupiedBeds}</strong>
          <div className="text-[10px] text-blue-600 mt-1">مرضى منومين</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <span className="text-[11px] text-amber-700 font-bold block">محجوز ومخصص</span>
          <strong className="text-xl font-black text-amber-800 block mt-0.5">
            {capacity.reservedBeds + capacity.assignedBeds}
          </strong>
          <div className="text-[10px] text-amber-600 mt-1">بانتظار وصول الحالات</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-cyan-200 bg-cyan-50/20 shadow-sm">
          <span className="text-[11px] text-cyan-700 font-bold block">تنظيف وتطهير (Turnover)</span>
          <strong className="text-xl font-black text-cyan-800 block mt-0.5">{capacity.cleaningTurnoverBeds}</strong>
          <div className="text-[10px] text-cyan-600 mt-1">تحت تجهيز النظافة</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-red-200 bg-red-50/20 shadow-sm">
          <span className="text-[11px] text-red-700 font-bold block">محظور / صيانة</span>
          <strong className="text-xl font-black text-red-800 block mt-0.5">{capacity.blockedMaintenanceBeds}</strong>
          <div className="text-[10px] text-red-600 mt-1">معطل فنياً</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Building className="w-4 h-4 text-slate-400" />
            <span>القسم التمريضي:</span>
          </div>
          <select
            value={filterUnit}
            onChange={e => setFilterUnit(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">كافة الأجنحة والأقسام</option>
            {units.map(u => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'available', label: 'المتاح فقط' },
            { id: 'occupied', label: 'المشغول' },
            { id: 'cleaning', label: 'قيد التنظيف' },
            { id: 'blocked', label: 'المحظور' }
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setFilterState(st.id)}
              className={`px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
                filterState === st.id
                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Bed Map (8 cols) + Bed Operations Detail (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Bed Visual Layout */}
        <div className="lg:col-span-8 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredBeds.map(bed => {
              const isSelected = selectedBed?.id === bed.id;
              const isAvailable = bed.state === 'available';
              const isOccupied = bed.state === 'occupied';
              const isCleaning = bed.state === 'cleaning';
              const isBlocked = bed.state === 'blocked' || bed.state === 'maintenance';

              return (
                <div
                  key={bed.id}
                  onClick={() => setSelectedBed(bed)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 relative ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                      : isAvailable
                      ? 'border-emerald-200 bg-white hover:border-emerald-400'
                      : isOccupied
                      ? 'border-blue-200 bg-white hover:border-blue-400'
                      : isCleaning
                      ? 'border-cyan-200 bg-cyan-50/20 hover:border-cyan-400'
                      : isBlocked
                      ? 'border-red-200 bg-red-50/20 hover:border-red-400'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <strong className="font-mono text-base font-black text-slate-900 block">{bed.bedNumber}</strong>
                      <span className="text-[11px] text-slate-500">غرفة {bed.roomNumber} • {bed.floor}</span>
                    </div>
                    <div>
                      {getStateBadge(bed.state)}
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 font-medium">
                    {bed.unitName}
                  </div>

                  {/* Patient Info or Housekeeping status */}
                  {bed.currentPatientName ? (
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="font-bold text-slate-900 truncate">{bed.currentPatientName}</div>
                      <div className="font-mono text-[10px] text-blue-700 font-bold">{bed.currentMrn}</div>
                    </div>
                  ) : bed.plannedPatientName ? (
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                      <span className="text-[10px] text-amber-700 block font-bold">مخصص للمريض:</span>
                      <div className="font-bold text-amber-900 truncate">{bed.plannedPatientName}</div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>حالة النظافة:</span>
                      <span className="font-bold text-slate-700">
                        {bed.housekeepingStatus === 'clean' ? 'نظيف ومعقم' : bed.housekeepingStatus === 'cleaning_in_progress' ? 'جاري التنظيف' : 'يحتاج تعقيم'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Bed Controls & Turnover Actions (4 cols) */}
        <div className="lg:col-span-4">
          {selectedBed ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5 sticky top-24">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900 font-mono">
                    سرير {selectedBed.bedNumber}
                  </h3>
                  {getStateBadge(selectedBed.state)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {selectedBed.unitName} • غرفة {selectedBed.roomNumber}
                </div>
              </div>

              {/* Physical Hierarchy */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="text-[11px] text-slate-400 font-bold block">التسلسل المكاني (Location Hierarchy):</span>
                <div className="text-slate-800 font-medium space-y-0.5">
                  <div>المنشأة: <strong>{selectedBed.facility}</strong></div>
                  <div>المبنى: <strong>{selectedBed.building}</strong></div>
                  <div>الدور: <strong>{selectedBed.floor}</strong></div>
                </div>
              </div>

              {/* Patient in Bed if any */}
              {selectedBed.currentPatientName && (
                <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                    <User className="w-4 h-4 text-blue-700" />
                    <span>المريض المنوم حالياً:</span>
                  </div>
                  <strong className="text-sm text-slate-900 block">{selectedBed.currentPatientName}</strong>
                  <div className="text-[11px] font-mono text-blue-700 font-bold">الملف: {selectedBed.currentMrn}</div>

                  <button
                    onClick={() => onOpenPatientWorkspace(selectedBed.currentMrn!, selectedBed.currentEncounterId)}
                    className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm cursor-pointer mt-1"
                  >
                    فتح السجل السريري للمنوم
                  </button>
                </div>
              )}

              {/* Bed Capabilities & Equipment */}
              <div className="space-y-1.5 text-xs">
                <span className="text-slate-400 font-bold block">تجهيزات وملاءمة السرير:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                    النوع: {selectedBed.bedType}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                    ملاءمة الجنس: {selectedBed.genderSuitability === 'any' ? 'مشترك' : selectedBed.genderSuitability === 'male' ? 'رجال' : 'نساء'}
                  </span>
                  {selectedBed.isNegativePressure && (
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[11px] font-bold">
                      غرفة ضغط سالب (عزل)
                    </span>
                  )}
                </div>
              </div>

              {/* Operational & Housekeeping Actions */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400 font-bold block">إجراءات التشغيل والنظافة (Operations):</span>

                {/* Turnover buttons */}
                {selectedBed.state !== 'occupied' && (
                  <div className="space-y-1.5">
                    <button
                      onClick={() => {
                        onUpdateHousekeeping(selectedBed.id, 'cleaning_in_progress');
                        onUpdateBedState(selectedBed.id, 'cleaning');
                      }}
                      className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>بدء دورة التعقيم والتنظيف (Start Turnover)</span>
                    </button>

                    <button
                      onClick={() => {
                        onUpdateHousekeeping(selectedBed.id, 'clean');
                        onUpdateBedState(selectedBed.id, 'available');
                      }}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>اعتماد السرير كنظيف ومتاح (Mark Available)</span>
                    </button>
                  </div>
                )}

                {/* Block / Unblock */}
                {selectedBed.state === 'blocked' ? (
                  <button
                    onClick={() => onUpdateBedState(selectedBed.id, 'available')}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>إلغاء حظر السرير وإعادته للخدمة</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onUpdateBedState(selectedBed.id, 'blocked')}
                    disabled={selectedBed.state === 'occupied'}
                    className="w-full py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Ban className="w-4 h-4" />
                    <span>حظر السرير / صيانة فنية (Block Bed)</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
              اختر سريراً لعرض تفاصيل تشغيله وتجهيزاته
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
