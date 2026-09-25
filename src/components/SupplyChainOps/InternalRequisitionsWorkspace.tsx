import React, { useState } from 'react';
import {
  ClipboardList,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  SlidersHorizontal,
  X,
  UserCheck,
  TrendingDown,
  Layers,
  ChevronDown
} from 'lucide-react';
import {
  DepartmentalRequisition,
  RequisitionLineItem,
  RequisitionPriority,
  ItemMasterRecord,
  DepartmentParLevel,
  StorageLocation
} from '../../types/supplyChainOps';

interface InternalRequisitionsWorkspaceProps {
  requisitions: DepartmentalRequisition[];
  catalogItems: ItemMasterRecord[];
  parLevels: DepartmentParLevel[];
  locations: StorageLocation[];
  onAddRequisition: (requisition: DepartmentalRequisition) => void;
  onApproveRequisition: (reqId: string, approvedBy: string) => void;
  onOpenScenarioModal?: () => void;
}

export const InternalRequisitionsWorkspace: React.FC<InternalRequisitionsWorkspaceProps> = ({
  requisitions,
  catalogItems,
  parLevels,
  locations,
  onAddRequisition,
  onApproveRequisition,
  onOpenScenarioModal
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'requisitions_list' | 'par_levels'>('requisitions_list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReqDetail, setSelectedReqDetail] = useState<DepartmentalRequisition | null>(null);

  // Form state for new requisition
  const [deptName, setDeptName] = useState('تنويم الباطنية والجراحة (Ward 4A)');
  const [destinationLocationId, setDestinationLocationId] = useState('LOC-WARD-4A-CLEAN');
  const [requesterName, setRequesterName] = useState('سارة الدوسري (مشرفة تمريض الجناح)');
  const [priority, setPriority] = useState<RequisitionPriority>('routine');
  const [priorityJustification, setPriorityJustification] = useState('');
  const [clinicalPurpose, setClinicalPurpose] = useState('تجديد مخزون استهلاكي دوري حسب جدول الأسبوع.');
  const [lines, setLines] = useState<Array<{ itemId: string; requestedQty: number; uom: string }>>([
    { itemId: 'ITEM-MS-001', requestedQty: 50, uom: 'box' },
    { itemId: 'ITEM-MS-003', requestedQty: 24, uom: 'bottle' }
  ]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const itemMap = new Map<string, ItemMasterRecord>(catalogItems.map(i => [i.id, i]));

  const handleAddLine = () => {
    setLines([...lines, { itemId: 'ITEM-MS-002', requestedQty: 10, uom: 'each' }]);
  };

  const handleRemoveLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const updated = [...lines];
    (updated[index] as any)[field] = value;
    setLines(updated);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Scenario I02: Urgent requisitions must have priority justification
    if ((priority === 'urgent' || priority === 'stat') && !priorityJustification.trim()) {
      setValidationError('⚠️ يلزم تدوين تبرير الأولوية السريرية للطلبات العاجلة والحرجة (سيناريو I02).');
      return;
    }

    if (lines.length === 0) {
      setValidationError('⚠️ يجب إضافة سطر صنف واحد على الأقل للطلب.');
      return;
    }

    const formattedLines: RequisitionLineItem[] = lines.map((l, idx) => {
      const item = itemMap.get(l.itemId);
      return {
        lineId: `REQL-${Date.now()}-${idx}`,
        itemId: l.itemId,
        requestedQty: Number(l.requestedQty),
        uom: (item?.packaging.baseUom || 'each') as any,
        allocatedQty: 0,
        pickedQty: 0,
        issuedQty: 0,
        deliveredQty: 0,
        outstandingQty: Number(l.requestedQty)
      };
    });

    const newReq: DepartmentalRequisition = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      requisitionNumber: `REQ-${priority.toUpperCase()}-${Date.now().toString().slice(-4)}`,
      requestingDepartment: deptName,
      destinationLocationId,
      requestingActorName: requesterName,
      requestingRole: 'Ward Nurse Lead',
      priority,
      priorityJustification: priorityJustification.trim() || undefined,
      clinicalPurpose,
      approvalStatus: 'submitted',
      fulfillmentStatus: 'not_started',
      createdAt: '2026-09-20 10:30',
      lines: formattedLines
    };

    onAddRequisition(newReq);
    setIsCreateModalOpen(false);
  };

  const filteredRequisitions = requisitions.filter(req => {
    const matchesSearch =
      req.requisitionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requestingDepartment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.clinicalPurpose.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority =
      filterPriority === 'all' || req.priority === filterPriority;

    return matchesSearch && matchesPriority;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-teal-400" />
            <span>طلبات الإمداد الداخلية ومستويات البار (Internal Requisitions & Par Levels)</span>
          </h2>
          <p className="text-xs text-slate-400">
            طلب وتجديد المستلزمات الطبية المستهلكة للأجنحة، غرف العمليات، والطوارئ مع التتبع الدقيق لحالات التخصيص والصرف.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-tab Switcher */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setActiveSubTab('requisitions_list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'requisitions_list'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              سجل الطلبات
            </button>
            <button
              onClick={() => setActiveSubTab('par_levels')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'par_levels'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              مستويات البار (PAR)
            </button>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء طلب إمداد جديد</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'requisitions_list' ? (
        <>
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="بحث برقم الطلب، القسم الطالب، أو الغرض السريري..."
                className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-500 text-xs font-medium focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilterPriority('all')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterPriority === 'all'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setFilterPriority('urgent')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterPriority === 'urgent'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-900 text-red-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                عاجل / STAT
              </button>
              <button
                onClick={() => setFilterPriority('routine')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterPriority === 'routine'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                روتيني
              </button>
            </div>
          </div>

          {/* Requisitions Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 text-[11px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">رقم الطلب والتاريخ</th>
                    <th className="p-3.5">القسم ومقدم الطلب</th>
                    <th className="p-3.5">الأولوية والغرض السريري</th>
                    <th className="p-3.5">حالة الاعتماد</th>
                    <th className="p-3.5">حالة التجهيز والتسليم</th>
                    <th className="p-3.5">عدد السطور</th>
                    <th className="p-3.5 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRequisitions.map(req => {
                    const isUrgent = req.priority === 'urgent' || req.priority === 'stat';
                    return (
                      <tr
                        key={req.id}
                        className={`hover:bg-slate-800/50 transition-colors cursor-pointer ${
                          isUrgent ? 'bg-red-950/15' : ''
                        }`}
                        onClick={() => setSelectedReqDetail(req)}
                      >
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="font-mono font-bold text-white flex items-center gap-1.5">
                            <span>{req.requisitionNumber}</span>
                            {isUrgent && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-600 text-white animate-pulse">
                                STAT
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{req.createdAt}</div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-100">{req.requestingDepartment}</div>
                          <div className="text-[10px] text-slate-400">{req.requestingActorName}</div>
                        </td>

                        <td className="p-3.5 max-w-xs">
                          <div className="text-slate-200 truncate">{req.clinicalPurpose}</div>
                          {req.priorityJustification && (
                            <div className="text-[10px] text-amber-300 mt-0.5">
                              تبرير: {req.priorityJustification}
                            </div>
                          )}
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            req.approvalStatus === 'approved'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : req.approvalStatus === 'submitted'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {req.approvalStatus === 'approved' && 'معتمد (Approved)'}
                            {req.approvalStatus === 'submitted' && 'قيد الاعتماد'}
                            {req.approvalStatus === 'draft' && 'مسودة'}
                          </span>
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            req.fulfillmentStatus === 'dispatched'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : req.fulfillmentStatus === 'picking'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : req.fulfillmentStatus === 'delivered'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {req.fulfillmentStatus === 'picking' && 'جاري التجهيز'}
                            {req.fulfillmentStatus === 'dispatched' && 'تم الصرف (بالطريق)'}
                            {req.fulfillmentStatus === 'allocated' && 'تم التخصيص'}
                            {req.fulfillmentStatus === 'not_started' && 'بانتظار البدء'}
                          </span>
                        </td>

                        <td className="p-3.5 font-mono text-center text-slate-300 whitespace-nowrap">
                          {req.lines.length} أسطر
                        </td>

                        <td className="p-3.5 text-center whitespace-nowrap">
                          {req.approvalStatus === 'submitted' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onApproveRequisition(req.id, 'د. خالد العمري (مدير الإمداد)');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
                            >
                              اعتماد الطلب
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReqDetail(req);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                            >
                              عرض السطور
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Departmental PAR Levels View */
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">إدارة مستويات التجديد الدوري (Departmental Par Levels)</h3>
              <p className="text-xs text-slate-400">
                مستويات الاستهلاك المعيارية المستهدفة وخوارزمية اقتراح التعبئة التلقائية (Suggested Reorder Calculation).
              </p>
            </div>
            <span className="text-xs font-mono text-teal-400 bg-teal-950 px-2.5 py-1 rounded-lg border border-teal-800">
              مراجعة دورية للأجنحة
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-[11px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">القسم وموقع الإمداد</th>
                  <th className="p-3">المستلزم الطبي</th>
                  <th className="p-3 text-center">الرصيد الفعلي الحالي</th>
                  <th className="p-3 text-center">الحد الأدنى (Min)</th>
                  <th className="p-3 text-center">المستوى المستهدف (Target)</th>
                  <th className="p-3 text-center text-teal-400">الكمية المقترحة لإعادة الطلب</th>
                  <th className="p-3">الحالة والمراجعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {parLevels.map(par => {
                  const item = itemMap.get(par.itemId);
                  const isDeficit = par.reviewStatus === 'below_min_reorder';
                  return (
                    <tr key={par.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-sans">
                        <div className="font-bold text-white">{par.departmentNameAr}</div>
                        <div className="text-[10px] text-slate-400">{par.locationId}</div>
                      </td>

                      <td className="p-3 font-sans">
                        <div className="font-bold text-slate-200">{item?.nameAr || par.itemId}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{item?.code}</div>
                      </td>

                      <td className={`p-3 text-center font-bold ${
                        isDeficit ? 'text-red-400 text-sm' : 'text-slate-200'
                      }`}>
                        {par.currentAvailableQty} {par.uom}
                      </td>

                      <td className="p-3 text-center text-slate-400">
                        {par.minParQty}
                      </td>

                      <td className="p-3 text-center text-slate-300 font-bold">
                        {par.targetParQty}
                      </td>

                      <td className="p-3 text-center font-extrabold text-teal-300 text-sm">
                        +{par.suggestedReorderQty} {par.uom}
                      </td>

                      <td className="p-3 font-sans whitespace-nowrap">
                        {isDeficit ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800">
                            أقل من الحد الأدنى (Deficit)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            كافٍ ومستقر
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Requisition Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Plus className="w-5 h-5 text-teal-400" />
                <span>إنشاء طلب إمداد داخلي جديد (New Internal Requisition)</span>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {validationError && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs font-medium">
                {validationError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">القسم المستلم (Department):</label>
                  <select
                    value={deptName}
                    onChange={e => setDeptName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-bold"
                  >
                    <option value="تنويم الباطنية والجراحة (Ward 4A)">تنويم الباطنية والجراحة (Ward 4A)</option>
                    <option value="قسم الحوادث والطوارئ (ER Resuscitation)">قسم الحوادث والطوارئ (ER Resuscitation)</option>
                    <option value="العناية المركزة (ICU Pod 1)">العناية المركزة (ICU Pod 1)</option>
                    <option value="غرف العمليات الجراحية (OR Core)">غرف العمليات الجراحية (OR Core)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">مقدم الطلب المسؤول:</label>
                  <input
                    type="text"
                    value={requesterName}
                    onChange={e => setRequesterName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-bold"
                  />
                </div>
              </div>

              {/* Priority & Justification (Scenario I01 & I02) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">مستوى الأولوية (Priority):</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-xl border font-bold ${
                      priority === 'urgent' || priority === 'stat'
                        ? 'bg-red-950 text-red-200 border-red-700'
                        : 'bg-slate-800 text-slate-100 border-slate-700'
                    }`}
                  >
                    <option value="routine">روتيني (Routine Replenish - I01)</option>
                    <option value="urgent">عاجل / STAT (Urgent Trauma/Resus - I02)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    مبرر الأولوية (إلزامي للطلبات العاجلة):
                  </label>
                  <input
                    type="text"
                    value={priorityJustification}
                    onChange={e => setPriorityJustification(e.target.value)}
                    placeholder="مثال: حادث مروري جماعي متعدد الإصابات..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">الغرض السريري العام:</label>
                <input
                  type="text"
                  value={clinicalPurpose}
                  onChange={e => setClinicalPurpose(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
                />
              </div>

              {/* Item Lines */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">سطور المستلزمات المطلوبة:</span>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-xs text-teal-400 hover:text-teal-300 font-bold cursor-pointer"
                  >
                    + إضافة صنف آخر
                  </button>
                </div>

                {lines.map((line, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <select
                      value={line.itemId}
                      onChange={e => handleLineChange(idx, 'itemId', e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 font-bold text-xs"
                    >
                      {catalogItems.map(i => (
                        <option key={i.id} value={i.id}>
                          {i.code} — {i.nameAr}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      value={line.requestedQty}
                      onChange={e => handleLineChange(idx, 'requestedQty', e.target.value)}
                      className="w-20 px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 font-mono font-bold text-xs text-center"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveLine(idx)}
                      className="p-1.5 text-slate-500 hover:text-red-400 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold cursor-pointer shadow-xs"
                >
                  إرسال الطلب للمستودع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Requisition Detail Modal (Scenario I14: Partial Fulfillment View) */}
      {selectedReqDetail && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="font-mono text-xs font-bold text-teal-400">
                  {selectedReqDetail.requisitionNumber}
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  تفاصيل وأسطر الطلب ({selectedReqDetail.requestingDepartment})
                </h3>
              </div>
              <button
                onClick={() => setSelectedReqDetail(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400">الغرض السريري:</div>
                <div className="text-slate-100 font-medium">{selectedReqDetail.clinicalPurpose}</div>
              </div>

              <div className="text-xs font-bold text-slate-300 pt-1">أسطر الأصناف وتفاصيل التخصيص والصرف:</div>

              {selectedReqDetail.lines.map((l, i) => {
                const item = itemMap.get(l.itemId);
                const isPartial = l.outstandingQty > 0 && l.pickedQty > 0;
                return (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5 font-mono"
                  >
                    <div className="flex justify-between font-bold text-white font-sans">
                      <span>{item?.nameAr || l.itemId}</span>
                      <span className="text-teal-400">{l.requestedQty} {l.uom} مطلوبة</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-slate-700/60">
                      <div>المخصص: <span className="text-emerald-400 font-bold">{l.allocatedQty}</span></div>
                      <div>المجهز (Picked): <span className="text-amber-400 font-bold">{l.pickedQty}</span></div>
                      <div>المعلق (Backorder): <span className="text-blue-400 font-bold">{l.outstandingQty}</span></div>
                    </div>
                    {isPartial && (
                      <div className="text-[10px] text-amber-300 font-sans mt-1">
                        ⚠️ تلبية جزئية (I14): تم تجهيز {l.pickedQty} والمتبقي {l.outstandingQty} سيبقى كطلب مؤجل حتى التوريد.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedReqDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
