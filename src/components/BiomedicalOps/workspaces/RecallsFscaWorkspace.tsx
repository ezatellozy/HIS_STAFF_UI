import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Building,
  Cpu,
  Search,
  Filter,
  Plus,
  X,
  FileText,
  HelpCircle
} from 'lucide-react';
import {
  SafetyAlertFsca,
  MedicalEquipmentAsset,
  BiomedicalOpsState
} from '../../../types/biomedicalOps';
import {
  quarantineForRecall,
  resolveRecallRemediation
} from '../../../utils/biomedicalWorkflowEngine';

interface RecallsFscaWorkspaceProps {
  state: BiomedicalOpsState;
  onUpdateAsset: (asset: MedicalEquipmentAsset) => void;
  onUpdateAlert: (alert: SafetyAlertFsca) => void;
  onAddAlert: (alert: SafetyAlertFsca) => void;
  onAddAuditLog: (action: string, entityId: string, description: string) => void;
}

export const RecallsFscaWorkspace: React.FC<RecallsFscaWorkspaceProps> = ({
  state,
  onUpdateAsset,
  onUpdateAlert,
  onAddAlert,
  onAddAuditLog
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNewAlertModal, setShowNewAlertModal] = useState<boolean>(false);

  // New alert form
  const [alertNo, setAlertNo] = useState<string>('SFDA-NCMDR-2026-089');
  const [alertTitle, setAlertTitle] = useState<string>('');
  const [affectedMfr, setAffectedMfr] = useState<string>('Hamilton Medical AG');
  const [affectedModel, setAffectedModel] = useState<string>('G5 Modular');
  const [hazardDesc, setHazardDesc] = useState<string>('');

  const handleApplyQuarantine = (alert: SafetyAlertFsca, assetId: string) => {
    const asset = state.assets.find(a => a.id === assetId);
    if (!asset) return;

    const quarantinedAsset = quarantineForRecall(asset, alert);
    onUpdateAsset(quarantinedAsset);

    onAddAuditLog(
      'RECALL_QUARANTINE_APPLIED',
      quarantinedAsset.id,
      `تطبيق الحظر الفوري والحجر الاحترازي على الأصل ${quarantinedAsset.assetTag} (${quarantinedAsset.nameAr}) استجابة للبلاغ ${alert.fscaAlertNumber}.`
    );
  };

  const handleResolveRemediation = (alert: SafetyAlertFsca, assetId: string) => {
    const asset = state.assets.find(a => a.id === assetId);
    if (!alert || !asset) return;

    const resolvedAsset = resolveRecallRemediation(asset, alert);
    onUpdateAsset(resolvedAsset);

    const updatedAlert: SafetyAlertFsca = {
      ...alert,
      status: 'verified_closed',
      closedDate: new Date().toISOString().split('T')[0]
    };
    onUpdateAlert(updatedAlert);

    onAddAuditLog(
      'RECALL_REMEDIATION_RESOLVED',
      resolvedAsset.id,
      `اكتمال الإجراء التصحيحي ورفع حظر السلامة عن الأصل ${resolvedAsset.assetTag} وإغلاق البلاغ ${alert.fscaAlertNumber}.`
    );
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle.trim()) return;

    // Auto-match affected assets
    const matchedAssets = state.assets.filter(
      a => a.manufacturer.toLowerCase().includes(affectedMfr.toLowerCase()) ||
           a.model.toLowerCase().includes(affectedModel.toLowerCase())
    );

    const newAlert: SafetyAlertFsca = {
      id: `fsca-${Date.now()}`,
      fscaAlertNumber: alertNo,
      issuingBody: 'SFDA_NCMDR',
      titleAr: alertTitle,
      titleEn: `Field Safety Corrective Action for ${affectedMfr}`,
      severity: 'class_1_critical_recall',
      affectedManufacturer: affectedMfr,
      affectedModel: affectedModel,
      affectedSerialRange: 'All Serials in Hospital Registry',
      hazardDescription: hazardDesc,
      actionRequired: 'immediate_quarantine',
      affectedAssetIds: matchedAssets.map(a => a.id),
      status: 'open_action_pending',
      dateIssued: new Date().toISOString().split('T')[0]
    };

    onAddAlert(newAlert);

    // Automatically quarantine matching assets
    matchedAssets.forEach(a => {
      onUpdateAsset(quarantineForRecall(a, newAlert));
    });

    onAddAuditLog(
      'SFDA_ALERT_REGISTERED',
      newAlert.id,
      `تسجيل بلاغ استدعاء وتحذير سلامة وطني ${newAlert.fscaAlertNumber} وحظر ${matchedAssets.length} أجهزة متأثرة فورياً.`
    );

    setShowNewAlertModal(false);
    setAlertTitle('');
    setHazardDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              إدارة مراجع بلاغات واستدعاءات السلامة الميدانية (Synthetic Safety Alerts & FSCA)
            </h2>
            <p className="text-xs text-slate-500">
              مراجع إشعارات السلامة الميدانية الاصطناعية (Synthetic Safety Alert / FSCA Reference) — محاكاة إجراءات الحجر الاحترازي والتصحيح الفني
            </p>
          </div>

          <button
            onClick={() => setShowNewAlertModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>تسجيل إشعار سلامة اصطناعي (Simulated Alert Intake)</span>
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {state.safetyAlerts.map(alert => {
          const isClosed = alert.status === 'verified_closed';
          return (
            <div
              key={alert.id}
              className={`bg-white rounded-2xl p-5 border text-xs space-y-4 shadow-xs ${
                isClosed ? 'border-slate-200 opacity-90' : 'border-red-300 bg-red-50/15'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-red-900 bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg text-xs">
                    {alert.fscaAlertNumber}
                  </span>
                  <span className="bg-slate-800 text-white font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                    {alert.issuingBody}
                  </span>
                  <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {alert.severity === 'class_1_critical_recall' ? 'استدعاء حرج (Class 1)' : 'إجراء تصحيحي (FSCA)'}
                  </span>
                </div>

                <span
                  className={`font-bold px-2.5 py-1 rounded-full text-xs ${
                    isClosed
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                  }`}
                >
                  {isClosed ? 'تم إغلاق البلاغ والتحقق' : 'إجراء أمان معلق (Action Pending)'}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm leading-snug">{alert.titleAr}</h3>
                <p className="text-[11px] text-slate-500 font-sans mt-0.5">{alert.titleEn}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 text-[11px]">
                <p className="text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 block mb-0.5">وصف الخطر والتحذير:</strong>
                  {alert.hazardDescription}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60">
                  <div>
                    <span className="text-slate-500 block">المصنّع المتأثر:</span>
                    <span className="font-bold text-slate-800">{alert.affectedManufacturer}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">الطراز (Model):</span>
                    <span className="font-bold text-slate-800">{alert.affectedModel}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">الأرقام التسلسلية:</span>
                    <span className="font-mono text-slate-800">{alert.affectedSerialRange}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">تاريخ الصدور:</span>
                    <span className="font-mono text-slate-800">{alert.dateIssued}</span>
                  </div>
                </div>
              </div>

              {/* Affected Hospital Assets In Registry */}
              <div className="space-y-2 pt-1">
                <h4 className="font-bold text-slate-800 flex items-center justify-between">
                  <span>الأجهزة المطابقة في المستشفى ({alert.affectedAssetIds.length} أصول):</span>
                  <span className="text-slate-400 font-normal">يتم تطبيق الحظر لمنع تشغيل الجهاز سريرياً</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {alert.affectedAssetIds.map(assetId => {
                    const asset = state.assets.find(a => a.id === assetId);
                    if (!asset) return null;
                    const isQuarantined = asset.currentStatus === 'quarantined_safety_hold';

                    return (
                      <div
                        key={asset.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                          isQuarantined
                            ? 'bg-red-50/80 border-red-300'
                            : 'bg-emerald-50/80 border-emerald-200'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-slate-900 block">{asset.assetTag}</span>
                          <span className="font-bold text-slate-800">{asset.nameAr}</span>
                          <span className="text-[11px] text-slate-500 block">الموقع: {asset.locationRoom}</span>
                        </div>

                        <div>
                          {isQuarantined ? (
                            <button
                              onClick={() => handleResolveRemediation(alert, asset.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                              <span>رفع الحظر بعد الإصلاح</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApplyQuarantine(alert, asset.id)}
                              className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>تطبيق حظر السلامة</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Notice Modal */}
      {showNewAlertModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden text-right" dir="rtl">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <h3 className="font-bold text-sm">تسجيل بلاغ استدعاء SFDA NCMDR جديد</h3>
              </div>
              <button onClick={() => setShowNewAlertModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="text-slate-700 block font-semibold mb-1">رقم بلاغ الهيئة SFDA-NCMDR:</label>
                <input
                  type="text"
                  value={alertNo}
                  onChange={e => setAlertNo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 block font-semibold mb-1">عنوان الاستدعاء باللغة العربية:</label>
                <input
                  type="text"
                  placeholder="مثال: استدعاء أجهزة التخدير طراز XYZ لوجود خلل في الصمام..."
                  value={alertTitle}
                  onChange={e => setAlertTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block font-semibold mb-1">الشركة المصنعة:</label>
                  <input
                    type="text"
                    value={affectedMfr}
                    onChange={e => setAffectedMfr(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-700 block font-semibold mb-1">الطراز المتأثر:</label>
                  <input
                    type="text"
                    value={affectedModel}
                    onChange={e => setAffectedModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 block font-semibold mb-1">وصف الخطر والتوجيه الإلزامي:</label>
                <textarea
                  rows={3}
                  placeholder="اكتب التوجيه الفني الصادر من الهيئة..."
                  value={hazardDesc}
                  onChange={e => setHazardDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  required
                />
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2 rounded-xl cursor-pointer shadow-xs transition-colors"
                >
                  حفظ وتطبيق الحظر الفوري على الأجهزة المطابقة
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewAlertModal(false)}
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
