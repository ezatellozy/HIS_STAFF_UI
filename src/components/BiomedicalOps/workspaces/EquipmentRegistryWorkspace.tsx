import React, { useState } from 'react';
import {
  Cpu,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Building,
  User,
  Barcode,
  Calendar,
  Wrench,
  X,
  FileCheck,
  Zap,
  ArrowRight,
  History,
  Clock,
  HeartPulse,
  FileText
} from 'lucide-react';
import {
  MedicalEquipmentAsset,
  MedicalDeviceClassification,
  ClinicalCriticality,
  EquipmentClinicalStatus,
  BiomedicalOpsState
} from '../../../types/biomedicalOps';
import {
  commissionEquipmentAsset,
  evaluateCommissioningEligibility,
  evaluateElectricalSafetyTestValues
} from '../../../utils/biomedicalWorkflowEngine';

interface EquipmentRegistryWorkspaceProps {
  state: BiomedicalOpsState;
  onUpdateAsset: (asset: MedicalEquipmentAsset) => void;
  onAddAuditLog: (action: string, entityId: string, description: string) => void;
  onOpenWorkOrderForAsset?: (asset: MedicalEquipmentAsset) => void;
}

export const EquipmentRegistryWorkspace: React.FC<EquipmentRegistryWorkspaceProps> = ({
  state,
  onUpdateAsset,
  onAddAuditLog,
  onOpenWorkOrderForAsset
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [criticalityFilter, setCriticalityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAsset, setSelectedAsset] = useState<MedicalEquipmentAsset | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'details' | 'history' | 'downtime'>('details');

  // Commissioning Modal State
  const [showCommissioningModal, setShowCommissioningModal] = useState<boolean>(false);
  const [physicalPassed, setPhysicalPassed] = useState<boolean>(true);
  const [functionalPassed, setFunctionalPassed] = useState<boolean>(true);
  const [earthResistance, setEarthResistance] = useState<number>(0.085);
  const [insulationResistance, setInsulationResistance] = useState<number>(95.0);
  const [chassisLeakage, setChassisLeakage] = useState<number>(45.0);
  const [calCertNumber, setCalCertNumber] = useState<string>('CERT-CAL-INIT-2026');
  const [calPassed, setCalPassed] = useState<boolean>(true);
  const [calStandardExpired, setCalStandardExpired] = useState<boolean>(false);
  const [commissioningError, setCommissioningError] = useState<string | null>(null);

  // Filtered Assets
  const filteredAssets = state.assets.filter(asset => {
    const matchesSearch =
      !searchQuery ||
      asset.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.nameAr.includes(searchQuery) ||
      asset.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.sfdaRegistrationNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept =
      departmentFilter === 'all' || asset.assignedDepartment.includes(departmentFilter);

    const matchesCriticality =
      criticalityFilter === 'all' || asset.clinicalCriticality === criticalityFilter;

    const matchesStatus =
      statusFilter === 'all' || asset.currentStatus === statusFilter;

    return matchesSearch && matchesDept && matchesCriticality && matchesStatus;
  });

  const handleExecuteCommissioning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;

    const profile = state.testProfiles.find(p => p.testProfileId === selectedAsset.safetyTestProfileId);
    const hasAppliedPart = Boolean(profile?.appliedPartType && profile.appliedPartType !== 'None');
    const safetyValidation = evaluateElectricalSafetyTestValues(
      profile,
      earthResistance,
      insulationResistance,
      chassisLeakage,
      hasAppliedPart ? 15.0 : undefined,
      false
    );

    const safetyRecord = selectedAsset.commissioningProfile.electricalSafetyTest === 'required'
      ? {
          id: `ST-${Date.now()}`,
          testDate: new Date().toISOString().split('T')[0],
          testedBy: 'م. طارق الغامدي (مهندس أجهزة طبية)',
          testStandardReference: profile?.applicableStandardReference || 'Workflow informed by IEC 62353',
          testProfileId: selectedAsset.safetyTestProfileId || 'PROF-IEC62353-CLASS-I-BF',
          testDeviceRef: 'Fluke ESA620 S/N 847291',
          earthResistanceOhms: earthResistance,
          earthResistancePass: safetyValidation.earthResistancePass,
          insulationResistanceMOhms: insulationResistance,
          insulationResistancePass: safetyValidation.insulationResistancePass,
          chassisLeakageCurrentMicroAmps: chassisLeakage,
          chassisLeakagePass: safetyValidation.chassisLeakagePass,
          overallSafetyPass: safetyValidation.overallPass
        }
      : undefined;

    const calRecord = selectedAsset.commissioningProfile.calibration === 'required'
      ? {
          id: `CAL-${Date.now()}`,
          calibrationDate: new Date().toISOString().split('T')[0],
          expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          calibratedBy: 'مختبر المعايرة المعتمد',
          certificateNumber: calCertNumber,
          referenceStandardDevice: 'TSI Certifier Pro S/N 99201',
          referenceStandardExpiryDate: '2027-04-01',
          referenceStandardExpired: calStandardExpired,
          testPoints: [
            { parameter: 'Baseline Output Accuracy', nominalValue: 100, measuredValue: 100.1, unit: '%', allowedTolerancePercent: 5, deviationPercent: 0.1, inTolerance: calPassed }
          ],
          passed: calPassed && !calStandardExpired
        }
      : undefined;

    const res = commissionEquipmentAsset(selectedAsset, {
      physicalInspectionPassed: physicalPassed,
      functionalTestPassed: functionalPassed,
      electricalSafetyTest: safetyRecord,
      initialCalibration: calRecord,
      commissionedBy: 'م. طارق الغامدي'
    });

    if (!res.success || !res.updatedAsset) {
      setCommissioningError(res.errorReason || 'فشل التدشين');
      return;
    }

    onUpdateAsset(res.updatedAsset);
    setSelectedAsset(res.updatedAsset);
    setShowCommissioningModal(false);
    setCommissioningError(null);

    onAddAuditLog(
      'COMMISSIONING_COMPLETED',
      res.updatedAsset.id,
      `اكتمال التدشين والقبول الفني للأصل ${res.updatedAsset.assetTag} (${res.updatedAsset.nameAr}) بنجاح وانتقاله للخدمة السريرية.`
    );
  };

  const getStatusBadge = (status: EquipmentClinicalStatus) => {
    switch (status) {
      case 'in_service':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">جاهز بالخدمة السريرية</span>;
      case 'under_repair':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">تحت الصيانة والإصلاح</span>;
      case 'post_repair_testing':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">فحص الأمان ما بعد الإصلاح</span>;
      case 'quarantined_safety_hold':
        return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">حظر سلامة / استدعاء SFDA</span>;
      case 'out_of_service_calibration_failed':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">خارج الخدمة (فشل المعايرة)</span>;
      case 'pending_commissioning':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">بانتظار فحص التدشين والقبول</span>;
      case 'maintenance_scheduled':
        return <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded-full">مستحق للصيانة الوقائية</span>;
      case 'decommissioned':
        return <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">متقاعد / تم التكهين</span>;
      default:
        return null;
    }
  };

  const getCriticalityBadge = (criticality: ClinicalCriticality, isLifeSupport: boolean) => {
    if (isLifeSupport) {
      return (
        <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded font-mono flex items-center gap-1">
          <HeartPulse className="w-3 h-3" />
          <span>Life Support (دعم حياة)</span>
        </span>
      );
    }
    switch (criticality) {
      case 'critical':
        return <span className="bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">Critical (حرج)</span>;
      case 'important':
        return <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">Important (هام)</span>;
      case 'routine':
        return <span className="bg-slate-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">Routine (اعتيادي)</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              سجل الأجهزة والتجهيزات الطبية والتدشين الفني (Equipment Registry & Acceptance)
            </h2>
            <p className="text-xs text-slate-500">
              سجل كامل لكافة الأصول الطبية مع الفصل التام بين التصنيف التنظيمي (Regulatory Scheme) والأهمية السريرية (Clinical Criticality)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-100 text-slate-700 font-mono font-bold px-3 py-1 rounded-xl">
              إجمالي المعروض: {filteredAssets.length} أصل طبي
            </span>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="بحث بالرمز، الاسم، الرقم التسلسلي، UDI..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-slate-800 focus:bg-white focus:outline-hidden focus:border-teal-500"
            />
          </div>

          <div>
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="all">كافة الأقسام السريرية</option>
              <option value="ICU">العناية المركزة (ICU)</option>
              <option value="OR">العمليات الجراحية (OR)</option>
              <option value="ER">طوارئ الكبار (ER)</option>
              <option value="NICU">حديثي الولادة (NICU)</option>
              <option value="LIS">المختبر المركزي (LIS)</option>
            </select>
          </div>

          <div>
            <select
              value={criticalityFilter}
              onChange={e => setCriticalityFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="all">كافة مستويات الأهمية السريرية</option>
              <option value="life_support">أجهزة دعم الحياة (Life Support)</option>
              <option value="critical">أجهزة حرجة (Critical)</option>
              <option value="important">أجهزة هامة (Important)</option>
              <option value="routine">أجهزة اعتيادية (Routine)</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="all">كافة الحالات التشغيلية</option>
              <option value="in_service">جاهز بالخدمة السريرية</option>
              <option value="under_repair">تحت الصيانة والإصلاح</option>
              <option value="post_repair_testing">فحص ما بعد الإصلاح</option>
              <option value="quarantined_safety_hold">حظر سلامة واستدعاء</option>
              <option value="pending_commissioning">بانتظار التدشين الأولي</option>
              <option value="decommissioned">متقاعد / مكهّن</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <Cpu className="w-12 h-12 mx-auto text-slate-300 stroke-1 mb-2" />
            <p className="text-sm font-semibold">لا توجد أجهزة مطابقة لمعايير البحث</p>
          </div>
        ) : (
          filteredAssets.map(asset => {
            const isSelected = selectedAsset?.id === asset.id;
            return (
              <div
                key={asset.id}
                onClick={() => {
                  setSelectedAsset(asset);
                  setActiveModalTab('details');
                }}
                className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer text-xs space-y-3 relative hover:shadow-md ${
                  isSelected
                    ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Top Tag, Scheme & Criticality */}
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {asset.assetTag}
                    </span>
                    <span className="bg-slate-200 text-slate-700 text-[9px] font-mono px-1.5 py-0.2 rounded font-bold" title={asset.regulatoryClassificationSource}>
                      {asset.regulatoryClassificationValue} ({asset.regulatoryClassificationScheme})
                    </span>
                  </div>
                  {getCriticalityBadge(asset.clinicalCriticality, asset.lifeSupportDependency)}
                </div>

                {/* Names */}
                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{asset.nameAr}</h3>
                  <p className="text-[11px] text-slate-500 font-sans">{asset.nameEn}</p>
                </div>

                {/* Specs Box */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">المصنّع والطراز:</span>
                    <span className="font-bold text-slate-700">{asset.manufacturer} — {asset.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">الرقم التسلسلي (S/N):</span>
                    <span className="font-mono text-slate-700">{asset.serialNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">سجل الهيئة (SFDA):</span>
                    <span className="font-mono text-teal-700 font-bold">{asset.sfdaRegistrationNumber}</span>
                  </div>
                </div>

                {/* Location & Custodian */}
                <div className="space-y-1 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{asset.assignedDepartment} — {asset.locationRoom}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>العهدة: {asset.custodianStaffName}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  {getStatusBadge(asset.currentStatus)}
                  <span className="text-[10px] text-slate-400">
                    PPM: {asset.ppmSchedule.frequencyMonths} أشهر
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selected Asset Slide-over / Details & History Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-right" dir="rtl">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-5 h-5 text-teal-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white">{selectedAsset.nameAr}</h3>
                    <span className="bg-teal-500/20 text-teal-300 font-mono text-xs px-2 py-0.5 rounded font-bold">
                      {selectedAsset.assetTag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans">{selectedAsset.nameEn}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Subnav Tabs */}
            <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center gap-2 text-xs">
              <button
                onClick={() => setActiveModalTab('details')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeModalTab === 'details' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                البيانات الفنية والامتثال (Technical Data)
              </button>
              <button
                onClick={() => setActiveModalTab('history')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeModalTab === 'history' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className="w-3.5 h-3.5 text-teal-600" />
                <span>سجل دورة الحياة ({selectedAsset.lifecycleHistory.length})</span>
              </button>
              <button
                onClick={() => setActiveModalTab('downtime')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeModalTab === 'downtime' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>سجل التوقف السريري (Downtime)</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              {activeModalTab === 'details' && (
                <>
                  {/* Status & Classification vs Criticality Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 block text-[10px]">الحالة التشغيلية:</span>
                      <div className="mt-1">{getStatusBadge(selectedAsset.currentStatus)}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">التصنيف التنظيمي المعتمد:</span>
                      <div className="mt-1">
                        <span className="bg-slate-200 text-slate-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                          {selectedAsset.regulatoryClassificationValue} ({selectedAsset.regulatoryClassificationScheme})
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">الأهمية السريرية الفعلية:</span>
                      <div className="mt-1">
                        {getCriticalityBadge(selectedAsset.clinicalCriticality, selectedAsset.lifeSupportDependency)}
                      </div>
                    </div>
                  </div>

                  {/* Technical Specifications */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-500 block">الشركة المصنعة (OEM):</span>
                      <span className="font-bold text-slate-800">{selectedAsset.manufacturer}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">الطراز (Model):</span>
                      <span className="font-bold text-slate-800">{selectedAsset.model}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">الرقم التسلسلي (Serial No):</span>
                      <span className="font-mono text-slate-800 font-bold">{selectedAsset.serialNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">رمز الجهاز الموحد (UDI):</span>
                      <span className="font-mono text-slate-700 text-[10px] break-all">{selectedAsset.udiCode}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">سجل الهيئة العامة للغذاء والدواء:</span>
                      <span className="font-mono text-teal-700 font-bold">{selectedAsset.sfdaRegistrationNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">الوكيل / مزود الخدمة المعتمد:</span>
                      <span className="font-semibold text-slate-800">{selectedAsset.oemVendorName}</span>
                    </div>
                  </div>

                  {/* Location & Custody Box */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-teal-600" />
                      <span>الموقع السريري وسلسلة الحيازة (Chain of Custody)</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">القسم السريري:</span>
                        <span className="font-bold text-slate-800">{selectedAsset.assignedDepartment}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">الغرفة / المحطة:</span>
                        <span className="font-bold text-slate-800">{selectedAsset.locationRoom}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">مسؤول العهدة السريري:</span>
                        <span className="font-semibold text-slate-800">{selectedAsset.custodianStaffName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">تاريخ انتهاء الضمان:</span>
                        <span className="font-mono text-slate-800">{selectedAsset.warrantyExpiryDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Commissioning Requirements Profile */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-teal-600" />
                      <span>ملف متطلبات التدشين المعتمد للجهاز (Commissioning Profile)</span>
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">فحص السلامة الكهربائية:</span>
                        <span className="font-semibold text-slate-800">{selectedAsset.commissioningProfile.electricalSafetyTest}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">شهادة المعايرة الأساسية:</span>
                        <span className="font-semibold text-slate-800">{selectedAsset.commissioningProfile.calibration}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">توفر دليل المصنّع (IFU):</span>
                        <span className={`font-semibold ${selectedAsset.commissioningProfile.manufacturerIfuAvailable ? 'text-emerald-700' : 'text-red-600 font-bold'}`}>
                          {selectedAsset.commissioningProfile.manufacturerIfuAvailable ? 'متوفر مع الجهاز' : 'مفقود / غير متوفر (حظر)'}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Lifecycle History Tab */}
              {activeModalTab === 'history' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800">التسلسل الزمني لأحداث الجهاز (Chronological Lifecycle):</h4>
                  {selectedAsset.lifecycleHistory.length === 0 ? (
                    <p className="text-slate-400 py-6 text-center">لا توجد أحداث سابقة مسجلة في هذا السجل</p>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                      {selectedAsset.lifecycleHistory.map(evt => (
                        <div key={evt.id} className="p-3 bg-white hover:bg-slate-50/80 transition-colors space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span>{evt.timestamp}</span>
                            <span className="bg-slate-100 text-teal-700 px-1.5 py-0.5 rounded font-bold">
                              {evt.eventType}
                            </span>
                          </div>
                          <p className="text-slate-800 font-semibold">{evt.descriptionAr}</p>
                          <p className="text-[10px] text-slate-400 font-sans">{evt.descriptionEn}</p>
                          <span className="text-[10px] text-slate-500 block">المسؤول: {evt.actor}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Downtime Tab */}
              {activeModalTab === 'downtime' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800">سجل فترات التوقف السريري (Clinical Downtime Records):</h4>
                  {selectedAsset.downtimeHistory.length === 0 ? (
                    <p className="text-slate-400 py-6 text-center">لم يسجل هذا الأصل أي فترات توقف سريري سابقة</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedAsset.downtimeHistory.map(dt => {
                        const isOpen = dt.end === undefined;
                        return (
                          <div
                            key={dt.id}
                            className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                              isOpen ? 'bg-amber-50/50 border-amber-300' : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-slate-700">{dt.id}</span>
                              <span
                                className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                                  isOpen ? 'bg-amber-600 text-white animate-pulse' : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {isOpen ? 'توقف جاري (Open Downtime)' : 'فترة توقف منتهية'}
                              </span>
                            </div>
                            <p className="font-semibold text-slate-800">{dt.reason}</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-200/60">
                              <div>بداية التوقف: {dt.start}</div>
                              <div>نهاية التوقف: {dt.end ? dt.end : 'لم ينتهِ بعد (بدون نهاية مفبركة)'}</div>
                              <div>المدة: {dt.durationHours ? `${dt.durationHours} ساعة` : 'قيد الاحتساب'}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {selectedAsset.currentStatus === 'pending_commissioning' && (
                  <button
                    onClick={() => setShowCommissioningModal(true)}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>إجراء فحص التدشين الموجه بملف الأصل (Commissioning)</span>
                  </button>
                )}

                {selectedAsset.currentStatus === 'in_service' && onOpenWorkOrderForAsset && (
                  <button
                    onClick={() => {
                      onOpenWorkOrderForAsset(selectedAsset);
                      setSelectedAsset(null);
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>فتح أمر صيانة تصحيحي</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedAsset(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 rounded-xl cursor-pointer transition-colors"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Commissioning Acceptance Form Modal */}
      {showCommissioningModal && selectedAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden text-right" dir="rtl">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm">
                  محضر التدشين والقبول الفني (Profile-Driven Commissioning)
                </h3>
              </div>
              <button
                onClick={() => setShowCommissioningModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteCommissioning} className="p-5 overflow-y-auto space-y-4 text-xs">
              {commissioningError && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-2 font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{commissioningError}</span>
                </div>
              )}

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">الجهاز المستهدف:</span>
                <span className="font-bold text-slate-900 text-sm">{selectedAsset.nameAr}</span>
                <span className="font-mono text-slate-500 block">{selectedAsset.assetTag} • S/N: {selectedAsset.serialNumber}</span>
              </div>

              {/* IFU Warning if missing */}
              {!selectedAsset.commissioningProfile.manufacturerIfuAvailable && (
                <div className="p-3 bg-red-100 text-red-800 rounded-xl border border-red-200 font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>تحذير أمان: وثائق تعليمات الاستخدام (IFU) مفقودة؛ التدشين محظور نظامياً.</span>
                </div>
              )}

              {/* Physical Check */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={physicalPassed}
                    onChange={e => setPhysicalPassed(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <span>اجتياز الفحص الفيزيائي والميكانيكي وسلامة التوريد</span>
                </label>
              </div>

              {/* Functional Check */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={functionalPassed}
                    onChange={e => setFunctionalPassed(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <span>اجتياز الفحص الوظيفي الأولي (Functional Test)</span>
                </label>
              </div>

              {/* Electrical Safety Test (Profile-Driven) */}
              {selectedAsset.commissioningProfile.electricalSafetyTest === 'required' ? (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>فحص السلامة الكهربائية (مطابق لملف: {selectedAsset.safetyTestProfileId})</span>
                  </h4>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-600 block text-[10px] mb-1 font-semibold">
                        المقاومة الأرضية (Ω):
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={earthResistance}
                        onChange={e => setEarthResistance(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-600 block text-[10px] mb-1 font-semibold">
                        مقاومة العزل (MΩ):
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={insulationResistance}
                        onChange={e => setInsulationResistance(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-600 block text-[10px] mb-1 font-semibold">
                        تسريب الهيكل (µA):
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={chassisLeakage}
                        onChange={e => setChassisLeakage(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-100 rounded-xl text-slate-500">
                  فحص السلامة الكهربائية غير مطلوب لهذا الأصل بحسب ملف التدشين المعتمد.
                </div>
              )}

              {/* Calibration (Profile-Driven) */}
              {selectedAsset.commissioningProfile.calibration === 'required' ? (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>شهادة المعايرة الأساسية المعتمدة (Baseline Calibration)</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-600 block text-[10px] mb-1 font-semibold">
                        رقم شهادة المعايرة:
                      </label>
                      <input
                        type="text"
                        value={calCertNumber}
                        onChange={e => setCalCertNumber(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block text-[10px] mb-1 font-semibold">
                        صلاحية أداة القياس المرجعية:
                      </label>
                      <select
                        value={calStandardExpired ? 'expired' : 'valid'}
                        onChange={e => setCalStandardExpired(e.target.value === 'expired')}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 font-semibold"
                      >
                        <option value="valid">أداة القياس سارية الصلاحية (Valid Standard)</option>
                        <option value="expired">أداة القياس منتهية الصلاحية (Expired Standard)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-100 rounded-xl text-slate-500">
                  شهادة المعايرة غير مطلوبة لهذا الأصل (جهاز غير ذي وظيفة قياسية مترولوجية).
                </div>
              )}

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2 rounded-xl cursor-pointer shadow-xs transition-colors"
                >
                  اعتماد التدشين في المسار الاصطناعي
                </button>
                <button
                  type="button"
                  onClick={() => setShowCommissioningModal(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 rounded-xl cursor-pointer transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
