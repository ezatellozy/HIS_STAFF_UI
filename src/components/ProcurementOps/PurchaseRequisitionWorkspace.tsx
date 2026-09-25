import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  RotateCcw, 
  ArrowRight,
  Package,
  Layers,
  Building,
  User,
  AlertTriangle,
  FileSpreadsheet,
  Calendar,
  DollarSign
} from 'lucide-react';
import { 
  PurchaseRequisition, 
  PurchaseRequisitionLine, 
  RequisitionPriority,
  SourcingItemType,
  ProcurementBranchId
} from '../../types/procurementOps';
import { ItemMasterRecord, UomType } from '../../types/supplyChainOps';

interface PurchaseRequisitionWorkspaceProps {
  requisitions: PurchaseRequisition[];
  catalogItems: ItemMasterRecord[];
  currentBranch: ProcurementBranchId;
  activeRole: string;
  onCreateRequisition: (newPr: any) => void;
  onApproveRequisition: (prId: string, decision: 'approved' | 'rejected' | 'returned_for_revision', comments?: string) => void;
  onResubmitRequisition: (prId: string, updatedLines: PurchaseRequisitionLine[]) => void;
  onNavigateToSourcing: (prLineIds: string[]) => void;
}

export const PurchaseRequisitionWorkspace: React.FC<PurchaseRequisitionWorkspaceProps> = ({
  requisitions,
  catalogItems,
  currentBranch,
  activeRole,
  onCreateRequisition,
  onApproveRequisition,
  onResubmitRequisition,
  onNavigateToSourcing
}) => {
  const [selectedPrId, setSelectedPrId] = useState<string>(requisitions[0]?.id || '');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Create PR Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newPrDept, setNewPrDept] = useState<string>('ICU');
  const [newPrDeptNameAr, setNewPrDeptNameAr] = useState<string>('العناية المركزة (ICU)');
  const [newPrPriority, setNewPrPriority] = useState<RequisitionPriority>('routine');
  const [newPrJustification, setNewPrJustification] = useState<string>('');
  const [newPrRequiredDate, setNewPrRequiredDate] = useState<string>('2026-10-15');
  const [newPrCostCenter, setNewPrCostCenter] = useState<string>('CC-ICU-701');
  const [newPrLines, setNewPrLines] = useState<any[]>([
    {
      itemType: 'catalog_stock' as SourcingItemType,
      catalogItemId: catalogItems[0]?.id || '',
      itemCode: catalogItems[0]?.itemCode || 'CAN-IV-20G',
      itemDescriptionAr: catalogItems[0]?.genericNameAr || 'قسطرة وريدية محيطية 20G',
      itemDescriptionEn: catalogItems[0]?.genericNameEn || 'IV Cannula 20G',
      requestedUom: 'box' as UomType,
      requestedQuantity: 20,
      estimatedUnitPriceSar: 120.0,
      requiredDeliveryDate: '2026-10-15',
      deliveryLocationId: 'LOC-WH-MAIN-DOCK',
      costCenterCode: 'CC-ICU-701',
      internalStockAvailable: 15
    }
  ]);

  // Approval Modal State
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState<boolean>(false);
  const [approvalDecision, setApprovalDecision] = useState<'approved' | 'rejected' | 'returned_for_revision'>('approved');
  const [approvalComments, setApprovalComments] = useState<string>('');
  const [approvalError, setApprovalError] = useState<string>('');

  // Resubmit Modal State
  const [isResubmitModalOpen, setIsResubmitModalOpen] = useState<boolean>(false);
  const [editingLines, setEditingLines] = useState<PurchaseRequisitionLine[]>([]);

  const selectedPr = requisitions.find(r => r.id === selectedPrId);

  // Filter requisitions
  const filteredPrs = requisitions.filter(pr => {
    if (statusFilter !== 'all' && pr.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = pr.requisitionNumber.toLowerCase().includes(q);
      const matchDept = pr.requestingDepartmentNameAr.toLowerCase().includes(q);
      const matchReq = pr.requesterNameAr.toLowerCase().includes(q);
      const matchItem = pr.lines.some(l => l.itemDescriptionAr.toLowerCase().includes(q) || l.itemCode.toLowerCase().includes(q));
      if (!matchNum && !matchDept && !matchReq && !matchItem) return false;
    }
    return true;
  });

  // Handle Catalog Selection in Create PR
  const handleSelectCatalogItem = (index: number, catalogId: string) => {
    const item = catalogItems.find(c => c.id === catalogId);
    if (!item) return;

    setNewPrLines(prev => prev.map((line, i) => {
      if (i !== index) return line;
      return {
        ...line,
        catalogItemId: item.id,
        itemCode: item.itemCode,
        itemDescriptionAr: item.genericNameAr,
        itemDescriptionEn: item.genericNameEn,
        requestedUom: item.baseUom,
        estimatedUnitPriceSar: item.standardCostSar || 100,
        internalStockAvailable: item.id === 'ITEM-MS-001' ? 15 : item.id === 'ITEM-MS-003' ? 20 : 0
      };
    }));
  };

  const handleAddLineToNewPr = () => {
    setNewPrLines(prev => [
      ...prev,
      {
        itemType: 'catalog_stock',
        catalogItemId: catalogItems[1]?.id || '',
        itemCode: catalogItems[1]?.itemCode || 'GLV-ST-75',
        itemDescriptionAr: catalogItems[1]?.genericNameAr || 'قفازات جراحية معقمة',
        itemDescriptionEn: catalogItems[1]?.genericNameEn || 'Surgical Gloves',
        requestedUom: 'box',
        requestedQuantity: 10,
        estimatedUnitPriceSar: 180.0,
        requiredDeliveryDate: newPrRequiredDate,
        deliveryLocationId: 'LOC-WH-MAIN-DOCK',
        costCenterCode: newPrCostCenter,
        internalStockAvailable: 0
      }
    ]);
  };

  const handleRemoveLineFromNewPr = (idx: number) => {
    if (newPrLines.length <= 1) return;
    setNewPrLines(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrJustification.trim()) {
      alert('يرجى تدوين مبررات الاحتياج لطلب الشراء.');
      return;
    }

    const prNum = `PR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPr = {
      requisitionNumber: prNum,
      branchId: currentBranch === 'all' ? 'main_hospital' : currentBranch,
      requestingDepartmentId: newPrDept,
      requestingDepartmentNameAr: newPrDeptNameAr,
      requestingDepartmentNameEn: newPrDept,
      requesterStaffId: 'STF-CURRENT-01',
      requesterNameAr: 'د. فيصل الحربي',
      requesterNameEn: 'Dr. Faisal Al-Harbi',
      requesterRoleTitle: 'استشاري / رئيس قسم معتمد',
      costCenterCode: newPrCostCenter,
      budgetStatus: 'funds_available' as const,
      priority: newPrPriority,
      requiredDate: newPrRequiredDate,
      businessJustificationAr: newPrJustification,
      businessJustificationEn: 'Requested for clinical care operations.',
      lines: newPrLines
    };

    onCreateRequisition(newPr);
    setIsCreateModalOpen(false);
    setSelectedPrId(`PR-${prNum}`);
  };

  const handleOpenApprovalModal = (decision: 'approved' | 'rejected' | 'returned_for_revision') => {
    setApprovalDecision(decision);
    setApprovalComments('');
    setApprovalError('');
    setIsApprovalModalOpen(true);
  };

  const handleExecuteApproval = () => {
    if ((approvalDecision === 'rejected' || approvalDecision === 'returned_for_revision') && !approvalComments.trim()) {
      setApprovalError('يجب تدوين الملاحظات والمسوغات بوضوح في حقل التعليق.');
      return;
    }

    if (!selectedPr) return;

    if (approvalDecision === 'approved') {
      if (
        selectedPr.budgetStatus === 'pending_finance_review' ||
        selectedPr.budgetStatus === 'budget_exhausted' ||
        (selectedPr as any).budgetStatus === 'unknown' ||
        !selectedPr.budgetStatus
      ) {
        setApprovalError('لا يمكن اعتماد طلب الشراء: الموقف المالي للميزانية غير مؤكد أو بانتظار إفادة الإدارة المالية (PROC28).');
        return;
      }
    }

    onApproveRequisition(selectedPr.id, approvalDecision, approvalComments);
    setIsApprovalModalOpen(false);
  };

  const handleOpenResubmitModal = () => {
    if (!selectedPr) return;
    setEditingLines([...selectedPr.lines]);
    setIsResubmitModalOpen(true);
  };

  const handleExecuteResubmit = () => {
    if (!selectedPr) return;
    onResubmitRequisition(selectedPr.id, editingLines);
    setIsResubmitModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span>طلبات الشراء والاعتمادات الإدارية (Purchase Requisitions)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            إعداد ومراجعة طلبات الشراء، فحص المخزون الداخلي قبل الطرح، وتمرير الاعتمادات حسب مصفوفة الصلاحيات (DoA).
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>طلب شراء جديد (Create PR)</span>
        </button>
      </div>

      {/* Workspace Master-Detail Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Requisitions List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          
          {/* Filters & Search */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث برقم الطلب، القسم، أو الصنف..."
                className="w-full pr-9 pl-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap gap-1 pt-1">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'submitted_pending_approval', label: 'بانتظار الاعتماد' },
                { id: 'approved', label: 'معتمد' },
                { id: 'returned_for_revision', label: 'معاد للتعديل' },
                { id: 'fully_sourced', label: 'تم الطرح' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Requisitions List Cards */}
          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredPrs.map(pr => {
              const isSelected = pr.id === selectedPrId;
              return (
                <div
                  key={pr.id}
                  onClick={() => setSelectedPrId(pr.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/50 border-indigo-500 shadow-xs ring-1 ring-indigo-500/30'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{pr.requisitionNumber}</span>
                    <div className="flex items-center gap-1.5">
                      {pr.priority === 'urgent' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                          عاجل
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        pr.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        pr.status === 'submitted_pending_approval' ? 'bg-amber-100 text-amber-800' :
                        pr.status === 'returned_for_revision' ? 'bg-orange-100 text-orange-800' :
                        pr.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {pr.status === 'approved' ? 'معتمد' :
                         pr.status === 'submitted_pending_approval' ? 'بانتظار الاعتماد' :
                         pr.status === 'returned_for_revision' ? 'معاد للتعديل' :
                         pr.status === 'rejected' ? 'مرفوض' :
                         pr.status === 'fully_sourced' ? 'مكتمل الطرح' : pr.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-1.5">
                    <h4 className="text-xs font-bold text-slate-800">{pr.requestingDepartmentNameAr}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{pr.businessJustificationAr}</p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{pr.lines.length} بنود</span>
                    <span className="font-mono font-bold text-slate-700">
                      {(pr.estimatedTotalValueSar ?? 0).toLocaleString()} SAR
                    </span>
                    <span>{pr.createdAt.substring(0, 10)}</span>
                  </div>
                </div>
              );
            })}

            {filteredPrs.length === 0 && (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
                لا توجد طلبات شراء مطابقة لمعايير البحث.
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Selected Requisition Details (7 cols) */}
        <div className="lg:col-span-7">
          {selectedPr ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5">
              
              {/* Top Detail Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900">{selectedPr.requisitionNumber}</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      selectedPr.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      selectedPr.status === 'submitted_pending_approval' ? 'bg-amber-100 text-amber-800' :
                      selectedPr.status === 'returned_for_revision' ? 'bg-orange-100 text-orange-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {selectedPr.status === 'approved' ? 'معتمد رسمي' :
                       selectedPr.status === 'submitted_pending_approval' ? 'بانتظار الاعتماد' :
                       selectedPr.status === 'returned_for_revision' ? 'معاد للتعديل وملاحظات التدقيق' :
                       selectedPr.status}
                    </span>
                    {selectedPr.priority === 'urgent' && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">
                        أولوية عاجلة (Urgent ER)
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    طلب شراء: {selectedPr.requestingDepartmentNameAr}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
                    <span>مقدم الطلب: <strong className="text-slate-700">{selectedPr.requesterNameAr}</strong> ({selectedPr.requesterRoleTitle})</span>
                    <span>مركز التكلفة: <strong className="text-slate-700">{selectedPr.costCenterCode}</strong></span>
                    <span>التاريخ المطلوب: <strong className="text-slate-700">{selectedPr.requiredDate}</strong></span>
                  </div>
                </div>

                {/* Financial Estimate Pill */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-left shrink-0">
                  <span className="text-[10px] text-slate-400 font-semibold block">القيمة التقديرية الإجمالية</span>
                  <span className="font-mono text-lg font-bold text-indigo-700">
                    {(selectedPr.estimatedTotalValueSar ?? 0).toLocaleString()} SAR
                  </span>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>مخصص مالي معتمد</span>
                  </div>
                </div>
              </div>

              {/* Business Justification */}
              <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-100 text-xs">
                <span className="font-bold text-slate-700 block mb-1">مسوغات ومبررات الاحتياج السريري:</span>
                <p className="text-slate-600 leading-relaxed">{selectedPr.businessJustificationAr}</p>
              </div>

              {/* Items Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    بنود ومستلزمات الطلب ({selectedPr.lines.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    محددات الصنف والكميات ومراجعة المخزون
                  </span>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                      <tr>
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">الصنف والمواصفات</th>
                        <th className="p-2.5">النوع</th>
                        <th className="p-2.5">الكمية</th>
                        <th className="p-2.5">الوحدة</th>
                        <th className="p-2.5">السعر التقديري</th>
                        <th className="p-2.5">الإجمالي</th>
                        <th className="p-2.5">المخزون الداخلي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedPr.lines.map((line, idx) => (
                        <tr key={line.id} className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-mono text-slate-400">{idx + 1}</td>
                          <td className="p-2.5">
                            <div className="font-bold text-slate-900">{line.itemDescriptionAr}</div>
                            <div className="font-mono text-[10px] text-slate-400">{line.itemCode}</div>
                          </td>
                          <td className="p-2.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              line.itemType === 'catalog_stock' ? 'bg-blue-50 text-blue-700' :
                              line.itemType === 'non_catalog_special' ? 'bg-purple-50 text-purple-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {line.itemType === 'catalog_stock' ? 'دليل الأصناف' :
                               line.itemType === 'non_catalog_special' ? 'خارج الدليل (خاص)' : line.itemType}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono font-bold text-slate-900">{line.requestedQuantity}</td>
                          <td className="p-2.5 text-slate-600">{line.requestedUom}</td>
                          <td className="p-2.5 font-mono text-slate-700">{(line.estimatedUnitPriceSar ?? 0).toLocaleString()} SAR</td>
                          <td className="p-2.5 font-mono font-bold text-indigo-900">{(line.estimatedTotalSar ?? 0).toLocaleString()} SAR</td>
                          <td className="p-2.5">
                            {(line.internalStockAvailable && line.internalStockAvailable > 0) ? (
                              <div className="flex items-center gap-1 text-amber-700 font-bold text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                <AlertCircle className="w-3 h-3 shrink-0" />
                                <span>متوفر بالمستودع: {line.internalStockAvailable}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">غير متوفر (0)</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Stock Warning Box if any item is available in warehouse (PROC03) */}
                {selectedPr.lines.some(l => l.internalStockAvailable && l.internalStockAvailable > 0) && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">تنبيه توفر أرصدة مخزنية بالمستودع المركزي (Internal Stock Available):</span>
                      <p className="mt-0.5 text-amber-800">
                        بعض الأصناف المطلوبة أعلاه يتوفر منها رصيد حالي بالمستودع المركزي. توصي سياسة سلاسل الإمداد بمراجعة إمكانية صرفها عبر طلب صرف مستودعي داخلي لتفادي الشراء الخارجي الزائد، ما لم توجد ضرورة تشغيلية معتمدة للشراء.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Approval History Audit Trail */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                  سجل ومراحل الاعتماد الإداري (Approval Workflow)
                </h4>
                <div className="space-y-2">
                  {selectedPr.approvalHistory.map(rec => (
                    <div key={rec.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{rec.stageNameAr}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rec.decision === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                            rec.decision === 'returned_for_revision' ? 'bg-orange-100 text-orange-800' :
                            rec.decision === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {rec.decision === 'approved' ? 'تم الاعتماد' :
                             rec.decision === 'returned_for_revision' ? 'أُعيد للتعديل' :
                             rec.decision === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                          </span>
                        </div>
                        {rec.reviewerStaffNameAr && (
                          <div className="text-slate-500 mt-0.5">
                            المعتمد: <strong>{rec.reviewerStaffNameAr}</strong> {rec.decisionTimestamp && `(${rec.decisionTimestamp})`}
                          </div>
                        )}
                        {rec.comments && (
                          <div className="mt-1 text-slate-700 bg-white p-2 rounded border border-slate-200">
                            ملاحظات المعتمد: {rec.comments}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {selectedPr.status === 'submitted_pending_approval' && (
                    <>
                      <button
                        onClick={() => handleOpenApprovalModal('approved')}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>اعتماد الطلب (Approve)</span>
                      </button>

                      <button
                        onClick={() => handleOpenApprovalModal('returned_for_revision')}
                        className="flex items-center gap-1.5 px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold rounded-lg border border-orange-200 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>إعادة للتعديل (Return for Revision)</span>
                      </button>

                      <button
                        onClick={() => handleOpenApprovalModal('rejected')}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg border border-red-200 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>رفض الطلب (Reject)</span>
                      </button>
                    </>
                  )}

                  {selectedPr.status === 'returned_for_revision' && (
                    <button
                      onClick={handleOpenResubmitModal}
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>تعديل الكميات وإعادة التقديم (Edit & Resubmit)</span>
                    </button>
                  )}

                  {selectedPr.status === 'approved' && (
                    <button
                      onClick={() => onNavigateToSourcing(selectedPr.lines.map(l => l.id))}
                      className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <Layers className="w-4 h-4" />
                      <span>تجميع في منافسة وطرح (Consolidate to RFQ)</span>
                    </button>
                  )}
                </div>

                <span className="text-[11px] text-slate-400">
                  معرف السجل: {selectedPr.id}
                </span>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              اختر طلب شراء من القائمة لعرض تفاصيله وبنوده.
            </div>
          )}
        </div>

      </div>

      {/* CREATE PR MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-4 text-right">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>إنشاء طلب شراء خارجي جديد (New Purchase Requisition)</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">القسم الطالب:</label>
                  <select
                    value={newPrDept}
                    onChange={(e) => {
                      setNewPrDept(e.target.value);
                      const name = e.target.value === 'ICU' ? 'العناية المركزة (ICU)' :
                                   e.target.value === 'ER' ? 'طوارئ الحوادث والإصابات (ER)' :
                                   e.target.value === 'OR' ? 'غرف العمليات (OR)' :
                                   e.target.value === 'BIOMEDICAL' ? 'الهندسة الطبية الحيوية' : 'أجنحة التنويم';
                      setNewPrDeptNameAr(name);
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="ICU">العناية المركزة (ICU)</option>
                    <option value="ER">طوارئ الحوادث والإصابات (ER)</option>
                    <option value="OR">غرف العمليات الجراحية (OR)</option>
                    <option value="BIOMEDICAL">الهندسة الطبية الحيوية (Biomedical)</option>
                    <option value="WARDS">أجنحة التنويم العامة (Wards)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">الأولوية:</label>
                  <select
                    value={newPrPriority}
                    onChange={(e) => setNewPrPriority(e.target.value as RequisitionPriority)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="routine">روتيني (Routine)</option>
                    <option value="urgent">عاجل سريرياً (Urgent)</option>
                    <option value="stat_emergency">طارئ إنقاذ حياة (STAT Emergency)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">التاريخ المطلوب للتسليم:</label>
                  <input
                    type="date"
                    value={newPrRequiredDate}
                    onChange={(e) => setNewPrRequiredDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">مبررات الاحتياج والمسوغات السريرية:</label>
                <textarea
                  rows={2}
                  value={newPrJustification}
                  onChange={(e) => setNewPrJustification(e.target.value)}
                  placeholder="بيان سبب طلب الشراء الخارجي، معدل الاستهلاك المتوقع، وتأثيره على رعاية المرضى..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>

              {/* Lines Form */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800">بنود المستلزمات والأصناف:</span>
                  <button
                    type="button"
                    onClick={handleAddLineToNewPr}
                    className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة بند آخر</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {newPrLines.map((line, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">البند #{idx + 1}</span>
                        {newPrLines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLineFromNewPr(idx)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            حذف
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2">
                          <label className="text-[11px] text-slate-500 block mb-0.5">الصنف من الدليل الطبي:</label>
                          <select
                            value={line.catalogItemId}
                            onChange={(e) => handleSelectCatalogItem(idx, e.target.value)}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs"
                          >
                            {catalogItems.map(item => (
                              <option key={item.id} value={item.id}>
                                {item.genericNameAr} ({item.itemCode})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-500 block mb-0.5">الكمية المطلوبة:</label>
                          <input
                            type="number"
                            min="1"
                            value={line.requestedQuantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              setNewPrLines(prev => prev.map((l, i) => i === idx ? { ...l, requestedQuantity: val } : l));
                            }}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs font-mono font-bold"
                          />
                        </div>
                      </div>

                      {/* Stock Alert if Available */}
                      {line.internalStockAvailable > 0 && (
                        <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>
                            تنبيه: يتوفر <strong>{line.internalStockAvailable}</strong> علبة بالمستودع المركزي. يمكنك تقليل الكمية أو إنشاء طلب صرف داخلي.
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  تقديم طلب الشراء للاعتماد
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* APPROVAL DECISION MODAL */}
      {isApprovalModalOpen && selectedPr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4 text-right">
            
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {approvalDecision === 'approved' ? 'اعتماد طلب الشراء رسمياً' :
                 approvalDecision === 'returned_for_revision' ? 'إعادة طلب الشراء للتعديل' :
                 'رفض طلب الشراء'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                الطلب: <span className="font-mono font-bold text-slate-800">{selectedPr.requisitionNumber}</span> - قسم {selectedPr.requestingDepartmentNameAr}
              </p>
            </div>

            {approvalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {approvalError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                {approvalDecision === 'approved'
                  ? 'سيتم اعتماد الكميات المطلوبة وإتاحتها لمسؤولي المشتريات لتجميعها وطرحها في منافسات الأسعار.'
                  : approvalDecision === 'returned_for_revision'
                  ? 'يرجى كتابة الملاحظات والأسباب المطلوب من القسم الطالب تعديلها (مثل تخفيض الكمية أو تبرير الحاجة).'
                  : 'يرجى تدوين الأسباب المبررة لرفض الطلب بشكل نهائي.'}
              </p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  الملاحظات والمسوغات {approvalDecision !== 'approved' && <span className="text-red-500">*</span>}:
                </label>
                <textarea
                  rows={3}
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  placeholder={approvalDecision === 'approved' ? 'ملاحظات الاعتماد (اختياري)...' : 'أسباب الإعادة أو الرفض بالتفصيل...'}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsApprovalModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleExecuteApproval}
                className={`px-4 py-2 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer ${
                  approvalDecision === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  approvalDecision === 'returned_for_revision' ? 'bg-orange-600 hover:bg-orange-700' :
                  'bg-red-600 hover:bg-red-700'
                }`}
              >
                تأكيد القرار
              </button>
            </div>

          </div>
        </div>
      )}

      {/* RESUBMIT MODAL (PROC06) */}
      {isResubmitModalOpen && selectedPr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl border border-slate-200 space-y-4 text-right">
            
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                تعديل بنود الطلب وإعادة التقديم (Edit & Resubmit PR)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تعديل الكميات المطلوبة استجابة لملاحظات المعتمد مع حفظ سجل المراجعة السابق.
              </p>
            </div>

            {/* Display Previous Reviewer Comments */}
            {selectedPr.approvalHistory.some(a => a.comments) && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-900">
                <span className="font-bold block mb-1">ملاحظات المعتمد السابقة:</span>
                <p className="text-orange-800">
                  {selectedPr.approvalHistory.filter(a => a.comments).pop()?.comments}
                </p>
              </div>
            )}

            <div className="space-y-3 text-xs max-h-[350px] overflow-y-auto pr-1">
              {editingLines.map((line, idx) => (
                <div key={line.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <h5 className="font-bold text-slate-900">{line.itemDescriptionAr}</h5>
                    <span className="font-mono text-[10px] text-slate-400">{line.itemCode}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">الكمية المعدلة:</span>
                    <input
                      type="number"
                      min="1"
                      value={line.requestedQuantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setEditingLines(prev => prev.map((l, i) => i === idx ? { ...l, requestedQuantity: val } : l));
                      }}
                      className="w-20 p-1.5 bg-white border border-slate-200 rounded font-mono font-bold text-xs text-center"
                    />
                    <span className="text-slate-600">{line.requestedUom}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsResubmitModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleExecuteResubmit}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                إعادة التقديم للاعتماد (Resubmit)
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
