import React, { useState } from 'react';
import {
  Layers,
  Search,
  Filter,
  Droplet,
  Thermometer,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Box,
  Flame
} from 'lucide-react';
import { BloodProductUnit, BloodComponentType, ProductUnitStatus } from '../../types/bloodBankOps';

interface ProductInventoryContextViewProps {
  units: BloodProductUnit[];
  onSelectUnit: (unit: BloodProductUnit) => void;
  onOpenPreparationModal?: (unit: BloodProductUnit) => void;
}

export const ProductInventoryContextView: React.FC<ProductInventoryContextViewProps> = ({
  units,
  onSelectUnit,
  onOpenPreparationModal
}) => {
  const [componentFilter, setComponentFilter] = useState<string>('all');
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredUnits = units.filter(u => {
    const matchesSearch =
      u.unitNumber.includes(searchTerm) ||
      u.id.includes(searchTerm) ||
      u.storageLocation.includes(searchTerm) ||
      (u.allocatedToPatientName && u.allocatedToPatientName.includes(searchTerm));

    const matchesComponent = componentFilter === 'all' || u.componentType === componentFilter;
    const matchesGroup =
      bloodGroupFilter === 'all' ||
      `${u.bloodGroup.abo}${u.bloodGroup.rh === 'positive' ? '+' : '-'}` === bloodGroupFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchesSearch && matchesComponent && matchesGroup && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">مخزون مشتقات الدم ومراقبة الثلاجات (Blood Product Inventory Context)</h2>
              <p className="text-xs text-slate-500">
                متابعة توفر المشتقات، الفصائل، درجات حرارة الحفظ، وصلاحيات الوحدات (ISBT-128 Units)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="بحث برقم الوحدة، الموقع..."
                className="pr-9 pl-3 py-1.5 rounded-xl border border-slate-200 text-xs w-48 focus:outline-none focus:border-red-500"
              />
            </div>

            <select
              value={componentFilter}
              onChange={e => setComponentFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50 font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">كافة المشتقات</option>
              <option value="packed_red_blood_cells">كريات دم حمراء (PRBCs)</option>
              <option value="platelets_apheresis">صفائح فصادة (Apheresis)</option>
              <option value="fresh_frozen_plasma">بلازما مجمدة (FFP)</option>
              <option value="cryoprecipitate">راسب برودي (Cryo)</option>
            </select>

            <select
              value={bloodGroupFilter}
              onChange={e => setBloodGroupFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50 font-medium text-slate-700 focus:outline-none font-mono"
            >
              <option value="all">كافة الفصائل</option>
              <option value="O-">O سالب (O-)</option>
              <option value="O+">O موجب (O+)</option>
              <option value="A-">A سالب (A-)</option>
              <option value="A+">A موجب (A+)</option>
              <option value="B-">B سالب (B-)</option>
              <option value="B+">B موجب (B+)</option>
              <option value="AB-">AB سالب (AB-)</option>
              <option value="AB+">AB موجب (AB+)</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50 font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">كافة الحالات</option>
              <option value="available">متاح في المخزون (Available)</option>
              <option value="allocated">مخصص لمريض (Allocated)</option>
              <option value="ready_for_issue">جاهز للتسليم (Ready)</option>
              <option value="issued">تم الصرف للقسم (Issued)</option>
              <option value="returned_in_inspection">عائد تحت الفحص (Returned)</option>
              <option value="quarantined">معزول (Quarantined)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredUnits.map(unit => (
          <div
            key={unit.id}
            onClick={() => onSelectUnit(unit)}
            className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-red-400 hover:shadow-xs transition-all cursor-pointer space-y-3 group"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                unit.bloodGroup.rh === 'negative'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {unit.bloodGroup.displayAr}
              </span>

              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                unit.status === 'available' ? 'bg-emerald-100 text-emerald-800' :
                unit.status === 'allocated' ? 'bg-blue-100 text-blue-800' :
                unit.status === 'ready_for_issue' ? 'bg-teal-100 text-teal-800' :
                unit.status === 'issued' ? 'bg-slate-200 text-slate-700' :
                unit.status === 'quarantined' ? 'bg-rose-100 text-rose-800' :
                'bg-amber-100 text-amber-800'
              }`}>
                {unit.status === 'available' ? 'متاح بالمخزون' :
                 unit.status === 'allocated' ? 'مخصص لمريض' :
                 unit.status === 'ready_for_issue' ? 'جاهز للتسليم' :
                 unit.status === 'issued' ? 'تم الصرف' :
                 unit.status === 'quarantined' ? 'معزول للتحقيق' : 'عائد تحت الفحص'}
              </span>
            </div>

            {/* Component Name & DIN */}
            <div>
              <div className="font-mono font-bold text-slate-900 text-xs">{unit.unitNumber}</div>
              <div className="font-bold text-slate-800 text-xs mt-0.5">{unit.componentNameAr}</div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">الحجم: {unit.volumeMl} mL</div>
            </div>

            {/* Storage & Expiry */}
            <div className="space-y-1 text-[11px] pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-slate-400" />
                  <span>الموقع:</span>
                </span>
                <span className="font-medium text-slate-800">{unit.storageLocation}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>تاريخ الصلاحية:</span>
                </span>
                <span className={`font-mono font-bold ${unit.isNearExpiry ? 'text-amber-700' : 'text-slate-800'}`}>
                  {unit.expiryDate}
                </span>
              </div>
            </div>

            {/* Allocation Context if allocated */}
            {unit.allocatedToPatientName && (
              <div className="p-2 rounded-lg bg-blue-50 text-[11px] text-blue-900 border border-blue-200">
                مخصص لـ: <strong>{unit.allocatedToPatientName}</strong> ({unit.allocatedToPatientMrn})
              </div>
            )}

            {/* Special Attributes Tags */}
            {unit.specialAttributes.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {unit.specialAttributes.map(att => (
                  <span key={att} className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                    {att === 'irradiated' ? 'مشعع' : att === 'leukocyte_reduced' ? 'مفلتر' : att === 'antigen_negative' ? 'سالب مستضد' : att}
                  </span>
                ))}
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => onSelectUnit(unit)}
                className="text-red-700 hover:text-red-900 font-bold flex items-center gap-1 text-[11px]"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>سجل الوحدة والتتبع</span>
              </button>

              {onOpenPreparationModal && unit.status === 'allocated' && (
                <button
                  onClick={() => onOpenPreparationModal(unit)}
                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center gap-1"
                >
                  <Flame className="w-3 h-3 text-amber-600" />
                  <span>تجهيز / إذابة</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredUnits.length === 0 && (
          <div className="col-span-3 p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            لا توجد وحدات تطابق معايير الفلترة المحددة.
          </div>
        )}
      </div>
    </div>
  );
};
