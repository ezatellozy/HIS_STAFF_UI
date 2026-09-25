import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Plus, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  FileText, 
  DollarSign, 
  Package, 
  Building,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { SupplierClaim, ClaimType, ClaimStatus } from '../../types/procurementOps';

interface SupplierClaimsWorkspaceProps {
  claims: SupplierClaim[];
  activeRole: string;
  onUpdateClaimStatus: (claimId: string, nextStatus: ClaimStatus, resolutionNote?: string) => void;
  onCreateNewClaim: (claimData: any) => void;
}

export const SupplierClaimsWorkspace: React.FC<SupplierClaimsWorkspaceProps> = ({
  claims,
  activeRole,
  onUpdateClaimStatus,
  onCreateNewClaim
}) => {
  const [selectedClaimId, setSelectedClaimId] = useState<string>(claims[0]?.id || '');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isNewClaimModalOpen, setIsNewClaimModalOpen] = useState<boolean>(false);

  // New Claim Form State
  const [claimPoNumber, setClaimPoNumber] = useState<string>('PO-2026-003');
  const [claimSupplierName, setClaimSupplierName] = useState<string>('شركة النخبة للتجهيزات الطبية (Elite Medical)');
  const [claimType, setClaimType] = useState<ClaimType>('replacement_goods');
  const [claimReason, setClaimReason] = useState<string>('تم رفض 10 علب قفازات جراحية لعدم تطابق رقم التشغيلة وتلف التغليف الخارجي أثناء فحص رصيف المستودع.');
  const [claimAmount, setClaimAmount] = useState<number>(2070);

  const selectedClaim = claims.find(c => c.id === selectedClaimId);

  const filteredClaims = claims.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const claimNum = `CLM-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newClaim = {
      claimNumber: claimNum,
      purchaseOrderId: 'PO-2026-003',
      purchaseOrderNumber: claimPoNumber,
      supplierId: 'SUP-002',
      supplierNameAr: claimSupplierName,
      claimType,
      status: 'submitted_to_supplier' as ClaimStatus,
      financialImpactSar: claimAmount,
      currency: 'SAR',
      problemDescriptionAr: claimReason,
      problemDescriptionEn: 'Defective goods rejected during dock receiving inspection.',
      dockInspectionReportRef: 'QA-REJ-2026-001',
      submittedAt: '2026-09-21'
    };

    onCreateNewClaim(newClaim);
    setIsNewClaimModalOpen(false);
    setSelectedClaimId(`CLM-${claimNum}`);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>المطالبات التجارية ومردودات الموردين (Supplier Claims & Exceptions)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            متابعة البضائع المرفوضة بالجودة برصيف المستودع، المطالبة بالتعويض أو إشعار دائن (Credit Note)، ومراقبة حل النزاعات.
          </p>
        </div>

        <button
          onClick={() => setIsNewClaimModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>تسجيل مطالبة تجارية جديدة (New Claim)</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          
          {/* Status filter */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex gap-1 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg font-semibold ${statusFilter === 'all' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              الكل ({claims.length})
            </button>
            <button
              onClick={() => setStatusFilter('submitted_to_supplier')}
              className={`px-3 py-1 rounded-lg font-semibold ${statusFilter === 'submitted_to_supplier' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              مقدمة للمورد
            </button>
            <button
              onClick={() => setStatusFilter('commercially_resolved')}
              className={`px-3 py-1 rounded-lg font-semibold ${statusFilter === 'commercially_resolved' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              تمت التسوية
            </button>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredClaims.map(claim => {
              const isSelected = claim.id === selectedClaimId;
              return (
                <div
                  key={claim.id}
                  onClick={() => setSelectedClaimId(claim.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/50 border-amber-500 shadow-xs ring-1 ring-amber-500/30'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900">{claim.claimNumber}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      claim.status === 'commercially_resolved' ? 'bg-emerald-100 text-emerald-800' :
                      claim.status === 'supplier_acknowledged' ? 'bg-blue-100 text-blue-800' :
                      claim.status === 'replacement_shipped' ? 'bg-purple-100 text-purple-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {claim.status === 'commercially_resolved' ? 'تمت التسوية بنجاح' :
                       claim.status === 'supplier_acknowledged' ? 'المورد وافق على التعويض' :
                       claim.status === 'replacement_shipped' ? 'البضاعة البديلة في الطريق' :
                       'مقدمة للمورد بانتظار الرد'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 mt-1">{claim.supplierNameAr}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{claim.problemDescriptionAr}</p>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-mono">أمر الشراء: {claim.purchaseOrderNumber}</span>
                    <span className="font-mono font-bold text-amber-900">{(claim.financialImpactSar ?? 0).toLocaleString()} SAR</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Detail (7 cols) */}
        <div className="lg:col-span-7">
          {selectedClaim ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5">
              
              {/* Top Details */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-slate-900">{selectedClaim.claimNumber}</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                      {selectedClaim.claimType === 'replacement_goods' ? 'مطالبة بتوريد بضاعة بديلة مطابقة' :
                       selectedClaim.claimType === 'credit_note' ? 'مطالبة بإشعار دائن مالي (Credit Note)' :
                       'استرداد مالي مباشر'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">المورد: {selectedClaim.supplierNameAr}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
                    <span>أمر الشراء الأصلي: <strong className="font-mono text-slate-800">{selectedClaim.purchaseOrderNumber}</strong></span>
                    <span>تقرير الرفض بالجودة: <strong className="font-mono text-slate-800">{selectedClaim.dockInspectionReportRef || 'QA-DOCK-REF'}</strong></span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-left shrink-0">
                  <span className="text-[10px] text-slate-400 font-semibold block">الأثر المالي للمطالبة</span>
                  <span className="font-mono text-lg font-bold text-amber-800">
                    {(selectedClaim.financialImpactSar ?? 0).toLocaleString()} SAR
                  </span>
                  <span className="text-[10px] text-slate-500 block">شامل الضريبة</span>
                </div>
              </div>

              {/* Problem Description */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                <span className="font-bold text-slate-800 block mb-1">بيان الخلل وملاحظات فحص الرصيف:</span>
                <p className="text-slate-700 leading-relaxed">{selectedClaim.problemDescriptionAr}</p>
              </div>

              {/* Status Stepper Progression */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">
                  مراحل معالجة المطالبة التجارية مع المورد (Claim Progression)
                </h4>

                <div className="space-y-2 text-xs">
                  {[
                    { id: 'submitted_to_supplier', label: 'تقديم المطالبة رسمياً للمورد وإرفاق محضر الرفض' },
                    { id: 'supplier_acknowledged', label: 'إقرار المورد بالمسؤولية والموافقة على التعويض' },
                    { id: 'replacement_shipped', label: 'شحن البضاعة البديلة أو إصدار إشعار الدائن' },
                    { id: 'commercially_resolved', label: 'اكتمال التسوية التجارية وإغلاق المطالبة بالمالية' }
                  ].map((step, idx) => {
                    const isPassed = 
                      (selectedClaim.status === 'commercially_resolved') ||
                      (selectedClaim.status === 'replacement_shipped' && idx <= 2) ||
                      (selectedClaim.status === 'supplier_acknowledged' && idx <= 1) ||
                      (selectedClaim.status === 'submitted_to_supplier' && idx === 0);

                    return (
                      <div key={step.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                          isPassed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {idx + 1}
                        </div>
                        <span className={`flex-1 ${isPassed ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resolution Action Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  تاريخ التقديم: {selectedClaim.submittedAt}
                </span>

                {selectedClaim.status !== 'commercially_resolved' ? (
                  <button
                    onClick={() => {
                      const next = selectedClaim.status === 'submitted_to_supplier' ? 'supplier_acknowledged' :
                                   selectedClaim.status === 'supplier_acknowledged' ? 'replacement_shipped' :
                                   'commercially_resolved';
                      onUpdateClaimStatus(selectedClaim.id, next, 'تمت التسوية وتأكيد استلام التعويض التجاري.');
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {selectedClaim.status === 'submitted_to_supplier' ? 'تسجيل موافقة المورد على التعويض' :
                       selectedClaim.status === 'supplier_acknowledged' ? 'تسجيل شحن البضاعة البديلة' :
                       'إغلاق وتسوية المطالبة نهائياً'}
                    </span>
                  </button>
                ) : (
                  <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تمت التسوية التجارية بالكامل</span>
                  </span>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              اختر مطالبة تجارية لعرض تفاصيلها.
            </div>
          )}
        </div>

      </div>

      {/* NEW CLAIM MODAL */}
      {isNewClaimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4 text-right">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>تسجيل مطالبة تجارية بحق مورد (New Supplier Claim)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                إنشاء مطالبة رسمية استناداً إلى بضائع مرفوضة عند استلام رصيف المستودع.
              </p>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">أمر الشراء المرتبط:</label>
                  <input
                    type="text"
                    value={claimPoNumber}
                    onChange={(e) => setClaimPoNumber(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">نوع المطالبة:</label>
                  <select
                    value={claimType}
                    onChange={(e) => setClaimType(e.target.value as ClaimType)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="replacement_goods">بضاعة بديلة مطابقة (Replacement)</option>
                    <option value="credit_note">إشعار دائن مالي (Credit Note)</option>
                    <option value="financial_deduction">خصم من مستحقات قائمة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">اسم المورد:</label>
                <input
                  type="text"
                  value={claimSupplierName}
                  onChange={(e) => setClaimSupplierName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">القيمة المالية المقدرة (SAR):</label>
                <input
                  type="number"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">بيان سبب الرفض والمطالبة:</label>
                <textarea
                  rows={3}
                  value={claimReason}
                  onChange={(e) => setClaimReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewClaimModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  تقديم المطالبة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
