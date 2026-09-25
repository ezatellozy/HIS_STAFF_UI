import React from 'react';
import { 
  FileText, 
  Layers, 
  ShoppingCart, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Building,
  PackageCheck,
  Plus
} from 'lucide-react';
import { 
  PurchaseRequisition, 
  SourcingEvent, 
  PurchaseOrder, 
  SupplierClaim,
  FrameworkAgreement,
  ProcurementBranchId
} from '../../types/procurementOps';

interface OverviewPlanningProps {
  requisitions: PurchaseRequisition[];
  sourcingEvents: SourcingEvent[];
  purchaseOrders: PurchaseOrder[];
  supplierClaims: SupplierClaim[];
  agreements: FrameworkAgreement[];
  currentBranch: ProcurementBranchId;
  onNavigateTab: (tab: string) => void;
  onOpenNewPr: () => void;
}

export const ProcurementOverviewPlanningView: React.FC<OverviewPlanningProps> = ({
  requisitions,
  sourcingEvents,
  purchaseOrders,
  supplierClaims,
  agreements,
  currentBranch,
  onNavigateTab,
  onOpenNewPr
}) => {
  // Compute metric numbers
  const pendingApprovals = requisitions.filter(r => r.status === 'submitted_pending_approval');
  const urgentRequisitions = requisitions.filter(r => r.priority === 'urgent' || r.priority === 'stat_emergency');
  const openSourcing = sourcingEvents.filter(s => s.status !== 'awarded' && s.status !== 'cancelled');
  const activePOs = purchaseOrders.filter(p => p.documentStatus === 'approved');
  const partiallyReceivedPOs = purchaseOrders.filter(p => p.fulfillmentStatus === 'partially_received');
  const openClaims = supplierClaims.filter(c => c.status !== 'commercially_resolved');

  // Total procurement committed value
  const totalCommittedValueSar = purchaseOrders
    .filter(p => p.documentStatus === 'approved')
    .reduce((acc, p) => acc + p.totalAmountSar, 0);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Welcome & Planning Context Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
              لوحة التخطيط والعمليات الشرائية الموحدة
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
              خطة المشتريات السنوية 2026
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            نظرة عامة على المشتريات وسلاسل التوريد بالمستشفى
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            متابعة تجميع الاحتياج، إدارة المنافسات، ترسية العروض، وأوامر الشراء ومطالبات الموردين التجارية.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenNewPr}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء طلب شراء خارجي جديد (New PR)</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Requisitions */}
        <div 
          onClick={() => onNavigateTab('requisitions')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">طلبات الشراء (PRs)</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{requisitions.length}</span>
            <span className="text-xs text-slate-500 font-medium">طلباً مسجلاً</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-amber-600 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {pendingApprovals.length} بانتظار الاعتماد
            </span>
            {urgentRequisitions.length > 0 && (
              <span className="text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded text-[10px]">
                {urgentRequisitions.length} عاجل
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Sourcing & Tenders */}
        <div 
          onClick={() => onNavigateTab('intake_sourcing')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">المنافسات وعروض الأسعار</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{sourcingEvents.length}</span>
            <span className="text-xs text-slate-500 font-medium">منافسة وطرح</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-indigo-600 font-medium">
              {openSourcing.length} جارية ومطروحة
            </span>
            <span className="text-slate-400 text-[10px]">RFQ & ITB</span>
          </div>
        </div>

        {/* Card 3: Purchase Orders */}
        <div 
          onClick={() => onNavigateTab('purchase_orders')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">أوامر الشراء المعتمدة (POs)</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{activePOs.length}</span>
            <span className="text-xs text-slate-500 font-medium">أمر شراء نشط</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-teal-600 font-medium flex items-center gap-1">
              <PackageCheck className="w-3 h-3" />
              {partiallyReceivedPOs.length} استلام جزئي بالرصيف
            </span>
            <span className="font-mono text-[10px] text-slate-500 font-bold">
              {(totalCommittedValueSar ?? 0).toLocaleString()} SAR
            </span>
          </div>
        </div>

        {/* Card 4: Claims & Exceptions */}
        <div 
          onClick={() => onNavigateTab('claims_exceptions')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">المطالبات ومردودات الموردين</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{supplierClaims.length}</span>
            <span className="text-xs text-slate-500 font-medium">مطالبة تجارية</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-amber-700 font-medium">
              {openClaims.length} قيد المتابعة مع المورد
            </span>
            <span className="text-emerald-700 text-[10px] font-semibold">بضائع تعويضية/إشعار دائن</span>
          </div>
        </div>

      </div>

      {/* Two Column Layout: Operational Worklists & Planning Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Actionable Items & Priority Queue */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Action Queue: Pending Requisitions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  طلبات الشراء العاجلة وبانتظار الاعتماد (Pending Approvals)
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('requisitions')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>عرض الكل</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {pendingApprovals.slice(0, 4).map(pr => (
                <div key={pr.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{pr.requisitionNumber}</span>
                      <span className="text-xs font-semibold text-slate-700">{pr.requestingDepartmentNameAr}</span>
                      {pr.priority === 'urgent' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                          عاجل ER
                        </span>
                      )}
                      {pr.priority === 'routine' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                          روتيني
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {pr.businessJustificationAr}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400">
                      <span>طالب الشراء: {pr.requesterNameAr}</span>
                      <span>التقدير المالي: {(pr.estimatedTotalValueSar ?? 0).toLocaleString()} SAR</span>
                      <span>التاريخ المطلوب: {pr.requiredDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <button
                      onClick={() => onNavigateTab('requisitions')}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                    >
                      مراجعة واعتماد
                    </button>
                  </div>
                </div>
              ))}
              {pendingApprovals.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  لا توجد طلبات شراء معلقة بانتظار الاعتماد حالياً.
                </div>
              )}
            </div>
          </div>

          {/* Active Framework Agreements Ceiling Tracker */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  الاتفاقيات الإطارية وعقود الشراء الموحد (Framework Agreements)
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('contracts')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>إدارة العقود</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-4">
              {agreements.map(agr => {
                const percent = Math.min(100, Math.round((agr.utilizedValueSar / agr.contractCeilingValueSar) * 100));
                return (
                  <div key={agr.id} className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                      <div>
                        <span className="font-mono text-xs font-bold text-indigo-900">{agr.contractNumber}</span>
                        <h4 className="text-xs font-bold text-slate-800">{agr.titleAr}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold self-start ${
                        agr.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {agr.status === 'active' ? 'عقد نشط' : 'قارب على الانتهاء'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                      <span>المورد: {agr.supplierNameAr}</span>
                      <span className="font-mono font-semibold">
                        المستهلك: {(agr.utilizedValueSar ?? 0).toLocaleString()} من {(agr.contractCeilingValueSar ?? 0).toLocaleString()} SAR ({percent}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          percent > 85 ? 'bg-amber-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Col: Planned vs Unplanned Purchasing & Policy Rules */}
        <div className="space-y-4">
          
          {/* Institutional Procurement Policy Card */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs border border-slate-800">
            <div className="flex items-center gap-2 mb-3 text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                سياسة الشراء وضوابط الصلاحيات (DoA)
              </h3>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              تخضع مشتريات المستشفى لضوابط الاعتماد المالي وفق اللائحة المؤسسية المعتمدة لعام 2026:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">الشراء المباشر (Direct):</span>
                <span className="font-mono font-bold text-slate-200">حتى 15,000 SAR</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">منافسة عروض (RFQ):</span>
                <span className="font-mono font-bold text-slate-200">3 عروض على الأقل</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">طرح عام ومنافسة كبرى:</span>
                <span className="font-mono font-bold text-slate-200">&gt; 150,000 SAR</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">ضريبة القيمة المضافة:</span>
                <span className="font-mono font-bold text-indigo-300">15% ZATCA</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>موافقة مسبقة على الشراء الطارئ مع تدقيق لاحق.</span>
            </div>
          </div>

          {/* Planned vs Unplanned Tracker */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">
                المشتريات المخططة مقابل الطارئة
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>مشتريات دورية ومجدولة (Planned)</span>
                  <span className="font-bold text-slate-800">84%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-600 h-full rounded-full" style={{ width: '84%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>شراء استثنائي وطارئ (Emergency)</span>
                  <span className="font-bold text-slate-800">16%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '16%' }} />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-4 leading-normal bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              يتم تشجيع الأقسام السريرية على الاستفادة من عقود التوريد الإطارية الموحدة (نوبكو) لتفادي طلبات الشراء العاجلة خارج الدليل.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
