import React from 'react';
import {
  Droplet,
  FlaskConical,
  ShieldCheck,
  Layers,
  Box,
  RotateCcw,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Activity
} from 'lucide-react';
import {
  BloodBankOperationalMetrics,
  BloodProductRequest,
  PreTransfusionSample,
  MassiveTransfusionProtocolSession,
  BloodProductUnit
} from '../../types/bloodBankOps';

interface BloodBankOperationalHomeProps {
  metrics: BloodBankOperationalMetrics;
  mtpSessions: MassiveTransfusionProtocolSession[];
  pendingRequests: BloodProductRequest[];
  pendingSamples: PreTransfusionSample[];
  readyUnits: BloodProductUnit[];
  onNavigateTab: (tabKey: any) => void;
  onOpenMtpModal: () => void;
  onOpenEmergencyRelease: () => void;
  onSelectRequest: (req: BloodProductRequest) => void;
}

export const BloodBankOperationalHome: React.FC<BloodBankOperationalHomeProps> = ({
  metrics,
  mtpSessions,
  pendingRequests,
  pendingSamples,
  readyUnits,
  onNavigateTab,
  onOpenMtpModal,
  onOpenEmergencyRelease,
  onSelectRequest
}) => {
  const activeMtp = mtpSessions.find(s => s.status === 'active');

  return (
    <div className="space-y-4">
      {/* Active MTP Banner if active */}
      {activeMtp && (
        <div className="bg-rose-900 text-white p-4 rounded-2xl border border-rose-700 shadow-md flex flex-wrap items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-600 text-white border border-rose-400">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">بروتوكول نقل دم مكثف نشط (MTP ACTIVE)</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                  الحزمة #{activeMtp.currentPackNumber} قيد المعالجة
                </span>
              </div>
              <p className="text-xs text-rose-200 mt-0.5">
                المريض: <strong>{activeMtp.patientName}</strong> (MRN: {activeMtp.patientMrn}) • الموقع: {activeMtp.location} • الاستشاري: {activeMtp.activatedByClinician}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenMtpModal}
              className="px-4 py-2 rounded-xl bg-white text-rose-950 hover:bg-rose-100 font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>إدارة وتجهيز حزم MTP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Fast Operational Stat Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Pending Requests */}
        <div
          onClick={() => onNavigateTab('requests')}
          className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-red-400 transition-all cursor-pointer shadow-2xs space-y-1"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-medium">طلبات الصرف</span>
            <Droplet className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">{metrics.pendingRequestsCount}</div>
          <span className="text-[10px] text-slate-500">منها {metrics.statRequestsCount} طلبات عاجلة STAT</span>
        </div>

        {/* Pending Samples */}
        <div
          onClick={() => onNavigateTab('samples')}
          className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 transition-all cursor-pointer shadow-2xs space-y-1"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-medium">عينات ما قبل النقل</span>
            <FlaskConical className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">{metrics.pendingSamplesCount}</div>
          <span className="text-[10px] text-slate-500">عينة بانتظار المطابقة والاستلام</span>
        </div>

        {/* Crossmatch in Progress */}
        <div
          onClick={() => onNavigateTab('crossmatch')}
          className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-teal-400 transition-all cursor-pointer shadow-2xs space-y-1"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-medium">فحوصات التوافق</span>
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">{metrics.crossmatchInProgressCount}</div>
          <span className="text-[10px] text-slate-500">تطابق مصلي وإلكتروني جاري</span>
        </div>

        {/* Ready for Issue */}
        <div
          onClick={() => onNavigateTab('issue_queue')}
          className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-400 transition-all cursor-pointer shadow-2xs space-y-1"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-medium">جاهز للصرف والتسليم</span>
            <Box className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700">{readyUnits.length}</div>
          <span className="text-[10px] text-slate-500">وحدة تنتظر الاستلام من الأقسام</span>
        </div>

        {/* Total Units in Inventory */}
        <div
          onClick={() => onNavigateTab('inventory')}
          className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-purple-400 transition-all cursor-pointer shadow-2xs space-y-1"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-medium">المخزون المتاح</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">{metrics.availableUnitsCount}</div>
          <span className="text-[10px] text-slate-500">وحدات مطابقة بالمخازن المبردة</span>
        </div>

        {/* Transfusion Reactions */}
        <div
          onClick={() => onNavigateTab('reactions')}
          className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-rose-400 transition-all cursor-pointer shadow-2xs space-y-1"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-medium">اشتباه تفاعلات النقل</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-700">{metrics.activeReactionsUnderInvestigation}</div>
          <span className="text-[10px] text-slate-500">حالة تحت التحقيق والمطابقة</span>
        </div>
      </div>

      {/* Main Operational Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Urgent Inflow Worklists */}
        <div className="lg:col-span-2 space-y-4">
          {/* STAT and Active Requests */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-red-600" />
                <h3 className="font-bold text-slate-900 text-xs">أحدث طلبات مشتقات الدم الواردة (Incoming Blood Product Orders)</h3>
              </div>
              <button
                onClick={() => onNavigateTab('requests')}
                className="text-[11px] font-bold text-red-700 hover:text-red-900 flex items-center gap-1"
              >
                <span>عرض قائمة الطلبات الكاملة</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {pendingRequests.slice(0, 4).map(req => (
                <div
                  key={req.id}
                  onClick={() => onSelectRequest(req)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-red-400 hover:bg-red-50/20 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      req.urgencyLevel === 'stat_emergency' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                      req.urgencyLevel === 'urgent' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {req.urgencyLevel === 'stat_emergency' ? 'STAT طارئ' : req.urgencyLevel === 'urgent' ? 'عاجل' : 'روتيني'}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{req.patientName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {req.id} • {req.locationWardBed} • {req.componentNameAr} ({req.requestedQuantity} وحدات)
                      </div>
                    </div>
                  </div>

                  <div className="text-left">
                    <span className="text-[11px] font-mono text-slate-400 block">{req.requestedAt}</span>
                    <span className="text-[10px] text-teal-700 font-bold">{req.requestStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pre-Transfusion Samples Inflow */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-xs">عينات ما قبل النقل الواردة للفحص والمطابقة</h3>
              </div>
              <button
                onClick={() => onNavigateTab('samples')}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                <span>فحص ومطابقة العينات</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pendingSamples.slice(0, 4).map(sample => (
                <div key={sample.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">{sample.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      sample.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                      sample.status === 'rejected_clerical_error' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {sample.status === 'accepted' ? 'مقبولة' : sample.status === 'rejected_clerical_error' ? 'مرفوضة' : 'قيد الاستلام'}
                    </span>
                  </div>
                  <div className="font-bold text-slate-800">{sample.patientName}</div>
                  <div className="text-[11px] text-slate-500 font-mono">سحبت: {sample.collectedAt} ({sample.sampleType})</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Safety Alerts, Emergency Trigger & Traceability */}
        <div className="space-y-4">
          {/* Emergency Fast Trigger Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>إجراءات الطوارئ الفورية (Critical Fast Actions)</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              الإفراج الفوري عن مشتقات الدم للحالات المهددة للحياة بتفويض استشاري مباشر
            </p>

            <div className="space-y-2">
              <button
                onClick={onOpenEmergencyRelease}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>صرف طارئ غير متوافق (O-Neg Release)</span>
              </button>

              <button
                onClick={onOpenMtpModal}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Flame className="w-4 h-4 text-amber-400" />
                <span>بروتوكول النقل المكثف (MTP Dashboard)</span>
              </button>
            </div>
          </div>

          {/* Blood Product Inventory Breakdown Summary */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-xs">توزيع المخزون حسب المشتق</h3>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="text-[11px] text-slate-500 hover:text-slate-800"
              >
                عرض المخزون
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="font-medium text-slate-700">كريات دم حمراء (PRBCs):</span>
                <span className="font-mono font-bold text-slate-900">18 وحدة</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="font-medium text-slate-700">صفائح فصادة (Platelets):</span>
                <span className="font-mono font-bold text-slate-900">6 وحدات</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="font-medium text-slate-700">بلازما مجمدة (FFP):</span>
                <span className="font-mono font-bold text-slate-900">14 وحدة</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="font-medium text-slate-700">راسب برودي (Cryoprecipitate):</span>
                <span className="font-mono font-bold text-slate-900">10 وحدات</span>
              </div>
            </div>
          </div>

          {/* Quality & Traceability Principle Card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>مبادئ اليقظة والتتبع الشامل</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              تتبع كامل من الاستلام الأولي للوحدة حتى التخصيص والصرف النهائي أو الإرجاع والتخلص (Cradle-to-Grave Traceability).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
