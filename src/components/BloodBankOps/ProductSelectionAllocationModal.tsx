import React, { useState } from 'react';
import {
  X,
  Droplet,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Search,
  Check,
  ShieldAlert,
  Clock,
  User,
  Filter
} from 'lucide-react';
import {
  BloodProductRequest,
  BloodProductUnit,
  ProductAllocationRecord
} from '../../types/bloodBankOps';

interface ProductSelectionAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: BloodProductRequest | null;
  availableUnits: BloodProductUnit[];
  onConfirmAllocation: (requestId: string, selectedUnitIds: string[]) => void;
}

export const ProductSelectionAllocationModal: React.FC<ProductSelectionAllocationModalProps> = ({
  isOpen,
  onClose,
  request,
  availableUnits,
  onConfirmAllocation
}) => {
  if (!isOpen || !request) return null;

  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const neededQuantity = request.requestedQuantity - request.allocatedUnitIds.length;

  // Filter candidates matching component type and suitability
  const matchingUnits = availableUnits.filter(u => {
    const matchesComponent = u.componentType === request.requestedComponent;
    const isAvailable = u.status === 'available';
    return matchesComponent && isAvailable;
  });

  const toggleUnit = (unitId: string) => {
    if (selectedUnitIds.includes(unitId)) {
      setSelectedUnitIds(selectedUnitIds.filter(id => id !== unitId));
    } else {
      if (selectedUnitIds.length < neededQuantity) {
        setSelectedUnitIds([...selectedUnitIds, unitId]);
      }
    }
  };

  const handleConfirm = () => {
    if (selectedUnitIds.length === 0) return;
    onConfirmAllocation(request.id, selectedUnitIds);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Layers className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h3 className="text-base font-bold">تخصيص وحجز مشتقات الدم للطلب (Product Selection & Allocation)</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                اختيار وحدات الدم المطابقة للمريض، فحص التوافق، وحجزها بالثلاجة المخصصة
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Patient Context & Requirements */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-600" />
                <span className="font-bold text-slate-900 text-sm">{request.patientName}</span>
                <span className="font-mono text-slate-500">({request.mrn})</span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-800 font-mono font-bold text-xs">
                {request.patientHistoricalBloodGroup?.displayAr || 'فصيلة غير مؤكدة'}
              </span>
            </div>

            <div className="text-[11px] text-slate-600 flex items-center gap-4">
              <span>المشتق المطلوب: <strong>{request.componentNameAr}</strong></span>
              <span>•</span>
              <span>الكمية المطلوبة: <strong>{request.requestedQuantity}</strong> وحدة</span>
              <span>•</span>
              <span>المتبقي للتخصيص: <strong className="text-teal-700">{neededQuantity}</strong> وحدة</span>
            </div>

            {request.specialRequirements.length > 0 && (
              <div className="pt-2 border-t border-slate-200 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-500 font-bold">المتطلبات الإلزامية:</span>
                {request.specialRequirements.map(req => (
                  <span key={req} className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-bold">
                    {req === 'irradiated' ? 'مشعع' : req === 'leukocyte_reduced' ? 'مفلتر' : req === 'antigen_negative' ? 'سالب مستضد' : req}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Units Selection List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs">
                الوحدات المتوافقة المتاحة بالمخزون (اختر {neededQuantity} وحدة):
              </span>
              <span className="text-[11px] text-slate-500">
                المحدد حالياً: {selectedUnitIds.length} من {neededQuantity}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {matchingUnits.map(unit => {
                const isSelected = selectedUnitIds.includes(unit.id);
                return (
                  <div
                    key={unit.id}
                    onClick={() => toggleUnit(unit.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/50 shadow-2xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-mono font-bold text-slate-900 text-xs">{unit.unitNumber}</div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-red-700 font-mono text-xs">{unit.bloodGroup.displayAr}</span>
                        <span className="text-[10px] text-slate-500">({unit.volumeMl} mL)</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{unit.storageLocation}</div>
                      <div className="text-[10px] font-mono text-slate-600">صلاحية: {unit.expiryDate}</div>
                      {unit.specialAttributes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {unit.specialAttributes.map(att => (
                            <span key={att} className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 text-[9px] font-bold">
                              {att}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center mt-1 shrink-0 ${
                      isSelected ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}

              {matchingUnits.length === 0 && (
                <div className="col-span-2 p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500">
                  لا توجد وحدات متوافقة متاحة حالياً في المخزون لهذا المشتق.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            سيتم حجز الوحدة ونقلها لثلاجة الوحدات المخصصة لمدة 48 ساعة.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              إلغاء
            </button>
            <button
              disabled={selectedUnitIds.length === 0}
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تأكيد التخصيص والحجز ({selectedUnitIds.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
