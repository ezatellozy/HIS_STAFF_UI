import React, { useState } from 'react';
import {
  X,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sun,
  Contrast,
  Layers,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
  Sliders
} from 'lucide-react';
import { Patient } from '../../../types/his';
import { ImagingReportItem } from '../../../types/clinicalResults';
import { PatientSafetyBanner } from '../PatientSafetyBanner';

interface DicomStudyViewerModalProps {
  study: ImagingReportItem;
  patient?: Patient;
  onClose: () => void;
}

export const DicomStudyViewerModal: React.FC<DicomStudyViewerModalProps> = ({
  study,
  patient,
  onClose
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isInverted, setIsInverted] = useState(false);
  const [activePreset, setActivePreset] = useState<'standard' | 'contrast' | 'bone' | 'soft_tissue'>('standard');
  const [showReportSidebar, setShowReportSidebar] = useState(true);

  const keyImages = study.mockDicomStudy?.keyImages || [
    {
      id: 'img-def-01',
      title: 'Key Representative Capture #1',
      description: 'Primary diagnostic view',
      view: 'Standard Diagnostic View'
    }
  ];

  const currentImage = keyImages[activeImageIdx] || keyImages[0];

  const handlePresetChange = (preset: 'standard' | 'contrast' | 'bone' | 'soft_tissue') => {
    setActivePreset(preset);
    if (preset === 'standard') {
      setBrightness(100);
      setContrast(100);
      setIsInverted(false);
    } else if (preset === 'contrast') {
      setBrightness(110);
      setContrast(140);
      setIsInverted(false);
    } else if (preset === 'bone') {
      setBrightness(90);
      setContrast(160);
      setIsInverted(true);
    } else if (preset === 'soft_tissue') {
      setBrightness(115);
      setContrast(90);
      setIsInverted(false);
    }
  };

  const handleResetView = () => {
    setZoomLevel(100);
    setBrightness(100);
    setContrast(100);
    setIsInverted(false);
    setActivePreset('standard');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col select-none animate-in fade-in duration-150 overflow-hidden">
      {/* Universal Patient Safety Banner for Context-Aware Imaging Review */}
      {patient && (
        <div className="shrink-0 bg-slate-900 border-b border-slate-800">
          <PatientSafetyBanner patient={patient} />
        </div>
      )}

      {/* Top DICOM App Bar */}
      <div className="h-14 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-400 font-mono font-bold text-xs">
            {study.modality}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100">{study.studyTitleAr}</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                Acc: {study.mockDicomStudy?.accessionNumber || 'ACC-2026-991'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Dedicated Clinical Workspace (Simulated / Mock Viewer)
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              {study.studyTitleEn} • وقت الإجراء: {study.performedAt}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Preset Buttons */}
          <div className="hidden md:flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => handlePresetChange('standard')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors cursor-pointer ${
                activePreset === 'standard' ? 'bg-teal-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => handlePresetChange('contrast')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors cursor-pointer ${
                activePreset === 'contrast' ? 'bg-teal-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              High-Contrast
            </button>
            <button
              onClick={() => handlePresetChange('soft_tissue')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors cursor-pointer ${
                activePreset === 'soft_tissue' ? 'bg-teal-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Soft Tissue
            </button>
            <button
              onClick={() => handlePresetChange('bone')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors cursor-pointer ${
                activePreset === 'bone' ? 'bg-teal-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Invert / Bone
            </button>
          </div>

          <button
            onClick={() => setShowReportSidebar(!showReportSidebar)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showReportSidebar ? 'bg-slate-800 text-teal-400 border border-teal-500/30' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{showReportSidebar ? 'إخفاء التقرير' : 'عرض التقرير السريري'}</span>
          </button>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Thumbnails Sidebar */}
        <div className="w-48 bg-slate-950 border-r border-slate-900 p-3 overflow-y-auto space-y-3 shrink-0 hidden sm:block">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Key Series ({keyImages.length})</span>
            <Layers className="w-3.5 h-3.5 text-slate-500" />
          </div>

          <div className="space-y-2">
            {keyImages.map((img, idx) => {
              const isSelected = idx === activeImageIdx;
              return (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-full text-right p-2 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-950/60 border-teal-500 text-white shadow-xs'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="aspect-4/3 bg-slate-900 rounded-lg flex items-center justify-center mb-1.5 border border-slate-800 relative overflow-hidden">
                    <div className="absolute inset-0 bg-radial from-slate-800 to-black opacity-80" />
                    <span className="relative text-[10px] font-mono text-slate-400">{img.view}</span>
                  </div>
                  <strong className="text-xs block truncate text-slate-200">{img.title}</strong>
                  <span className="text-[10px] text-slate-500 block truncate">{img.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Central DICOM Canvas & Tools */}
        <div className="flex-1 bg-black flex flex-col relative overflow-hidden">
          {/* Top Floating Toolbar */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800 text-white flex items-center gap-3 text-xs shadow-xl">
            <button
              onClick={() => setZoomLevel(prev => Math.min(250, prev + 15))}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="font-mono text-[11px] text-teal-400 font-bold w-12 text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.max(50, prev - 15))}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-slate-700 mx-1" />

            <button
              onClick={() => setBrightness(prev => (prev >= 140 ? 80 : prev + 15))}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer flex items-center gap-1"
              title="Adjust Brightness"
            >
              <Sun className="w-4 h-4" />
              <span className="font-mono text-[10px] text-slate-400">{brightness}%</span>
            </button>

            <button
              onClick={() => setContrast(prev => (prev >= 150 ? 80 : prev + 15))}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer flex items-center gap-1"
              title="Adjust Contrast"
            >
              <Contrast className="w-4 h-4" />
              <span className="font-mono text-[10px] text-slate-400">{contrast}%</span>
            </button>

            <button
              onClick={() => setIsInverted(!isInverted)}
              className={`p-1.5 rounded-lg text-xs cursor-pointer font-mono ${
                isInverted ? 'bg-teal-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
              title="Invert Gray Values"
            >
              INV
            </button>

            <div className="w-px h-4 bg-slate-700 mx-1" />

            <button
              onClick={handleResetView}
              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              Reset
            </button>
          </div>

          {/* Medical Image Simulation Canvas */}
          <div className="flex-1 flex items-center justify-center p-8 overflow-hidden relative">
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                filter: `brightness(${brightness}%) contrast(${contrast}%) ${isInverted ? 'invert(1)' : ''}`,
                transition: 'transform 0.15s ease-out'
              }}
              className="max-w-2xl w-full aspect-4/3 bg-radial from-slate-900 via-slate-950 to-black rounded-2xl border border-slate-800 p-8 flex flex-col justify-between shadow-2xl relative select-none"
            >
              {/* Corner Overlays (DICOM Standard Patient & Technical Data) */}
              <div className="flex justify-between text-[11px] font-mono text-teal-400/90 leading-tight">
                <div>
                  <span className="font-bold block">Patient: #Pat-01 / MRN-2026-901</span>
                  <span>Modality: {study.modality}</span>
                  <span className="block">Body Region: {study.bodyRegion}</span>
                </div>
                <div className="text-left">
                  <span className="block">Study Date: {study.performedAt}</span>
                  <span>Series: {activeImageIdx + 1} / {keyImages.length}</span>
                  <span className="block">KVp: 120 / mA: 240</span>
                </div>
              </div>

              {/* Graphic Representation / Mock Diagnostic Visualizer */}
              <div className="my-auto text-center space-y-3 py-6">
                <div className="w-24 h-24 mx-auto rounded-full border-2 border-dashed border-teal-500/40 flex items-center justify-center text-teal-400">
                  <span className="text-2xl font-black font-mono">{study.modality}</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-slate-200 tracking-wide">
                    {currentImage.title}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {currentImage.description}
                  </p>
                  {currentImage.annotation && (
                    <div className="inline-block mt-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-mono font-bold">
                      📌 {currentImage.annotation}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Overlays */}
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Zoom: {zoomLevel}% • W/L: {contrast}/{brightness}</span>
                <span>Radiology Workstation Mock Viewer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Structured Clinical Report Sidebar */}
        {showReportSidebar && (
          <div className="w-96 bg-slate-900 border-l border-slate-800 text-slate-200 flex flex-col shrink-0 overflow-y-auto">
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white">التقرير الإشعاعي السريري</h4>
                <span className="text-[10px] text-slate-400">Diagnostic Radiology Report</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {study.status.toUpperCase()}
              </span>
            </div>

            <div className="p-4 space-y-4 text-xs">
              {/* Order Provenance */}
              {study.orderReferenceId && (
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                  <span className="text-slate-400">طلب الأشعة المرجعي:</span>
                  <span className="font-mono font-bold text-teal-400">{study.orderReferenceId}</span>
                </div>
              )}

              {/* Indication */}
              <div>
                <span className="text-[11px] font-bold text-teal-400 block mb-1">دواعي الفحص السريرية (Indication):</span>
                <p className="text-slate-300 leading-relaxed bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
                  {study.clinicalIndication}
                </p>
              </div>

              {/* Technique */}
              <div>
                <span className="text-[11px] font-bold text-teal-400 block mb-1">التقنية المستخدمة (Technique):</span>
                <p className="text-slate-400 leading-relaxed font-mono text-[11px]">
                  {study.technique}
                </p>
              </div>

              {/* Comparison */}
              {study.comparisonPriorStudy && (
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">المقارنة مع دراسات سابقة:</span>
                  <p className="text-slate-400 text-[11px] bg-slate-950 p-2 rounded-lg border border-slate-800">
                    {study.comparisonPriorStudy}
                  </p>
                </div>
              )}

              {/* Findings */}
              <div>
                <span className="text-[11px] font-bold text-teal-400 block mb-1">الموجودات التفصيلية (Findings):</span>
                <p className="text-slate-200 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                  {study.findings}
                </p>
              </div>

              {/* Impression (Highlight) */}
              <div className="p-3.5 rounded-2xl bg-teal-950/40 border border-teal-500/40 space-y-1">
                <span className="text-[11px] font-bold text-teal-300 block">الخلاصة والتشخيص (Impression):</span>
                <p className="text-slate-100 font-bold leading-relaxed">
                  {study.impression}
                </p>
              </div>

              {/* Critical Findings Alert if applicable */}
              {study.hasCriticalFindings && study.criticalOrSignificantFindings && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>موجودات سريرية تستلزم المتابعة العاجلة:</span>
                  </div>
                  <p className="text-rose-200 text-[11px] leading-relaxed">
                    {study.criticalOrSignificantFindings}
                  </p>
                </div>
              )}

              {/* Sign-off Provenance */}
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>طبيب الأشعة المعتمد:</span>
                  <strong className="text-slate-200">{study.radiologist}</strong>
                </div>
                <div className="flex justify-between">
                  <span>الصفة السريرية:</span>
                  <span className="text-slate-400">{study.radiologistRole}</span>
                </div>
                <div className="flex justify-between">
                  <span>تاريخ الاعتماد:</span>
                  <span className="font-mono text-slate-400">{study.reportedAt}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
