import React, { useState } from 'react';
import {
  X,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Syringe,
  Clock,
  ShieldCheck,
  History,
  FileText
} from 'lucide-react';
import {
  IncomingImagingRequest,
  ImagingProtocol,
  ContrastRequirement
} from '../../types/radiologyOps';

interface ProtocolingWorkspaceModalProps {
  request: IncomingImagingRequest;
  existingProtocol?: ImagingProtocol;
  onSaveProtocol: (protocol: ImagingProtocol) => void;
  onClose: () => void;
}

export const ProtocolingWorkspaceModal: React.FC<ProtocolingWorkspaceModalProps> = ({
  request,
  existingProtocol,
  onSaveProtocol,
  onClose
}) => {
  const [protocolName, setProtocolName] = useState(
    existingProtocol?.protocolNameAr || `${request.examNameAr} - بروتوكول معتمد`
  );
  const [contrastType, setContrastType] = useState<ContrastRequirement>(
    existingProtocol?.contrastProtocol.type || request.contrastRequired
  );
  const [agentName, setAgentName] = useState(
    existingProtocol?.contrastProtocol.agentName || (request.modality === 'MRI' ? 'Dotarem 0.5 mmol/mL' : 'Omnipaque 350 mgI/mL')
  );
  const [volumeMl, setVolumeMl] = useState<number>(existingProtocol?.contrastProtocol.volumeMl || 80);
  const [flowRate, setFlowRate] = useState<number>(existingProtocol?.contrastProtocol.flowRateMlSec || 3.0);
  const [delaySeconds, setDelaySeconds] = useState<number>(existingProtocol?.contrastProtocol.delaySeconds || 70);

  const [sequences, setSequences] = useState<string[]>(
    existingProtocol?.sequencesOrPhases || [
      'مسح استطلاعي أولي (Scout / Topogram)',
      'مقاطع أساسية أولية بدون صبغة (Baseline Pre-contrast)',
      'مرحلة ذروة الصبغة الوريدية (Portal Venous / Contrast Peak)',
      'مقاطع إعادة بناء ثلاثية الأبعاد (3D Multiplanar Reconstructions)'
    ]
  );
  const [newSequenceText, setNewSequenceText] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState(
    existingProtocol?.specialInstructionsAr || 'التحقق من الكانيولا الوريدية قبل الحقن، ومراجعة جودة الصور فور انتهاء المسح'
  );
  const [sedationRequired, setSedationRequired] = useState(existingProtocol?.sedationRequired || false);

  const handleAddSequence = () => {
    if (!newSequenceText.trim()) return;
    setSequences([...sequences, newSequenceText.trim()]);
    setNewSequenceText('');
  };

  const handleRemoveSequence = (index: number) => {
    setSequences(sequences.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const protocol: ImagingProtocol = {
      id: existingProtocol?.id || `prot-${Date.now()}`,
      requestId: request.id,
      modality: request.modality,
      protocolNameAr: protocolName,
      protocolNameEn: request.examNameEn,
      bodyRegion: request.bodyRegion,
      contrastProtocol: {
        type: contrastType,
        agentName: contrastType !== 'none' ? agentName : undefined,
        volumeMl: contrastType !== 'none' ? volumeMl : undefined,
        flowRateMlSec: contrastType !== 'none' ? flowRate : undefined,
        delaySeconds: contrastType !== 'none' ? delaySeconds : undefined
      },
      sequencesOrPhases: sequences,
      specialInstructionsAr: specialInstructions,
      sedationRequired,
      protocolPolicy: 'radiologist_approved',
      approvedBy: 'د. طلال السعيد (استشاري الأشعة التشخيصية)',
      approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    onSaveProtocol(protocol);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">
                اعتماد وتحديد بروتوكول الفحص الشعاعي (Protocoling Workspace)
              </h3>
              <p className="text-[11px] text-slate-300">
                طلب: {request.id} • الموداليتي: {request.modality}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient & Request Context Strip */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-500 text-[11px] block">اسم المريض:</span>
            <strong className="text-slate-900 font-bold">{request.patientName}</strong>
          </div>
          <div>
            <span className="text-slate-500 text-[11px] block">رقم الملف MRN:</span>
            <strong className="text-slate-900 font-mono">{request.mrn}</strong>
          </div>
          <div>
            <span className="text-slate-500 text-[11px] block">الفحص المطلوب:</span>
            <strong className="text-slate-900 truncate block" title={request.examNameAr}>
              {request.examNameAr}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 text-[11px] block">المؤشر السريري:</span>
            <strong className="text-slate-900 truncate block" title={request.clinicalIndication}>
              {request.clinicalIndication}
            </strong>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* Protocol Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">اسم البروتوكول السريري:</label>
            <input
              type="text"
              value={protocolName}
              onChange={e => setProtocolName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-teal-500 font-medium"
            />
          </div>

          {/* Contrast Settings Section */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Syringe className="w-4 h-4 text-teal-600" />
                <span>بروتوكول حقن مادة التباين (Contrast Protocol)</span>
              </span>
              <select
                value={contrastType}
                onChange={e => setContrastType(e.target.value as ContrastRequirement)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 font-bold cursor-pointer"
              >
                <option value="none">بدون صبغة (Non-Contrast)</option>
                <option value="iv_iodinated">صبغة وريدية يودية (IV Iodinated - CT)</option>
                <option value="iv_gadolinium">صبغة جادولينيوم (Gadolinium - MRI)</option>
                <option value="oral">صبغة فموية (Oral)</option>
                <option value="double_contrast">صبغة مزدوجة (Double Contrast)</option>
              </select>
            </div>

            {contrastType !== 'none' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div>
                  <label className="text-[11px] text-slate-600 font-medium block mb-1">اسم مادة الصبغة:</label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={e => setAgentName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 font-medium block mb-1">الحجم (Volume mL):</label>
                  <input
                    type="number"
                    value={volumeMl}
                    onChange={e => setVolumeMl(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 font-medium block mb-1">معدل التدفق (Flow Rate mL/s):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={flowRate}
                    onChange={e => setFlowRate(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sequences / Phases List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-teal-600" />
                <span>المراحل والمتتاليات الشعاعية المطلوبة (Sequences / Phases):</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">{sequences.length} متتاليات</span>
            </div>

            <div className="space-y-1.5">
              {sequences.map((seq, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold font-mono text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-slate-800">{seq}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveSequence(idx)}
                    className="text-rose-600 hover:text-rose-800 text-[11px] font-bold cursor-pointer"
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="إضافة متتالية أو مرحلة تصوير إضافية..."
                value={newSequenceText}
                onChange={e => setNewSequenceText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSequence()}
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-teal-500"
              />
              <button
                type="button"
                onClick={handleAddSequence}
                className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 cursor-pointer"
              >
                إضافة
              </button>
            </div>
          </div>

          {/* Special Instructions & Sedation */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                تعليمات خاصة للأخصائي الفني (Technologist Notes):
              </label>
              <textarea
                rows={2}
                value={specialInstructions}
                onChange={e => setSpecialInstructions(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sedationCheck"
                checked={sedationRequired}
                onChange={e => setSedationRequired(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-slate-300"
              />
              <label htmlFor="sedationCheck" className="text-xs font-medium text-slate-800 cursor-pointer">
                يتطلب الفحص تجهيز تهدئة واعية أو إشراف فريق التخدير (Sedation Support)
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>سيتم توثيق الاعتماد باسم استشاري الأشعة المناوب وفق سياسة القسم</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>اعتماد البروتوكول وإرساله لجهاز الفحص</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
