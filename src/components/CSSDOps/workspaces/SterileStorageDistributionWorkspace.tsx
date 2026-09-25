import React, { useState } from 'react';
import {
  PackageCheck,
  Truck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Search,
  Droplets,
  RotateCcw,
  UserCheck,
  Check
} from 'lucide-react';
import {
  CSSDOpsState,
  CSSDPackageRecord,
  SterileDistributionRequest
} from '../../../types/cssdOps';
import {
  evaluatePackageStorageIntegrity,
  dispatchSterileSetToCase
} from '../../../utils/cssdWorkflowEngine';

interface SterileStorageDistributionWorkspaceProps {
  state: CSSDOpsState;
  onUpdatePackage: (pkg: CSSDPackageRecord) => void;
  onUpdateDistributionRequest: (req: SterileDistributionRequest) => void;
  onAddAuditLog: (action: string, entityId: string, description: string) => void;
}

export const SterileStorageDistributionWorkspace: React.FC<SterileStorageDistributionWorkspaceProps> = ({
  state,
  onUpdatePackage,
  onUpdateDistributionRequest,
  onAddAuditLog
}) => {
  const [selectedRequestId, setSelectedRequestId] = useState<string>(
    state.distributionRequests[0]?.id || ''
  );
  const [selectedPackageToDispatch, setSelectedPackageToDispatch] = useState<string>(
    state.packages.find(p => p.currentStatus === 'released_sterile')?.id || ''
  );
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'warning';
    msg: string;
  } | null>(null);

  const selectedRequest = state.distributionRequests.find(r => r.id === selectedRequestId);

  // 1. Simulate Storage Compromise (Event-Related Sterility)
  const handleSimulateCompromise = (
    pkg: CSSDPackageRecord,
    event: 'wet_pack' | 'torn_wrap' | 'dropped_floor' | 'opened_seal'
  ) => {
    const result = evaluatePackageStorageIntegrity(pkg, event);

    if (!result.isValid && result.updatedEntity) {
      onUpdatePackage(result.updatedEntity);
      setFeedback({
        type: 'error',
        msg: result.blockReasonAr || 'تم فقدان عقم العبوة وحجزها'
      });
      onAddAuditLog('PACKAGE_INTEGRITY_BREACH', pkg.id, result.blockReasonAr || 'فقدان عقم العبوة في المستودع');
    }
  };

  // 2. Dispatch Package to Surgical Case
  const handleDispatch = () => {
    if (!selectedRequest) return;
    const pkg = state.packages.find(p => p.id === selectedPackageToDispatch);
    if (!pkg) {
      setFeedback({ type: 'error', msg: 'لم يتم العثور على العبوة المعقمة المحددة للتوزيع' });
      return;
    }

    const result = dispatchSterileSetToCase(selectedRequest, pkg, 'فني التوزيع المعقم');

    if (!result.isValid) {
      setFeedback({
        type: 'error',
        msg: result.blockReasonAr || 'تعذر توزيع العبوة'
      });
      onAddAuditLog('DISTRIBUTION_BLOCKED', pkg.id, result.blockReasonAr || 'حظر تسليم عبوة للعمليات');
      return;
    }

    if (result.updatedEntity) {
      onUpdateDistributionRequest(result.updatedEntity);
      setFeedback({
        type: 'success',
        msg: `تم صرف وتسليم العبوة المعقمة ${pkg.id} بنجاح إلى ${selectedRequest.destinationDepartment}`
      });
      onAddAuditLog('STERILE_SET_DISPATCHED', pkg.id, `تسليم الطقم المعقم لمسرح ${selectedRequest.destinationDepartment}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Sterile Storage Environmental Standards */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <strong className="text-emerald-900 block font-bold">
              المستودع المعقم وإدارة التوزيع السريري (Sterile Storage & Event-Related Distribution)
            </strong>
            <span className="text-emerald-700 text-[11px]">
              ضغط إيجابي (Positive Pressure) • حرارة 18-22°C • رطوبة نسبية 35-50% • العقم مرتبط بالحدث (Event-Related) وليس بانتهاء التاريخ المجرد.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="bg-emerald-200/80 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px] font-mono">
            المنطقة الخضراء (Sterile Clean Zone)
          </span>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
            feedback.type === 'error'
              ? 'bg-red-100 border-red-300 text-red-900'
              : feedback.type === 'warning'
              ? 'bg-amber-100 border-amber-300 text-amber-900'
              : 'bg-emerald-100 border-emerald-300 text-emerald-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'error' ? (
              <XCircle className="w-4 h-4 text-red-600" />
            ) : feedback.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
            <span className="font-bold">{feedback.msg}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-bold underline cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Main Grid: Distribution Requests List & Warehouse Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: OR & Department Distribution Requests */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
          <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>طلبات تزويد مسارح العمليات ({state.distributionRequests.length})</span>
            </h3>
            <span className="text-[10px] text-slate-500">طلبات الأطقم المعقمة</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {state.distributionRequests.map(req => {
              const isSelected = req.id === selectedRequestId;
              return (
                <div
                  key={req.id}
                  onClick={() => {
                    setSelectedRequestId(req.id);
                    setFeedback(null);
                  }}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isSelected ? 'bg-emerald-50/80 border-r-4 border-r-emerald-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-black text-slate-900">{req.id}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        req.status === 'received_at_unit'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'dispatched'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {req.status === 'received_at_unit'
                        ? 'مستلم بالمسرح'
                        : req.status === 'dispatched'
                        ? 'في طريق التسليم'
                        : 'عجز / بانتظار التخصيص'}
                    </span>
                  </div>

                  <div className="font-bold text-xs text-slate-800 mb-1">{req.destinationDepartment}</div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>موعد الجراحة: <strong className="font-mono">{req.requiredByTime}</strong></span>
                    {req.orCaseReference && (
                      <span className="bg-blue-50 text-blue-700 px-1 rounded font-mono text-[10px]">
                        {req.orCaseReference}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Allocation, Storage Inventory & Event-Related Quality */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
          {selectedRequest ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{selectedRequest.destinationDepartment}</h3>
                    <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      {selectedRequest.id}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    حالة المسرح: {selectedRequest.orCaseReference || 'طلب عام'} • وقت الحاجة: {selectedRequest.requiredByTime}
                  </span>
                </div>

                <button
                  onClick={handleDispatch}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>صرف وتوصيل للعمليات</span>
                </button>
              </div>

              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                {/* Allocation Box */}
                <div className="border border-slate-200 rounded-xl p-3.5 space-y-3 bg-slate-50/40">
                  <h4 className="font-bold text-xs text-slate-900">
                    تخصيص عبوة معقمة مفرج عنها من المستودع:
                  </h4>

                  <select
                    value={selectedPackageToDispatch}
                    onChange={e => setSelectedPackageToDispatch(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs font-bold bg-white text-slate-800"
                  >
                    <option value="">-- اختر عبوة معقمة سليمة من المستودع --</option>
                    {state.packages
                      .filter(p => p.currentStatus === 'released_sterile' && p.storageIntegrity === 'intact_sterile')
                      .map(pkg => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.id} - {pkg.setNameAr} ({pkg.storageLocation || 'المستودع الرئيسي'})
                        </option>
                      ))}
                  </select>

                  <div className="text-[11px] text-slate-500">
                    العبوات المخصصة لهذا الطلب حالياً: {selectedRequest.allocatedPackageIds.join(', ') || 'لا توجد عبوة مخصصة بعد'}
                  </div>
                </div>

                {/* Storage Inventory & Event-Related Compromise Simulation */}
                <div className="border border-slate-200 rounded-xl p-3.5 space-y-3 bg-slate-50/40">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center justify-between">
                    <span>مخزون المستودع المعقم وفحص سلامة الحاويات (Event-Related Inspection)</span>
                    <span className="text-[10px] text-slate-500">محاكاة الحوادث الفيزيائية</span>
                  </h4>

                  <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden bg-white text-xs">
                    {state.packages
                      .filter(p => p.currentStatus === 'released_sterile' || p.currentStatus === 'package_integrity_compromised')
                      .map(pkg => (
                        <div key={pkg.id} className="p-3 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="font-mono text-slate-900">{pkg.id}</strong>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                  pkg.storageIntegrity === 'intact_sterile'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {pkg.storageIntegrity === 'intact_sterile' ? 'معقم سليم' : 'فاقد للعقم (محجوز)'}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-600 block mt-0.5">{pkg.setNameAr}</span>
                            {pkg.eventRelatedCompromiseReason && (
                              <span className="text-[10px] text-red-600 block mt-0.5">
                                سبب الفقدان: {pkg.eventRelatedCompromiseReason}
                              </span>
                            )}
                          </div>

                          {pkg.storageIntegrity === 'intact_sterile' && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleSimulateCompromise(pkg, 'wet_pack')}
                                className="text-[10px] bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2 py-1 rounded cursor-pointer transition-colors"
                                title="محاكاة رطوبة وتكثف داخل العبوة"
                              >
                                عبوة رطبة (Wet Pack)
                              </button>
                              <button
                                onClick={() => handleSimulateCompromise(pkg, 'torn_wrap')}
                                className="text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-2 py-1 rounded cursor-pointer transition-colors"
                              >
                                تمزق الغلاف
                              </button>
                              <button
                                onClick={() => handleSimulateCompromise(pkg, 'dropped_floor')}
                                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-2 py-1 rounded cursor-pointer transition-colors"
                              >
                                سقوط على الأرض
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
              اختر طلباً للمتابعة
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
