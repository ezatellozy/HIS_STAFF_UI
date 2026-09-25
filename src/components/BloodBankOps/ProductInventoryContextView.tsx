import React, { useState } from 'react';
import {
  Layers,
  Search,
  Thermometer,
  Calendar,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Filter,
  Eye,
  Settings2,
  ShieldAlert,
  Ban,
  Split,
  BookOpen,
  Info,
  Building2,
  GitBranch
} from 'lucide-react';
import { BloodProductUnit, ExpiryVerificationStatus, BloodBankBranchId } from '../../types/bloodBankOps';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [componentFilter, setComponentFilter] = useState('all');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');

  // Configurable Institutional Near-Expiry Warning Window
  const [nearExpiryWarningThreshold, setNearExpiryWarningThreshold] = useState<'24h' | '48h' | '72h' | '7d'>('48h');

  const filteredUnits = units.filter(u => {
    const matchesSearch =
      u.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.componentNameAr.includes(searchTerm) ||
      u.storageLocation.includes(searchTerm);

    const matchesComponent = componentFilter === 'all' || u.componentType === componentFilter;
    const matchesGroup = bloodGroupFilter === 'all' || u.bloodGroup.displayAr.includes(bloodGroupFilter) || u.bloodGroup.displayEn.includes(bloodGroupFilter);
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchesBranch = branchFilter === 'all' || u.branchId === branchFilter || (!u.branchId && branchFilter === 'main_hospital');

    return matchesSearch && matchesComponent && matchesGroup && matchesStatus && matchesBranch;
  });

  // Calculate near expiry and missing expiry counts based on institutional policy
  const nearExpiryUnits = units.filter(u => u.isNearExpiry);
  const missingExpiryUnits = units.filter(u => !u.expiryDate || u.expiryVerificationStatus === 'unverified_missing_date');
  const quarantinedUnits = units.filter(u => u.status === 'quarantined');

  return (
    <div className="space-y-4 text-right">
      {/* Expiry Risk & Institutional Warning Configuration Banner */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-xs">
                  مراقبة الصلاحيات الفعلية وعتبات التنبيه المؤسسية (Actual Expiry & Institutional Alerts)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                  عتبة قابلة للتهيئة المؤسسية
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                تعتمد الصلاحية على تاريخ انتهاء الوحدة الأصلي المورد؛ عتبات التنبيه المبكر هي سياسات تشغيلية مؤسسية وليست معياراً إلزامياً موحداً.
              </p>
            </div>
          </div>

          {/* Institutional Threshold Selector */}
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <Settings2 className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="text-[11px] font-bold text-slate-700">نافذة تنبيه اقتراب الصلاحية:</span>
            <select
              value={nearExpiryWarningThreshold}
              onChange={e => setNearExpiryWarningThreshold(e.target.value as any)}
              className="py-1 px-2 rounded-lg border border-slate-300 text-xs font-bold bg-white text-slate-800 focus:outline-none"
            >
              <option value="24h">24 ساعة (عاجل - صفائح/بلازما مذابة)</option>
              <option value="48h">48 ساعة (تنبيه تشغيلي افتراضي)</option>
              <option value="72h">72 ساعة (تنبيه مبكر)</option>
              <option value="7d">7 أيام (مشتقات طويلة المدى - كريات حمراء)</option>
            </select>
          </div>
        </div>

        {/* Expiry Status Summary Metric Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-amber-900 font-bold block">تقترب من انتهاء الصلاحية:</span>
              <span className="text-[10px] text-amber-700">ضمن نافذة التنبيه المؤسسي المحددة</span>
            </div>
            <span className="font-mono text-base font-bold text-amber-900 px-2.5 py-0.5 rounded-lg bg-white border border-amber-300">
              {nearExpiryUnits.length}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-rose-900 font-bold block">تاريخ الصلاحية غير محدد (Missing Expiry):</span>
              <span className="text-[10px] text-rose-700">محظورة من الصرف ومحجوزة للتحقق</span>
            </div>
            <span className="font-mono text-base font-bold text-rose-900 px-2.5 py-0.5 rounded-lg bg-white border border-rose-300">
              {missingExpiryUnits.length}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-slate-800 font-bold block">إجمالي الوحدات المعزولة (Quarantined):</span>
              <span className="text-[10px] text-slate-500">حجر حراري أو عطل ملصق أو تلف</span>
            </div>
            <span className="font-mono text-base font-bold text-slate-800 px-2.5 py-0.5 rounded-lg bg-white border border-slate-300">
              {quarantinedUnits.length}
            </span>
          </div>
        </div>
      </div>

      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                مخزون مشتقات الدم ومراقبة الفروع المتعددة (GAP-08 Multi-Branch Inventory & Location Context)
              </h2>
              <p className="text-xs text-slate-500">
                متابعة توفر المشتقات عبر الفروع والمستشفيات التابعة (GAP-08)، الفصائل، درجات حرارة الحفظ، والتتبع الهرمي للوحدات
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
              value={branchFilter}
              onChange={e => setBranchFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50 font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">كافة الفروع والمنشآت (GAP-08)</option>
              <option value="main_hospital">المستشفى الرئيسي المركزي (Central Hub)</option>
              <option value="satellite_clinic_north">مركز جراحة اليوم الواحد (Satellite North)</option>
              <option value="trauma_center_east">مركز الإصابات والحوادث (Trauma East)</option>
            </select>

            <select
              value={componentFilter}
              onChange={e => setComponentFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50 font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">كافة المشتقات</option>
              <option value="packed_red_blood_cells">كريات دم حمراء (PRBCs)</option>
              <option value="platelets_apheresis">صفائح فصادة (Apheresis)</option>
              <option value="platelets_pooled">صفائح مجمعة (Pooled PLT)</option>
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
              <option value="in_preparation">قيد التجهيز والمعالجة (In Prep)</option>
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
        {filteredUnits.map(unit => {
          const isMissingExpiry = !unit.expiryDate || unit.expiryVerificationStatus === 'unverified_missing_date';
          const isQuarantined = unit.status === 'quarantined';

          return (
            <div
              key={unit.id}
              onClick={() => onSelectUnit(unit)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 group ${
                isQuarantined
                  ? 'border-rose-300 bg-rose-50/40 hover:border-rose-500'
                  : isMissingExpiry
                  ? 'border-amber-300 bg-amber-50/30 hover:border-amber-500'
                  : 'border-slate-200 bg-white hover:border-red-400 hover:shadow-xs'
              }`}
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

                <div className="flex items-center gap-1.5">
                  {/* Status Badge */}
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    unit.status === 'available' ? 'bg-emerald-100 text-emerald-800' :
                    unit.status === 'allocated' ? 'bg-blue-100 text-blue-800' :
                    unit.status === 'in_preparation' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                    unit.status === 'ready_for_issue' ? 'bg-teal-100 text-teal-800' :
                    unit.status === 'issued' ? 'bg-slate-200 text-slate-700' :
                    unit.status === 'quarantined' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {unit.status === 'available' ? 'متاح بالمخزون' :
                     unit.status === 'allocated' ? 'مخصص لمريض' :
                     unit.status === 'in_preparation' ? 'قيد التجهيز / التحقق' :
                     unit.status === 'ready_for_issue' ? 'جاهز للتسليم' :
                     unit.status === 'issued' ? 'تم الصرف' :
                     unit.status === 'quarantined' ? 'معزول بحظر الصرف' : 'عائد تحت الفحص'}
                  </span>
                </div>
              </div>

              {/* Component Name & DIN */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 text-xs">{unit.unitNumber}</span>
                  <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {unit.id}
                  </span>
                </div>
                <div className="font-bold text-slate-800 text-xs mt-1">{unit.componentNameAr}</div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-0.5">
                  <span>الحجم: {unit.volumeMl} mL</span>
                  <span className="text-[10px] font-sans text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-500" />
                    <span>
                      {unit.branchNameAr ||
                        (unit.branchId === 'trauma_center_east'
                          ? 'مركز الإصابات (شرق)'
                          : unit.branchId === 'satellite_clinic_north'
                          ? 'مركز جراحة اليوم الواحد'
                          : 'المستشفى المركزي')}
                    </span>
                  </span>
                </div>
              </div>

              {/* Hierarchy & Traceability Tags */}
              {(unit.parentUnitId || unit.poolIdentifier || unit.contributingUnitIds) && (
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-[10px]">
                  {unit.parentUnitId && (
                    <div className="text-purple-800 font-medium flex items-center gap-1">
                      <Split className="w-3 h-3" />
                      <span>حصة أطفال مجزأة تابعة للوحدة الأم: <strong className="font-mono">{unit.parentUnitId}</strong></span>
                    </div>
                  )}
                  {unit.poolIdentifier && (
                    <div className="text-indigo-800 font-medium flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      <span>مجمع راسب برودي معتمد: <strong className="font-mono">{unit.poolIdentifier}</strong></span>
                    </div>
                  )}
                </div>
              )}

              {/* Storage & Expiry Section */}
              <div className="space-y-1.5 text-[11px] pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-slate-400" />
                    <span>الموقع والحرارة:</span>
                  </span>
                  <span className="font-medium text-slate-800 text-[10px]">{unit.storageLocation} ({unit.storageTemperatureC})</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>تاريخ الصلاحية الفعلي:</span>
                  </span>
                  {isMissingExpiry ? (
                    <span className="font-bold text-rose-700 text-[10px] flex items-center gap-0.5">
                      <Ban className="w-3 h-3" />
                      غير محدد (Missing Expiry)
                    </span>
                  ) : (
                    <span className={`font-mono font-bold text-[11px] ${
                      unit.isNearExpiry ? 'text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200' : 'text-slate-800'
                    }`}>
                      {unit.expiryDate}
                    </span>
                  )}
                </div>

                {/* Original vs Verified Post-Processing Expiry (Audit Trail) */}
                {unit.originalExpiryDate && unit.postProcessingVerifiedExpiry && (
                  <div className="p-1.5 rounded-lg bg-blue-50/70 border border-blue-200 text-[10px] space-y-0.5">
                    <div className="text-slate-600 flex justify-between font-mono">
                      <span>الصلاحية الأصلية (المورد):</span>
                      <span className="font-bold">{unit.originalExpiryDate}</span>
                    </div>
                    <div className="text-blue-900 font-bold flex justify-between font-mono">
                      <span>الصلاحية بعد المعالجة (موثقة):</span>
                      <span className="font-bold text-blue-800">{unit.postProcessingVerifiedExpiry}</span>
                    </div>
                  </div>
                )}

                {/* Expiry Verification Status Badge */}
                <div className="flex items-center justify-between text-[10px] pt-1">
                  <span className="text-slate-500">حالة التحقق من الصلاحية:</span>
                  <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                    unit.expiryVerificationStatus === 'verified'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : unit.expiryVerificationStatus === 'unverified_missing_date'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {unit.expiryVerificationStatus === 'verified'
                      ? 'موثق ومطابق'
                      : unit.expiryVerificationStatus === 'unverified_missing_date'
                      ? 'غير محدد - محظور'
                      : 'قيد التحقق'}
                  </span>
                </div>
              </div>

              {/* Special Attributes Tags */}
              {unit.specialAttributes.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {unit.specialAttributes.map(att => (
                    <span key={att} className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                      {att === 'irradiated' ? 'مشعع (Irradiated)' :
                       att === 'leukocyte_reduced' ? 'مفلتر (LR)' :
                       att === 'washed' ? 'مغسول (Washed)' :
                       att === 'pooled' ? 'مدمج (Pooled)' :
                       att === 'pediatric_split' ? 'مجزأ للأطفال' :
                       att === 'antigen_negative' ? 'سالب مستضد' : att}
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

                {onOpenPreparationModal && (
                  <button
                    onClick={() => onOpenPreparationModal(unit)}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-[10px] flex items-center gap-1 shadow-2xs"
                  >
                    <Flame className="w-3 h-3 text-amber-600" />
                    <span>تجهيز / معالجة</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredUnits.length === 0 && (
          <div className="col-span-3 p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            لا توجد وحدات تطابق معايير الفلترة المحددة.
          </div>
        )}
      </div>
    </div>
  );
};
