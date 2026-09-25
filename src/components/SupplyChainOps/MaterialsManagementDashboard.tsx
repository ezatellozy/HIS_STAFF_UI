import React from 'react';
import {
  Boxes,
  ClipboardList,
  Truck,
  ShieldAlert,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  Warehouse,
  CheckCircle2,
  Clock,
  Layers,
  FileSpreadsheet,
  AlertOctagon,
  Eye,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import {
  ItemMasterRecord,
  StorageLocation,
  PhysicalStockBalance,
  DepartmentalRequisition,
  GoodsReceiptRecord,
  SupplyRecallRecord,
  InterLocationTransfer,
  DepartmentParLevel,
  SupplyChainViewTab
} from '../../types/supplyChainOps';

interface MaterialsManagementDashboardProps {
  catalogItems: ItemMasterRecord[];
  locations: StorageLocation[];
  stockBalances: PhysicalStockBalance[];
  requisitions: DepartmentalRequisition[];
  goodsReceipts: GoodsReceiptRecord[];
  recalls: SupplyRecallRecord[];
  transfers: InterLocationTransfer[];
  parLevels: DepartmentParLevel[];
  onNavigateTab: (tab: SupplyChainViewTab) => void;
  onOpenScenarioModal: () => void;
}

export const MaterialsManagementDashboard: React.FC<MaterialsManagementDashboardProps> = ({
  catalogItems,
  locations,
  stockBalances,
  requisitions,
  goodsReceipts,
  recalls,
  transfers,
  parLevels,
  onNavigateTab,
  onOpenScenarioModal
}) => {
  // Aggregate statistics
  const totalItemsCount = catalogItems.length;
  const activeLocationsCount = locations.length;
  
  const pendingRequisitionsCount = requisitions.filter(
    r => r.approvalStatus === 'submitted' || r.fulfillmentStatus === 'not_started' || r.fulfillmentStatus === 'allocated' || r.fulfillmentStatus === 'picking'
  ).length;

  const urgentRequisitions = requisitions.filter(
    r => r.priority === 'urgent' || r.priority === 'stat'
  );

  const pendingReceiptsCount = goodsReceipts.filter(
    g => g.inspectionStatus === 'received_uninspected' || g.putAwayStatus === 'pending_putaway' || g.putAwayStatus === 'staged_dock'
  ).length;

  const quarantinedUnitsTotal = stockBalances.reduce((acc, curr) => acc + curr.quarantined, 0);
  const activeRecallsCount = recalls.filter(r => r.notificationStatus !== 'closed').length;
  const inTransitTransfersCount = transfers.filter(t => t.status === 'in_transit').length;
  const criticalParItems = parLevels.filter(p => p.reviewStatus === 'below_min_reorder' || p.reviewStatus === 'critical_stockout');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Controls & Quick Scenario Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>لوحة القيادة والعمليات اللوجستية العامة</span>
              <span className="text-xs font-mono font-normal text-amber-400 bg-amber-950/70 border border-amber-800/80 px-2 py-0.5 rounded-full">
                Materials Management
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              المتابعة اللحظية لتدفق المستلزمات الطبية، الاستلام، التجهيز، الصرف، والحجر الوقائي بالمستشفى.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onOpenScenarioModal()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>تشغيل سيناريوهات التدقيق (I01–I30)</span>
          </button>

          <button
            onClick={() => onNavigateTab('requisitions')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            <ClipboardList className="w-3.5 h-3.5 text-teal-400" />
            <span>طلب إمداد جديد</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Ribbons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Catalog Items */}
        <div
          onClick={() => onNavigateTab('catalog')}
          className="bg-slate-900/70 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 p-3.5 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>دليل المواد العام</span>
            <Boxes className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{totalItemsCount}</div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">100%</span>
            <span>موصوفة ومصنفة</span>
          </div>
        </div>

        {/* Metric 2: Pending Requisitions */}
        <div
          onClick={() => onNavigateTab('requisitions')}
          className="bg-slate-900/70 hover:bg-slate-850 border border-slate-800 hover:border-teal-500/40 p-3.5 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>طلبات قيد التجهيز</span>
            <ClipboardList className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono text-teal-300">{pendingRequisitionsCount}</div>
          <div className="text-[10px] text-slate-400 mt-1">
            منها <span className="text-amber-400 font-bold">{urgentRequisitions.length}</span> عاجل / طوارئ
          </div>
        </div>

        {/* Metric 3: Dock Inbound Receipts */}
        <div
          onClick={() => onNavigateTab('receiving')}
          className="bg-slate-900/70 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 p-3.5 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>واردات الرصيف</span>
            <ArrowDownLeft className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-300">{pendingReceiptsCount}</div>
          <div className="text-[10px] text-slate-400 mt-1">بانتظار الفحص / التخزين</div>
        </div>

        {/* Metric 4: Quarantined Lots */}
        <div
          onClick={() => onNavigateTab('stock_ledger')}
          className="bg-slate-900/70 hover:bg-slate-850 border border-slate-800 hover:border-red-500/40 p-3.5 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>وحدات في الحجر</span>
            <ShieldAlert className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-400">{quarantinedUnitsTotal}</div>
          <div className="text-[10px] text-red-300/80 mt-1">معزولة تماماً من الصرف</div>
        </div>

        {/* Metric 5: Active Recalls */}
        <div
          onClick={() => onNavigateTab('recalls')}
          className="bg-slate-900/70 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 p-3.5 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>تنبيهات الاستدعاء</span>
            <AlertOctagon className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{activeRecallsCount}</div>
          <div className="text-[10px] text-slate-400 mt-1">سحب دفعة (SFDA Alert)</div>
        </div>

        {/* Metric 6: Transfers In Transit */}
        <div
          onClick={() => onNavigateTab('transfers')}
          className="bg-slate-900/70 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/40 p-3.5 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>نقل بين الفروع</span>
            <Truck className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-300">{inTransitTransfersCount}</div>
          <div className="text-[10px] text-slate-400 mt-1">شاحنة في الطريق</div>
        </div>
      </div>

      {/* Main Grid: Urgent Tasks & Safety Triage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 & 2: Urgent Requisitions & Dock Queue */}
        <div className="lg:col-span-2 space-y-6">
          {/* Urgent / Routine Requisitions Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white">طلبات الإمداد النشطة للأقسام السريرية</h3>
              </div>
              <button
                onClick={() => onNavigateTab('requisitions')}
                className="text-xs text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>عرض الكل ({requisitions.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {requisitions.map(req => {
                const isUrgent = req.priority === 'urgent' || req.priority === 'stat';
                return (
                  <div
                    key={req.id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      isUrgent
                        ? 'bg-red-950/30 border-red-800/60 text-red-200'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white">{req.requisitionNumber}</span>
                        {isUrgent ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white animate-pulse">
                            عاجل / STAT
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300">
                            روتيني
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400 font-medium">📍 {req.requestingDepartment}</span>
                      </div>
                      <p className="text-xs text-slate-300">{req.clinicalPurpose}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                        <span>مقدم الطلب: {req.requestingActorName}</span>
                        <span>•</span>
                        <span>{req.lines.length} أسطر مواد</span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-1 shrink-0">
                      <span className={`text-[11px] px-2 py-0.5 rounded font-mono font-bold ${
                        req.fulfillmentStatus === 'picking'
                          ? 'bg-amber-900/60 text-amber-200 border border-amber-700'
                          : req.fulfillmentStatus === 'dispatched'
                          ? 'bg-blue-900/60 text-blue-200 border border-blue-700'
                          : 'bg-teal-900/60 text-teal-200 border border-teal-700'
                      }`}>
                        {req.fulfillmentStatus === 'picking' && 'جاري التجهيز (Picking)'}
                        {req.fulfillmentStatus === 'dispatched' && 'تم الصرف - مع السائق'}
                        {req.fulfillmentStatus === 'allocated' && 'تم تخصيص المخزون'}
                      </span>

                      <button
                        onClick={() => onNavigateTab('picking')}
                        className="text-xs font-bold text-teal-400 hover:text-teal-300 cursor-pointer mt-1"
                      >
                        فتح أمر التجهيز &larr;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inbound Receipts & Inspection Queue */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">واردات رصيف الاستلام والتفتيش الفني المركزي</h3>
              </div>
              <button
                onClick={() => onNavigateTab('receiving')}
                className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>شاشة الاستلام &larr;</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {goodsReceipts.map(rcv => (
                <div
                  key={rcv.id}
                  className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">{rcv.receiptReference}</span>
                      <span className="text-slate-400 font-mono">({rcv.poNumber})</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rcv.inspectionStatus === 'accepted'
                          ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-800'
                          : rcv.inspectionStatus === 'quarantined'
                          ? 'bg-red-900/60 text-red-300 border border-red-800'
                          : 'bg-amber-900/60 text-amber-300 border border-amber-800'
                      }`}>
                        {rcv.inspectionStatus === 'accepted' && 'مقبول فحصاً (Accepted)'}
                        {rcv.inspectionStatus === 'quarantined' && 'محجور للتلف (Quarantined)'}
                        {rcv.inspectionStatus === 'received_uninspected' && 'بانتظار الفحص الفني (Pending QA)'}
                      </span>
                    </div>
                    <div className="text-slate-300">المورد: {rcv.vendorName}</div>
                    <div className="text-slate-400 text-[11px] font-mono">
                      الكمية المستلمة: {rcv.receivedQty} {rcv.uom} | التشغيلة: {rcv.lotNumber || 'غير محددة'}
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <div className="text-[11px] text-slate-400 font-mono">{rcv.receivedAt}</div>
                    <span className="text-[11px] text-blue-400 font-bold">
                      {rcv.putAwayStatus === 'staged_dock' && 'على الرصيف بانتظار الرف'}
                      {rcv.putAwayStatus === 'pending_putaway' && 'قيد الفحص'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: Safety Holds, Recalls & Par Stockout Warnings */}
        <div className="space-y-6">
          {/* Active SFDA Recall Triage Card */}
          <div className="bg-amber-950/40 border border-amber-600/40 rounded-2xl p-4.5 shadow-sm">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-amber-800/60">
              <AlertOctagon className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-amber-200">تنبيه استدعاء رسمي (SFDA Recall)</h3>
            </div>

            {recalls.map(rec => (
              <div key={rec.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white bg-amber-900/80 px-2 py-0.5 rounded border border-amber-700">
                    {rec.recallReference}
                  </span>
                  <span className="text-[10px] font-bold text-red-300 bg-red-950 px-2 py-0.5 rounded border border-red-800">
                    عاجل - الدرجة الثانية
                  </span>
                </div>

                <p className="text-xs text-amber-100 font-medium leading-relaxed">
                  {rec.recallReasonAr}
                </p>

                <div className="bg-black/30 p-2.5 rounded-xl border border-amber-900/40 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span>التشغيلة المحظورة:</span>
                    <span className="text-red-400 font-bold">{rec.affectedLotNumbers.join(', ')}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>الوحدات المحجورة بالمستودع:</span>
                    <span className="text-amber-300 font-bold">{rec.totalUnitsQuarantined} حبة</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>متبقي مسح الأجنحة:</span>
                    <span className="text-amber-400 font-bold">20 حبة (Ward 4A)</span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateTab('recalls')}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer text-center block"
                >
                  إدارة الاستدعاء وحظر التشغيلة &larr;
                </button>
              </div>
            ))}
          </div>

          {/* Critical Par Alerts (< Min Par) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-bold text-white">تنبيهات نقص مخزون الأجنحة (Par Deficits)</h3>
              </div>
            </div>

            <div className="space-y-2.5">
              {criticalParItems.map(par => (
                <div
                  key={par.id}
                  className="p-3 rounded-xl bg-red-950/20 border border-red-900/40 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{par.departmentNameAr}</span>
                    <span className="text-[10px] text-red-400 bg-red-950 px-2 py-0.5 rounded font-mono font-bold">
                      أقل من الحد الأدنى
                    </span>
                  </div>
                  <div className="text-slate-300 font-mono text-[11px]">
                    الرصيد المتاح: <span className="text-red-400 font-bold">{par.currentAvailableQty}</span> / الحد الأدنى {par.minParQty} (الهدف {par.targetParQty})
                  </div>
                  <div className="text-teal-400 text-[11px]">
                    الكمية المقترحة لإعادة التعبئة: <span className="font-bold font-mono">+{par.suggestedReorderQty} {par.uom}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
