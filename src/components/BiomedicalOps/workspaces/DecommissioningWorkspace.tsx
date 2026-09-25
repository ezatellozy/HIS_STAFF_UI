import React, { useState } from 'react';
import {
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  Building,
  User,
  Archive,
  Search,
  Plus,
  X
} from 'lucide-react';
import {
  MedicalEquipmentAsset,
  BiomedicalOpsState
} from '../../../types/biomedicalOps';
import { retireAndDecommissionEquipment } from '../../../utils/biomedicalWorkflowEngine';

interface DecommissioningWorkspaceProps {
  state: BiomedicalOpsState;
  onUpdateAsset: (asset: MedicalEquipmentAsset) => void;
  onAddAuditLog: (action: string, entityId: string, description: string) => void;
}

export const DecommissioningWorkspace: React.FC<DecommissioningWorkspaceProps> = ({
  state,
  onUpdateAsset,
  onAddAuditLog
}) => {
  const decommissionedAssets = state.assets.filter(a => a.currentStatus === 'decommissioned');
  const activeAssets = state.assets.filter(a => a.currentStatus !== 'decommissioned');

  const [showDecommissionModal, setShowDecommissionModal] = useState<boolean>(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string>(activeAssets[0]?.id || '');
  const [deconCertRef, setDeconCertRef] = useState<string>('CSSD-DECON-CERT-2026-');
  const [reason, setReason] = useState<string>('تقادم الجهاز وتوقف دعم قطع الغيار من الشركة المصنعة (End of Life).');
  const [disposalMethod, setDisposalMethod] = useState<'recycle_parts' | 'destruction_hazardous' | 'oem_trade_in' | 'donation'>('recycle_parts');
  const [authorizedBy, setAuthorizedBy] = useState<string>('م. خالد السعدون (مدير إدارة الهندسة السريرية)');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExecuteDecommission = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const asset = state.assets.find(a => a.id === selectedAssetId);
    if (!asset) return;

    const res = retireAndDecommissionEquipment(
      asset,
      deconCertRef,
      reason,
      disposalMethod,
      authorizedBy
    );

    if (!res.success || !res.updatedAsset) {
      setErrorMessage(res.error || 'فشل التكهين');
      return;
    }

    onUpdateAsset(res.updatedAsset);
    onAddAuditLog(
      'EQUIPMENT_DECOMMISSIONED',
      res.updatedAsset.id,
      `اكتمال تكهين وسحب الأصل الطبي ${res.updatedAsset.assetTag} (${res.updatedAsset.nameAr}) بعد التحقق من شهادة التطهير البيولوجي ${deconCertRef}.`
    );

    setShowDecommissionModal(false);
  };

  const getDisposalMethodLabel = (method: string) => {
    switch (method) {
      case 'recycle_parts':
        return 'إعادة تدوير وفرز قطع الغيار الصالحة';
      case 'destruction_hazardous':
        return 'إتلاف نفايات إلكترونية خطرة معتمدة';
      case 'oem_trade_in':
        return 'استبدال تجاري مع المصنّع (OEM Trade-in)';
      case 'donation':
        return 'تبرع لجهات تعليمية وتدريبية';
      default:
        return method;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              إدارة إخراج وتكهين الأجهزة الطبية المتقاعدة (Decommissioning & Safe Disposal)
            </h2>
            <p className="text-xs text-slate-500">
              الضوابط الصارمة لتقاعد الأصول المنتهية دورة حياتها، اشتراط خلو التلوث البيولوجي (CSSD Clearance)، وتوثيق محضر الإتلاف
            </p>
          </div>

          <button
            onClick={() => setShowDecommissionModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Archive className="w-4 h-4" />
            <span>بدء إجراء تكهين أصل طبي (Decommission Asset)</span>
          </button>
        </div>
      </div>

      {/* Decommissioned List */}
      <div className="space-y-4">
        <h3 className="font-bold text-xs text-slate-700">الأجهزة المكهنة والمتقاعدة في السجل:</h3>

        {decommissionedAssets.length === 0 ? (
          <div className="bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200 text-xs">
            لا توجد أجهزة مكهنة في السجل الحالي
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {decommissionedAssets.map(asset => {
              const rec = asset.decommissioningRecord;
              return (
                <div
                  key={asset.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 text-xs space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {asset.assetTag}
                    </span>
                    <span className="bg-slate-200 text-slate-700 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                      متقاعد ومكهّن نهائياً
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{asset.nameAr}</h4>
                    <p className="text-[11px] text-slate-500 font-sans">{asset.nameEn}</p>
                  </div>

                  {rec && (
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">سبب التكهين:</span>
                        <span className="font-semibold text-slate-800">{rec.reason}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                        <div>
                          <span className="text-slate-500 block">شهادة التطهير (CSSD/IPC):</span>
                          <span className="font-mono font-bold text-teal-700">{rec.decontaminationCertRef}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">طريقة التخلص:</span>
                          <span className="font-semibold text-slate-800">{getDisposalMethodLabel(rec.disposalMethod)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">تاريخ الإخراج:</span>
                          <span className="font-mono text-slate-700">{rec.date}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">المعتمد:</span>
                          <span className="font-semibold text-slate-700">{rec.authorizedBy}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Decommission Modal */}
      {showDecommissionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden text-right" dir="rtl">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm">محضر سحب وتكهين أصل طبي (Decommissioning Protocol)</h3>
              </div>
              <button onClick={() => setShowDecommissionModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteDecommission} className="p-5 overflow-y-auto space-y-4 text-xs">
              {errorMessage && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="text-slate-700 block font-semibold mb-1">الأصل المراد تكهينه وسحبه:</label>
                <select
                  value={selectedAssetId}
                  onChange={e => setSelectedAssetId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800"
                >
                  {activeAssets.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.assetTag} — {a.nameAr} ({a.assignedDepartment})
                    </option>
                  ))}
                </select>
              </div>

              {/* Biological Decontamination Clearance */}
              <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
                <label className="font-bold text-emerald-900 block">
                  رقم شهادة التطهير البيولوجي الإلزامية (CSSD / Infection Prevention Clearance):
                </label>
                <input
                  type="text"
                  placeholder="e.g. CSSD-DECON-CERT-2026-102"
                  value={deconCertRef}
                  onChange={e => setDeconCertRef(e.target.value)}
                  className="w-full bg-white border border-emerald-300 rounded-lg p-2 font-mono text-slate-800"
                  required
                />
                <p className="text-[10px] text-emerald-700 leading-relaxed">
                  إلزام أمان ووقاية: لا يمكن إخراج أي جهاز ملامس للمرضى أو بيئة الرعاية دون شهادة تطهير وخلو تلوث معتمدة من قسم التعقيم المركزي أو مكافحة العدوى.
                </p>
              </div>

              <div>
                <label className="text-slate-700 block font-semibold mb-1">مبرر وقرار التكهين الفني:</label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 block font-semibold mb-1">طريقة التخلص النهائي:</label>
                <select
                  value={disposalMethod}
                  onChange={e => setDisposalMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                >
                  <option value="recycle_parts">إعادة تدوير وفرز قطع الغيار السليمة (Spare Parts Salvage)</option>
                  <option value="destruction_hazardous">إتلاف بيئي للنفايات الإلكترونية الخطرة</option>
                  <option value="oem_trade_in">استبدال تجاري مع الوكيل المصنع (OEM Trade-in)</option>
                  <option value="donation">تبرع لجهات تعليمية أو تدريبية</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 block font-semibold mb-1">اعتماد مدير إدارة الهندسة السريرية:</label>
                <input
                  type="text"
                  value={authorizedBy}
                  onChange={e => setAuthorizedBy(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800"
                  required
                />
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-5 py-2 rounded-xl cursor-pointer shadow-xs transition-colors"
                >
                  اعتماد التكهين النهائي للأصل
                </button>
                <button
                  type="button"
                  onClick={() => setShowDecommissionModal(false)}
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
