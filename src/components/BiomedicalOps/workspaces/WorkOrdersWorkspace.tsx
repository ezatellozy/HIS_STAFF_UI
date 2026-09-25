import React, { useState } from 'react';
import {
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  User,
  Building,
  Coins,
  Cpu,
  Layers,
  FileText,
  X,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import {
  BiomedicalWorkOrder,
  WorkOrderPriority,
  WorkOrderStatus,
  MedicalEquipmentAsset,
  BiomedicalOpsState,
  SparePartUsed
} from '../../../types/biomedicalOps';

interface WorkOrdersWorkspaceProps {
  state: BiomedicalOpsState;
  onUpdateWorkOrder: (wo: BiomedicalWorkOrder) => void;
  onAddWorkOrder: (wo: BiomedicalWorkOrder) => void;
  onUpdateAsset: (asset: MedicalEquipmentAsset) => void;
  onAddAuditLog: (action: string, entityId: string, description: string) => void;
  onNavigateToTesting?: (woId: string) => void;
}

export const WorkOrdersWorkspace: React.FC<WorkOrdersWorkspaceProps> = ({
  state,
  onUpdateWorkOrder,
  onAddWorkOrder,
  onUpdateAsset,
  onAddAuditLog,
  onNavigateToTesting
}) => {
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWo, setSelectedWo] = useState<BiomedicalWorkOrder | null>(null);

  // New Work Order Modal
  const [showNewWoModal, setShowNewWoModal] = useState<boolean>(false);
  const [newAssetId, setNewAssetId] = useState<string>(state.assets[0]?.id || '');
  const [newPriority, setNewPriority] = useState<WorkOrderPriority>('urgent_clinical');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newReportedBy, setNewReportedBy] = useState<string>('م. عبد الله العمري (مشرف تمريض)');

  // Work Order Edit / Actions Modal
  const [showActionModal, setShowActionModal] = useState<boolean>(false);
  const [actionsTaken, setActionsTaken] = useState<string>('');
  const [rootCause, setRootCause] = useState<string>('');
  const [assignedEng, setAssignedEng] = useState<string>('م. طارق الغامدي');
  const [downtimeHours, setDowntimeHours] = useState<number>(2.0);

  // New Part State
  const [partNo, setPartNo] = useState<string>('');
  const [partDesc, setPartDesc] = useState<string>('');
  const [partCost, setPartCost] = useState<number>(500);

  const filteredWorkOrders = state.workOrders.filter(wo => {
    const matchesSearch =
      !searchQuery ||
      wo.workOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.assetName.includes(searchQuery) ||
      wo.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.departmentName.includes(searchQuery);

    const matchesPriority = priorityFilter === 'all' || wo.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || wo.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleCreateNewWorkOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = state.assets.find(a => a.id === newAssetId);
    if (!asset || !newDescription.trim()) return;

    const newWoNumber = `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newWo: BiomedicalWorkOrder = {
      id: `wo-${Date.now()}`,
      workOrderNumber: newWoNumber,
      assetId: asset.id,
      assetTag: asset.assetTag,
      assetName: asset.nameAr,
      departmentId: asset.assignedDepartment,
      departmentName: asset.assignedDepartment,
      reportedBy: newReportedBy,
      reportedDate: nowStr,
      priority: newPriority,
      status: 'reported',
      problemDescription: newDescription,
      partsUsed: [],
      downtimeRecord: {
        id: `DT-${Date.now()}`,
        start: nowStr,
        reason: newDescription
      },
      electricalSafetyTestRequired: asset.commissioningProfile?.electricalSafetyTest === 'required',
      calibrationRequired: Boolean(asset.calibrationProfile?.calibrationRequired),
      functionalVerificationCompleted: false,
      vendorRepaired: false,
      hospitalVerificationCompleted: false,
      returnToServiceApproved: false
    };

    const updatedAsset: MedicalEquipmentAsset = {
      ...asset,
      currentStatus: 'under_repair',
      activeWorkOrderId: newWo.id
    };

    onAddWorkOrder(newWo);
    onUpdateAsset(updatedAsset);
    onAddAuditLog(
      'WORK_ORDER_CREATED',
      newWo.id,
      `فتح أمر صيانة تصحيحي جديد ${newWo.workOrderNumber} للأصل ${asset.assetTag} (${asset.nameAr}) بالأولوية ${newPriority}.`
    );

    setShowNewWoModal(false);
    setNewDescription('');
  };

  const handleSaveActionsAndParts = () => {
    if (!selectedWo) return;

    const updatedParts = [...selectedWo.partsUsed];
    if (partNo.trim() && partDesc.trim()) {
      updatedParts.push({
        partNumber: partNo,
        description: partDesc,
        quantity: 1,
        costSar: partCost,
        lotOrSerialNumber: `LOT-${Date.now().toString().slice(-6)}`,
        inventorySource: 'hospital_central_store'
      });
    }

    const updatedWo: BiomedicalWorkOrder = {
      ...selectedWo,
      actionsTaken: actionsTaken || selectedWo.actionsTaken,
      rootCauseAnalysis: rootCause || selectedWo.rootCauseAnalysis,
      assignedEngineer: assignedEng || selectedWo.assignedEngineer,
      downtimeHours,
      partsUsed: updatedParts,
      status: 'testing_pending',
      technicianSignOff: {
        engineerName: assignedEng,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
      }
    };

    const asset = state.assets.find(a => a.id === selectedWo.assetId);
    if (asset) {
      onUpdateAsset({
        ...asset,
        currentStatus: 'post_repair_testing'
      });
    }

    onUpdateWorkOrder(updatedWo);
    setSelectedWo(updatedWo);
    setShowActionModal(false);

    onAddAuditLog(
      'WORK_ORDER_REPAIR_COMPLETED',
      updatedWo.id,
      `اكتمال أعمال الصيانة الفنية لأمر العمل ${updatedWo.workOrderNumber} ونقل الجهاز ${updatedWo.assetTag} إلى مرحلة فحص الأمان والتحرير السريري.`
    );
  };

  const getPriorityBadge = (priority: WorkOrderPriority) => {
    switch (priority) {
      case 'stat_life_support':
        return <span className="bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full animate-pulse">STAT (دعم حياة طارئ)</span>;
      case 'urgent_clinical':
        return <span className="bg-amber-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">عاجل سريرياً (Urgent)</span>;
      case 'routine':
        return <span className="bg-blue-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">اعتيادي (Routine)</span>;
      case 'scheduled_ppm':
        return <span className="bg-teal-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">صيانة دورية مجدولة</span>;
    }
  };

  const getStatusBadge = (status: WorkOrderStatus) => {
    switch (status) {
      case 'reported':
        return <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded">تم الإبلاغ</span>;
      case 'assigned':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">قيد الإسناد</span>;
      case 'in_progress':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">جاري العمل الفني</span>;
      case 'awaiting_parts':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded">بانتظار قطع الغيار</span>;
      case 'testing_pending':
        return <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded">بانتظار فحص الأمان</span>;
      case 'completed_verified':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">مكتمل ومجاز سريرياً</span>;
      case 'cancelled':
        return <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded">ملغي</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & New Work Order Trigger */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              إدارة بلاغات وأوامر الصيانة التصحيحية (Corrective Maintenance & Work Orders)
            </h2>
            <p className="text-xs text-slate-500">
              تتبع أعطال الأجهزة الطبية، استبدال قطع الغيار، حصر ساعات التوقف (Downtime)، وتوثيق المعاينة الفنية
            </p>
          </div>

          <button
            onClick={() => setShowNewWoModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>فتح أمر صيانة جديد (New Work Order)</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="بحث برقم الأمر، الأصل، القسم..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-slate-800 focus:bg-white focus:outline-hidden focus:border-teal-500"
            />
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="all">كافة مستويات الأولوية</option>
              <option value="stat_life_support">STAT (دعم حياة طارئ)</option>
              <option value="urgent_clinical">عاجل سريرياً (Urgent)</option>
              <option value="routine">اعتيادي (Routine)</option>
              <option value="scheduled_ppm">صيانة وقائية دورية</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="all">كافة الحالات الفنية</option>
              <option value="reported">تم الإبلاغ (Reported)</option>
              <option value="in_progress">جاري العمل (In Progress)</option>
              <option value="awaiting_parts">بانتظار قطع الغيار (Awaiting Parts)</option>
              <option value="testing_pending">بانتظار فحص الأمان (Testing Pending)</option>
              <option value="completed_verified">مكتمل ومجاز (Completed)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Work Orders List */}
      <div className="space-y-3">
        {filteredWorkOrders.length === 0 ? (
          <div className="bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200 text-xs">
            لا توجد أوامر صيانة تطابق شروط التصفية
          </div>
        ) : (
          filteredWorkOrders.map(wo => {
            const isStat = wo.priority === 'stat_life_support';
            return (
              <div
                key={wo.id}
                onClick={() => setSelectedWo(wo)}
                className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer text-xs space-y-3 shadow-xs hover:shadow-md ${
                  isStat ? 'border-red-200 bg-red-50/10' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg text-xs">
                      {wo.workOrderNumber}
                    </span>
                    {getPriorityBadge(wo.priority)}
                    {getStatusBadge(wo.status)}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    تاريخ البلاغ: {wo.reportedDate}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] block">الجهاز والقسم:</span>
                    <h4 className="font-bold text-slate-900 text-sm">{wo.assetName}</h4>
                    <span className="font-mono text-teal-700 font-bold block">{wo.assetTag} • {wo.departmentName}</span>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <span className="text-slate-400 text-[10px] block">وصف العطل / المشكلة:</span>
                    <p className="text-slate-700 text-xs leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {wo.problemDescription}
                    </p>
                  </div>
                </div>

                {/* Footer details */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                  <div className="flex items-center gap-4">
                    <span>المبلغ: <strong className="text-slate-700">{wo.reportedBy}</strong></span>
                    <span>المهندس المسند: <strong className="text-slate-700">{wo.assignedEngineer || 'غير مسند'}</strong></span>
                    <span>قطع الغيار: <strong className="text-slate-700">{wo.partsUsed.length} قطع</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                      توقف: {wo.downtimeHours} ساعة
                    </span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedWo(wo);
                        setShowActionModal(true);
                        setActionsTaken(wo.actionsTaken || '');
                        setRootCause(wo.rootCauseAnalysis || '');
                        setAssignedEng(wo.assignedEngineer || 'م. طارق الغامدي');
                        setDowntimeHours(wo.downtimeHours || 2.0);
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      تحديث الإجراءات والقطع
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Work Order Modal */}
      {showNewWoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden text-right" dir="rtl">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm">فتح أمر صيانة تصحيحي جديد (New Work Order)</h3>
              </div>
              <button onClick={() => setShowNewWoModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewWorkOrder} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="text-slate-700 block font-semibold mb-1">الأصل الطبي المعطل:</label>
                <select
                  value={newAssetId}
                  onChange={e => setNewAssetId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 focus:outline-hidden"
                >
                  {state.assets
                    .filter(a => a.currentStatus !== 'decommissioned')
                    .map(a => (
                      <option key={a.id} value={a.id}>
                        {a.assetTag} — {a.nameAr} ({a.assignedDepartment})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 block font-semibold mb-1">أولوية البلاغ السريري:</label>
                <select
                  value={newPriority}
                  onChange={e => setNewPriority(e.target.value as WorkOrderPriority)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 focus:outline-hidden"
                >
                  <option value="stat_life_support">عاجل جداً — جهاز دعم حياة وإنعاش (STAT)</option>
                  <option value="urgent_clinical">عاجل سريرياً يؤثر على رعاية المرضى (Urgent)</option>
                  <option value="routine">اعتيادي ولا يهدد سير العمل الفوري (Routine)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 block font-semibold mb-1">اسم المبلّغ وقسمه:</label>
                <input
                  type="text"
                  value={newReportedBy}
                  onChange={e => setNewReportedBy(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-slate-700 block font-semibold mb-1">وصف العطل بالتفصيل وأعراض المشكلة:</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="مثال: ظهور كود خطأ ERR-102 أثناء تشغيل المضخة مع توقف مستشعر الهواء..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-hidden"
                  required
                />
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2 rounded-xl cursor-pointer shadow-xs transition-colors"
                >
                  إنشاء وتوجيه أمر الصيانة
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewWoModal(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 rounded-xl cursor-pointer transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Actions & Parts Modal */}
      {showActionModal && selectedWo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden text-right" dir="rtl">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm">
                  تسجيل الإجراءات الفنية وقطع الغيار ({selectedWo.workOrderNumber})
                </h3>
              </div>
              <button onClick={() => setShowActionModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">الأصل المستهدف:</span>
                <span className="font-bold text-slate-900 text-sm">{selectedWo.assetName} ({selectedWo.assetTag})</span>
                <p className="text-slate-600 text-[11px] mt-1">{selectedWo.problemDescription}</p>
              </div>

              <div>
                <label className="text-slate-700 block font-semibold mb-1">المهندس المنفذ للإصلاح:</label>
                <input
                  type="text"
                  value={assignedEng}
                  onChange={e => setAssignedEng(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="text-slate-700 block font-semibold mb-1">الإجراءات الفنية المتخذة (Actions Taken):</label>
                <textarea
                  rows={2}
                  value={actionsTaken}
                  onChange={e => setActionsTaken(e.target.value)}
                  placeholder="تم استبدال البطاقة الإلكترونية ومعايرة قنوات الدخل وفحص التوصيلات..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div>
                <label className="text-slate-700 block font-semibold mb-1">تحليل السبب الجذري (Root Cause Analysis):</label>
                <textarea
                  rows={2}
                  value={rootCause}
                  onChange={e => setRootCause(e.target.value)}
                  placeholder="ارتفاع تيار مفاجئ تسبب في تلف مكثف التغذية..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              {/* Spare Parts Section */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-teal-600" />
                  <span>إضافة قطعة غيار مستبدلة (Spare Part Used)</span>
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-slate-500 block text-[10px] mb-1">رقم القطعة (Part No):</label>
                    <input
                      type="text"
                      placeholder="e.g. PCB-4402"
                      value={partNo}
                      onChange={e => setPartNo(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block text-[10px] mb-1">الوصف:</label>
                    <input
                      type="text"
                      placeholder="e.g. Inverter Board"
                      value={partDesc}
                      onChange={e => setPartDesc(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block text-[10px] mb-1">التكلفة (SAR):</label>
                    <input
                      type="number"
                      value={partCost}
                      onChange={e => setPartCost(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-700 block font-semibold mb-1">إجمالي ساعات التوقف (Downtime Hours):</label>
                <input
                  type="number"
                  step="0.5"
                  value={downtimeHours}
                  onChange={e => setDowntimeHours(parseFloat(e.target.value) || 0)}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-slate-800"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={handleSaveActionsAndParts}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2 rounded-xl cursor-pointer shadow-xs transition-colors"
              >
                حفظ ونقل لفحص الأمان السريري (Move to Testing)
              </button>
              <button
                type="button"
                onClick={() => setShowActionModal(false)}
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
