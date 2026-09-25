import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  FileCheck,
  RotateCcw,
  Search,
  Filter,
  ShieldCheck,
  X,
  Play
} from 'lucide-react';
import {
  MedicalEquipmentAsset,
  CalibrationRecord,
  BiomedicalOpsState
} from '../../../types/biomedicalOps';

interface PpmCalibrationWorkspaceProps {
  state: BiomedicalOpsState;
  onUpdateAsset: (asset: MedicalEquipmentAsset) => void;
  onAddAuditLog: (action: string, entityId: string, description: string) => void;
}

export const PpmCalibrationWorkspace: React.FC<PpmCalibrationWorkspaceProps> = ({
  state,
  onUpdateAsset,
  onAddAuditLog
}) => {
  const [activeTab, setActiveTab] = useState<'ppm_schedules' | 'calibration_registry'>('ppm_schedules');
  const [ppmFilter, setPpmFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected asset for executing PPM
  const [executingPpmAsset, setExecutingPpmAsset] = useState<MedicalEquipmentAsset | null>(null);
  const [checklist, setChecklist] = useState<{ step: string; completed: boolean }[]>([]);

  // Filtered Assets for PPM
  const filteredAssets = state.assets.filter(asset => {
    const matchesSearch =
      !searchQuery ||
      asset.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.nameAr.includes(searchQuery) ||
      asset.nameEn.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      ppmFilter === 'all' || asset.ppmSchedule.status === ppmFilter;

    return matchesSearch && matchesFilter;
  });

  const handleOpenPpmModal = (asset: MedicalEquipmentAsset) => {
    setExecutingPpmAsset(asset);
    setChecklist(asset.ppmSchedule.checklistItems.map(item => ({ ...item })));
  };

  const handleToggleChecklistStep = (index: number) => {
    setChecklist(prev =>
      prev.map((item, i) => (i === index ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleCompletePpm = () => {
    if (!executingPpmAsset) return;

    const allStepsDone = checklist.every(c => c.completed);
    if (!allStepsDone) {
      alert('يجب إكمال كافة بنود بروتوكول الصيانة الوقائية قبل الاعتماد');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + executingPpmAsset.ppmSchedule.frequencyMonths);
    const nextDateStr = nextDate.toISOString().split('T')[0];

    const updatedAsset: MedicalEquipmentAsset = {
      ...executingPpmAsset,
      currentStatus: executingPpmAsset.currentStatus === 'maintenance_scheduled' ? 'in_service' : executingPpmAsset.currentStatus,
      ppmSchedule: {
        ...executingPpmAsset.ppmSchedule,
        lastPpmDate: todayStr,
        nextPpmDueDate: nextDateStr,
        status: 'up_to_date',
        checklistItems: checklist
      }
    };

    onUpdateAsset(updatedAsset);
    onAddAuditLog(
      'PPM_MAINTENANCE_COMPLETED',
      updatedAsset.id,
      `اكتمال أعمال الصيانة الوقائية الدورية للأصل ${updatedAsset.assetTag} (${updatedAsset.nameAr}) وتمديد الموعد القادم حتى ${nextDateStr}.`
    );

    setExecutingPpmAsset(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Toggle */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              برامج الصيانة الدورية والمعايرة السريرية (Preventive Maintenance & Calibration)
            </h2>
            <p className="text-xs text-slate-500">
              إدارة بروتوكولات الصيانة الوقائية (PPM) وفق تعليمات المصنّع (IFU) وتوثيق شهادات القياس والمعايرة المترولوجية
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('ppm_schedules')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ppm_schedules'
                  ? 'bg-white text-teal-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              جدول الصيانة الوقائية (PPM Schedules)
            </button>
            <button
              onClick={() => setActiveTab('calibration_registry')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'calibration_registry'
                  ? 'bg-white text-teal-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              سجل شهادات المعايرة (Calibration)
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-slate-100">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="بحث في الأجهزة والبروتوكولات..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-slate-800 focus:bg-white focus:outline-hidden focus:border-teal-500"
            />
          </div>

          {activeTab === 'ppm_schedules' && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold">تصفية حالة الالتزام:</span>
              <select
                value={ppmFilter}
                onChange={e => setPpmFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 focus:outline-hidden cursor-pointer"
              >
                <option value="all">كافة الحالات</option>
                <option value="up_to_date">محدّثة وفي الموعد (Up to date)</option>
                <option value="due_soon">مستحقة قريباً (Due soon)</option>
                <option value="overdue">متأخرة عن موعدها (Overdue)</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Tab 1: PPM Schedules Grid */}
      {activeTab === 'ppm_schedules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map(asset => {
            const ppm = asset.ppmSchedule;
            const isOverdue = ppm.status === 'overdue';
            const isDueSoon = ppm.status === 'due_soon';

            return (
              <div
                key={asset.id}
                className={`bg-white rounded-2xl p-4 border transition-all text-xs space-y-3 shadow-xs ${
                  isOverdue
                    ? 'border-red-300 bg-red-50/20'
                    : isDueSoon
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-slate-200'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {asset.assetTag}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isOverdue
                        ? 'bg-red-600 text-white'
                        : isDueSoon
                        ? 'bg-amber-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {isOverdue ? 'متأخرة (Overdue)' : isDueSoon ? 'مستحقة قريباً' : 'محدثة (Up to date)'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{asset.nameAr}</h3>
                  <p className="text-[11px] text-slate-500 font-sans">{asset.nameEn}</p>
                </div>

                {/* PPM Protocol Info */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">رمز البروتوكول المعتمد:</span>
                    <span className="font-mono font-bold text-teal-700">{ppm.ppmProtocolCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">التكرار الإلزامي:</span>
                    <span className="font-semibold text-slate-700">كل {ppm.frequencyMonths} أشهر</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">آخر صيانة نفذت:</span>
                    <span className="font-mono text-slate-700">{ppm.lastPpmDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">الموعد المستحق القادم:</span>
                    <span className={`font-mono font-bold ${isOverdue ? 'text-red-600' : 'text-slate-800'}`}>
                      {ppm.nextPpmDueDate}
                    </span>
                  </div>
                </div>

                {/* Checklist Preview */}
                <div className="space-y-1">
                  <span className="text-slate-500 font-semibold block text-[10px]">
                    بنود الفحص ({ppm.checklistItems.filter(i => i.completed).length} / {ppm.checklistItems.length}):
                  </span>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isOverdue ? 'bg-red-500' : 'bg-teal-600'}`}
                      style={{
                        width: `${ppm.checklistItems.length > 0 ? (ppm.checklistItems.filter(i => i.completed).length / ppm.checklistItems.length) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold">
                    الموقع: {asset.assignedDepartment}
                  </span>
                  <button
                    onClick={() => handleOpenPpmModal(asset)}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>تنفيذ وتوثيق PPM</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Calibration Registry */}
      {activeTab === 'calibration_registry' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>سجل نتائج ومعايرات الأجهزة الطبية الحيوية المترولوجية</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {state.assets.filter(a => a.latestCalibration).length} شهادات معايرة مسجلة
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {state.assets
                .filter(a => a.latestCalibration)
                .map(asset => {
                  const cal = asset.latestCalibration!;
                  return (
                    <div key={asset.id} className="p-4 text-xs space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {asset.assetTag}
                          </span>
                          <h4 className="font-bold text-slate-800 text-sm">{asset.nameAr}</h4>
                          <span className="text-slate-400 font-mono text-[11px] font-sans">
                            ({asset.model} • S/N: {asset.serialNumber})
                          </span>
                        </div>
                        <span
                          className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                            cal.passed
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}
                        >
                          {cal.passed ? 'شهادة معايرة مجازة ومطابقة' : 'فشل المعايرة — الجهاز محظور'}
                        </span>
                      </div>

                      {/* Calibration Meta */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px]">
                        <div>
                          <span className="text-slate-500 block">رقم الشهادة:</span>
                          <span className="font-mono font-bold text-slate-800">{cal.certificateNumber}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">تاريخ المعايرة:</span>
                          <span className="font-mono text-slate-800">{cal.calibrationDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">تاريخ الانتهاء:</span>
                          <span className="font-mono text-slate-800">{cal.expiryDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">معتمد من:</span>
                          <span className="font-semibold text-slate-800">{cal.calibratedBy}</span>
                        </div>
                      </div>

                      {/* Test Points Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-[11px]">
                          <thead>
                            <tr className="bg-slate-100 text-slate-600">
                              <th className="p-2 rounded-r-lg">المعامل المقاس</th>
                              <th className="p-2">القيمة الاسمية (Nominal)</th>
                              <th className="p-2">القيمة المقاسة (Measured)</th>
                              <th className="p-2">الوحدة</th>
                              <th className="p-2">التسامح المسموح</th>
                              <th className="p-2">الانحراف الفعلي</th>
                              <th className="p-2 rounded-l-lg">النتيجة</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {cal.testPoints.map((tp, i) => (
                              <tr key={i} className="hover:bg-slate-50/60">
                                <td className="p-2 font-semibold text-slate-800">{tp.parameter}</td>
                                <td className="p-2 font-mono">{tp.nominalValue}</td>
                                <td className="p-2 font-mono font-bold">{tp.measuredValue}</td>
                                <td className="p-2 text-slate-500">{tp.unit}</td>
                                <td className="p-2 font-mono">±{tp.allowedTolerancePercent}%</td>
                                <td className={`p-2 font-mono font-bold ${tp.inTolerance ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {tp.deviationPercent}%
                                </td>
                                <td className="p-2">
                                  {tp.inTolerance ? (
                                    <span className="text-emerald-700 font-bold">مطابق</span>
                                  ) : (
                                    <span className="text-red-700 font-bold">غير مطابق (تجاوز التسامح)</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {cal.notes && (
                        <p className="text-[11px] text-slate-500 bg-amber-50 p-2 rounded-lg border border-amber-200">
                          {cal.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Execute PPM Modal */}
      {executingPpmAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden text-right" dir="rtl">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm">
                  تنفيذ بروتوكول الصيانة الوقائية الدورية (PPM Execution)
                </h3>
              </div>
              <button
                onClick={() => setExecutingPpmAsset(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">الجهاز المستهدف:</span>
                <span className="font-bold text-slate-900 text-sm">{executingPpmAsset.nameAr}</span>
                <span className="font-mono text-slate-500 block">
                  {executingPpmAsset.assetTag} • بروتوكول: {executingPpmAsset.ppmSchedule.ppmProtocolCode}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800">قائمة التحقق المعتمدة (PPM Checklist):</h4>
                <div className="space-y-2">
                  {checklist.map((item, idx) => (
                    <label
                      key={idx}
                      className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-start gap-3 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleChecklistStep(idx)}
                        className="w-4 h-4 text-teal-600 rounded mt-0.5"
                      />
                      <span className={`text-slate-800 font-semibold ${item.completed ? 'line-through text-slate-400' : ''}`}>
                        {item.step}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={handleCompletePpm}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2 rounded-xl cursor-pointer shadow-xs transition-colors"
              >
                اعتماد اكتمال الصيانة الوقائية
              </button>
              <button
                onClick={() => setExecutingPpmAsset(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 rounded-xl cursor-pointer transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
