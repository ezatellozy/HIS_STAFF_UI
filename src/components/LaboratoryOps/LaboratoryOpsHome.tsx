import React from 'react';
import {
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Cpu,
  FlaskConical,
  Layers,
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  Eye,
  Microscope,
  FileText,
  Truck
} from 'lucide-react';
import {
  IncomingLabOrder,
  LabSpecimen,
  LabAccession,
  MicrobiologyCase,
  PathologyCase,
  InstrumentOperationalStatus
} from '../../types/laboratoryOps';

interface LaboratoryOpsHomeProps {
  orders: IncomingLabOrder[];
  specimens: LabSpecimen[];
  accessions: LabAccession[];
  microCases: MicrobiologyCase[];
  pathCases: PathologyCase[];
  instruments: InstrumentOperationalStatus[];
  onSelectView: (view: string) => void;
  onPreviewAccession: (accession: LabAccession) => void;
  onPreviewSpecimen: (specimen: LabSpecimen) => void;
  onPreviewOrder: (order: IncomingLabOrder) => void;
  onOpenCriticalModal: (accession: LabAccession) => void;
}

export const LaboratoryOpsHome: React.FC<LaboratoryOpsHomeProps> = ({
  orders,
  specimens,
  accessions,
  microCases,
  pathCases,
  instruments,
  onSelectView,
  onPreviewAccession,
  onPreviewSpecimen,
  onPreviewOrder,
  onOpenCriticalModal
}) => {
  // Metric counts
  const pendingCollectionCount = specimens.filter(s => s.status === 'pending_collection').length;
  const inTransitOrAwaitingReceiptCount = specimens.filter(
    s => s.status === 'collected' || s.status === 'in_transit'
  ).length;
  const inProcessCount = accessions.filter(a => a.status === 'in_analysis').length + microCases.length;
  const awaitingTechValCount = accessions.filter(a => a.status === 'awaiting_tech_val').length;
  const awaitingClinicalValCount = accessions.filter(a => a.status === 'awaiting_clinical_val').length;
  const criticalItemsCount = accessions.filter(
    a =>
      a.tests.some(t => t.flag === 'critical_high' || t.flag === 'critical_low') &&
      a.criticalCommunication?.acknowledgementStatus !== 'acknowledged'
  ).length;
  const rejectedCount = specimens.filter(s => s.status === 'rejected').length;

  return (
    <div className="space-y-6 text-right font-['Cairo',sans-serif]">
      {/* Top Banner with Quick Context */}
      <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-teal-950 text-white p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-teal-400 font-bold text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping inline-block" />
            <span>لوحة القيادة والعمليات المركزية للمختبرات والأحياء الدقيقة والأنسجة</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white mt-1">
            Central Laboratory & Diagnostic Operational Command Center
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
            متابعة دقيقة لدورة حياة الفحص التشخيصي من لحظة إصدار الطلب، التحقق من العينات، التشغيل الآلي على الأجهزة، والتحقق الفني، وصولاً إلى اعتماد التقارير وإبلاغ القيم الحرجة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectView('demo_scenarios')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-lg shadow-teal-950/40 cursor-pointer transition-all hover:scale-102"
          >
            <Sparkles className="w-4 h-4" />
            <span>سيناريوهات الاختبار التفاعلية (Scenarios A - G)</span>
          </button>
        </div>
      </div>

      {/* Operational KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div
          onClick={() => onSelectView('collection_worklist')}
          className="p-3 bg-white rounded-xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>سحب معلق</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">{pendingCollectionCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Pending Collection</div>
        </div>

        <div
          onClick={() => onSelectView('reception')}
          className="p-3 bg-white rounded-xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>بانتظار الاستلام</span>
            <Layers className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">{inTransitOrAwaitingReceiptCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">In-Transit / Bench</div>
        </div>

        <div
          onClick={() => onSelectView('core_lab')}
          className="p-3 bg-white rounded-xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>قيد التحليل الآلي</span>
            <Cpu className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-xl font-black text-teal-700 mt-1">{inProcessCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">On Analyzers</div>
        </div>

        <div
          onClick={() => onSelectView('core_lab')}
          className="p-3 bg-white rounded-xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>تحقق فني معلق</span>
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-xl font-black text-indigo-700 mt-1">{awaitingTechValCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Awaiting Tech Val</div>
        </div>

        <div
          onClick={() => onSelectView('core_lab')}
          className="p-3 bg-white rounded-xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>اعتماد نهائي</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-700 mt-1">{awaitingClinicalValCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Ready for Release</div>
        </div>

        <div
          onClick={() => onSelectView('exceptions')}
          className="p-3 bg-red-50 rounded-xl border border-red-200 hover:border-red-400 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-red-700 font-bold">
            <span>تنبيهات حرجة</span>
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 animate-pulse" />
          </div>
          <div className="text-xl font-black text-red-800 mt-1">{criticalItemsCount}</div>
          <div className="text-[10px] text-red-600 mt-0.5">Critical Values Active</div>
        </div>

        <div
          onClick={() => onSelectView('exceptions')}
          className="p-3 bg-amber-50 rounded-xl border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-amber-800 font-bold">
            <span>عينات مرفوضة</span>
            <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-900 mt-1">{rejectedCount}</div>
          <div className="text-[10px] text-amber-700 mt-0.5">Recollection Needed</div>
        </div>
      </div>

      {/* Main Operational Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Work Queue & Urgent Accessions */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Worklist Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-black text-slate-900">
                  قائمة العمليات النشطة على البنش (Live Worklist Queue)
                </h3>
              </div>
              <button
                onClick={() => onSelectView('core_lab')}
                className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
              >
                <span>عرض كامل القائمة</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {accessions.map(acc => {
                const hasCritical = acc.tests.some(
                  t => t.flag === 'critical_high' || t.flag === 'critical_low'
                );

                return (
                  <div
                    key={acc.id}
                    className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{acc.patientName}</span>
                        <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {acc.mrn}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            acc.priority === 'stat'
                              ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                              : acc.priority === 'urgent'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {acc.priority.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 flex items-center gap-2">
                        <span className="font-bold text-teal-700">{acc.testPanelName}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500">{acc.instrumentContext.analyzerName}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-slate-400 text-[11px]">{acc.accessionNumber}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {hasCritical && (
                        <button
                          onClick={() => onOpenCriticalModal(acc)}
                          className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer animate-pulse"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          <span>إبلاغ القيمة الحرجة</span>
                        </button>
                      )}
                      <button
                        onClick={() => onPreviewAccession(acc)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>معاينة</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Departmental Quick Navigations */}
          <div className="grid grid-cols-3 gap-3">
            <div
              onClick={() => onSelectView('microbiology')}
              className="p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-2xl cursor-pointer transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between text-purple-800">
                <Microscope className="w-5 h-5" />
                <span className="text-xs font-bold">{microCases.length} حالات نشطة</span>
              </div>
              <h4 className="font-bold text-sm text-purple-950">قسم الأحياء الدقيقة (Microbiology)</h4>
              <p className="text-[11px] text-purple-800 leading-tight">
                مزارع الدم والبول، تقارير صبغة غرام الأولية، واختبارات الحساسية الدوائية (AST) بتصنيف EUCAST.
              </p>
            </div>

            <div
              onClick={() => onSelectView('pathology')}
              className="p-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl cursor-pointer transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between text-emerald-800">
                <FileText className="w-5 h-5" />
                <span className="text-xs font-bold">{pathCases.length} حالة مسجلة</span>
              </div>
              <h4 className="font-bold text-sm text-emerald-950">علم الأمراض والأنسجة (Pathology)</h4>
              <p className="text-[11px] text-emerald-800 leading-tight">
                الفحص العياني (Grossing)، تقطيع البلوكات، الشرائح المجهرية، والتقارير المتزامنة (Synoptic).
              </p>
            </div>

            <div
              onClick={() => onSelectView('send_out')}
              className="p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-2xl cursor-pointer transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between text-blue-800">
                <Truck className="w-5 h-5" />
                <span className="text-xs font-bold">2 شحنات مرجعية</span>
              </div>
              <h4 className="font-bold text-sm text-blue-950">المختبرات المرجعية الخارجية (Send-Out)</h4>
              <p className="text-[11px] text-blue-800 leading-tight">
                تتبع العينات المرسلة خارجياً للتحاليل الجينية النادرة ومتابعة تقاريرها المرجعية.
              </p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Instruments Operational State & Quality Control Mock */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                <Cpu className="w-4 h-4 text-teal-600" />
                <span>حالة الأجهزة والمحللات (Analyzer Status)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Mock Telemetry</span>
            </div>

            <div className="space-y-2.5">
              {instruments.map(inst => (
                <div
                  key={inst.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{inst.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inst.status === 'operational'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inst.status === 'processing'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inst.status === 'operational'
                        ? 'يعمل بكفاءة'
                        : inst.status === 'processing'
                        ? 'جاري التشغيل'
                        : 'صيانة دورية'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">{inst.statusMessage}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 font-mono">
                    <span>قائمة الانتظار: {inst.queueCount} عينة</span>
                    <span className="text-emerald-700 font-bold">ضبط الجودة: {inst.qcStatus}</span>
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
