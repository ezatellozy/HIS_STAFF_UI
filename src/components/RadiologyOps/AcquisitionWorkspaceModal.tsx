import React, { useState } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Layers,
  Activity,
  Syringe,
  Clock,
  ShieldCheck,
  Check
} from 'lucide-react';
import {
  IncomingImagingRequest,
  ImagingStudy,
  ImagingModality
} from '../../types/radiologyOps';

interface AcquisitionWorkspaceModalProps {
  request: IncomingImagingRequest;
  onCompleteAcquisition: (study: ImagingStudy) => void;
  onClose: () => void;
}

export const AcquisitionWorkspaceModal: React.FC<AcquisitionWorkspaceModalProps> = ({
  request,
  onCompleteAcquisition,
  onClose
}) => {
  const [acquisitionStage, setAcquisitionStage] = useState<'positioning' | 'scanning' | 'review'>('scanning');
  const [motionArtifact, setMotionArtifact] = useState(false);
  const [repeatSequenceNeeded, setRepeatSequenceNeeded] = useState(false);
  const [technicalComments, setTechnicalComments] = useState('تم إجراء الفحص وفق البروتوكول القياسي، والمريض متعاون تماماً أثناء المسح.');
  const [contrastInjectedConfirmed, setContrastInjectedConfirmed] = useState(request.contrastRequired !== 'none');
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock series preview items
  const mockAcquiredSeries = [
    { name: '1. مسح توجيهي استطلاعي (Scout / Topogram)', slices: 2, status: 'completed' },
    { name: '2. مقاطع أولية للأنسجة الرخوة (Brain Tissue / Soft Tissue Window 5mm)', slices: 48, status: 'completed' },
    { name: '3. مقاطع إعادة بناء دقيقة 1.25 مم (Thin Reconstructions)', slices: 64, status: 'completed' },
    { name: '4. نافذة العظام وقاعدة الجمجمة (Bone Window High-Resolution)', slices: 44, status: 'completed' }
  ];

  const handleFinishAcquisition = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const completedStudy: ImagingStudy = {
        id: `STUDY-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        accessionNumber: `ACC-RAD-${Math.floor(1000000 + Math.random() * 9000000)}`,
        requestId: request.id,
        patientId: request.patientId,
        patientName: request.patientName,
        patientNameEn: request.patientNameEn,
        mrn: request.mrn,
        studyDate: '2026-09-13',
        studyTime: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        modality: request.modality,
        bodyRegion: request.bodyRegion,
        studyDescriptionAr: request.examNameAr,
        studyDescriptionEn: request.examNameEn,
        performingTechnologist: 'أخصائي الأشعة: حسام الدين كامل',
        roomId: 'room-ct-1',
        roomName: 'CT Suite 1 (Somatom 128)',
        seriesCount: 4,
        totalInstancesCount: 158,
        series: [
          {
            id: 'ser-auto-01',
            seriesNumber: 1,
            seriesDescriptionAr: 'المقاطع المحورية الرئيسية',
            seriesDescriptionEn: 'Axial Reconstructions',
            modality: request.modality,
            instancesCount: 48,
            instances: [
              {
                id: 'inst-auto-01',
                instanceNumber: 1,
                imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80',
                windowLevel: 'W:80 L:40',
                sopInstanceUid: '1.2.840.10008.5.1.4.1.1.2.999.1'
              }
            ],
            seriesInstanceUid: '1.2.840.10008.5.1.4.1.1.2.999'
          }
        ],
        radiationDoseMetadata: {
          reported: true,
          ctdiVolMgy: 42.5,
          dlpMgyCm: 680,
          referenceProtocolName: 'Adult Diagnostic Standard'
        },
        technicalQc: {
          status: repeatSequenceNeeded ? 'additional_view_required' : 'satisfactory',
          reviewedBy: 'أخصائي الأشعة: حسام الدين كامل',
          reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          motionArtifact,
          technicalComments
        },
        studyInstanceUid: '1.2.840.10008.5.1.4.1.1.2.999'
      };

      setIsProcessing(false);
      onCompleteAcquisition(completedStudy);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span>محطة تحكم أخصائي الأشعة (Technologist Acquisition Console)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-500/30 text-blue-300">
                  {request.modality}
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                {request.patientName} • MRN: {request.mrn} • فحص: {request.examNameAr}
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

        {/* Console Body */}
        <div className="p-5 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* Identity & Safety Verification Banner */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-950 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>تم التحقق من مطابقة اسم المريض ورقم الملف والبروتوكول على جهاز الفحص</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Verified ✓
            </span>
          </div>

          {/* Acquisition Progress & Acquired Series */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-teal-600" />
                <span>المتتاليات والمقاطع المنجزة (Acquired Series & Slices):</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-mono font-bold">
                158 مقطع صورة DICOM
              </span>
            </div>

            <div className="space-y-1.5">
              {mockAcquiredSeries.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-slate-900">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-600 text-[11px]">{item.slices} مقطع</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      مكتمل
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Quality & Comments */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
            <h4 className="font-bold text-slate-800">التقييم الفني الأولي للأخصائي (Technical QC Inputs):</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="motionCheck"
                  checked={motionArtifact}
                  onChange={e => setMotionArtifact(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300"
                />
                <label htmlFor="motionCheck" className="text-slate-800 cursor-pointer">
                  تشويش حركة طفيف من المريض (Motion Artifact)
                </label>
              </div>

              {request.contrastRequired !== 'none' && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="contrastInjected"
                    checked={contrastInjectedConfirmed}
                    onChange={e => setContrastInjectedConfirmed(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300"
                  />
                  <label htmlFor="contrastInjected" className="text-slate-800 font-bold text-teal-900 cursor-pointer">
                    تأكيد حقن الصبغة الآلي بنجاح (Omnipaque 350 - 95mL)
                  </label>
                </div>
              )}
            </div>

            <div>
              <label className="text-[11px] text-slate-600 font-medium block mb-1">
                ملاحظات الجودة الفنية للأخصائي:
              </label>
              <textarea
                rows={2}
                value={technicalComments}
                onChange={e => setTechnicalComments(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:border-teal-500"
              />
            </div>
          </div>

          {/* Radiation Dose Summary */}
          {request.modality === 'CT' && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-amber-950">بيانات الجرعة الإشعاعية التقديرية (Radiation Dose Info):</span>
                <div className="text-[11px] text-amber-800 font-mono mt-0.5">
                  CTDIvol: <strong>42.5 mGy</strong> • DLP: <strong>680 mGy*cm</strong> (ضمن النطاق المرجعي الوطني)
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                ALARA Compliant
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            إلغاء والعودة
          </button>

          <button
            disabled={isProcessing}
            onClick={handleFinishAcquisition}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isProcessing ? 'جاري إرسال المقاطع إلى محطة القراءة...' : 'إتمام المسح وإرسال الصور للتشخيص'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
