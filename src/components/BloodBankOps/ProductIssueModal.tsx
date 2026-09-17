import React, { useState } from 'react';
import {
  X,
  Droplet,
  CheckCircle2,
  AlertTriangle,
  User,
  Clock,
  Thermometer,
  ShieldCheck,
  Box,
  FileCheck,
  Check
} from 'lucide-react';
import { BloodProductRequest, BloodProductUnit } from '../../types/bloodBankOps';

interface ProductIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: BloodProductRequest | null;
  unit: BloodProductUnit | null;
  onConfirmIssue: (issueData: {
    requestId: string;
    unitId: string;
    receivingStaffName: string;
    receivingStaffRole: string;
    destinationLocation: string;
    handoffMethod: 'clinical_nurse_pickup' | 'dedicated_porter_transport' | 'emergency_transfusion_runner';
    transportCarrierId: string;
    coldChainConfirmed: boolean;
  }) => void;
}

export const ProductIssueModal: React.FC<ProductIssueModalProps> = ({
  isOpen,
  onClose,
  request,
  unit,
  onConfirmIssue
}) => {
  if (!isOpen || !request || !unit) return null;

  const [receivingStaffName, setReceivingStaffName] = useState('ممرضة ندى الحربي');
  const [receivingStaffRole, setReceivingStaffRole] = useState('تمريض جناح الباطنة 4A');
  const [destinationLocation, setDestinationLocation] = useState(request.locationWardBed);
  const [handoffMethod, setHandoffMethod] = useState<'clinical_nurse_pickup' | 'dedicated_porter_transport' | 'emergency_transfusion_runner'>('clinical_nurse_pickup');
  const [transportCarrierId, setTransportCarrierId] = useState('صندوق تبريد مخصص #B04 مع مؤشر حرارة سليم');
  const [coldChainConfirmed, setColdChainConfirmed] = useState(true);
  const [twoPersonVerificationDone, setTwoPersonVerificationDone] = useState(true);

  const handleConfirm = () => {
    onConfirmIssue({
      requestId: request.id,
      unitId: unit.id,
      receivingStaffName,
      receivingStaffRole,
      destinationLocation,
      handoffMethod,
      transportCarrierId,
      coldChainConfirmed
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30">
              <Droplet className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-bold">إصدار وصرف مشتق الدم للقسم السريري (Product Issue & Release)</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                التحقق الثنائي من مطابقة الوحدة والمريض ونافذة سلسلة التبريد (30-Minute Rule)
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

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Identity Matching Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold block">المريض المستلم والموقع:</span>
              <div className="font-bold text-slate-900 text-xs">{request.patientName}</div>
              <div className="text-[11px] font-mono text-slate-600">MRN: {request.mrn}</div>
              <div className="text-[11px] text-slate-600">الموقع: {destinationLocation}</div>
              <div className="text-[10px] text-red-700 font-bold mt-1">
                فصيلة المريض: {request.patientHistoricalBloodGroup?.displayAr}
              </div>
            </div>

            <div className="p-3.5 bg-red-50/60 rounded-xl border border-red-200 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold block">الوحدة المصروفة:</span>
              <div className="font-mono font-bold text-slate-900 text-xs">{unit.unitNumber}</div>
              <div className="text-xs text-slate-700 font-bold">{unit.componentNameAr}</div>
              <div className="text-[11px] text-red-700 font-bold">
                فصيلة الوحدة: {unit.bloodGroup.displayAr} ({unit.volumeMl} mL)
              </div>
              <div className="text-[10px] text-slate-500">انتهاء الصلاحية: {unit.expiryDate}</div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">اسم الموظف المستلم:</label>
              <input
                type="text"
                value={receivingStaffName}
                onChange={e => setReceivingStaffName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">المسمى وقسم المستلم:</label>
              <input
                type="text"
                value={receivingStaffRole}
                onChange={e => setReceivingStaffRole(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">وسيلة / قناة التسليم:</label>
              <select
                value={handoffMethod}
                onChange={e => setHandoffMethod(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none bg-white"
              >
                <option value="clinical_nurse_pickup">استلام مباشر من تمريض القسم السريري</option>
                <option value="dedicated_porter_transport">نقل عبر مراسل مخصص بصندوق تبريد</option>
                <option value="emergency_transfusion_runner">عدّاء طوارئ / إنعاش إسعافي مباشر</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">صندوق النقل المبرد ومؤشر الحرارة:</label>
              <input
                type="text"
                value={transportCarrierId}
                onChange={e => setTransportCarrierId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Safety Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800 text-xs">
                  تمت المطابقة الثنائية المستقلة (اسم المريض، الرقم الطبي، كود الوحدة، الفصيلة وتاريخ الصلاحية):
                </span>
              </div>
              <input
                type="checkbox"
                checked={twoPersonVerificationDone}
                onChange={e => setTwoPersonVerificationDone(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-teal-600" />
                <span className="font-bold text-slate-800 text-xs">
                  تأكيد سلامة سلسلة التبريد وإخطار المستلم ببدء النقل خلال 30 دقيقة أو إعادة الوحدة فوراً:
                </span>
              </div>
              <input
                type="checkbox"
                checked={coldChainConfirmed}
                onChange={e => setColdChainConfirmed(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            تنبيه: التوثيق السريري لإعطاء الدم والعلامات الحيوية بجانب السرير يتم في ملف المريض السريري.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              إلغاء
            </button>
            <button
              disabled={!twoPersonVerificationDone || !coldChainConfirmed}
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تأكيد الصرف والتسليم</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
